# Changelog — lora-evaluate

## 0.1.0 (2026-04-21)
- Initial release as part of the generic LoRA training pipeline
- Test grid covers four intents: identity, flexibility, style-neutrality, negative-control
- Weight sweep (default `[0.5, 0.7, 0.9]`)
- Four scoring axes: consistency, fidelity, overfitting, artefacts
- Pass / review / fail verdict with recommended weight
- Read-only on the model file — never mutates or promotes
- Explicit "Return Value" contract for callers (status, evaluation_path, grid_dir, recommended_weight, scores)
