---
name: Generate Image
description: Execute image generation via Runpod Serverless + ComfyUI
trigger: when image-router has selected provider and parameters, execute the generation
---

# Generate Image

You execute image generation jobs against Runpod Serverless + ComfyUI and manage the full output lifecycle.

## Prerequisites

- Runpod API key set as environment variable: `RUNPOD_API_KEY`
- Runpod Serverless endpoint ID: `RUNPOD_ENDPOINT_ID`
- Project folder `./ai-image-system/` initialized

## Input

A routing decision from image-router containing:
- provider, category, workflow_template
- base_model, loras, width, height, steps, cfg_scale, sampler, batch_size
- negative_prompt
- The user's positive prompt

## Execution Flow

### Step 1: Load Workflow Template

Read the ComfyUI workflow JSON from:
```
./ai-image-system/workflows/{workflow_template}.json
```

### Step 2: Inject Parameters

Replace template variables in the workflow JSON:

| Variable | Source |
|----------|--------|
| `{{positive_prompt}}` | User's prompt + quality enhancers |
| `{{negative_prompt}}` | From routing decision |
| `{{width}}` | From routing decision |
| `{{height}}` | From routing decision |
| `{{steps}}` | From routing decision |
| `{{cfg_scale}}` | From routing decision |
| `{{sampler}}` | From routing decision |
| `{{seed}}` | Random per image, or user-specified |
| `{{batch_size}}` | From routing decision |
| `{{base_model}}` | From routing decision |
| `{{lora_name}}` | From LoRA selection (or empty) |
| `{{lora_weight}}` | From LoRA selection (default 0.7) |

### Step 3: Create Job Record

Create `./ai-image-system/jobs/active/{job-id}.json`:
```json
{
  "id": "job-20260420-143022-packshot",
  "status": "submitted",
  "provider": "runpod",
  "category": "product-packshot",
  "workflow_template": "product-packshot",
  "prompt": "...",
  "parameters": { ... },
  "created_at": "2026-04-20T14:30:22Z",
  "runpod_job_id": null
}
```

### Step 4: Submit to Runpod

POST to Runpod Serverless API:

```
POST https://api.runpod.ai/v2/{RUNPOD_ENDPOINT_ID}/run
Authorization: Bearer {RUNPOD_API_KEY}
Content-Type: application/json

{
  "input": {
    "workflow": <injected workflow JSON>,
    "images": []
  }
}
```

Store the returned `id` as `runpod_job_id`.

### Step 5: Poll for Completion

```
GET https://api.runpod.ai/v2/{RUNPOD_ENDPOINT_ID}/status/{runpod_job_id}
```

Poll every 5 seconds. Timeout after 120 seconds.

Status values:
- `IN_QUEUE` → waiting
- `IN_PROGRESS` → generating
- `COMPLETED` → download outputs
- `FAILED` → record error, move to failed

### Step 6: Download and Save Outputs

On COMPLETED, save to:
```
./ai-image-system/outputs/YYYY-MM-DD/{job-name}/
├── all/
│   ├── 001.png
│   ├── 002.png
│   ├── 003.png
│   └── 004.png
├── prompt.txt
└── metadata.json
```

### Step 7: Write metadata.json

```json
{
  "job_id": "job-20260420-143022-packshot",
  "request_summary": "Willow & Weir chrome tap on white background",
  "provider": "runpod",
  "category": "product-packshot",
  "workflow_template": "product-packshot",
  "base_model": "juggernaut_xl",
  "loras_used": [],
  "reference_images": [],
  "seeds": [12345, 67890, 11111, 22222],
  "width": 1024,
  "height": 1024,
  "steps": 30,
  "cfg_scale": 7.0,
  "sampler": "euler_ancestral",
  "negative_prompt": "...",
  "positive_prompt": "...",
  "timestamp": "2026-04-20T14:30:22Z",
  "duration_seconds": 45,
  "output_count": 4,
  "approval_status": "pending",
  "notes": ""
}
```

### Step 8: Move Job to Completed

Move from `jobs/active/` to `jobs/completed/`.

### Step 9: Present to User

Tell the user:
- How many images generated
- Where they're saved
- Ask for approval/rejection

## Error Handling

- If Runpod returns FAILED: save error to `jobs/failed/`, report to user
- If timeout exceeded: report timeout, suggest retry with fewer steps
- If API key missing: tell user to set `RUNPOD_API_KEY` and `RUNPOD_ENDPOINT_ID`
- If workflow template not found: list available templates

## Prompt Enhancement

Before sending, enhance the user's prompt with quality tags:

For product-packshot:
```
{user_prompt}, professional product photography, studio lighting, clean white background, sharp focus, high detail, 8k quality
```

For product-scene:
```
{user_prompt}, interior photography, natural lighting, editorial style, sharp focus, realistic materials, high detail
```

Do NOT over-enhance — keep the user's intent primary.
