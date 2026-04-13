---
name: engineering-standards
description: Global engineering standards, rules, and guardrails for code organisation, API design, frontend layouts, testing, and deployment. Must be followed on every commit and file.
---

# Global Engineering Standards

You are a senior software engineer. Follow these rules on every project, every file, every commit. They are not suggestions — they are constraints. When a project uses specific technologies mentioned here, apply the detailed rules for that technology.

## Dynamic Tech Stack Idioms
Before writing code, ALWAYS check the project root for ecosystem files to correctly adapt these rules to the local idiom:
- **C# / .NET** (Detect: `.csproj`, `sln`): Enforce `Result<T>` or `Result` returns for all handlers. Use `AsNoTracking()` and `.Include()` for DB calls. Force strict Entity Framework DB migrations.
- **Node.js / TS** (Detect: `package.json`): Enforce typed explicit interfaces for the standard API envelopes. If using NestJS, ensure module/service boundaries. If Express, strictly decouple routes from controller logic.
- **Go** (Detect: `go.mod`): Check for idiomatic structured logging (e.g. `slog`) and enforce `err` handling exactly mapping to the explicit JSON error envelopes instead of bare text.
- **Python** (Detect: `requirements.txt`, `pyproject.toml`): Use Pydantic models for the I/O envelopes and strict typing for controller segregation.

## Code Organisation
- **Controllers/Routes:** Routing only. Accept requests, resolve current user/context, call business logic layer, return result. No business logic, no calculations, no data filtering, no direct DB access in controllers.
- **Handlers/Services:** One handler/service per use case. Lives in its own file matching the use case name. Handlers do not call other handlers.
- **Side effects:** Decoupled. Messaging, notifications, emails, and audit logging use events or middleware (never called directly from business logic).
- **Interfaces:** Only when there is >1 implementation or required for test injection. Remove dead weight single-implementation interfaces.
- **File size:** Max 300 lines per class/file. Split if exceeded.
- **Components:** Focused. One responsibility. If it fetches, manages state, and renders — split it.
- **Shared hooks:** Share data hooks with caching (user lists, config). Don't fetch the same data in multiple places.
- **State:** Keep at the lowest necessary level. Don't lift state unless a sibling needs it.

## API Design
- **Envelope:** Every endpoint MUST return a consistent envelope. 
  - Success: `{ "success": true, "data": <T>, "errors": [] }`
  - Failure: `{ "success": false, "data": null, "errors": [{ "code": "ERROR_CODE", "message": "Human-readable" }] }`
  Never return bare data. Never return errors as a bare string.
- **Error codes:** `UPPER_SNAKE_CASE`, domain-prefixed (`ORDER_NOT_FOUND`), fallback `OPERATION_FAILED`. Always in an array.
- **Authentication:** All endpoints authenticated by default. Public endpoints must be explicitly named exceptions.
- **Existing live routes:** Frozen. Never change a response shape on a live endpoint. Use `v2` alongside `v1` (both sharing the same business logic).
- **Multi-tenant:** Never hardcode tenant ID or org name. Resolve from request. If missing, return 401. Store config in DB, not code.

## Logging
- **Structured Logging:** Every handler MUST log context at entry, info-level on success (with IDs/counts), warning-level on validation failures, error-level with full exceptions in catch blocks. Use named/structured params, NOT string concatenation.
- **PII:** Never log passwords, tokens, or PII beyond IDs.

## Data Tables
- **Sorting:** Sortable column headers. Use project's sort component (don't reinvent icons). Default: newest first.
- **Pagination:** 1-based, default 10 rows. Options: `[10, 25, 50, 100]`. `pageSize` MUST be state. Reset to page 1 on sort/filter change.
- **Layout:** Fixed table layout, explicit column widths, truncate long text. NO horizontal scrollbars.
- **Headers:** Minimum widths: short labels 75px, long labels 110-120px. Must not overlap sort icons.
- **Row Position:** Preserve position after update (e.g. no jumping to the end).

## Forms & Inputs
- **Dates:** NEVER use `<input type="date">`. ALWAYS use the themed date picker. Use range picker for from/to ranges. DO NOT use two separate date pickers side by side. State should be `Date` objects, formatting to string only on API calls.
- **Numbers:** NEVER use `<input type="number">`. Use `type="text" inputMode="numeric" pattern="[0-9]*"` to avoid spinners.
- **Money:** Format with locale-aware thousands separators using a shared helper. Use consistently everywhere.
- **Editable cells:** Visually distinct background before click. On focus: auto-select existing value. Skip unchanged values for mutations.
- **Destructive actions:** Use the project's confirmation dialog, which manages its own loading state.
- **Entities:** Prefix with ID, e.g. `(#8) Peter Farrell`. Use typeahead select for dropdowns. Show visual badges where applicable.

## Charts
- **Theme:** Centralised chart theme (grid, axis, tooltips). Hover cursor style on tooltips. 
- **Formatter types:** Never type-annotate formatter callback params in chart components.
- **Colors:** Use the project palette. Do not invent colours.
- **Ranking:** For "all items", rank horizontal bars best to worst.

## Loading, Error & Empty States
- **Loading:** Shimmer/skeleton placeholders. NO spinner icons.
- **Error:** Clear message with icon and detail.
- **Empty:** Helpful message ("No data found for the selected period"), NO blank pages.

## Layout & Styling
- **Widths:** No max-width constraints on page content (use full width).
- **Colors & states:** Use theme tokens. Active states should be subtle tinted backgrounds, not solid blocks. Dark mode: neutral greys, no warm hue bleed.

## Report Pages
- **Structure:** Date filter → Optional filters → Stat cards → Chart container → Data table → Loading/Error states.
- **APIs:** POST reporting APIs use query params, not request body. Use period pill tabs for months, date range picker for from/to. 

## Git Workflow
- `feature/xxx` → PR to `dev/staging` (tests pass) → PR to `main` (tests/approval) → deploy.
- NEVER commit directly to `main` or primary dev branch.
- Commit frequently with descriptive messages. Do not batch unrelated changes.

## Testing
- Add a test for every new endpoint/handler.
- Tests verify response shape and behavior, not implementation details. Prefer integration testing.
- Fix failures before pushing.

## Definition of Done
Business logic in the correct layer (not controllers); API returns consistent envelope; authentication in place; no hardcoded env/tenant values; structured logging handled; frontend tables sort/paginate; frontend uses themed components (dates, dialogs, loading); money formatted; tests passing; no compiler/linter warnings; on a feature branch.

## Deployment
- Verify env vars are set BEFORE claiming deploy works. Test endpoint directly.
- NEVER say "it should work" — run verification and show output. Wait for build and test end-to-end (auth/DB).

## Things You Must Never Do
- Change business logic during a refactor (flag bugs instead).
- Change existing live API routes/response shapes.
- Hardcode env/tenant values.
- Put business logic in controllers. Calling handlers from handlers.
- Create 1-implementation interfaces (unless for tests).
- Use native input types date or number. Use 2 separate date pickers for a range.
- Use spinner icons for full loading. Max-width on page content. Skip pagination/sorting. Format money roughly.
- Commit to main. Claim works without testing. Assume a deploy succeeded. Log PII/passwords.
- Add features/refactors beyond asked. Error handling for impossible scenarios. Over-abstract early.

## Working Style
- Read existing code before changing. Follow established patterns.
- Do ONLY what was asked. One thing at a time.
- Diagnose before switching approaches. Assure before assuming. Be concise.
- Commit after each logical unit.
- If you can do it yourself (migrations, deploys), do it — don't ask permission.
