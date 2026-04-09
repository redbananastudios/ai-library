---
name: Google Stitch AI UI Designer
description: Design and generate UI components, web pages, and applications using Google Stitch AI
trigger: stitch, google stitch, design ui, generate ui, ai ui design, design website, create ui
---

# Google Stitch AI UI Designer

You are an expert at using Google Stitch (stitch.withgoogle.com) to design and generate UI components, web pages, and full applications. Stitch is an AI-native software design canvas from Google Labs, powered by Gemini 2.5 Pro.

## Setup — MCP Server (Recommended)

The Stitch MCP server lets AI agents interact with Stitch programmatically. This is the preferred integration method.

### Install and Initialize

```bash
npx @_davideast/stitch-mcp init
```

This guided wizard handles Google Cloud OAuth authentication, credential storage, and MCP client configuration.

### MCP Client Configuration

Add to your MCP settings (Claude Code, Cursor, VS Code, etc.):

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["@_davideast/stitch-mcp", "proxy"]
    }
  }
}
```

### Alternative: API Key Authentication

```bash
export STITCH_API_KEY="your-api-key"
```

Generate an API key in Stitch settings — it doesn't expire. Then configure:

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["@_davideast/stitch-mcp", "proxy"],
      "env": {
        "STITCH_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Verify Setup

```bash
npx @_davideast/stitch-mcp doctor
```

## MCP Tools Available

| Tool | Description |
|------|-------------|
| `create_project` | Create a new Stitch design project |
| `generate_screen_from_text` | Generate a UI screen from a text prompt |
| `get_screen` | Get details about a specific screen |
| `get_screen_code` | Download the HTML/CSS code for a screen |
| `get_screen_image` | Download a screenshot of the screen as base64 |
| `build_site` | Map screens to routes and generate a full site |

### build_site Example

```json
{
  "projectId": "123456",
  "routes": [
    { "screenId": "abc", "route": "/" },
    { "screenId": "def", "route": "/about" },
    { "screenId": "ghi", "route": "/pricing" }
  ]
}
```

## CLI Commands

The stitch-mcp package also works as a standalone CLI:

```bash
# Browse all projects interactively
npx @_davideast/stitch-mcp view --projects

# Preview project screens locally in browser
npx @_davideast/stitch-mcp serve -p <project-id>

# List screens in terminal
npx @_davideast/stitch-mcp screens -p <project-id>

# Generate a full Astro site from screens
npx @_davideast/stitch-mcp site -p <project-id>

# Save screen state to file
npx @_davideast/stitch-mcp snapshot

# Invoke MCP tools directly from CLI
npx @_davideast/stitch-mcp tool build_site -d '{
  "projectId": "123456",
  "routes": [
    { "screenId": "abc", "route": "/" }
  ]
}'

# List all available MCP tools
npx @_davideast/stitch-mcp tool

# View tool schema
npx @_davideast/stitch-mcp tool <name> -s
```

## Browser Workflow (Alternative)

If MCP is not configured, you can use Stitch via browser at **https://stitch.withgoogle.com**:

1. Sign in with Google account (350 free generations/month)
2. Describe the UI in natural language or upload a sketch/wireframe/screenshot
3. Generate and review design variants
4. Iterate with follow-up prompts ("Make the header larger", "Switch to dark mode")
5. Export: **Code** (HTML/CSS) or **Figma** (editable layers with Auto Layout)

## Best Practices

- **Use MCP for automation**: The MCP server is the best way to integrate Stitch into coding workflows
- **Be descriptive in prompts**: Include color palettes, layout preferences, target audience, and UX patterns
- **Use reference images**: Upload screenshots of designs you like as inspiration
- **Iterate in stages**: Start broad (layout), then refine details (colors, typography, spacing)
- **Generate variants**: Always generate multiple variants before committing to a direction
- **build_site for multi-page**: Use `build_site` to map screens to routes for complete websites
- **Export early and often**: Download code at each milestone to track progress

## Prompt Tips for Better Results

| Goal | Prompt Pattern |
|------|---------------|
| Specific style | "A [style] [component] with [color] palette and [typography]" |
| Clone a design | Upload screenshot + "Recreate this with [modifications]" |
| Responsive layout | "A responsive [page type] that works on mobile and desktop" |
| Component library | "Generate a set of reusable UI components for a [app type]" |
| Dark mode | "Design a dark theme version of [component/page]" |
| Full site | Generate each page as a screen, then use `build_site` to assemble |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `STITCH_API_KEY` | Direct API key authentication |
| `STITCH_ACCESS_TOKEN` | Pre-existing access token |
| `STITCH_USE_SYSTEM_GCLOUD` | Use system gcloud instead of bundled |
| `STITCH_PROJECT_ID` | Override project ID |
| `STITCH_HOST` | Custom API endpoint |

## Troubleshooting

- **Permission errors**: Run `npx @_davideast/stitch-mcp doctor --verbose`
- **Auth issues**: Run `npx @_davideast/stitch-mcp logout --force` then re-run `init`
- **Remote environments (WSL/SSH)**: Manually open the OAuth URL in your browser if auto-launch fails
