## Changelog

### 0.3.0 - Git workflow, QA gate, error handling and documentation gate
- Added Git Workflow section: feature branching, atomic commits, branch naming conventions
- Added QA gate: delegate to qa-engineer agent before creating PRs, fix-forward loop
- Added Agents to Delegate To section: qa-engineer and bug-investigator
- Added error handling step in workflow: error boundaries and try/catch on frontend actions
- Added Documentation gate: update all related docs before opening a PR
- Added qa-only to requirements
- Updated guardrails with error handling mandates for frontend layer
- Updated output format to include documentation list, QA results and PR link

### 0.2.0 - Full rebuild
- Rebuilt with full workflow, skill references and tool guidance

### 0.1.0 - Initial creation
- Added initial version of the agent.
