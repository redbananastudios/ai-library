---
name: reject-output
description: Mark generated image outputs as rejected. Records failure reasons to memory, identifies whether the issue was provider, workflow, LoRA, prompt, or dataset.
trigger: reject image, bad output, image not right, redo
---
---
name: Reject Output
description: Mark image outputs as rejected and record what failed
trigger: when user rejects generated images or requests changes
---

# Reject Output

Mark generated images as rejected. Records what went wrong so the system avoids repeating mistakes.

## Input

- Job ID or output path
- Reason for rejection (from user or inferred)
- Failure category (ask user if unclear)

## Failure Categories

Classify every rejection into one of:

| Category | Examples |
|----------|----------|
| `prompt` | Wrong subject, missing details, prompt misunderstood |
| `workflow` | Wrong composition, bad framing, template mismatch |
| `provider` | Artifacts, glitches, model limitations |
| `lora` | LoRA too strong/weak, wrong style applied |
| `dataset` | LoRA was trained on bad data |
| `quality` | Blurry, low-res, color issues |
| `composition` | Bad layout, wrong aspect ratio, cluttered |

## Actions

### 1. Update metadata.json

Set `approval_status` to `"rejected"`.
Add `rejection_reason` and `failure_category`.

### 2. Write Failed Patterns

Append to `./ai-image-system/memory/failed-patterns.md`:

```markdown
## {date} — {job_id}

**Request**: {request_summary}
**Category**: {category}
**Provider**: {provider}
**Workflow**: {workflow_template}
**LoRAs**: {loras_used or "none"}
**Prompt**: {positive_prompt}
**Failure category**: {failure_category}
**What failed**: {rejection_reason}
**Suggested fix**: {what to try differently}

---
```

### 3. Revoke Candidate LoRA (if applicable)

If the job used a candidate LoRA and the failure is LoRA-related:
- Update status to `rejected` in lora-registry.json
- Do NOT delete the LoRA files (keep for reference)
- Note why it failed

### 4. Move Job to Failed

Move job from `jobs/completed/` or `jobs/active/` to `jobs/failed/`.

### 5. Suggest Retry

Based on failure category, suggest:

| Failure | Suggestion |
|---------|-----------|
| prompt | Rewrite prompt with more specifics |
| workflow | Try different workflow template |
| provider | Try different provider or model |
| lora | Remove LoRA or try different weight |
| quality | Increase steps, try higher quality tier |
| composition | Adjust dimensions or reframe |

## Output

Confirm to user:
- Rejection recorded
- What was identified as the issue
- Suggested next action for retry
