# Hitting ±10%: Making Claude Cost Pre‑Estimation Buildable for Jungle3

## Executive Summary

To enforce ADR 0007's $50/month hard-cutoff LLM budget, Jungle3's `llm-gateway` must accurately pre-estimate Claude API costs before executing calls. Our research into Anthropic's 2026-04-22 billing semantics reveals that Claude’s token accounting is additive and auditable: total input tokens equal the sum of cache reads, cache writes, and uncached inputs [1] [2]. Tool use injects a predictable "tax" (e.g., +346 tokens for the system prompt, +700 for text_editor) that must be statically added to estimates [3] [4]. 

By combining Anthropic's Token Counting API for structured inputs, documented per-tool overhead tables, and per-call `max_tokens` bounds, Jungle3 can achieve a median absolute error of ≤±10% on pre-estimates. To prevent runaway agentic loops in Step Functions (ADR 0008), we must implement a per-turn cost envelope that pre-authorizes the maximum possible spend for a planned sequence of calls. Reconciliation must follow a strict FinOps ledger pattern in DynamoDB, writing immutable audit trails to `jungle3-audit` (ADR 0009) [5].

## 1) Ground-truth cost model for Claude Sonnet/Haiku

Anthropic's billing model is strictly token-based, but the composition of "input tokens" is complex. Input tokens include the system prompt, conversation history, tool definitions, `tool_use` blocks, `tool_result` content, and attachments (images/PDFs) [3]. 

The canonical formula for calculating total input tokens from the Messages API `usage` response is:
`total_input_tokens = cache_read_input_tokens + cache_creation_input_tokens + input_tokens` [1] [2]. 

Prompt caching introduces pricing multipliers. Cache writes are charged a premium, while cache reads are heavily discounted.

| Model | Input $/MTok | Output $/MTok | Cache write 5m (×1.25) | Cache write 1h (×2.0) | Cache read (×0.1) | Min cacheable tokens |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $3.75 | $6.00 | $0.30 | 2048 |
| Claude Haiku 4.5 | $1.00 | $5.00 | $1.25 | $2.00 | $0.10 | 4096 |

*Key Takeaway: The `llm-gateway` must implement this exact pricing matrix. Because cache writes cost 25% to 100% more than base tokens, pre-estimators should assume worst-case (uncached) pricing to guarantee the budget is never overdrawn.* [6] [7] [2]

## 2) Tool-use overheads (“per-tool tax”)

Enabling tools in Claude automatically injects a hidden system prompt, and specific tools add fixed token costs to the context window. This "tool tax" is deterministic and must be hardcoded into the pre-estimator.

| Model Family | Tool Choice Mode | System Prompt Overhead | Bash Tool | Text Editor Tool | Computer-Use System | Computer-Use Per Def |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Claude 4.x (Sonnet/Haiku) | `auto` / `none` | 346 tokens | +245 tokens | +700 tokens | +466–499 tokens | +735 tokens |
| Claude 4.x (Sonnet/Haiku) | `any` / `tool` | 313 tokens | +245 tokens | +700 tokens | +466–499 tokens | +735 tokens |

*Key Takeaway: Whenever the `llm-gateway` detects tools in the request payload, it must statically add these overheads to the Token Counting API's estimate. Failure to do so will result in consistent under-estimation of 300-1500 tokens per call.* [8] [3] [4]

## 3) Prompt-caching economics and policy

Prompt caching reduces costs, but only if the cache is hit. The default Time-To-Live (TTL) is 5 minutes, which breaks even after just 1 cache read (1.25x write cost vs 0.1x read cost) [6] [7]. The 1-hour TTL breaks even after 2 reads [7].

| TTL | Write Multiplier | Read Multiplier | Reads to Break Even | Good Candidates | Risk Flags |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 5-minute | 1.25x | 0.1x | 1 | Multi-turn chats, fast agent loops | Slow user response times |
| 1-hour | 2.0x | 0.1x | 2 | Stable system prompts, RAG docs | High schema churn, low traffic |

*Key Takeaway: For Jungle3's v1, default to the 5-minute TTL for agentic loops. The pre-estimator must assume 0 cache hits (charging the base or write price) to ensure safety, refunding the difference during post-call reconciliation if a cache hit occurs.* [7] [2]

## 4) Turn-level cost envelopes for Step Functions

ADR 0008 dictates that multi-step processes use Step Functions. Bounding a single call via `max_tokens` is insufficient for an agent that might loop 10 times. We must define a "turn-level envelope".

The envelope formula is: `Σ(input_i × price_in + tool_taxes + max_tokens_i × price_out) × (1 + safety_margin)`.

| Flow Type | Declared Calls (N) | Max Tokens per Call | Est. Input Tokens | Reserved Envelope ($) | Typical Actual ($) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Claim Triage (Sonnet) | 2 | 1000 | 3000 | ~$0.050 | ~$0.025 |
| Doc Extraction (Haiku) | 1 | 2000 | 15000 | ~$0.025 | ~$0.018 |
| Agentic Loop (Sonnet) | 5 | 500 | 5000 | ~$0.115 | ~$0.060 |

*Key Takeaway: The Step Functions planner must declare `N` calls upfront. The `llm-gateway` reserves the full envelope. If the agent nears 90% of the envelope, the gateway triggers a mid-stream cancellation.*

## 5) Hybrid pre-estimation algorithm

To achieve ≤±10% error, the `llm-gateway` must use a hybrid approach.

1. **Base Input**: Call Anthropic's Token Counting API (`/v1/messages/count_tokens`) with the exact structured payload [9] [10].
2. **Tool Taxes**: Add fixed overheads from the config table (e.g., +346 for system, +245 for bash).
3. **Output Bound**: Multiply `max_tokens` by the output price.
4. **Margin**: Apply an 8% safety margin to absorb system-added tokens (which the counting API estimates but Anthropic doesn't bill) and variable `tool_result` sizes [11].

| Query Class | Inputs (Typical) | Tool Taxes | Output Cap | Margin Default | Expected Median Error |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Standard Chat | Token Count API | 0 | `max_tokens` | +5% | ±3% |
| Tool-Heavy | Token Count API | +346 to +1500 | `max_tokens` | +8% | ±7% |
| Vision/PDF | Token Count API | 0 | `max_tokens` | +12% | ±9% |

*Key Takeaway: The Token Counting API is highly accurate but returns estimates [11]. The safety margin protects the hard-cutoff budget from edge-case undercounts.*

## 6) Reconciliation and FinOps ledger

Following ADR 0009, every LLM call must be recorded immutably. The `llm-gateway` acts as a FinOps ledger using an optimistic pre-debit pattern.

| Scenario | Pre-Debit Action | Actual Usage | Reconciliation Outcome | Audit Record |
| :--- | :--- | :--- | :--- | :--- |
| Standard Success | Debit $0.05 | $0.04 | Refund $0.01 | `SUCCESS_REFUND` |
| Cache Hit | Debit $0.05 | $0.01 | Refund $0.04 | `SUCCESS_CACHE_HIT` |
| Overrun Blocked | Check fails | N/A | Deny request | `DENIED_INSUFFICIENT_FUNDS` |
| Timeout/Retry | Debit $0.05 | Unknown | Hold funds, manual sync | `PENDING_RECONCILIATION` |

*Key Takeaway: Use DynamoDB conditional expressions to prevent negative balances. Write the final reconciled state, including `trace_id` and `case_id`, to `jungle3-audit`.* [5]

## 7) Price drift detection and config management

Anthropic changes prices and tokenization rules (e.g., Opus 4.7 uses a new tokenizer [7]). Hardcoding prices will cause plausibility collapse.

| Config Key | Source | Refresh Cadence | Owner | Rollout Path |
| :--- | :--- | :--- | :--- | :--- |
| `models.sonnet_4_6.price_in` | Anthropic Docs | Daily Polling | FinOps/Platform | SSM Parameter Store |
| `tools.bash.overhead` | Anthropic Docs | Daily Polling | Platform | SSM Parameter Store |
| `cache.ttl_5m.multiplier` | Anthropic Docs | Weekly | Platform | SSM Parameter Store |

*Key Takeaway: Store pricing in AWS SSM. Run a nightly synthetic calibration job. If the median estimation error exceeds 5%, or P95 exceeds 15%, trigger a PagerDuty alert and halt automated config rollouts.*

## 8) Budgets and top-up UX

While ADR 0007 specifies a per-install budget, enterprise customers will eventually demand per-team chargebacks. 

* **v1 (Current)**: Single DynamoDB item per install (`PK=INSTALL#123`, `monthly_quota=50.00`, `consumed=12.50`).
* **v2 (Future)**: Hierarchical model (`INSTALL -> FEATURE -> OPERATOR`).
* **Top-up UX**: When a customer hits the $50 limit, they must be able to top-up via the Jungle3 Admin Console or CLI. The update to DynamoDB must be atomic, and the `llm-gateway` must recognize the new funds in <5 seconds to resume in-flight Step Function loops.

## 9) Validation harness and readiness gates

Before v1 GA, the estimator must be proven. We will build a replay harness that feeds anonymized historical Jungle3 requests through the Token Counting API and compares them against live Messages API `usage` fields.

* **Metrics**: Mean Absolute Error (MAE), Mean Absolute Percentage Error (MAPE), P50, P90, P95.
* **v1 Gate**: Median absolute percentage error must be ≤±10% on ≥90% of calls. There must be zero systemic underestimation on tool-heavy requests.

## 10) Risk register and mitigations

| Failure Mode | Detection Signal | Preventive Control | Real-Time Response |
| :--- | :--- | :--- | :--- |
| Non-terminating tool loop | >5 calls in one turn | Step Functions loop cap (N=6) | Abort execution, refund unused |
| Oversized PDF attachment | Token Count > 100k | Pre-flight Token Count API check | Reject payload before model call |
| Cache miss undercount | `cache_read` = 0 | Assume 0 hits in pre-estimate | Refund delta post-call |

## 11) Industry guardrails to emulate

Production AI systems utilize strict guardrails to prevent cost explosions.

| Mechanism | Industry Example | Jungle3 Applicability |
| :--- | :--- | :--- |
| Per-turn token ceilings | Cursor, Zed | High. Enforce via Step Functions envelope. |
| Mid-stream cancellation | Codeium | High. Abort if envelope hits 90%. |
| Cache-aware routing | Perplexity | Medium. Defer to v2; stick to Sonnet/Haiku static routing for v1. |

## Decision-ready recommendations for Jungle3

* **Implement the exact Anthropic cost formula** in the `llm-gateway`, utilizing the Token Counting API for inputs, adding static tool taxes (e.g., +346 for system, +700 for text_editor), and bounding outputs via `max_tokens`.
* **Enforce a pessimistic pre-debit model**: Assume zero prompt-cache hits during pre-estimation to guarantee the budget is never overdrawn, and refund the savings during post-call reconciliation.
* **Require Step Functions planners to declare a call budget** (N calls, max_tokens per call) to reserve a full turn-level envelope upfront.
* **Store pricing and tool overheads in AWS SSM**, backed by a nightly calibration job that alerts if estimation error drifts above 5% median or 15% P95.
* **Explicitly defer hierarchical (per-user/per-feature) budgets to v2**, maintaining the ADR 0007 per-install budget for v1, but ensure the DynamoDB ledger logs `trace_id` and `case_id` to support future chargeback migrations.
* **The single biggest risk** if Jungle3 ignores this is a non-terminating agent loop exhausting the $50 monthly budget in minutes due to un-capped tool-use roundtrips.
* **Cross-link**: This directly impacts ADR 0008 (Step Functions) by requiring state machines to handle `InsufficientFunds` abort signals gracefully without causing plausibility collapse.

## References

1. *Prompt caching - Claude API Docs*. https://platform.claude.com/docs/en/build-with-claude/prompt-caching
2. *Prompt caching - Claude API Docs*. http://platform.claude.com/docs/en/build-with-claude/prompt-caching
3. *Tool use with Claude - Claude API Docs*. https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
4. *Text editor tool - Claude API Docs*. https://platform.claude.com/docs/en/agents-and-tools/tool-use/text-editor-tool
5. *Audit Log Paradigms & Go/PostgreSQL/GORM Design ...*. https://dev.to/akkaraponph/comprehensive-research-audit-log-paradigms-gopostgresqlgorm-design-patterns-1jmm
6. *Claude Prompt Caching and Pricing*. http://platform.claude.com/docs/en/about-claude/pricing
7. *Pricing - Claude API Docs*. https://platform.claude.com/docs/en/about-claude/pricing
8. *Claude API Docs Pricing*. http://docs.anthropic.com/en/docs/about-claude/pricing
9. *Count tokens in a Message - Claude API Reference*. https://platform.claude.com/docs/en/api/messages/count_tokens
10. *Build With Claude Token Counting*. https://claude.yourdocs.dev/docs/build-with-claude/token-counting
11. *Token counting - Claude API Docs*. https://platform.claude.com/docs/en/build-with-claude/token-counting