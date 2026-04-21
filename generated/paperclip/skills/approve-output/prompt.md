---
name: Approve Output
description: Mark image outputs as approved and update project memory
trigger: when user approves generated images
---

# Approve Output

Mark generated images as approved. This updates memory so the system learns what works.

## Input

- Job ID or output path
- Which specific images are approved (by number or "all")
- Optional notes from user about what they liked

## Actions

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

## Output

Confirm to user:
- Which images were approved
- Where selected images are saved
- What was learned (brief summary)
