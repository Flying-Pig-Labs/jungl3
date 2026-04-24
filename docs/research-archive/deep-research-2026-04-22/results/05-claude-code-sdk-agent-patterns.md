# Zero-Hallucination Agent Architecture: Implementing Deterministic Tool Constraints and Cost Governance in Jungl3

## Executive Summary

To meet Jungl3's "time to real" thesis and avoid plausibility collapse, the v1 admin agent must operate with absolute determinism. Relying on system prompts to prevent LLM hallucinations is insufficient. Instead, Jungl3 must enforce strict structural constraints using the Claude Agent SDK's in-process Model Context Protocol (MCP) servers, structured JSON outputs, and deterministic post-processing. 

Key strategic actions include:
* **In-Process MCP**: Utilize the Claude Agent SDK's `create_sdk_mcp_server` to run tools directly within the Python application, eliminating the IPC overhead and deployment complexity of external subprocesses [1] [2].
* **Zero-Confabulation**: Enforce a strict JSON Schema (`output_format`) requiring a `citations` array that maps every claim to a specific `tool_call_id` [3] [4].
* **Mitigating SDK Backpressure**: Address known SDK failure modes (e.g., Issue #425 where message-queue backpressure causes hallucinated `<function_calls>`) by implementing aggressive stream draining and strict retry budgets via `PreToolUse` hooks [5] [6].
* **Cost Governance**: Leverage Anthropic's Prompt Caching to reduce heavy query costs from ~$0.0279 to ~$0.0225, stretching the $50/month budget to support over 2,200 heavy queries [7] [8].
* **Degraded Mode**: Deploy a quantized ONNX MiniLM INT8 model (~22MB) for intent-to-tool classification when the LLM budget is exhausted, providing a robust fallback without the LLM [9].

## 1. Claude Agent SDK Surface and In-Process MCP Architecture

### Eliminating IPC Overhead with In-Process Servers
The Claude Agent SDK (v0.1.64+) provides the exact primitives needed for Jungl3's v1 architecture. By using `create_sdk_mcp_server`, Jungl3 can implement custom tools as Python functions that run directly within the application process [1] [2]. This approach eliminates subprocess management, improves performance by removing IPC overhead, and ensures type safety with direct Python function calls [1].

### Streaming and Event Interleaving
The SDK handles streaming via the `query()` and `ClaudeSDKClient` interfaces, returning an async iterator of messages [1]. The UI must track the event stream to differentiate between `AssistantMessage` text blocks and `ToolUseBlock` / `ToolResultBlock` events [3] [1]. This allows the frontend to render an `in_tool` state, showing users exactly when the agent is fetching data versus reasoning.

### Deterministic Control via SDK Hooks
To enforce governance, Jungl3 must utilize SDK hooks. A hook is a Python function invoked at specific points in the agent loop [1]. For example, a `PreToolUse` hook can validate arguments or block unauthorized actions, returning a `permissionDecision` of `"allow"` or `"deny"` [6].

## 2. Zero-Confabulation Enforcement and Citation Schemas

### Structured Output Enforcement
To prevent the agent from inventing system state, Jungl3 must mandate structured outputs. The SDK's `output_format` option allows passing a JSON Schema (or Pydantic model) that forces the agent to return validated JSON [4]. 

### Citation Mapping via tool_call_id
The schema must require a `citations` array. Every factual claim must include an exact substring quote and the `tool_call_id` of the `ToolResultBlock` it originated from [3] [4]. A deterministic Python post-processor must intercept the final output, verify that the cited substring exists exactly within the payload of the referenced `tool_call_id`, and drop or flag the response if verification fails.

## 3. Failure Mode Catalog and SDK-Level Mitigations

### Mitigating Issue #425: Hallucinated Tool Calls
A critical failure mode in the Claude Agent SDK occurs under background subagent message-queue backpressure (Issue #425). When the internal buffer fills, the model may silently hallucinate plain-text `<function_calls><invoke...>` blocks instead of executing actual tools [5]. 
**Mitigation**: Ensure the application continuously drains the message stream (e.g., using `receive_messages()`) and does not block the control protocol [5].

### Preventing Infinite Retry Loops
Agents can enter infinite loops if a tool repeatedly fails or returns unexpected data.
**Mitigation**: Implement a circuit breaker using `PreToolUse` hooks to track the number of invocations per `tool_name` within a session. If a tool is called more than 3 times consecutively without progressing, the hook must return a `permissionDecision: "deny"` and escalate to the user [6].

## 4. Cost Profile, Prompt Caching, and Budget Governance

### Claude 3.5 Sonnet Cost Economics
Claude 3.5 Sonnet is priced at $3 per million input tokens and $15 per million output tokens [7]. 

| Query Type | Input Tokens | Output Tokens | Base Cost | Cost w/ Prompt Caching |
| :--- | :--- | :--- | :--- | :--- |
| Light | 540 | 250 | $0.0053 | $0.0045 |
| Medium | 1,000 | 500 | $0.0105 | $0.0085 |
| Heavy | 2,000 | 1,600 | $0.0300 | $0.0225 |

*Takeaway: Prompt caching (which costs 1.25x for a 5-minute write but only 0.1x for subsequent reads) is mandatory to maximize the $50/month budget [8].*

### Budget Metering and Hard Cutoff
The `llm-gateway` Lambda must track cumulative spend. When the $50 budget reaches 95%, the gateway must trigger a webhook alert [10] and gracefully degrade the UI to the deterministic fallback mode.

## 5. Degraded Mode: ONNX-Based Deterministic Fallback

When the LLM budget is exhausted, Jungl3 must fall back to a deterministic router [11]. 

### MiniLM INT8 Intent Classification
Instead of brittle regex rules, Jungl3 should deploy a quantized ONNX `intent-classifier-minilm` model. The `model_int8.onnx` variant is approximately 22MB, executes in under 30ms, and provides robust intent-to-tool mapping [9]. This allows the admin UI to continue functioning by mapping natural language directly to parameterized tool calls (e.g., "Show me claim 123" -> `mcp__dynamodb__get_claim(id="123")`).

## 6. Evaluation Harness and LangSmith Integration

### Continuous Verification
To maintain a <1% hallucination rate, Jungl3 must implement an evaluation harness using LangSmith. LangSmith integrates via OpenTelemetry to trace every agent step, capturing `tool_calls.{n}.id` and `gen_ai.prompt` [12].

### Golden Dataset Gates
CI/CD pipelines must run offline evaluations against a curated dataset of 10-20 golden claims-processing queries [13]. The pipeline must use a `ToolCorrectnessMetric` to verify that the agent selected the optimal tools and that all citations map correctly to the tool outputs [14].

## 7. SDK vs. Alternatives: Sanity Check

| Feature | Claude Agent SDK | LangGraph | AWS Bedrock Converse |
| :--- | :--- | :--- | :--- |
| **Tool Primitives** | Native in-process MCP [1] | Requires adapters [15] | `ToolInputSchema` via API [16] |
| **Streaming** | Built-in event interleaving [1] | Supported via graph state [17] | `ConverseStream` API [18] |
| **Validation Hooks** | Native `PreToolUse` / `PostToolUse` [6] | Custom middleware [15] | Manual implementation |
| **Complexity** | Low (purpose-built for Claude) | High (graph orchestration) [17] | Medium (bare API) |

*Takeaway: The Claude Agent SDK is the correct choice for v1 due to its native MCP support and low overhead. LangGraph should be deferred until v2 if complex, multi-actor durable execution becomes necessary [17].*

## 8. Decision-ready recommendations for Jungl3

* **Implement in-process MCP servers** using `create_sdk_mcp_server` for all v1 domain tools to eliminate subprocess management and simplify the AWS deployment footprint.
* **Enforce structured outputs** with a mandatory `citations` array mapping claims to `tool_call_id`, backed by a deterministic Python post-processor that drops unverified claims.
* **Enable Prompt Caching** immediately on system prompts and tool schemas to reduce heavy query costs to ~$0.0225, maximizing the $50/month budget.
* **Deploy the ONNX MiniLM INT8 model** (~22MB) in the `llm-gateway` Lambda for degraded-mode intent classification, avoiding brittle regex fallbacks.
* **Explicitly defer LangGraph** and complex multi-agent orchestration past v1; the Claude Agent SDK provides sufficient primitives for the current requirements.
* **Single Biggest Risk**: Failing to aggressively drain the message stream (Issue #425) will cause the agent to hallucinate tool calls under load, leading directly to plausibility collapse.
* **Cross-links**: This architecture directly impacts ADR 0007 (Cost Profile) via prompt caching, and ADR 0009 (Audit) by requiring `tool_call_id` to be logged in the `jungle3-audit` DynamoDB table.

## References

1. *anthropics/claude-agent-sdk-python*. https://github.com/anthropics/claude-agent-sdk-python
2. *Give Claude custom tools*. https://code.claude.com/docs/en/agent-sdk/custom-tools
3. *Fetched web page*. https://raw.githubusercontent.com/anthropics/claude-agent-sdk-python/main/src/claude_agent_sdk/types.py
4. *Get structured output from agents - Claude Code Docs*. https://code.claude.com/docs/en/agent-sdk/structured-outputs
5. *SDK MCP tools can fail / “hallucinate” under background ...*. https://github.com/anthropics/claude-agent-sdk-python/issues/425
6. *Fetched web page*. https://code.claude.com/docs/en/agent-sdk/hooks
7. *Claude 3.5 Sonnet pricing and availability*. http://anthropic.com/news/claude-3-5-sonnet
8. *Pricing - Claude API Docs*. https://platform.claude.com/docs/en/about-claude/pricing
9. *kousik-2310/intent-classifier-minilm · Hugging Face*. https://huggingface.co/kousik-2310/intent-classifier-minilm
10. *Control LLM Spend with AI Gateway Budget Alerts and Limits*. https://mlflow.org/blog/gateway-budget-alerts-limits
11. *How to Add Deterministic Tool Routing to AI Agents*. https://how2.sh/posts/how-to-add-deterministic-tool-routing-to-ai-agents/
12. *Trace with OpenTelemetry - Docs by LangChain*. https://docs.langchain.com/langsmith/trace-with-opentelemetry
13. *Evaluation concepts - Docs by LangChain*. https://docs.langchain.com/langsmith/evaluation-concepts
14. *Tool Correctness | DeepEval by Confident AI - The LLM ...*. https://deepeval.com/docs/metrics-tool-correctness
15. *LangChain LangGraph 1.0 release*. http://blog.langchain.com/langchain-langgraph-1dot0
16. *ToolInputSchema - Amazon Bedrock - AWS Documentation*. https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_ToolInputSchema.html
17. *LangGraph overview*. http://docs.langchain.com/oss/python/langgraph/overview
18. *ConverseStream - Amazon Bedrock - docs.aws.amazon.com*. https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_ConverseStream.html