# Workflows

Orchestration layer for the AI Library. Declarative YAML pipelines that coordinate skills into coherent marketing outputs — image + caption + CTA built from the same concept, blogs with SEO refinement baked in, ad variant sets ready for A/B testing.

Workflows are the missing middle between **isolated capabilities** (skills) and **autonomous marketing operations** (scheduled runs, analytics feedback loops, cross-brand scale).

## System Hierarchy

| Layer         | Role                                          | Example                             |
| ------------- | --------------------------------------------- | ----------------------------------- |
| **Agents**    | Decision makers / operators. Pick what to do. | `social-media-manager`, `seo-manager` |
| **Workflows** | Execution pipelines. Specify how steps compose. | `social_post`, `blog_post`        |
| **Skills**    | Capabilities / functions. Do one thing.       | `copywriter`, `generate-image`    |

An agent decides to publish a LinkedIn post today → invokes the `social_post` workflow → the workflow calls `content-idea-generator`, `image-blueprint`, `generate-image`, `social-content`, `copywriter` in order, passing shared context between them → returns a structured post.

## V1 Scope

This is a **v1 foundation**: workflow definitions and documentation only. No executor ships in this change. Runtimes (agents, CLIs, future schedulers) consume these YAMLs today by following the declared sequence manually or via model-driven orchestration.

**Not in v1:** workflow executor, build-pipeline integration, scheduler, validation tooling, per-workflow `spec.yaml`. These arrive once the shape is proven.

## Folder Layout

```
workflows/
  README.md                              # This file
  content/                               # Reserved for cross-channel content workflows
  social/
    social_post.yaml                     # Coherent image + caption + CTA from one concept
  blog/
    blog_post.yaml                       # SEO-focused blog content pipeline
  ads/
    ad_variants.yaml                     # Multi-variant ad creative for A/B testing
  analytics/
    performance_review.yaml              # Pull + normalise + insights + recommendations
  automation/
    daily_marketing_runner.yaml          # Meta-workflow: coordinates the above daily
  shared/
    README.md                            # Data contract for inter-step handoff
```

## YAML Schema

```yaml
name: <workflow-name>
description: <one-line purpose>
version: 0.1.0

input:
  - name: brand
    required: true
  - name: campaign_goal
    required: false

steps:
  - id: <step-id>
    skill: <library-skill-id>            # or `workflow: <other-workflow>` or `type: manual`
    description: <what this step does>
    input:
      concept: $input.concept
      tone: $input.brand.voice
    output: <key written back to shared context>

outputs:
  - caption
  - image_url
  - cta
```

### Reference Conventions

- `$input.<name>` — read from workflow-level input
- `$steps.<step-id>.output` — read prior step output
- `skill: <id>` — resolves to `skills/<id>/` at execution time
- `workflow: <name>` — invoke a child workflow (see `automation/daily_marketing_runner.yaml`)
- `type: manual` — escape hatch for steps without a dedicated skill (e.g. "assemble final object")

## Execution Model

A runtime consuming a workflow is expected to:

1. **Load** the workflow YAML
2. **Validate** required `input` fields are provided
3. **Initialise** a shared context object (see [shared/README.md](shared/README.md))
4. **Execute** steps sequentially, resolving each step's `input` references against the shared context, invoking the named skill (or child workflow), and writing the result back to the shared context under the declared `output` key
5. **Return** a structured object with the declared `outputs` fields

Workflows should be callable by agents, CLIs, orchestrators, or future schedulers — the definition is runtime-agnostic.

## Example Invocation (conceptual)

```
agent: social-media-manager
  -> load workflows/social/social_post.yaml
  -> provide input: { brand: "Red Banana Studios", platform: "linkedin", objective: "thought leadership" }
  -> execute steps in order, shared context accumulates
  -> receive final post object { image_url, caption, cta, platform }
  -> hand off to upload-post skill for publishing
```

## Scheduling

**Scheduling lives outside the library.** There is no cron or daemon infrastructure in this repo. The `automation/daily_marketing_runner.yaml` defines the daily sequence; the actual daily trigger is a future concern — options include:

- Claude Code `/schedule` skill
- GitHub Actions scheduled workflows
- External cron + CLI invocation
- A `scripts/run-workflow.py` runner (not yet built)

## Future Direction

The folder structure and schema anticipate, but do not yet implement:

- **A/B testing** — `ad_variants.yaml` emits structured variants ready for tagging
- **Analytics feedback loops** — `performance_review.yaml` outputs recommendations the daily runner can feed back into concept generation
- **Scheduled runs** — external schedulers invoking `daily_marketing_runner.yaml`
- **Human approval checkpoints** — a future `status: needs-review` field in workflow outputs
- **Multi-brand support** — `brand` is already a first-class input field
- **Multi-channel publishing** — `dispatch_child_workflows` pattern in the daily runner
- **Content scoring** — future step type that ranks outputs before publish
- **Ready-to-publish tagging** — `daily_marketing_runner.yaml` reserves a `status` output (draft | review | ready-to-publish); concrete tagging rules are future work

## Relationship to Skills and Agents

Workflows do **not** use `spec.yaml`, are not built into `generated/`, and do not appear in `build/library-registry.json`. They are orchestration contracts, not deployable artifacts. Skills and agents get published to the Claude harness; workflows are library-internal definitions consumed by runtimes that already have skills available.

If a workflow references a skill that does not exist in `skills/<id>/`, treat it as aspirational — either the skill needs to be built, or the step should be flagged with `type: manual`.

## See Also

- [shared/README.md](shared/README.md) — canonical shared context data contract
- [../skills/](../skills/) — available skills workflows can reference
- [../agents/](../agents/) — agents that invoke workflows
