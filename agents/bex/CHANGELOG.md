# Bex — Changelog

## 0.2.2 — 2026-05-19

`compatible_targets` reduced from `['claude', 'paperclip', 'nebula']` to `['nebula']`. Bex runs on Nebula; we don't need a parallel Claude Code subagent install (`~/.claude/agents/bex.md`) or a Paperclip payload at this point. If a use-case for local Claude-Code-subagent Bex emerges later, re-add `'claude'` and run `publish-item.py bex --target=claude`. Until then, `publish-all.py` skips bex for the claude/paperclip targets.

No prompt or behaviour changes — distribution-policy change only.

## 0.2.1 — 2026-05-18

Correction release. Aligns Bex's roster with reality after stack decisions.

**Corrections:**
- Viktor's runtime corrected to `viktor.com` (was `appy-ai` in v0.2.0)
- Bex's own runtime declared: `nebula.gg`
- Specialist roster reorganised into four explicit groups: real / absorbed_by_bex / covered_by_tooling / framework_only
- Explicit instruction added: Bex must NOT @-mention framework-only specialists — do the work herself and flag if it becomes recurring

**Removed:**
- Appy.AI references (subscription being cancelled — capability covered by Nebula + viktor.com + Perplexity Computer)

**Specialist status after this revision:**
- **Real:** Viktor (viktor.com)
- **Absorbed by Bex:** Hugo (copy QA), Iris (analytics synthesis), Nina (lead-gen orchestration — viktor.com handles execution)
- **Covered by tooling:** Dex (Peter + Claude Code), Argus (cron script in RBS-OS)
- **Framework only (NOT built):** Sasha, Mira, Quinn, Sage, Remy, Frank

**Behavioural change:**
- When Bex encounters work in a framework-only domain (e.g. social content), she does it herself and flags to Peter: *"Did this myself; would normally be [Sasha/Mira/etc.]. Build if recurring?"* — rather than fabricating a delegation to someone who isn't there.

---

## 0.2.0 — 2026-05-18

Major revision after architectural alignment on RBS-OS + brain + ai-library three-layer architecture and Slack channel design.

**Architectural changes:**
- Two specialist types: external Slack agents (e.g. Viktor) vs internal Claude Code sub-agents
- Delegation pattern for external specialists: peer-to-peer Slack @-mention
- Channel names normalised — no `#brand-` or `#client-` prefix; brand governance lives in `brands/<id>/spec.yaml`

**Channel additions:**
- `#ops-finance` — cross-brand operations: weekly invoice collation, subscriptions, bank reconciliation

**Scope additions:**
- Weekly invoice collation (Monday 07:00) — pulls invoices from all inboxes, reconciles against subscription db, flags anomalies

---

## 0.1.0 — 2026-05-16

Initial persona definition. Drafted by Peter + Claude during agency setup discussion.

- Role: Chief of Staff at Red Banana Studios Ltd
- Reports to: Peter Farrell (Founder/CEO)
- Cadence: morning brief, EOD wrap, weekly review, monthly subscription audit
- Boundaries: no customer-facing publishing without approval, no spend without approval, no direct commits to `brands/`
- Public persona: own Instagram, agency face
