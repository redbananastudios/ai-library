# Changelog — lora-version

## 0.1.0 (2026-04-21)
- Initial release as part of the generic LoRA training pipeline
- Three version strategies: semver / date / increment
- Registry path supplied by caller — no hardcoded location
- Derived fields: dataset hash, config hash, recommended weight from evaluation
- Consolidated human-readable run report alongside the model
- Candidate-by-default; explicit opt-in for `approved`
