# 2026-04-24 — Research Sufficiency Check

**Frame.** A follow-up to the same-day [viability review](./2026-04-24-viability-review.md), triggered by the absorption of four new research memos (see [`../research/README.md` — "User-dropped memos 2026-04-24"](../research/README.md)). Question: is the repo still research-limited, or is it action-limited?

**How to read this.** Opinion, not policy. The action list at the end is a recommendation to the founder; nothing here decides anything. Any change this note implies lands as an ADR, a `CLAUDE.md §11` edit, a `BACKLOG.md` entry, or a calendar invitation — not as appeals to this document.

**Status.** Advisory.

---

## 1. The claim

**The repo is over-researched for its current build state.** The three highest-leverage open questions ([`CLAUDE.md §11`](../../CLAUDE.md) #31, #32, #33) are all blocked on human action, not reading. Continuing to read is now a form of procrastination `[Inference]`.

---

## 2. What's blocked on a human, not a memo

| §11 item | What unblocks it |
| --- | --- |
| **#31 — first design partner** | A warm intro and a 30-minute call. No memo substitutes. |
| **#33 — ICP narrowing** | Held pending #31 on purpose. Narrowing by founder opinion is weaker than narrowing by a named prospect's words. |
| **#37 — co-sell / ACE / MDF** | Already marked blocked on #31. No co-sell story without a reference customer. |
| **#32 / [ADR 0012](../decisions/0012-v0.5-wedge-scope.md) — v0.5 wedge** | Accept or reject after the first design-partner conversation, not before. A prospect saying "yes, one exposure surface is enough" or "no, we need the Gallery" resolves this in one call. |
| **#16 — canonical maker-checker workflow** | Default on record (settlement approval above a threshold). Locking it needs a real claims ops person, not more research. |
| **First POC slice** | Enough is decided (ADRs 0001–0012, [`findings.md §6`](../research/findings.md), v0.5 wedge shape) to start building `marketplace-listing/` + `control-plane/` + one `dmz/` template + one insurance-claims `synthetic-runtime/` seed generator. Building reveals what memos can't — e.g. how painful the CloudFormation update problem (#3) actually is in practice. |

---

## 3. Where narrow research still earns its keep

These are the few places an hour of reading beats an hour of building or calling. None is a blocker for #31 or the first POC slice — they happen *alongside* action, not before it.

- **#18 — LLM cost-estimate accuracy.** Small empirical study: run a handful of representative agent tasks, log token counts, check against [ADR 0007](../decisions/0007-v1-cost-profile-and-llm-metering.md)'s $50/month envelope. Cheap, answerable at a desk, prevents a v1 surprise. Do this before `llm-gateway` is designed.
- **#4 — minimum IAM permissions.** Really "build a draft template, then audit with `aws iam simulate-principal-policy`." Build-then-audit, not standalone research.
- **#7 — IaC authoring tool.** Decidable in about a day by writing the same ~50-line vend operation in CDK, SAM, and raw CFN and picking. Becomes concrete the moment `control-plane/` starts.
- **#17 — pin the MVR floor.** [`findings.md §5.5`](../research/findings.md) has tighter numbers implicitly; [`research1-aws-installable-shape.md`](../research-archive/first-generation/research1-aws-installable-shape.md) has looser ones; the archived [`aws-innovation-environment-design-report.md`](../research-archive/user-memos-2026-04-24/aws-innovation-environment-design-report.md) has larger ones still. Pinning this is a half-day ADR draft against inputs already in the repo — not new research.
- **#25 / #29 — DMZ → Canopy promotion gate.** Needs one concrete evaluation run to make the criteria real. Build-small-and-observe, not reading.

---

## 4. What I would *not* research more

- **Marketplace packaging mechanics** (#1, #2, #3, #5, #6, #8, #34, #35, #36). Enough is captured. Next real signal is an AWS reviewer's feedback on a submitted listing draft, not another memo on how Marketplace works.
- **Agentic sandbox / DMZ theory.** [`docs/research/synthetic-user-testing/`](../research/synthetic-user-testing/) and the archived [`innovation-sandbox-ai-driven-product-development.md`](../research-archive/user-memos-2026-04-24/innovation-sandbox-ai-driven-product-development.md) are already thorough. More here is procrastination.
- **Insurance domain authenticity.** The 2026-04-22 deep-research cluster plus the archived [`aws-innovation-environment-design-report.md`](../research-archive/user-memos-2026-04-24/aws-innovation-environment-design-report.md) provide more domain signal than a solo founder can absorb. One real SME conversation beats another memo.

---

## 5. Recommended next moves

Priority order. Items 1 and 2 run in parallel; item 3 waits on item 1.

1. **This week — #31 action.** Name 3–5 P&C innovation-lead targets. Ask for warm intros. Book calls.
2. **Next two weeks — first POC slice.** Spin up `marketplace-listing/` and `control-plane/` per [`CLAUDE.md §4`](../../CLAUDE.md). Write the first vend-a-Jungle flow against the v0.5 wedge. This generates real signal on #3, #4, #7, #11 that no memo can.
3. **After the first design-partner call.** Accept or reject [ADR 0012](../decisions/0012-v0.5-wedge-scope.md) (#32). Narrow ICP (#33). Pick the maker-checker canonical workflow (#16).

---

## Related

- [`2026-04-24-viability-review.md`](./2026-04-24-viability-review.md) — parent review; §7 names #31 as "the single most concerning item."
- [`2026-04-24-v0.1-plan.md`](./2026-04-24-v0.1-plan.md) — same-day follow-up translating this note's recommendations into a three-track plan.
- [`../research/README.md`](../research/README.md) — active synthesis surface.
- [`../research-archive/README.md`](../research-archive/README.md) — frozen raw inputs (created as part of the 2026-04-24 archive move this note triggered).
- [`../../CLAUDE.md`](../../CLAUDE.md) §0 (current phase) and §11 (open questions).
- [`../decisions/0012-v0.5-wedge-scope.md`](../decisions/0012-v0.5-wedge-scope.md) — Proposed; resolves after #31.
