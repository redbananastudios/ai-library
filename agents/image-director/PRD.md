# AI Image Generation System — PRD

## Overview

Production-ready image generation pipeline for Claude and other agents. Supports multiple image providers, fixed workflow templates, LoRA usage, optional LoRA training, project-local storage, and reusable skills/agents built through the existing library pipeline.

## Context

- The library is the source of truth
- Skills live in `skills/<skill-id>/`
- Agents live in `agents/<agent-id>/`
- Generated artifacts are built for Claude, Paperclip, and Codex
- Never hand-edit generated targets
- Build from source items and publish through the normal pipeline

## Primary Goal

Create and integrate a full image-generation capability into the ai-library so agents can choose between multiple providers:

- **Stable Diffusion** via Runpod Serverless + ComfyUI (PRIMARY — Phase 1)
- **Gemini** (Phase 4)
- **Higgsfield** (Phase 4)

## Image Types Supported

| Category | Examples |
|----------|----------|
| face/avatar | realistic human face, avatar identity images |
| full-body/lifestyle | realistic human body, lifestyle shots |
| product isolated | taps, sinks, Willow & Weir products |
| product in scene | kitchen/bathroom context shots |
| vehicle/van/taxi | Marley Moves vans, taxi fleet |
| room/interior scene | bathrooms, kitchens, showrooms |
| Facebook/UGC ad creative | social ads, UGC-style |
| general branded scene | brand compositions |

## Providers

### Runpod Serverless + ComfyUI (Phase 1)

- **Base models**: SDXL (Juggernaut/RealVis primary), SD 1.5 (fallback)
- **Future**: FLUX (optional later)
- **Setup**: First-time (no existing account assumed)
- **Workflow**: Generic templates designed from scratch

### Gemini (Phase 4)

- Direct Gemini API (NOT Vertex)
- API key scaffolded but not yet configured

### Higgsfield (Phase 4)

- Existing browser automation skill
- No API access needed

## Provider Routing Rules

- Use Runpod/SD when LoRAs or reusable visual identity matter
- Use Gemini when explicitly requested or conversational iteration preferred
- Use Higgsfield when explicitly requested or has known advantage
- Configurable in project memory and agent settings

## LoRA System

### Policy

- Prefer existing LoRAs first
- Only ask for image sets when no useful LoRA exists AND consistency matters
- Validate image sets before training
- Reject weak datasets
- Only promote/store a LoRA after an approved output confirms it is useful

### Classes (priority order)

1. character
2. product
3. style
4. pose (later)
5. environment (later)

### Training Backend

- **Provider**: Runpod (same environment as generation)
- **Framework**: kohya_ss
- **Budget tiers**:
  - Low: 10–20 min (quick test)
  - Standard: 20–40 min (default)
  - High: 40–90 min (key assets only)

### Self-Training Workflow

1. Image request arrives
2. Check if suitable LoRA exists in project
3. If exists → use it
4. If not exists AND consistency matters → ask user for image set
5. If user provides set → validate it
6. If dataset good → train candidate LoRA
7. Use candidate in generation
8. Only after APPROVED output → store and register LoRA
9. System automatically considers registered LoRA in future routing

### Dataset Validation Rules

- Minimum image count threshold
- Subject consistency
- Acceptable resolution/quality
- Low duplication
- No mixed unrelated concepts
- No poor crops
- Clear naming and metadata

## Project-Local Storage Structure

```
./ai-image-system/
├── inputs/
│   ├── briefs/
│   ├── reference-images/
│   └── training-sets/
├── memory/
│   ├── brand-profile.md
│   ├── visual-style.md
│   ├── winning-patterns.md
│   ├── failed-patterns.md
│   ├── lora-registry.json
│   ├── workflow-registry.json
│   └── provider-preferences.json
├── workflows/
│   ├── face-avatar.json
│   ├── full-body.json
│   ├── product-packshot.json
│   ├── product-scene.json
│   ├── vehicle-scene.json
│   ├── interior-scene.json
│   └── facebook-ugc.json
├── models/
│   └── loras/
│       ├── character/
│       ├── product/
│       ├── style/
│       ├── pose/
│       └── environment/
├── jobs/
│   ├── active/
│   ├── completed/
│   └── failed/
├── outputs/
│   └── YYYY-MM-DD/
│       └── job-name/
│           ├── metadata.json
│           ├── prompt.txt
│           ├── selected/
│           ├── all/
│           └── thumbs/
├── temp/
└── logs/
```

## Output Requirements

Every generation job must:
- Generate 3–5 outputs by default
- Save prompt.txt
- Save metadata.json (request summary, provider, category, workflow template, base model, LoRAs used, reference images, seeds, size, negative prompt, timestamp, approval status, notes)
- Record workflow, provider, LoRAs, reference images used
- Support approval / rejection
- Write winning/failed patterns back into memory

## Approval Memory Loop

**After approved results:**
- Write what worked into `winning-patterns.md`
- Store prompt recipe, provider, workflow, LoRA used
- Save reusable notes for future routing

**After rejected results:**
- Write what failed into `failed-patterns.md`
- Save why it failed
- Note whether problem was provider, workflow, LoRA, prompt, or dataset

## Core Skills

| Skill | Purpose | Phase |
|-------|---------|-------|
| ai-image-system | Parent orchestrator, PRD, system docs | 1 |
| image-router | Choose provider, category, workflow, check LoRA registry | 1 |
| generate-image | Execute generation, save outputs and metadata | 1 |
| approve-output | Mark approved, promote LoRA, write memory | 1 |
| reject-output | Mark rejected, write failure notes | 1 |
| cleanup-temp | Remove temporary files safely | 1 |
| select-lora | Match best existing LoRA(s) | 2 |
| train-lora | Train candidate LoRA via kohya_ss on Runpod | 3 |
| validate-training-set | Check dataset quality before training | 3 |

## Workflow Templates

Fixed templates for v1 (no dynamic node graph editing):
- Choose template → inject variables → choose LoRAs → execute → save

Templates: face-avatar, full-body, product-packshot, product-scene, vehicle-scene, interior-scene, facebook-ugc

## Execution Model

- REST-first design for providers
- Runpod Serverless + ComfyUI as primary backend
- Fixed workflow templates in v1
- Optional thin MCP wrapper only if useful (Phase 4)

## Brands

### Willow & Weir
- **Products**: taps, sinks, bathroom fixtures, kitchen scenes
- **Image types**: product-packshot, product-scene, interior-scene

### Marley Moves
- **Assets**: vans (fleet branding)
- **Image types**: vehicle-scene

### Taxi System
- **Assets**: cars (fleet branding)
- **Image types**: vehicle-scene

## Phased Implementation

### Phase 1 — MVP
- Runpod serverless setup scaffolded
- ComfyUI product-packshot workflow working
- Generate 3–5 product images per request
- Save outputs locally with metadata
- Approve/reject loop
- No LoRA training yet

### Phase 2 — LoRA Usage + Face/Avatar
- Add LoRA selection from registry
- Add face-avatar workflow
- Add full-body workflow

### Phase 3 — LoRA Training + Memory
- Add training via kohya_ss on Runpod
- Add dataset validation
- Add memory system (winning/failed patterns)
- Self-learning loop active

### Phase 4 — Multi-Provider + MCP
- Add Gemini routing
- Add Higgsfield routing
- Optional MCP wrapper
- Full provider-preferences system

## Success Metrics

- Product packshot working end-to-end in Phase 1
- < 60s generation time per batch
- Approval rate > 70% after memory system active
- LoRA reuse rate increasing over time
- Zero manual file management needed
