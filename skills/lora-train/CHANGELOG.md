# Changelog — lora-train

## 0.1.0 (2026-04-21)
- Initial release as the canonical LoRA training skill
- Replaces and generalises the legacy `train-lora` skill (no hardcoded Runpod / kohya assumptions in the skill body)
- Backend-agnostic: kohya_ss, sd-scripts, OneTrainer — caller supplies endpoint + credentials
- Budget tiers preserved from the legacy skill (low / standard / high) with full override support
- LoRA class taxonomy preserved (character / product / style / pose / environment)
- Candidate→approved safety pattern preserved: training always produces `status: candidate`
- Run metadata and training-config artefacts written alongside the `.safetensors`
