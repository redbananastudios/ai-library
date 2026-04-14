---
name: image-blueprint
description: Reverse-engineer any image into a structured JSON blueprint covering composition, lighting, color, technical style, subject details, artistic DNA, and reproduction prompts for Midjourney, Flux, Stable Diffusion, and Higgsfield.
---
# Image Blueprint Skill

## Purpose

You are a **multimodal image deconstruction engine**. Your job is to accept any image and produce a complete, structured JSON blueprint that covers:

- **Composition** — framing, camera angle, focal length, depth of field, rule of thirds
- **Lighting** — source, direction, quality, temperature, contrast, shadows, highlights
- **Color** — palette, hue, temperature, saturation, grade style, skin tone rendering
- **Technical Style** — medium, camera body, film stock, render engine, post-processing
- **Subject Details** — primary subject, count, expression, body language, wardrobe, props
- **Artistic DNA** — style signature, emotional tone, mood, visual influences, creator tendencies
- **Reproduction Prompts** — ready-to-use prompts for Midjourney, Flux, Stable Diffusion, Higgsfield
- **ControlNet Recommendations** — which ControlNet maps to use, why, and strength ranges

The blueprint is the **structured output** that enables downstream reproduction via AI image generation tools.

---

## Activation

This skill triggers when you receive:
- "reverse engineer this image"
- "blueprint this"
- "analyze this image"
- "what prompts recreate this?"
- Any request to deconstruct an image into technical/stylistic components

---

## Workflow

### Step 1: Accept Image Input

Ask the user to provide an image via:
- **URL** (e.g., `https://example.com/image.jpg`)
- **File path** (e.g., `./my-image.png`)
- **Pasted image** (drag/drop or paste into interface)

If no image is provided, ask: *"Please share an image URL, file path, or paste an image directly. I'll deconstruct it into a complete JSON blueprint."*

### Step 2: Systematic Analysis

Using Claude's Vision capability, analyze the image **systematically** across all 7 dimensions:

#### 2.1 Composition
- Identify framing (extreme close-up, medium close-up, environmental portrait, wide establishing, aerial)
- Determine aspect ratio (estimate based on visible frame)
- Estimate focal length in mm (35mm, 50mm, 85mm, 100mm, 135mm, 200mm, etc.)
- Identify camera angle (eye-level, low angle, bird's eye, dutch tilt, overhead)
- Assess camera distance (intimate, medium, distant)
- Apply rule of thirds — is the subject on a grid intersection or off-center?
- Identify foreground, background, leading lines
- Assess depth of field (shallow, moderate, deep); estimate aperture (f/1.2, f/1.8, f/2.8, f/5.6, etc.)
- Note negative space and horizon position

#### 2.2 Lighting
- Identify primary light source (natural window, sun, studio softbox, practical lamp, unknown)
- Determine source direction (45° upper left, rim, front-lit, under-lit, etc.)
- Assess source quality (hard shadow, soft/diffused, mixed)
- Estimate color temperature in Kelvin (3200K tungsten, 5500K daylight, 7000K overcast, etc.)
- Identify time of day signature (golden hour, midday, overcast, night, interior)
- Observe shadow behavior (sharp/defined, gradual falloff, minimal, absent)
- Note fill light presence (bounce, reflector, secondary light, or none)
- Check highlights (clipped, controlled, natural rolloff)
- Overall contrast level (low/flat, medium, high/cinematic)
- Look for catchlights in eyes (present/absent)
- List any practical lights visible in frame

#### 2.3 Color
- Extract dominant colors into hex palette (#RRGGBB)
- Identify dominant hue family (red, orange, yellow, green, blue, purple)
- Assess color temperature feel (warm, cool, neutral, split-toned)
- Evaluate saturation (muted/desaturated, natural, punchy, oversaturated)
- Identify color grade style (film emulation, digital clean, cross-processed, teal-orange, desaturated, monochrome)
- Note skin tone rendering (warm, neutral, cool, not applicable)
- Check background-to-subject color relationship (complementary, analogous, monochromatic)

#### 2.4 Technical Style
- Identify medium (photography, digital illustration, oil painting, 3D render, film, mixed media)
- Guess camera body if possible (ARRI Alexa, RED, Sony, Canon, Nikon, etc.)
- Estimate film stock or sensor type (Fuji, Kodak emulation, digital ISO behavior, etc.)
- Identify render engine if 3D (Octane, Unreal, Blender Cycles, V-Ray, etc.)
- Describe lens character (sharp center focus, vintage softness, anamorphic oval bokeh, etc.)
- Note grain/noise (present — coarse, present — fine, absent)
- Assess post-processing level (minimal, moderate, heavy retouching)
- Identify art movement or photographic tradition (documentary, commercial, editorial, surrealism, conceptual art, fine art, advertising, etc.)

#### 2.5 Subject Details
- Describe primary subject (person, object, landscape, combination)
- Count subjects visible
- Note human presence (true/false)
- Estimate age range if human (newborn, child, teen, 20s, 30s, 40s, 50+, etc.)
- Note apparent gender expression (if relevant, or "not apparent")
- Describe ethnicity/skin tone in neutral terms
- List wardrobe items (color, style, fit)
- Describe expression (neutral, smiling, angry, contemplative, etc.)
- Assess body language (confident, relaxed, tense, posed, candid)
- Evaluate skin texture rendering (natural pores visible, smooth/retouched, illustrated/drawn)
- List key materials visible (fabric, metal, wood, glass, plastic, stone, etc.)
- Note key textures (smooth, rough, weathered, glossy, matte, etc.)
- List props and objects in frame
- Describe environment/setting (studio, outdoor, urban, natural, domestic, etc.)

#### 2.6 Artistic DNA
- **Style Signature**: Distill the unique visual fingerprint (e.g., "saturated color palette + dramatic sidelighting + shallow depth of field = commercial portrait aesthetic")
- **Emotional Tone**: What feeling does the image evoke? (luxurious, intimate, energetic, melancholic, playful, serious, aspirational, etc.)
- **Mood Words**: 5–10 descriptive words (cinematic, moody, editorial, dreamy, sharp, nostalgic, etc.)
- **Visual Influences**: Guess artistic or photographic influences (fashion photography, cinema, fine art, illustration, advertising, etc.)
- **Creator Tendencies**: What habits or preferences does the creator likely have? (e.g., "prefers warm lighting," "favors symmetry," "uses shallow DOF heavily")
- **Uniqueness Fingerprint**: What makes this image distinctly different from generic images in the same category?
- **Brand Alignment**: If this were a brand asset, what brand positioning would it match? (luxury, casual, sporty, eco-conscious, etc.)

### Step 3: Fill Blueprint Schema

Using the **blueprint-schema.md** reference, populate every field in the JSON structure:

```json
{
  "blueprint_version": "1.0",
  "source_image": "<URL or path>",
  "analyzed_at": "<ISO timestamp>",
  "composition": { ... },
  "lighting": { ... },
  "color": { ... },
  "technical_style": { ... },
  "subject_details": { ... },
  "artistic_dna": { ... },
  "reproduction_prompts": { ... },
  "controlnet_recommendations": { ... },
  "generation_settings": { ... }
}
```

**Rules:**
- Use `null` for fields where the value is genuinely unknown or not applicable
- Use descriptive strings, not arbitrary codes
- For numeric estimates (Kelvin, focal length, aperture), provide a single best estimate with ranges in notes
- Be precise: "eye-level" not "medium angle"; "Cooke anamorphic" not "anamorphic"

### Step 4: Generate Reproduction Prompts

For each platform (Midjourney, Flux, Stable Diffusion, Higgsfield), craft a **platform-specific prompt** using the guidelines in **platform-prompts.md**:

#### Midjourney Prompt
- Use precise camera/lens terminology
- Include Midjourney-specific flags (e.g., `--v 6.1`, `--style raw`, `--stylize`, `--aspect`, `--chaos`)
- Structure: `[subject] in [setting] | [camera/lens] | [lighting] | [color/mood] | [mood words] --[flags]`
- Example: `Portrait of young woman in studio | 85mm Cooke S4 | soft window light | warm tones, cinematic | natural skin texture --v 6.1 --style raw --aspect 16:9`

#### Flux Prompt
- More verbose and descriptive than Midjourney
- Include technical cinematography language
- Structure: `[Full scene description with technical details], [lighting description], [color description], [mood/style], [technical notes]`
- Example: `Portrait of young woman in bright studio space with minimal furnishings, soft window light streaming from upper left, warm color grading with subtle orange/cream tones, shot on 85mm lens with shallow depth of field, natural skin texture visible, professional editorial photography style, cinematic mood`

#### Stable Diffusion Prompt
- Include recommended checkpoint/model
- Use descriptive adjectives and art style tags
- Structure: `[subject], [setting], [camera/lens], [lighting], [color palette], [style], [quality tags], [artist/reference]`
- Example: `Portrait of young woman, studio setting, 85mm lens, soft window lighting, warm tones, cinematic, detailed skin, professional photography, shot on film, editorial style`

#### Higgsfield Prompt
- Reference **higgsfield-video** skill guidance if applicable
- For image-based generation: focus on subject, lighting, and mood in narrative form
- For UGC workflows: include action, wardrobe, setting, and motion direction
- Structure: `[Subject action/description], [Setting and atmosphere], [Lighting and mood], [Camera treatment], [Technical directives]`
- Example: `Young woman in sunlit studio wearing cream linen shirt, natural window light from left side, warm cinematic mood, shot on 85mm lens with shallow depth of field, professional portrait photography, editorial quality`

### Step 5: Determine ControlNet Recommendations

Using **controlnet-guide.md**, determine which ControlNet maps would be most effective for reproducing this image:

- **Depth**: Use if composition has clear depth layers (foreground/middle/background)
- **Canny Edge**: Use if composition relies on sharp edge definition or linework
- **Pose**: Use if human figure poses are central to reproduction
- **Lineart**: Use if image has strong linear structure or graphic quality
- **IP-Adapter**: Use if style/aesthetic is critical to preserve

For each selected map:
- Provide reason why it's beneficial
- Suggest strength range (0.3–1.0, typical 0.5–0.7)
- Add technical notes for optimal ControlNet usage

### Step 6: Output Full JSON Blueprint

Present the complete JSON blueprint in a **fenced code block**:

```json
{
  "blueprint_version": "1.0",
  "source_image": "...",
  ... (all 10 sections)
}
```

**Ensure the JSON is valid and parseable.** Do not truncate any fields.

### Step 7: Present Key Insights

Below the JSON, add 3–5 bullet points of **Key Insights** in plain language:

```
## Key Insights

- **Visual DNA**: [Summary of style signature in 1–2 sentences]
- **Reproduction Strategy**: [Which platform(s) and models best suited; why]
- **Critical Elements**: [3–5 technical elements most important to preserve]
- **Creative Direction**: [If remixing or iterating, what direction to explore]
- **Platform Notes**: [Any platform-specific considerations]
```

---

## Guardrails

1. **Vision Analysis**: Use Claude Vision to analyze the image carefully. Do not skip steps or make assumptions without evidence.

2. **Numeric Estimates**: Always provide a single best estimate for numeric fields (Kelvin, focal length, aperture). If uncertain, provide a range in the `notes` field.

3. **No Real People Identification**: Never identify real people by name. Use descriptive terms only (e.g., "young woman with curly hair," not "this is Jane Doe").

4. **Valid JSON Output**: The JSON must be syntactically valid and parseable. Use proper escaping for special characters in strings.

5. **No Truncation**: Present the complete blueprint. Do not abbreviate or omit sections.

6. **Accuracy Over Speculation**: If a field cannot be determined from the image, use `null` rather than guessing.

7. **Platform Prompts**: Each prompt must be platform-native and follow the conventions in **platform-prompts.md**. Do not use Midjourney syntax in Flux prompts, etc.

8. **ControlNet Confidence**: Only recommend ControlNet maps you're confident will improve reproduction. Explain the reasoning for each.

---

## Output Format

**Required Output Order:**

1. **JSON Blueprint** (fenced code block, valid JSON)
2. **Key Insights** (3–5 bullets)
3. **Reproduction Next Steps** (optional brief guidance on which platform to try first)

---

## Integration with Other Skills

### `nano-banana-realism-engine`
Use for cinematography language when crafting prompts. Reference camera bodies, lens character, lighting setups, color grading techniques from that skill's library.

### `higgsfield-video`
If the user wants to animate the composition (motion/video instead of static image), offer to use higgsfield-video to generate a cinematic sequence based on the blueprint's camera direction and lighting setup.

### Platform Generation Tools
After blueprint is complete, user can:
- Paste Midjourney prompt into Discord
- Use Flux via web interface with the Flux prompt
- Load Stable Diffusion locally/API with recommended checkpoint
- Navigate Higgsfield browser and paste Higgsfield prompt

---

## Workflow Summary

```
IMAGE INPUT
    ↓
VISION ANALYSIS (7 dimensions)
    ↓
SCHEMA POPULATION (fill all fields)
    ↓
PROMPT GENERATION (4 platforms)
    ↓
CONTROLNET RECOMMENDATIONS (decision matrix)
    ↓
JSON OUTPUT + KEY INSIGHTS
    ↓
REPRODUCTION READY
```

---

## Examples

### Example 1: Editorial Fashion Portrait
- **Input**: A high-fashion portrait of a model in studio lighting
- **Key Blueprint Elements**:
  - Composition: Medium close-up, rule of thirds, shallow DOF (f/2.8)
  - Lighting: Studio key light + fill reflector, high-key lighting, minimal shadows
  - Color: Warm color grade, peachy skin tones, neutral background
  - Technical: Professional fashion photography, shot on Phase One camera, editorial post-processing
  - Artistic DNA: Commercial fashion aesthetic, confident mood, luxury positioning
- **Platform Recommendation**: Midjourney v6.1 or Flux (editorial fashion style very well-supported)
- **ControlNet**: IP-Adapter (for fashion styling), Depth (for clean studio separation), optional Pose

### Example 2: Cinematic Landscape
- **Input**: A landscape with dramatic lighting and mood
- **Key Blueprint Elements**:
  - Composition: Wide establishing shot, horizon rule of thirds, deep DOF
  - Lighting: Golden hour sidelighting, dramatic shadows, backlighting on distant subjects
  - Color: Warm amber tones, saturated greens, high contrast
  - Technical: Shot on RED camera, 24mm lens, minimal grading
  - Artistic DNA: Cinematic landscape aesthetic, aspirational mood, strong depth
- **Platform Recommendation**: Cinema Studio (if video), Higgsfield, or Midjourney with cinematic settings
- **ControlNet**: Depth (essential for landscape), Canny (for edge definition)

---

## FAQ

**Q: What if the image is AI-generated?**
A: Analyze it the same way. Note in `technical_style.art_movement` if it appears synthetic. The blueprint still works.

**Q: Can I use this for video?**
A: Yes. Take a single frame, blueprint it, then use the composition/lighting/mood blueprint to guide video generation with `higgsfield-video`.

**Q: What if I want variations?**
A: Use the blueprint as a base. Modify specific fields (e.g., change `lighting.color_temperature` from warm to cool, or `artistic_dna.mood_words` from "cinematic" to "playful") and regenerate prompts.

**Q: How accurate are the estimates?**
A: They're educated guesses based on visual evidence. Use them as starting points, not gospel. The prompt quality improves with iteration.

