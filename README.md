# AI Library

Central reusable library for AI agent skills and subagents.
Single source of truth with automated build and publish pipeline.

## Core Principle

```
author once -> build target artifacts -> publish to Claude and Paperclip
```

**Never** live-edit generated files in `.claude/` or Paperclip targets.
**Always** edit in `ai-library/skills/<id>/` or `ai-library/agents/<id>/` first.

## Folder Layout

```
ai-library/
  skills/<skill-id>/          # Source of truth for skills
    spec.yaml                  # Metadata, version, source info
    prompt.md                  # The actual skill prompt
    CHANGELOG.md               # Version history
    source.json                # Import provenance
    references/                # Supporting docs
    templates/                 # Templates used by the skill
    scripts/                   # Automation scripts
  agents/<agent-id>/           # Source of truth for agents (same structure)
  generated/
    claude/skills/             # Generated Claude-native skill artifacts
    claude/agents/             # Generated Claude-native agent artifacts
    paperclip/skills/          # Generated Paperclip-ready payloads
    paperclip/agents/          # Generated Paperclip-ready payloads
  scripts/                     # Pipeline scripts
  build/
    logs/                      # Build and publish logs
    manifests/                 # Paperclip import manifests
    library-registry.json      # Machine-readable registry
    library-registry.md        # Human-readable registry
  versions.json                # Version tracking for all items
```

## Quick Start

```bash
# See what's in the library
python scripts/status.py

# Validate everything
python scripts/validate-library.py

# Build all items (Claude + Paperclip artifacts)
python scripts/build-all.py

# Publish everything
python scripts/publish-all.py

# Publish a single item
python scripts/publish-item.py claude-seo --target=claude
python scripts/publish-item.py claude-seo --target=paperclip
python scripts/publish-item.py claude-seo --target=both
```

## How to Add a New Skill

1. Create the folder: `ai-library/skills/my-new-skill/`
2. Add `spec.yaml`:
   ```yaml
   id: my-new-skill
   name: My New Skill
   type: skill
   version: 0.1.0
   source_url: ""
   source_kind: custom
   compatible_targets: ['claude', 'paperclip']
   description: What this skill does
   status: active
   ```
3. Add `prompt.md` with the skill prompt
4. Add `source.json` with provenance info
5. Add `CHANGELOG.md`
6. Build: `python scripts/build-skill.py my-new-skill`
7. Publish: `python scripts/publish-item.py my-new-skill --target=both`

## How to Add a New Agent

Same as above, but in `agents/` and set `type: agent` in spec.yaml.

## How to Import from Upstream

```bash
# List all known upstream items
python scripts/import-upstream.py --list

# Import a specific item
python scripts/import-upstream.py claude-seo

# Import all discovered items
python scripts/import-upstream.py --all
```

To add a new upstream source, add an entry to the `DISCOVERED` list in
`scripts/import-upstream.py`.

## How to Build

```bash
python scripts/build-all.py       # Build all items
python scripts/build-skill.py X   # Build one skill
python scripts/build-agent.py X   # Build one agent
```

Build outputs go to `generated/claude/` and `generated/paperclip/`.

## How to Publish

```bash
python scripts/publish-all.py               # Publish everything
python scripts/publish-claude.py             # Publish all to Claude
python scripts/publish-paperclip.py          # Generate all Paperclip manifests
python scripts/publish-item.py X --target=Y  # Publish one item (Y=claude|paperclip|both)
```

Claude publish copies to `.claude/skills/` and `.claude/agents/`.
Paperclip publish generates import manifests in `build/manifests/`.

## How to Version Bump

1. Edit `spec.yaml` and update `version`
2. Update `CHANGELOG.md`
3. Run `python scripts/build-all.py`
4. Run `python scripts/publish-all.py`

## How to Avoid Drift

- NEVER edit files in `.claude/skills/` or `.claude/agents/` directly
- NEVER edit files in `generated/` directly
- Always edit in `skills/<id>/` or `agents/<id>/` first
- Always run build -> publish after editing
- The pipeline backs up existing files before overwriting

## Pipeline Commands Reference

| Command | Purpose |
|---------|---------|
| `python scripts/validate-library.py` | Validate all source items |
| `python scripts/import-upstream.py --all` | Import all upstream items |
| `python scripts/import-upstream.py X` | Import one upstream item |
| `python scripts/build-all.py` | Build all Claude + Paperclip artifacts |
| `python scripts/build-skill.py X` | Build one skill |
| `python scripts/build-agent.py X` | Build one agent |
| `python scripts/publish-all.py` | Publish all to both targets |
| `python scripts/publish-item.py X --target=Y` | Publish one item |
| `python scripts/publish-claude.py` | Publish all to Claude |
| `python scripts/publish-paperclip.py` | Generate all Paperclip manifests |
| `python scripts/status.py` | Show full library status |
