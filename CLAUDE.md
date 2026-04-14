# CLAUDE.md - AI Library

## What This Is

A centralized library of reusable AI skills and agents with an automated build/publish pipeline.
Skills and agents are authored once, then built into artifacts for Claude, Paperclip and Codex targets.

## Architecture

```
skills/<id>/     -> source of truth for skills
agents/<id>/     -> source of truth for agents
generated/       -> build output (never edit directly)
build/           -> registry, manifests, logs
scripts/         -> Python build/publish pipeline
```

Each item has: `spec.yaml` (metadata), `prompt.md` (content), `CHANGELOG.md`, `source.json` (provenance).

## Key Rules

- **Never edit files in `generated/` or `.claude/` directly** - always edit in `skills/<id>/` or `agents/<id>/`
- After editing source, run `build -> publish` to propagate changes
- The pipeline backs up existing files before overwriting

## Common Commands

```bash
python scripts/status.py              # Show library status
python scripts/validate-library.py    # Validate all items
python scripts/build-all.py           # Build all artifacts
python scripts/publish-all.py         # Publish to Claude + Paperclip
python scripts/build-skill.py <id>    # Build one skill
python scripts/build-agent.py <id>    # Build one agent
python scripts/publish-item.py <id> --target=both  # Publish one item
python scripts/import-upstream.py --list            # List upstream sources
python scripts/import-upstream.py <id>              # Import from upstream
```

## Adding a New Skill

1. Create `skills/<id>/` directory
2. Add `spec.yaml` with: id, name, type (skill), version, source_url, source_kind, compatible_targets, description, status
3. Add `prompt.md` with the skill prompt (can include YAML frontmatter with name, description, trigger)
4. Add `source.json` with import provenance
5. Add `CHANGELOG.md`
6. Build: `python scripts/build-skill.py <id>`
7. Publish: `python scripts/publish-item.py <id> --target=both`

## Adding a New Agent

Same as skills but in `agents/` directory with `type: agent` in spec.yaml.
Agents are built as single `.md` files with YAML frontmatter (name, description, allowed_tools).

## spec.yaml Fields

```yaml
id: my-item
name: My Item
type: skill              # skill | agent | metadata
version: 0.1.0
source_url: ""           # upstream repo URL
source_kind: github      # github | community | custom
compatible_targets: ['claude', 'paperclip', 'codex']
description: What this does
status: imported         # imported | active | placeholder | clone_failed
trigger: ""              # auto-activation trigger phrase
requirements: []
```

## Build Targets

- **Claude**: Generates `SKILL.md` (skills) or `<id>.md` (agents) with YAML frontmatter, publishes to `~/.claude/skills/` and `~/.claude/agents/`
- **Paperclip**: Generates `payload.json` manifests in `build/manifests/`
- **Codex** (OpenAI Codex CLI): Generates `SKILL.md` (skills, strict 5-key frontmatter: `name`, `description`, `license`, `allowed-tools`, `metadata`) or `<id>.toml` (agents, with `[instructions].text` block). Publishes to `~/.codex/skills/` and `~/.codex/agents/`. Respects `CODEX_HOME` env var.

## Pipeline Code

All scripts are in `scripts/` and share `lib.py` as core utilities.
Key paths are defined in `lib.py`: ROOT, SKILLS_DIR, AGENTS_DIR, GEN_CLAUDE_*, GEN_CODEX_*, BUILD_DIR, etc.
The publish target for Claude is the user's home `~/.claude/`. Codex publishes to `~/.codex/` (or `$CODEX_HOME`).

## Current Inventory

- **60 skills** across: SEO, marketing, Shopify (11), WordPress (4), ads, dev tools, design, content, image generation
- **3 agents** (backend-developer, frontend-developer, fullstack-developer) - currently clone_failed status
- **2 metadata** items (awesome-agent-skills, awesome-claude-code-subagents)

## Style Notes

- Python scripts use basic YAML parsing (no PyYAML dependency) - keep spec files simple/flat
- All paths use pathlib
- Logging goes to both stdout and `build/logs/` date-stamped files
