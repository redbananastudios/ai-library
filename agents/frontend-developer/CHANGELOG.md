## Changelog

### 0.3.0 - Git workflow, QA gate, error handling and documentation gate
- Added Git Workflow section: feature branching, atomic commits, branch naming conventions
- Added QA gate: delegate to qa-engineer agent before creating PRs, fix-forward loop
- Added Agents to Delegate To section: qa-engineer and bug-investigator
- Added comprehensive Error Handling and Recovery section:
  - Error Boundaries for every route/feature section
  - User Action Error Handling: try/catch on all async handlers, friendly messages
  - Exception Safety: null guards, type guards, race condition prevention, double-submit prevention
  - Error Reporting: structured logging, correlation IDs, service integration
- Added Documentation gate: update all related docs before opening a PR
- Added qa and code-reviewer to requirements
- Updated guardrails with error handling mandates
- Updated output format to include error handling summary and PR link

### 0.2.0 - Full rebuild
- Rebuilt with full workflow, skill references and tool guidance

### 0.1.0 - Initial creation
- Added initial version of the agent.
