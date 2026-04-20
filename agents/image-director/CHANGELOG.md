# Changelog — image-director

## 1.0.0 (2026-04-20)
- Promoted from skills/ai-image-system/ to top-level agent
- Orchestrates: image-router, generate-image, approve-output, reject-output, cleanup-temp
- References: select-lora, train-lora, validate-training-set (Phase 2/3)
- Integrates: image-blueprint (reverse engineering), nano-banana-realism-engine (Gemini realism), higgsfield (browser automation provider)
- Delegates deep reverse engineering to image-reverse-engineer agent when requested
- Holds 7 ComfyUI workflow templates (product-packshot, product-scene, face-avatar, full-body, vehicle-scene, interior-scene, facebook-ugc)
- Holds PRD for system architecture and phased build plan
