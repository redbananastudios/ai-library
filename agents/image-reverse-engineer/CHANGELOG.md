# Changelog - image-reverse-engineer

## [2.0.0] - 2026-04-13

### Changed (Major Rebuild)
- **Architectural redesign**: Agent now fully standalone with no external skill dependencies
  - Previous: Invoked image-blueprint skill for vision analysis (not supported in Claude Code)
  - Now: Embedded complete 7-dimension vision analysis directly in agent using Claude's multimodal capabilities
- **Tool configuration moved to spec.yaml**: Correct spec.yaml for allowed_tools definition (was in prompt.md frontmatter)
  - `allowed_tools: ['read', 'write', 'edit', 'bash', 'glob', 'grep', 'agent']`
  - Enables: file persistence, batch processing, blueprint diffing via parallel agents
- **No YAML frontmatter in prompt.md**: Removed duplicate header block (build script now provides from spec.yaml)

### Added (New Capabilities)
- **File persistence**: Saves 3 files per image to `./blueprints/{image-name}-*`
  - `-blueprint.json`: Full 10-section analysis
  - `-prompts.json`: 4 platform-native reproduction prompts
  - `-controlnet.json`: ControlNet recommendations
- **Batch processing**: Accept multiple images; analyze in parallel via `agent` tool for concurrent generation
- **Blueprint diffing**: Compare two existing blueprints to identify visual differences
- **Iterative refinement**: Modify blueprint fields and regenerate prompts without re-analyzing image
- **Comprehensive error handling**: Image validation (accessible, format, quality); JSON validation; prompt syntax checking; recovery logic
- **7-dimension embedded analysis**: Complete workflow for composition, lighting, color, technical style, subject details, artistic DNA
  - Full forensic depth (Layer 1–6 methodology for artistic DNA)
  - Structured output fields for each dimension
  - Reference materials (nano-banana-realism-engine, higgsfield) used as knowledge base, not skill invocation

### Improved
- **JSON Blueprint Schema**: Fully documented 10-section template with all field definitions
- **ControlNet Decision Matrix**: Comprehensive recommendation logic by image type with synergistic combinations
- **Reproduction Prompts**: Platform-native generation with detailed templates and validation
- **Recovery & Validation**: Explicit handling for inaccessible images, invalid JSON, incomplete analysis
- **Documentation**: Expanded guardrails, FAQ, interaction patterns, workflow examples

### Fixed
- **Bug: allowed_tools in wrong location** → Now correctly in spec.yaml (build pipeline reads from here)
- **Bug: Double YAML frontmatter** → Removed from prompt.md; build script provides single header
- **Architectural limitation: No skill invocation** → All analysis now embedded; no external dependencies

### Removed
- Dependency on `image-blueprint` skill (no longer needed; analysis embedded)
- Dependency on skill invocation pattern (not supported in Claude Code agents)
- YAML frontmatter from prompt.md (build script handles)

---

## [1.0.0] - 2026-04-13

### Added
- Initial agent creation with complete image deconstruction orchestration
- Workflow: Image intake → blueprint generation → analysis presentation → reproduction
- Full integration with `image-blueprint` skill for vision analysis
- JSON blueprint presentation with all 10 sections (composition, lighting, color, technical style, subject details, artistic DNA, reproduction prompts, ControlNet recommendations, generation settings)
- Key Insights generation: 3–5 bullets summarizing image's distinctive qualities
- Platform-specific reproduction prompts (Midjourney, Flux, Stable Diffusion, Higgsfield)
- ControlNet pipeline recommendations with alternative options and troubleshooting
- Higgsfield generation integration for optional image/video reproduction
- Iterative refinement support: user can modify direction, mood, style; agent regenerates prompts
- 5 common interaction patterns (analyze, create like, generate on platform, modify direction, recreate prompts)
- Complete example workflow: Editorial Fashion Portrait analysis end-to-end
- FAQ covering prompt modification, ControlNet usage, variation generation, accuracy
- Guardrails: Never bypass image-blueprint skill, never identify real people, maintain JSON validity, keep platform authenticity

### Features
- Structured presentation format: Blueprint → Insights → Prompts → ControlNet → Next Steps
- Integration with nano-banana-realism-engine for cinematography language in prompts
- Optional higgsfield-video for animated versions of analyzed compositions
- Multi-platform prompt optimization with platform-specific strengths explained
- Comparison notes when generating to show how output aligns with source
- Flexibility: analyze-only or analyze-and-generate workflows
- Clear CTAs with multiple next-step options for user direction

