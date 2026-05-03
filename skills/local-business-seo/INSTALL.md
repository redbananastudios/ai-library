# Installing the Local Business SEO Kit

This kit is designed to drop into the standard Claude Code skills/agents
locations.

## Layout assumed

- Skills: `~/.claude/skills/<skill-name>/SKILL.md`
- Agents: `~/.claude/agents/<agent-name>.md`

(On Windows: `C:\Users\<user>\.claude\skills\` and `C:\Users\<user>\.claude\agents\`.)

## Install (Windows / bash)

```bash
# From this kit's root:
KIT="$PWD"
TARGET_SKILLS="$HOME/.claude/skills"
TARGET_AGENTS="$HOME/.claude/agents"

# Skills
for d in "$KIT"/skills/*/; do
  name=$(basename "$d")
  cp -r "$d" "$TARGET_SKILLS/$name"
done

# Agent
cp "$KIT"/agents/local-service-seo-builder.md "$TARGET_AGENTS/"
```

## Install (Windows / PowerShell)

```powershell
$Kit = $PWD
$Skills = "$HOME\.claude\skills"
$Agents = "$HOME\.claude\agents"

Get-ChildItem "$Kit\skills" -Directory | ForEach-Object {
    Copy-Item $_.FullName -Destination $Skills -Recurse -Force
}
Copy-Item "$Kit\agents\local-service-seo-builder.md" -Destination $Agents -Force
```

## Verify

In Claude Code, after install:

```
/help
```

You should see all 7 skills listed under available skills, with names
starting `local-business-`. The agent should be invokable as
`@local-service-seo-builder`.

## Updating

Re-running the install commands above is idempotent — it will overwrite
the previous version of each skill. The kit is self-contained, no
package manager hooks.

## Sharing

If you want to share with teammates, zip the kit folder and send it.
Or push it to a private git repo and have teammates clone + run the
install script.
