---
description: Run a site change through the full flow — spec, approval, branch, code, tests, PR with preview (Flow 2)
argument-hint: <one-sentence change request in Hebrew>
---
Change request: $ARGUMENTS

1. `node orchestrator/db.mjs run:start dev` → run_id.
2. Use the **product-agent** to write the story and acceptance criteria into `.orchestrator/cr-<run_id>.md`. Save it: `node orchestrator/db.mjs cr:save <run_id> "<request>" .orchestrator/cr-<run_id>.md` → change_request_id.
3. Show Shlomi the story and criteria in Hebrew and **stop until he approves** (gate 1). If he asks for changes, revise and ask again. On approval: `cr:update <id> status spec_approved`.
4. Create a branch `feature/<short-english-slug>` from an up-to-date main (`git switch main && git pull && git switch -c ...`). `cr:update <id> branch <name>` and `cr:update <id> status in_dev`.
5. Use the **dev-agent** to implement and test. If tests fail, give it the failures; at most 3 rounds, then `cr:update <id> status qa_failed`, `run:finish <run_id> failed` and report to Shlomi.
6. When `cd qa && npm test` passes: commit, `git push -u origin <branch>`, and open a pull request (`gh pr create` if available, otherwise give Shlomi the GitHub link). `cr:update <id> pr_url <url>` and `status in_review`.
7. Tell Shlomi in Hebrew: what changed, test results, the PR link, and that Vercel posts a preview link on the PR. **Never merge** — merging to main is Shlomi's release gate.
