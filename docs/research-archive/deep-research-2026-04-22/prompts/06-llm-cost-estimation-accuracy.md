# Topic 6: LLM cost pre-estimation accuracy for Claude with tool use

See `00-context.md` for product framing. [ADR 0007](../../decisions/0007-v1-cost-profile-and-llm-metering.md) commits to a $50/month default LLM budget enforced by an `llm-gateway` Lambda that **pre-estimates** each call's cost, debits the budget before the call, and reconciles after. The reliability of this scheme depends entirely on how accurate the pre-estimator is, and the current design is sketched but not calibrated. This topic is about making the estimator real.

## Research questions

1. **Anthropic token accounting, exactly.** For the current (2026-04-22) Claude Sonnet and Claude Haiku APIs, what does "input tokens" actually include — system prompt, conversation history, tool definitions, tool call results, cache reads, cache writes? What is the prompt-caching billing model, and how does it interact with tool use? Cite current Anthropic docs and pricing.

2. **Tool-use overhead.** Each tool call adds round-trips. How much does a tool call inflate input and output tokens relative to a pure text completion? Empirical measurements are ideal; worst-case bounds are acceptable. What is the per-tool-call token "tax"?

3. **Output length bounding.** `max_tokens` bounds output cost. But for an agent that may make multiple model calls per user turn, how do you bound total-turn cost? What abstractions do production Claude users (Cursor, Perplexity, Zed, Codeium) rely on — per-turn token ceilings, mid-stream cancellation, budget envelopes on the entire agent loop?

4. **Pre-estimation methods.** Concrete approaches to estimating cost before the call: (a) counting input tokens via `tiktoken` or Anthropic's tokenizer, (b) adding a fixed tool-call overhead per registered tool, (c) bounding output at `max_tokens * price_per_token`, (d) historical per-query-class averages. Which combination gives you ≤10% error on real workloads? Cite any published analyses.

5. **Reconciliation after the call.** Anthropic API responses include `usage.input_tokens` and `usage.output_tokens`. What is the cleanest pattern for the `llm-gateway` to reconcile estimate → actual and refund/debit the delta? Cite FinOps patterns for similar pay-per-inference services.

6. **Price drift.** Anthropic pricing changes. A static estimator calibrated on April pricing becomes wrong in May. How do production systems keep their cost estimators current — polling a pricing endpoint, pinned SDK versions, manual config updates, deploy-gated calibration runs? What is the maintenance cadence?

7. **Per-user and per-purpose budgets.** ADR 0007 defaults to a per-install budget. Is there a clear point (multi-tenant install, multi-operator deployment, per-team billing) at which per-user or per-purpose budgets become necessary? What data model supports both gracefully?

8. **Top-up UX.** When a customer wants to extend a budget mid-month — via CLI, Console, or the admin UI — what is the cleanest UX? How do similar metered-LLM products (Anthropic Console, OpenAI Platform, Braintrust, LangSmith) handle this?

9. **Validation harness.** What does a real cost-estimation validation harness look like? Replay historical calls, compare estimates against actuals, report error distribution. What should the v1 gate be — the estimator must predict within ±N% on M% of calls?

## Decision-ready recommendations for Jungl3

End with the required decision-ready section from `00-context.md`.
