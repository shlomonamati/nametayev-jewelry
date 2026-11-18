---
description: Process new site leads into design briefs, concepts and pricing cards (stops before price — Shlomi prices)
---
Run the custom-order flow (Flow 1 in the spec) for every new lead.

1. `node orchestrator/db.mjs leads:new` — if the list is empty, say so in Hebrew and stop.
2. For each lead, one at a time:
   a. `node orchestrator/db.mjs run:start order <lead id>` → keep run_id.
   b. If the lead has image_path: `node orchestrator/db.mjs image:download <image_path> .orchestrator/<lead id>.<ext>` (create the .orchestrator folder; it is git-ignored).
   c. Use the **intake-agent** with the lead and the image path. Save its JSON to `.orchestrator/<id>.brief.json`, then `node orchestrator/db.mjs step:log <run_id> intake haiku 1 .orchestrator/<id>.brief.json`. If it exits with code 3 (invalid output), ask the agent once more with the errors; on a second failure finish the run as `failed` and move on.
   d. Use the **design-agent** → `.orchestrator/<id>.concepts.json` → `step:log <run_id> design sonnet 1 ...` (same retry rule).
   e. Use the **pricing-prep-agent** → `.orchestrator/<id>.card.json` → `step:log <run_id> pricing-prep haiku 1 ...`.
   f. Use the **qa-agent** with the lead text and all three outputs → `.orchestrator/<id>.qa.json` → `step:log <run_id> qa haiku 1 ...`.
      If QA failed: send its reasons back to the design-agent (and pricing-prep-agent if criterion 5 failed), re-run QA. At most 2 rounds; then finish the run as `qa_failed` and tell Shlomi which criteria failed.
   g. `node orchestrator/db.mjs brief:save <lead id> <run_id> <brief> <concepts> <card> awaiting_price` (use `needs_info` instead if the brief has clarifying questions that block pricing), then `run:finish <run_id> awaiting_price`.
3. Finish with a short Hebrew summary per lead: name, item, the first concept, the pricing card (metal, karat, stones, total carat), clarifying questions, and the exact next step:
   `/set-price <lead id> <price>`.

Never send anything to a customer and never write a price — that is Shlomi's step.
