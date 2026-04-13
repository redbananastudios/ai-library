## Changelog

### 0.4.0 - Git specialist delegation and dev team coordination
- Added git-specialist agent to delegation table for conflicts, rebases, history surgery and recovery
- Added backend-developer and frontend-developer as delegation targets for parallel specialist work
- Added Git Workflow guardrails: delegate conflicts to git-specialist, never force-push shared branches

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
