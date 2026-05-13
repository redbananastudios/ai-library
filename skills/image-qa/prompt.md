---
name: Image QA
description: Judge generated image outputs — approve or reject with learning feedback
trigger: when user approves or rejects generated images
---

# Image QA

Judge generated image outputs. Two modes: **approve** (record what worked) or **reject** (record what failed). Both update project memory so the system improves over time.

## Input

- Job ID or output path
- **Approve**: which images are approved (by number or "all"), optional notes about what worked
- **Reject**: reason for rejection, failure category

---

## Mode: Approve

### 1. Update metadata.json

Set `approval_status` to `"approved"` in the job's metadata.json.
Add user notes if provided.

### 2. Copy to Selected

Copy approved images from `all/` to `selected/` within the job output folder.

### 3. Write Winning Patterns

Append to `./ai-image-system/memory/winning-patterns.md`:

```markdown
## {date} — {job_id}

**Request**: {request_summary}
**Category**: {category}
**Provider**: {provider}
**Workflow**: {workflow_template}
**Base Model**: {base_model}
**LoRAs**: {loras_used or "none"}
**Prompt**: {positive_prompt}
**What worked**: {user_notes or "User approved without specific notes"}
**Seeds**: {approved_seeds}

---
```

### 4. Promote Candidate LoRA (if applicable)

If the job used a candidate LoRA (status: `candidate` in lora-registry.json):
- Update its status to `approved`
- Set `approved_date` and `approved_job_id`
- The LoRA is now available for automatic selection in future jobs

### 5. Update Workflow Registry

Append success record to `./ai-image-system/memory/workflow-registry.json`:
```json
{
  "workflow": "product-packshot",
  "category": "product-packshot",
  "success_count": +1,
  "last_success": "2026-04-20",
  "avg_approval_rate": 0.75
}
```

---

## Mode: Reject

### Failure Categories

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

| Failure | Suggestion |
|---------|-----------|
| prompt | Rewrite prompt with more specifics |
| workflow | Try different workflow template |
| provider | Try different provider or model |
| lora | Remove LoRA or try different weight |
| quality | Increase steps, try higher quality tier |
| composition | Adjust dimensions or reframe |

---

## Output

Confirm to user:
- What action was taken (approved/rejected)
- Where images were saved or moved
- What was learned (brief summary)
- Suggested next action (for rejections)
