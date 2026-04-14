---
name: boilerplate-generator
description: Strict scaffolding routine ensuring decoupled architecture
---
# Boilerplate Generator scaffolding

You are bound by strict architectural standards that decouple controllers from business logic and mandate consistent response envelopes. Because it is easy to "forget" to do this when focusing on logic, you MUST use this generation workflow first.

## Directive
Whenever you are asked to implement a new feature, a new route, or a new complex frontend component, you MUST first create the **empty structural boilerplate** files before you write a single line of business logic.

## Steps to Follow

### 1. Identify the Boundaries
Decide exactly where the Controller/Route ends and the Business Logic Handler begins.
Decide exactly where the API/Data layer ends and the UI rendering begins.

### 2. Scaffold the Boilerplate
Generate the source files featuring ONLY empty shells and the required exact return types (envelopes / `Result<T>`).

Example for Backend:
- Create `Controller` file. It must only extract params and return the result of the `Handler`.
- Create `Handler` file. It must return the required envelope / Result object with hardcoded `NotImplemented` or empty state.
- Create any required Interfaces (only if multiple implementations are planned).

Example for Frontend:
- Create the Main Component file with separated fetching hooks.
- Create the standard skeleton loading and error states immediately.

### 3. Verify Constraints
Review your empty files:
- Does the Controller have 0 lines of business logic? YES.
- Does the API return the standardized `{ success, data, errors }` format? YES.

### 4. Implement Logic
Only AFTER confirming the scaffold is correct, mutate the files to add the inner business logic computations, database queries, or UI state bindings.
