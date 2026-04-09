---
name: higgsfield
description: Generate images via Higgsfield.ai using browser automation - supports Nano Banana, Seedream, FLUX, GPT Image, Kling, Reve, and more. Auto-selects the best model for the task.
trigger: higgsfield, generate image, create image, make image, image generation, nano banana, seedream, flux image, kling image
---
---
name: higgsfield
description: Generate images via Higgsfield.ai using browser automation. Supports 15+ models including Nano Banana, Seedream, FLUX, GPT Image, Kling, Reve, and more. Auto-selects the best model for the task or lets the user choose.
---

# Higgsfield AI Image Generator

Generate images using Higgsfield.ai through browser automation. This skill navigates the Higgsfield web app, selects the optimal model, enters prompts, and downloads results to your workspace.

## Prerequisites

- `browser-use` CLI installed (`browser-use doctor` to verify)
- Logged into Higgsfield.ai (via Chrome profile or manual login)

## Available Models and When to Use Them

| Model | Best For | Slug |
|-------|----------|------|
| **Nano Banana Pro** | 4K images, creative editing, up to 8 reference images, object swaps, pose editing | `nano_banana_pro` |
| **Nano Banana 2.5** | Latest 4K model (Gemini Flash), general-purpose, fast | `nano_banana_2` |
| **Seedream 5.0** | Ultra-realistic lifestyle, editorial, fashion, cinematic lighting | `seedream_5` |
| **Seedream 4.0** | Realistic imagery, fashion-grade quality | `seedream_4` |
| **FLUX.2 Pro** | High-fidelity, sharp text rendering in images | `flux_2_pro` |
| **FLUX.2 Max** | Maximum quality text rendering | `flux_2_max` |
| **FLUX Kontext** | Context-aware generation, consistent characters | `flux_kontext` |
| **GPT Image 1.5** | Multimodal reasoning, general purpose, versatile | `gpt_image` |
| **Reve** | Strict prompt accuracy, concept design, anime, mixed-media | `reve` |
| **Kling O1** | Kuaishou model, good for varied styles | `kling_o1` |
| **Z-Image** | Alibaba model, diverse styles | `z_image` |
| **WAN 2.5** | Anime style, illustration | `wan_2_5` |
| **Soul 2.0** | Character consistency, identity preservation across generations | `soul_2` |

### Auto-Selection Guide

When the user does NOT specify a model, choose based on the request:

- **Photo-realistic people/fashion/lifestyle** -> Seedream 5.0
- **General purpose / quick generation** -> Nano Banana 2.5
- **Text in image (logos, signs, posters)** -> FLUX.2 Pro or FLUX.2 Max
- **Anime / illustration / stylized** -> WAN 2.5 or Reve
- **Concept art / mixed media** -> Reve
- **Character consistency across multiple images** -> Soul 2.0 or FLUX Kontext
- **Creative editing with reference images** -> Nano Banana Pro
- **Highest quality, no specific need** -> Seedream 5.0 or GPT Image 1.5

## Output Directory

All downloaded images are saved to `./higgsfield-images/` relative to the user's workspace. Create this directory if it does not exist.

Name files descriptively: `{model}-{short-description}-{timestamp}.png`
Example: `seedream5-sunset-beach-portrait-20260409-143022.png`

## Workflow

### Step 1: Ensure Browser Session

Check if browser-use has an active session. If not, connect to the user's Chrome (preserves login):

```bash
browser-use connect
```

If connect fails or the user is not logged in, navigate to the login page:

```bash
browser-use open https://higgsfield.ai/auth/email/sign-in
```

Then ask the user for their email and password if needed. Use `browser-use state` to find the input fields and `browser-use input <index> "value"` to fill them.

### Step 2: Navigate to Image Generation

Navigate to the model page. Use the slug from the model table:

```bash
browser-use open https://higgsfield.ai/image/{model_slug}
```

If the user wants to browse models or you need to discover what's available:

```bash
browser-use open https://higgsfield.ai/ai-image
```

### Step 3: Verify Page State

```bash
browser-use state
```

Look for:
- The prompt textarea (usually has placeholder text like "Describe any visual idea")
- The model selector (to confirm correct model is selected)
- Settings controls (aspect ratio, quality)
- The Generate button

### Step 4: Configure Settings (if needed)

Before entering the prompt, adjust settings if the user specified them:

**Aspect Ratio** - Look for aspect ratio controls (1:1, 9:16, 16:9, 3:4, 4:3). Click the appropriate option.

**Image Quality** - Look for quality settings (1K, 2K, 4K). Default to the highest available for the model.

**Number of Images** - If the user wants multiple images, look for a count selector.

### Step 5: Enter Prompt and Generate

```bash
browser-use state                          # Find the prompt textarea index
browser-use input <textarea_index> "the prompt text here"
browser-use state                          # Find the Generate button
browser-use click <generate_button_index>
```

### Step 6: Wait for Generation

Image generation takes 10-60 seconds depending on model and quality. Poll for completion:

```bash
browser-use wait text "Download" --timeout 120000
```

If `wait` is not available or times out, use a loop:

```bash
browser-use screenshot
```

Check the screenshot to see if the image has been generated. Look for the rendered image and download icon. Repeat every 10 seconds until done.

### Step 7: Download the Image

Once the image is generated:

```bash
browser-use state    # Find the download icon/button
```

Look for a download button or icon near the generated image. Click it:

```bash
browser-use click <download_icon_index>
```

The browser will download the file. Wait briefly for the download to complete:

```bash
browser-use wait selector "[data-download-complete]" --timeout 10000
```

If the download button triggers a direct browser download, the file lands in the system's default Downloads folder. Move it to the workspace:

```bash
# Find the most recently downloaded image
ls -t ~/Downloads/*.png ~/Downloads/*.jpg ~/Downloads/*.webp 2>/dev/null | head -1
```

Then move and rename it:

```bash
mkdir -p ./higgsfield-images
mv "<downloaded_file>" "./higgsfield-images/{model}-{description}-{timestamp}.png"
```

### Step 8: Alternative Download - Extract Image URL

If the download button approach fails, extract the image URL directly:

```bash
browser-use state    # Find the generated image element
browser-use get attributes <image_index>    # Get the src URL
```

Then download via curl:

```bash
mkdir -p ./higgsfield-images
curl -L "<image_url>" -o "./higgsfield-images/{model}-{description}-{timestamp}.png"
```

### Step 9: Confirm and Present

After downloading, confirm the file exists and show the user:

```bash
ls -la ./higgsfield-images/
```

Report to the user:
- Which model was used and why
- The file path of the downloaded image
- The image dimensions/size
- Offer to generate more variations or try a different model

## Visual Mode

When using Playwright or Chrome DevTools MCP tools instead of browser-use CLI, follow the same workflow but use the equivalent MCP tool calls:

1. **Navigate**: `mcp__playwright__browser_navigate` or `mcp__chrome-devtools__navigate_page`
2. **Inspect**: `mcp__playwright__browser_snapshot` or `mcp__chrome-devtools__take_snapshot`
3. **Click**: `mcp__playwright__browser_click` or `mcp__chrome-devtools__click`
4. **Type**: `mcp__playwright__browser_type` or `mcp__chrome-devtools__fill`
5. **Screenshot**: `mcp__playwright__browser_take_screenshot` or `mcp__chrome-devtools__take_screenshot`
6. **Wait**: `mcp__playwright__browser_wait_for` or `mcp__chrome-devtools__wait_for`
7. **Download**: `mcp__playwright__browser_evaluate` to extract URLs, then `curl` to download

The workflow steps remain the same - adapt the tool calls to whichever browser automation is available.

## Prompt Engineering Tips

When the user gives a brief description, enhance the prompt for better results:

1. **Add style cues**: lighting, camera angle, color palette, mood
2. **Specify composition**: close-up, wide shot, centered, rule of thirds
3. **Include medium**: photograph, digital art, oil painting, watercolor
4. **Add quality modifiers**: "highly detailed", "professional", "4K", "cinematic"

Always show the enhanced prompt to the user before generating so they can approve or adjust.

## Error Handling

- **Not logged in**: The page redirects to `/auth`. Ask the user for credentials or to connect their Chrome profile.
- **Model not available**: Fall back to Nano Banana 2.5 as the default general-purpose model.
- **Generation fails/errors**: Screenshot the page, report the error to the user, suggest trying a different model.
- **Download fails**: Try the URL extraction method (Step 8) as a fallback.
- **Rate limited**: Should not happen on paid plan, but if it does, wait and retry.

## Multiple Images

To generate a batch of images:

1. Generate the first image following the full workflow
2. For subsequent images with the same model, the browser is already on the page - just clear the prompt, enter the new one, and click Generate
3. Download each result before generating the next
4. Name files sequentially: `{model}-{description}-{timestamp}-01.png`, `-02.png`, etc.

## Integration with Nano Banana Skills

This skill supersedes the standalone `nano-banana-pro` and `nano-banana-ppt` skills when working through Higgsfield.ai's web interface. Those skills can still be used independently for direct model-specific workflows outside of Higgsfield.
