# Scene Template - Standard Definition Format

## Overview

A **Scene Template** is a standardized format for defining individual shots/scenes in a video production. Use this format when planning multi-scene videos, creating shot lists, or documenting scenes before generation.

The template captures all necessary information for Higgsfield to generate a single scene: subject, action, camera work, lighting, duration, and mood. Multiple scene templates stacked together form a complete video production (storyboard).

---

## Basic Scene Template

Copy and fill in this template for each scene in your video:

```
SCENE [N]: [SCENE_TITLE]
─────────────────────────────────────────

Subject:
  [Who or what is in the frame? Describe appearance, clothing, expression]
  Example: "Woman in black blazer, seated at desk, confident expression"

Action:
  [What is happening? Movement, dialogue, expression changes, behavior]
  Example: "Reviewing spreadsheet on desktop, eyes scanning left to right, nods approvingly"

Setting:
  [Location, environment, time of day, atmosphere]
  Example: "Modern office, morning light from window, professional ambiance, soft warm tones"

Camera Body:
  [Select one from Cinema Studio bodies, or specify "Standard" for other models]
  Options: ARRI Alexa 35 | RED V-Raptor | Sony Venice | IMAX Film Camera | Panavision Millennium DXL2 | Arriflex 16SR | Standard
  Example: "ARRI Alexa 35"

Lens:
  [Select specific lens if using Cinema Studio, or "Standard" for other models]
  Options: ARRI Signature Prime | Cooke S4 | Canon K-35 | Laowa Macro | Hawk V-Lite Anamorphic | Panavision C-Series | Petzval | Zeiss | Lensbaby | Standard
  Example: "Cooke S4 50mm"

Focal Length:
  [Approximate focal length for desired framing — optional if lens is specified]
  Options: 18–35mm (wide) | 35–50mm (standard) | 70–85mm (telephoto) | Macro (detail)
  Example: "50mm (standard framing)"

Camera Movement:
  [Stack up to 3 movements. Reference 70+ presets from camera-controls.md]
  Format: Movement 1 + Movement 2 + Movement 3 (optional)
  Example: "Dolly In (slow) + Pan Right (gentle) + Tilt Up (subtle)"

  Movement Rules:
  - Primary: one dominant movement (e.g., dolly in)
  - Secondary: one complementary movement (e.g., pan right to follow)
  - Tertiary: one accent/quality (e.g., handheld for texture)
  - All three should work in harmony, not conflict

Camera Movement Speed:
  [Indicate pace of movement if relevant]
  Options: Static (no movement) | Very Slow | Slow | Medium | Fast | Whip (snappy)
  Example: "Slow dolly with gentle pan"

Lighting:
  [Describe the light setup: key light, fill, rim, practicals, mood]
  Format: [Key light type] + [fill light] + [rim light (optional)] + [mood]
  Example: "Golden hour side light (key) + natural fill + subtle rim light + warm cinematic mood"

  Key Light Options:
  - Golden hour side light (warm, soft shadows)
  - Window light (practical, directional)
  - Studio key light (soft box, professional)
  - Practical lights only (high contrast)
  - High-key studio (flat, editorial)

Fill Light:
  - Natural (ambient bouncing back)
  - Reflector fill (secondary surface)
  - Low fill (high contrast, moody)
  - High fill (flat, soft)

Rim/Back Light:
  - None (flat lighting)
  - Hair light (edge-lit separation)
  - Rim light (backlighting, potential silhouette)
  - Kicker (side-back light for dimension)

Duration:
  [Total seconds for this scene]
  Typical ranges: 2–3s (quick shot) | 3–5s (standard) | 5–8s (hero shot) | 8–12s (complex)
  Example: "5 seconds"

Aspect Ratio:
  [Video framing for platform]
  Options: 21:9 (CinemaScope) | 16:9 (broadcast landscape) | 9:16 (social portrait) | 1:1 (square)
  Example: "9:16 (TikTok/Reels)"

Quality / Production Tier:
  [Desired quality level and style]
  Options: UGC (user-generated, casual) | Premium UGC | Cinematic (broadcast) | Ultra-cinematic (4K cinema)
  Example: "Premium UGC"

Mood / Tone:
  [Emotional tone, color grade, atmosphere]
  Example: "Professional, confident, warm color grade, sophisticated ambiance"

Visual Style:
  [Any specific aesthetic or reference]
  Example: "Luxury brand aesthetic, minimal distractions, focus on subject"

Color Grade:
  [Overall color palette and temperature]
  Options: Warm (golden, cozy) | Cool (blue, clinical) | Neutral (balanced) | Saturated (vivid) | Desaturated (moody)
  Example: "Warm golden tones, sophisticated highlights"

Dialogue / Voiceover:
  [If applicable, the exact words spoken during this scene]
  Example: "Thank you for watching. I'm excited to share this with you today."

Dialogue Timing:
  [When voiceover plays relative to visual action]
  Options: Voiceover starts at beginning | Mid-scene | End | Optional (visual only)
  Example: "Starts at 0s, ends at 4s"

Cinematic Prompt:
  [Full, final prompt to send to Higgsfield for generation]
  Format: [Subject + Action] in [Setting], [Lighting], [Camera movement] with [Camera body] and [Lens], [Mood], [Cinematic modifiers], [Quality]

  Example:
  "Woman in black blazer reviewing spreadsheet at desk, soft golden morning light from window, dolly in slowly with gentle pan right, ARRI Alexa 35 with Cooke S4 50mm, warm cinematic mood, sophisticated color grade, professional broadcast quality"

Model to Use:
  [Which Higgsfield model best fits this scene]
  Options: Cinema Studio | Kling 3.0 | Kling 2.5 Turbo | Seedance 2.0 | Veo 3.1 (UGC) | WAN 2.5 | Sora 2 | Minimax | UGC Factory
  Example: "Cinema Studio"

Generation Strategy:
  [Approach: single shot, multi-cut, or requires stitching]
  Options: Single scene (standalone) | Part of multi-shot sequence (requires stitching) | Multi-cut within one clip (6 scenes, 12–15s)
  Example: "Part of 3-scene sequence, will stitch with Scene 2 and 3"

Notes / Creative Direction:
  [Any additional guidance for generation, desired emphasis, or variations to try]
  Example: "Emphasize the moment of realization, natural motion, avoid mechanical camera moves"

Reference Images:
  [If using reference images for consistency]
  Example: "Reference image: office_luxury_01.jpg (color palette, desk setup)"

---

## Scene Template – Abbreviated Version (for quick planning)

For rapid production planning, use this shorter version:

```
SCENE [N]: [TITLE]

Subject: [who/what]
Action: [movement, dialogue]
Setting: [location, light, time]
Camera: [body] + [lens]
Movement: [up to 3 stacked]
Duration: [seconds]
Aspect: [9:16 | 16:9 | 21:9 | 1:1]
Mood: [tone, color, style]
Prompt: [cinematic prompt]
Model: [Cinema Studio | Kling 3.0 | etc.]
```

---

## Complete Scene Template Example

Here's a fully filled-out scene for reference:

```
SCENE 1: COFFEE BRAND HERO — OPENING BEAN REVEAL

Subject:
  Close-up of artisan coffee beans cascading into a white ceramic cup. Hands visible
  (elegant, clean presentation), natural skin tones, refined gestures. Cup is
  minimalist, white ceramic, sits on marble countertop.

Action:
  Hand opens burlap coffee bag, beans pour into cup in slow-motion cascade.
  Camera follows hand motion. Beans settle. Subtle hand gesture reveals cup
  after beans settle, drawing attention to product.

Setting:
  Modern coffee shop interior, daytime. Soft natural light streams from
  large windows to the left. Marble countertop. Blurred café background
  (warm neutral tones). Ambiance: luxury, artisanal, intimate.

Camera Body:
  ARRI Alexa 35

Lens:
  Cooke S4 50mm (standard, warm rendering, natural bokeh)

Focal Length:
  50mm (standard framing, comfortable viewing distance)

Camera Movement:
  Dolly In (very slow, ~2 cm per second) + Pan Right (gentle, ~10 degrees)
  + Subtle Handheld Wiggle (documentary feel, slight weight shift)

Camera Movement Speed:
  Very slow, almost imperceptible forward motion with gentle rightward pan

Lighting:
  Golden hour side light from window (key) + natural ambient fill
  (soft, bouncing off walls) + subtle rim light catching edge of cup (separation)
  + warm cinematic mood

Fill Light:
  Natural ambient fill from environment, high fill to maintain shadow detail

Rim Light:
  Subtle rim light on cup edge, separating it from background

Duration:
  3 seconds

Aspect Ratio:
  9:16 (optimized for Instagram Reels / TikTok)

Quality / Production Tier:
  Premium UGC (high-end user-generated aesthetic, luxury brand)

Mood / Tone:
  Warm, intimate, luxurious, artisanal. Color grade emphasizes golden
  tones and rich browns. Sophisticated, sensory experience.

Visual Style:
  Minimalist luxury aesthetic. Clean backgrounds, focus on product and
  hand gesture. Artisanal but refined. No clutter.

Color Grade:
  Warm golden highlights, rich shadow detail, slightly desaturated
  background to keep focus on beans/cup. Sophisticated, not overly
  saturated.

Dialogue / Voiceover:
  None (visual only, potential for music/ambience)

Dialogue Timing:
  N/A

Cinematic Prompt:
  "Close-up of artisan coffee beans cascading into white ceramic cup on
  marble countertop, hands opening burlap bag, golden hour side light from
  window with natural ambient fill, dolly in very slowly + pan right gently +
  subtle handheld wiggle, ARRI Alexa 35 with Cooke S4 50mm, warm intimate
  cinematic mood, rich golden color grade, luxury artisanal aesthetic,
  premium UGC production, 9:16 aspect, 24fps"

Model to Use:
  Cinema Studio (for maximum control over camera body, lens, and lighting simulation)

Generation Strategy:
  Part of 3-scene coffee brand hero sequence. This is scene 1 (opening reveal).
  Requires stitching with Scene 2 (pour) and Scene 3 (wide shop + cup in hand).

Notes / Creative Direction:
  Emphasize sensory quality: focus on texture of beans, warmth of light,
  luxury presentation. Camera movement should feel like discovery, not mechanical.
  Subtle motion blur on cascading beans. Avoid fast cuts or jerky motion.
  Let viewer feel the ritual of coffee-making.

Reference Images:
  - coffee_luxury_ambiance.jpg (color palette, golden light)
  - artisan_cup_marble.jpg (product + setting styling)
  - luxury_coffee_brand_aesthetic.jpg (overall tone, minimalism)
```

---

## Multi-Scene Storyboard Example

Here's a full 3-scene coffee brand video using the template format:

```
PROJECT: Coffee Brand Hero Film – 12 seconds, 9:16, Premium UGC
WORKFLOW: Cinema Studio (Scene 1, 2) + Kling 3.0 (Scene 3)
TOTAL DURATION: 3s + 3s + 3s = 9s (with transitions)

───────────────────────────────────────────────────────────────

SCENE 1: BEAN REVEAL (3s)
  Subject: Coffee beans, hands, ceramic cup, marble counter
  Action: Pour beans into cup, hand reveals cup
  Setting: Modern café, golden hour light, marble counter
  Camera: ARRI Alexa 35 + Cooke S4 50mm
  Movement: Dolly In + Pan Right + Handheld Wiggle
  Duration: 3s
  Mood: Warm, intimate, artisanal
  Model: Cinema Studio

───────────────────────────────────────────────────────────────

SCENE 2: POUR & STEAM (3s)
  Subject: Coffee pouring into cup, steam rising, foam crema
  Action: Pour action (slow motion), steam interaction with camera
  Setting: Close-up detail, backlit steam, key light on cup
  Camera: RED V-Raptor + Macro lens
  Movement: Through Object (camera through steam) + Zoom In (slight)
  Duration: 3s
  Mood: Dynamic, sensory, high-contrast, dramatic
  Model: Cinema Studio

───────────────────────────────────────────────────────────────

SCENE 3: WIDE SHOT & PRODUCT (3s)
  Subject: Person holding finished cup, café interior behind
  Action: Hold cup, bring to lips (implied enjoyment), look out window
  Setting: Bright café interior, person at table, window light
  Camera: Panavision Millennium DXL2 + Hawk V-Lite Anamorphic
  Movement: Crane Up + Orbit (gentle circle) + Pan Right
  Duration: 3s
  Mood: Cinematic, anamorphic flare, storytelling, aspirational
  Model: Cinema Studio

───────────────────────────────────────────────────────────────

STITCH ORDER: Scene 1 → Scene 2 → Scene 3
TRANSITIONS: Fade to black 0.5s between each scene
FINAL DURATION: ~9s (with transitions)
OUTPUT: 9:16, 1080p, ProRes
READY FOR: Instagram Reels, TikTok, YouTube Shorts
```

---

## Scene Template Checklist

Before sending a scene to Higgsfield, confirm:

- [ ] Subject clearly described (appearance, positioning)
- [ ] Action defined (what happens, how subject moves)
- [ ] Setting described (location, lighting conditions, atmosphere)
- [ ] Camera body chosen (Cinema Studio or Standard)
- [ ] Lens selected (if Cinema Studio, choose from 11 options)
- [ ] Up to 3 camera movements stacked (primary + secondary + tertiary)
- [ ] Duration specified (in seconds, realistic for scene complexity)
- [ ] Aspect ratio chosen (9:16 / 16:9 / 21:9 / 1:1)
- [ ] Mood/tone articulated (emotional intent, color palette)
- [ ] Cinematic prompt written (complete, specific, ready to paste)
- [ ] Model selected (Cinema Studio / Kling 3.0 / etc.)
- [ ] Generation strategy decided (standalone / part of sequence / multi-cut)
- [ ] Optional: reference images attached (for consistency)

---

## Tips for Writing Scene Templates

### Be Specific
- ❌ "Woman at desk"
- ✅ "Woman in navy blazer at modern glass desk, confident expression, eyes on spreadsheet"

### Describe Action Clearly
- ❌ "She reviews things"
- ✅ "Scanning spreadsheet row by row from left to right, pausing at a data point, eyebrows raise slightly, nods approving"

### Setting Matters for Mood
- ❌ "Office"
- ✅ "Modern luxury office, morning golden hour light through floor-to-ceiling windows, minimalist desk, soft shadows on face"

### Camera Movements Should Justify Themselves
- ❌ "Dolly in and pan for no reason"
- ✅ "Dolly in slowly to emphasize subject's reaction, pan right to follow gaze to data insight"

### Combine Body + Lens + Movement Intentionally
- ✅ ARRI Alexa 35 + Cooke S4 + Dolly In + Pan Right = warm, filmic, following action naturally
- ✅ RED V-Raptor + Macro + Through Object = sharp, detailed, discovery-focused
- ✅ Panavision + Anamorphic + Crane Up + Orbit = cinematic, storytelling, epic

### Lighting Sets the Tone
- Warm golden light = intimate, premium, luxury
- Flat studio light = clean, modern, editorial
- Practical lights only = moody, dramatic, documentary
- High-key backlit = ethereal, dreamy, romantic

---

## Scene Template Variations

### For UGC / Testimonial
```
Subject: [Avatar description or real person]
Action: [Dialogue or speaking direction]
Setting: [Background, with or without blur]
Motion Tone: [Casual | Testimonial | Cinematic | Dynamic]
Script: [Exact voiceover text]
Model: Veo 3.1 (UGC Builder)
```

### For Social Reels
```
Subject: [Action-driven, fast-paced]
Action: [Quick transitions, trending audio timing]
Setting: [Visual hook, eye-catching]
Camera Movement: [Fast, dynamic, trendy]
Duration: 3–5s per scene (6 scenes in 15s clip possible with Kling 3.0)
Aspect: 9:16 (always)
Model: Kling 3.0 or Kling 2.5 Turbo
```

### For Product Showcase
```
Subject: [Product in hand or on display]
Action: [Rotation, reveal, detail shot]
Setting: [Minimal, white background OR branded environment]
Camera Movement: [360 Orbit | Dolly In + Tilt Up | Static + Zoom In]
Lighting: [Studio key + fill, product-focused]
Duration: 3–5s
Model: Cinema Studio (for luxury) or Kling 3.0 (for UGC feel)
```

### For Brand Film / Cinematic
```
Subject: [Character-driven, emotional]
Action: [Meaningful movement, narrative moment]
Setting: [Rich environment, tells story]
Camera: [Cinema Studio with ARRI / RED / Panavision]
Movement: [Complex, 3-movement stacking, justified]
Lighting: [3-point or dramatic, mood-driven]
Duration: 5–8s per scene
Model: Cinema Studio
```

---

## Output: From Template to Video

1. **Write scene template** → Fill out above format
2. **Review prompt** → Confirm Cinematic Prompt is clear and specific
3. **Verify model selection** → Right tool for the scene (Cinema Studio for hero shots, Kling 3.0 for social, etc.)
4. **Generate** → Paste cinematic prompt into Higgsfield, generate scene
5. **Review output** → Check camera movement, lighting, mood match
6. **Iterate if needed** → Adjust prompt, re-generate if output doesn't match vision
7. **Download** → Save to `./higgsfield-videos/project-name/scene-XX.mp4`
8. **Stitch** → Combine all scenes with ffmpeg or video editor

---

## Template Variations by Platform

### TikTok / Instagram Reels
```
Aspect: 9:16
Duration: 3–15s per scene
Model: Kling 3.0 (multi-cut) or Kling 2.5 Turbo (fast)
Quality: Premium UGC
Mood: Trendy, energetic, authentic
```

### YouTube / Broadcast
```
Aspect: 16:9
Duration: 5–10s per scene
Model: Cinema Studio (quality) or Seedance 2.0 (consistency)
Quality: Cinematic broadcast
Mood: Professional, polished, premium
```

### Website Hero Video
```
Aspect: 21:9 (CinemaScope)
Duration: 5–8s
Model: Cinema Studio
Quality: Ultra-cinematic
Mood: Brand-forward, premium, immersive
```

### Educational / Explainer
```
Aspect: 16:9
Duration: 3–5s per concept
Model: Kling 3.0 (multiple scenes) or Seedance 2.0 (consistency)
Quality: Clear, professional UGC
Mood: Authoritative, friendly, explanatory
```
