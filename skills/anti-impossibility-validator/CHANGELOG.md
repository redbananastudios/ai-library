# Changelog

## 1.0.0 (2026-04-14)

### Added
- Initial release: 5-constraint validation framework
- Grounding & Contact validation
- Structural Integrity validation
- Material Opacity validation
- Perspective Consistency validation
- Anatomical & Functional Correctness validation
- JSON output format with scores and violation details
- Regen recommendations with prompt fixes
- Cost savings analysis
- 4 usage patterns (single image, with fixes, batch, blueprint)
- Integration guides with nano-banana-realism-engine, higgsfield-video, image-reverse-engineer
- Pre-generation validation checklist
- Severity scoring (critical, high, medium, low)

### Design
- Optimized for Claude Haiku execution (~$0.01 per image)
- Cost-optimized workflow: draft → validate → fix → regen → validate
- Estimated 65% cost savings vs. blind regeneration
