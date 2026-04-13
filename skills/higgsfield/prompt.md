---
name: higgsfield
description: Generate images via Higgsfield.ai using browser automation. Access 15+ premium AI models (Nano Banana Pro, Seedream, FLUX, GPT Image, Reve, Soul ID) through browser-use CLI or Playwright MCP. Auto-selects the best model for the task, handles generation, and downloads results.
---

# Higgsfield AI Image Generator

Generate images using Higgsfield.ai through browser automation. This skill navigates the Higgsfield web app, selects the optimal model, enters prompts, and downloads results to your workspace.

## Prerequisites

- `browser-use` CLI installed (`browser-use doctor` to verify), OR Playwright MCP available
- Logged into Higgsfield.ai (via Chrome profile or manual login)

## Available Models

| Model | Best For | URL Path |
|-------|----------|----------|
| **Nano Banana Pro** | 4K creative editing, up to 8 reference images, object swaps, pose editing | `/image/nano_banana_pro` |
| **Nano Banana 2.5** | Latest 4K model (Gemini Flash), general-purpose, fast | `/image/nano_banana_2` |
| **Seedream 5.0** | Ultra-realistic lifestyle, editorial, fashion, cinematic lighting | `/image/seedream_5` |
| **Seedream 4.0** | Realistic imagery, fashion-grade quality | `/image/seedream_4` |
| **FLUX.2 Pro** | High-fidelity, sharp text rendering in images | `/image/flux_2_pro` |
| **FLUX.2 Max** | Maximum quality text rendering | `/image/flux_2_max` |
| **FLUX Kontext** | Context-aware generation, consistent characters | `/image/flux_kontext` |
| **GPT Image 1.5** | Multimodal reasoning, general purpose, versatile | `/image/gpt_image` |
| **Reve** | Strict prompt accuracy, concept design, anime, mixed-media | `/image/reve` |
| **Kling O1** | Kuaishou model, good for varied styles | `/image/kling_o1` |
| **Z-Image** | Alibaba model, diverse styles | `/image/z_image` |
| **WAN 2.5** | Anime style, illustration | `/image/wan_2_5` |
| **Soul 2.0** | Character consistency, identity preservation across generations | `/image/soul_2` |

### Auto-Selection Guide

When the user does NOT specify a model, choose based on the request:

- **Photo-realistic people / fashion / lifestyle** → Seedream 5.0
- **General purpose / quick generation** → Nano Banana 2.5
- **Text in image (logos, signs, posters)** → FLUX.2 Pro or FLUX.2 Max
- **Anime / illustration / stylized** → WAN 2.5 or Reve
- **Concept art / mixed media** → Reve
- **Character consistency across multiple images** → Soul 2.0 or FLUX Kontext
- **Creative editing with reference images** → Nano Banana Pro
- **Highest quality, no specific need** → Seedream 5.0 or GPT Image 1.5

## Output Directory

All downloaded images are saved to `./higgsfield-images/` relative to the user's workspace. Create this directory if it does not exist.

Name files descriptively: `{model}-{short-description}-{timestamp}.png`
Example: `seedream5-sunset-beach-portrait-20260413-160000.png`

## Workflow (browser-use CLI)

### Step 1: Ensure Browser Session and Authentication

**Fast path:** If a browser is already open on a Higgsfield page and the user is logged in (user avatar visible in top-right, no "Login" / "Sign up" buttons), skip directly to **Step 2**. Do NOT re-check authentication if the current page is already Higgsfield and shows the user is logged in.

**Authentication flow (only if NOT logged in):**

1. Navigate to any Higgsfield page (e.g. `https://higgsfield.ai/image/nano_banana_pro`).
2. Check the top-right corner: if you see a user avatar/profile icon, the user is already authenticated — skip to Step 2.
3. If you see "Login" / "Sign up" buttons instead:
   a. **Ask the user to log into Google first.** Navigate the browser to `https://accounts.google.com` and tell the user: *"Please sign into your Google account in the browser window. Let me know when you're done."*
   b. Once the user confirms, navigate back to `https://higgsfield.ai/image/nano_banana_pro`.
   c. Click the **"Login"** button in the top-right corner.
   d. Click **"Continue with Google"** — the user's existing Google session will authenticate automatically.
   e. Wait for the redirect back to Higgsfield. Verify the user avatar now appears.

4. If using `browser-use` CLI, connect to the user's Chrome profile to preserve existing Google sessions:
   ```bash
   browser-use connect
   ```

**Important:** NEVER attempt to fill in Google credentials programmatically. Google blocks automated sign-ins.

### Step 2: Navigate to the Model Page

```bash
browser-use open https://higgsfield.ai/image/{model_slug}
```

Replace `{model_slug}` with the URL path from the model table (e.g. `nano_banana_2`, `seedream_5`).

To browse all available models:

```bash
browser-use open https://higgsfield.ai/ai-image
```

### Step 3: Verify Page State

```bash
browser-use state
```

Look for:
- The prompt textarea (placeholder like "Describe any visual idea")
- Model selector (confirm correct model is active)
- Settings controls (aspect ratio, quality)
- The Generate button

### Step 4: Configure Settings

Before entering the prompt, adjust settings if the user specified them:

- **Aspect Ratio**: Click the appropriate option (1:1, 9:16, 16:9, 3:4, 4:3)
- **Image Quality**: Select the highest available (1K, 2K, 4K)
- **Number of Images**: Adjust the count selector if available

### Step 5: Enter Prompt and Generate

```bash
browser-use state                          # Find the prompt textarea index
browser-use input <textarea_index> "the prompt text here"
browser-use state                          # Find the Generate button
browser-use click <generate_button_index>
```

### Step 6: Wait for Generation

Image generation takes 10–60 seconds depending on model and quality. Poll for completion:

```bash
browser-use wait text "Download" --timeout 120000
```

If `wait` times out, poll with screenshots:

```bash
browser-use screenshot
```

Repeat every 10 seconds until the rendered image and download icon are visible.

### Step 7: Download the Image

Once generated:

```bash
browser-use state    # Find the download icon/button near the generated image
browser-use click <download_icon_index>
```

The browser downloads the file. Find and move it to the workspace:

```bash
# Find the most recently downloaded image (Windows)
Get-ChildItem -Path "$env:USERPROFILE\Downloads" -Include *.png,*.jpg,*.webp -Recurse | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# Move and rename
mkdir -p ./higgsfield-images
mv "<downloaded_file>" "./higgsfield-images/{model}-{description}-{timestamp}.png"
```

### Step 8: Fallback – Extract Image URL

If the download button approach fails, extract the image URL directly:

```bash
browser-use state                         # Find the generated image element
browser-use get attributes <image_index>  # Get the src URL
```

Then download via curl:

```bash
mkdir -p ./higgsfield-images
curl -L "<image_url>" -o "./higgsfield-images/{model}-{description}-{timestamp}.png"
```

### Step 9: Confirm and Present

After downloading, confirm and report:
- Which model was used and why
- The file path of the downloaded image
- The image dimensions/size
- Offer to generate more variations or try a different model

## Workflow (Playwright MCP)

If Playwright MCP tools are available instead of browser-use CLI, follow the same logical workflow using these tool mappings:

| Action | Playwright MCP |
|--------|---------------|
| Navigate | `mcp__playwright__browser_navigate` |
| Inspect | `mcp__playwright__browser_snapshot` |
| Click | `mcp__playwright__browser_click` |
| Type | `mcp__playwright__browser_type` |
| Screenshot | `mcp__playwright__browser_take_screenshot` |
| Wait | `mcp__playwright__browser_wait_for` |
| Download | `mcp__playwright__browser_evaluate` to extract URLs, then `curl` |

## Prompt Engineering

When the user gives a brief description, enhance the prompt for better results:

1. **Add style cues**: lighting, camera angle, color palette, mood
2. **Specify composition**: close-up, wide shot, centered, rule of thirds
3. **Include medium**: photograph, digital art, oil painting, watercolor
4. **Add quality modifiers**: "highly detailed", "professional", "4K", "cinematic"

Always show the enhanced prompt to the user before generating so they can approve or adjust.

**For photorealistic prompts**, use the `nano-banana-realism-engine` skill to construct the prompt. That skill applies camera presets, lighting presets, and anti-AI realism constraints to produce prompts that look like real photography. Feed the resulting prompt into Higgsfield for generation.

## Error Handling

- **Not logged in**: Page redirects to `/auth`. Ask the user for credentials or to connect their Chrome profile.
- **Model not available**: Fall back to Nano Banana 2.5 as the default general-purpose model.
- **Generation fails**: Screenshot the page, report the error, suggest trying a different model.
- **Download fails**: Try the URL extraction method (Step 8) as a fallback.
- **Rate limited**: Wait and retry. Should not happen on paid plans.

## Multiple Images

To generate a batch:

1. Generate the first image following the full workflow
2. For subsequent images with the same model, the browser is already on the page — just clear the prompt, enter the new one, and click Generate
3. Download each result before generating the next
4. Name files sequentially: `{model}-{description}-{timestamp}-01.png`, `-02.png`, etc.

## Integration

- **Prompt quality**: Use `nano-banana-realism-engine` to craft photorealistic prompts before feeding them into Higgsfield.
- **CLI fallback**: If Higgsfield is unavailable or the user prefers speed over model choice, the `nano-banana` CLI can generate images directly via the Gemini API without a browser.
