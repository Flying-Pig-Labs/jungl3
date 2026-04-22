# Topic 5: Claude Code SDK agent patterns for deterministic tool-constrained agents

See `00-context.md` for product framing. [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) commits to the LLM admin agent being implemented via the [Claude Code SDK](https://docs.claude.com/en/api/agent-sdk/overview), constrained to invoke deterministic tools and summarize their output with citations — explicitly forbidden from inventing claims about system state. This topic is about how to actually build an agent that holds to that contract.

## Research questions

1. **SDK surface, concretely.** What are the relevant Claude Code SDK primitives for building a tool-calling agent? Survey the public documentation and any available examples. How does tool registration work, how does tool-call streaming work, how does the SDK surface structured tool inputs/outputs to the model and back? Cite specific SDK versions and code patterns.

2. **Preventing confabulation.** What are the known patterns for building an agent that *refuses to state system facts not grounded in a tool result*? System prompts are part of it; what else — structured output constraints, required-citation post-processing, response-schema enforcement, adversarial test patterns? Cite real implementations where published (Anthropic's own cookbook, published papers, notable open-source agent frameworks with this property).

3. **Tool-call grounding patterns.** When the agent invokes `cloudwatch_logs_insights_query` and gets rows back, how does it cite those rows in its natural-language summary such that a reader can verify? Patterns: inline markdown citation, structured "citation" field in the response schema, rendered evidence blocks. What do other production tool-using agents do? Cite Perplexity, Claude's own browser-tool pattern, Cursor's agent citations, etc.

4. **Failure-mode catalog.** When a Claude-Sonnet-class agent with tool use does misbehave, what does the misbehavior look like? Tool-arg hallucination, tool-name hallucination, invented rows in summaries, ignoring tool errors, re-asking the same tool repeatedly, cycles. What are the testable mitigations for each?

5. **Cost profile of tool-use round-trips.** A tool-calling agent often makes 2–4 round-trips to the model per user question (reason → tool call → reason → tool call → answer). For a Claude Sonnet-class model, what is the real token profile of a single admin-agent query at v1 scale? Cite Anthropic pricing and measured examples. Include a concrete per-query cost estimate for a representative operator question.

6. **Degraded-mode without the LLM.** ADR 0007 requires graceful degradation — when the budget is exhausted, the admin UI still works, with keyword matching selecting tools and raw output returned. What is the cleanest pattern for this fallback? Sub-agent design (a keyword-only "sibling" that shares the tool set), a tool-name dispatch table, a small local model (ONNX/distilled) for intent classification?

7. **Evaluation harness.** How should Jungle3 continuously test that the admin agent (a) picks the right tool for common queries, (b) does not invent facts, and (c) degrades correctly at budget exhaustion? Cite eval frameworks for tool-using agents (Anthropic's MCP evals, OpenAI evals, Braintrust, LangSmith, etc.). What does a real eval suite for this agent look like?

8. **Claude Code SDK vs alternatives.** Briefly: is there a reason to reconsider the Claude Code SDK choice in favor of bare Anthropic API, MCP over Anthropic API, LangChain/LangGraph, or Bedrock Converse API? ADR 0007 is settled; this is a sanity check on whether the SDK ships what we assume it ships.

## Decision-ready recommendations for Jungle3

End with the required decision-ready section from `00-context.md`.
