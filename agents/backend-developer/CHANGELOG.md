## Changelog

### 0.3.0 - Git specialist delegation
- Added git-specialist agent to delegation table for conflicts, rebases, history surgery and recovery
- Added Git Workflow guardrails: delegate conflicts to git-specialist, never force-push shared branches

### 0.2.0 - Git workflow, QA gate and documentation gate
- Added Git Workflow section: feature branching, atomic commits, branch naming conventions
- Added QA gate: delegate to qa-engineer agent before creating PRs, fix-forward loop
- Added Agents to Delegate To section: qa-engineer and bug-investigator
- Added Documentation gate: update all related docs before opening a PR
- Added qa and code-reviewer to requirements
- Updated workflow to 11-step process with branch creation, QA, self-review, docs and PR creation
- Updated output format to include PR link and QA test results

### 0.1.0 - Initial creation
- Added initial version of the agent.
