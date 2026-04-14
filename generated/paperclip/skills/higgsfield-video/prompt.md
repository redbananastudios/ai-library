---
name: Higgsfield Video
description: Generate high-quality videos via Higgsfield.ai — Cinema Studio (4K ARRI/RED/IMAX), UGC testimonials, social reels, Kling 3.0 multi-cut, and browser-based workflows with 70+ camera presets
---

# Higgsfield Video Skill

## Purpose

This skill enables you to generate professional-grade videos using Higgsfield.ai's browser interface. Supports 9 video models, Cinema Studio camera body/lens simulation, UGC talking heads, 70+ camera movement presets, and multi-scene stitching.

**All workflows execute via Higgsfield's browser interface** — no CLI API required (browser-use automation).

---

## Quick Start

1. **Understand the task:** Is this a cinematic brand film (Cinema Studio), social reel (Kling 3.0), testimonial (UGC Builder), or multi-scene project (Storyboard)?
2. **Define the scene:** Use the scene template — subject, action, setting, camera, lighting, mood.
3. **Choose the model:** Reference the auto-selection guide (see below).
4. **Write the prompt:** Use cinematic language for clarity.
5. **Navigate and generate:** Go to Higgsfield.ai URL, paste prompt, click generate.
6. **Download & organize:** Save to `./higgsfield-videos/project/scene-XX.mp4`
7. **Stitch (if needed):** Use ffmpeg command for multi-scene concatenation.

---

## 4 Primary Workflows

### Workflow A: Cinema Studio (4K Cinematic, ARRI/RED/IMAX)

**Best for:** Premium brand films, luxury ads, hero shots, high-end commercial production

**Navigate to:** https://higgsfield.ai/cinema-studio

**Features:**
- 6 camera bodies: ARRI Alexa 35, RED V-Raptor, Sony Venice, IMAX, Panavision, Arriflex 16SR
- 11 lens options: Spherical (ARRI Signature, Cooke S4, Canon K-35), Anamorphic (Hawk V-Lite, Panavision C), Specialty
- 70+ camera movement presets (stack up to 3 simultaneously)
- Lighting simulation: key, fill, rim, practical lights
- Multi-shot mode: 6 cuts in 12-15s clip (automatic stitching)

**Workflow Steps:**
1. Navigate to `/cinema-studio`
2. Select camera body (e.g., "ARRI Alexa 35")
3. Select lens (e.g., "Cooke S4 50mm")
4. Enter scene description (subject, action, setting, mood)
5. Configure camera movements (Dolly In + Pan Right + Tilt Up, max 3)
6. Configure duration (5s, 10s, 15s, or 12-15s for multi-shot)
7. Configure aspect ratio (21:9 CinemaScope, 16:9, 9:16, 1:1)
8. Enter full cinematic prompt (subject + action, setting, camera, lens, movement, mood)
9. Click **Generate**
10. Click **Download** → save to `./higgsfield-videos/project/scene-01.mp4`

**Output:** 4K ProRes 422 (16-bit cinema)
**Duration:** 30-90s generation time per scene

**Reference:** See `references/cinema-studio.md` for complete camera body/lens guide

---

### Workflow B: Standard Video (/create/video)

**Best for:** Social media, fast generation, variety of models, quick turnaround

**Navigate to:** https://higgsfield.ai/create/video

**Model choices (dropdown):**
- **Kling 3.0** — native audio, lip-sync, 6-shot multi-cut, up to 15s
- **Kling 2.5 Turbo** — fast generation, frame interpolation
- **Seedance 2.0** — multi-input (text+image+audio), consistent characters
- **WAN 2.5** — full camera control, cinematography mastery
- **Sora 2** — color-coherent sequences, storyboard workflows
- **Minimax Hailuo 02** — budget tier, fast performance

**Workflow Steps:**
1. Navigate to `/create/video`
2. Select model from dropdown
3. Set duration (5s, 10s, 15s)
4. Set aspect ratio (9:16 for social, 16:9 for broadcast, 21:9 for cinematic, 1:1 for square)
5. Set quality (1080p or 4K, model-dependent)
6. Enter scene description (use scene template)
7. Enter text prompt
8. Click **Generate**
9. Download → save to `./higgsfield-videos/project/`

**Output:** 1080p–4K (model-dependent), H.264 or ProRes
**Duration:** 15-60s generation time

**Auto-Selection Guide:**
- **TikTok/Instagram Reels (9:16, 15s max)** → Kling 3.0
- **YouTube Shorts (9:16, 60s)** → Sora 2 or Seedance 2.0
- **Product demo (landscape)** → WAN 2.5 or Kling 3.0
- **Fast draft / testing** → Kling 2.5 Turbo

**Reference:** See `references/video-models.md` for detailed model guide and platform targets

---

### Workflow C: UGC Builder (/ugc)

**Best for:** Talking heads, testimonials, avatar ads, educational videos, voice-driven content

**Navigate to:** https://higgsfield.ai/ugc

**Model:** Veo 3.1 (photorealistic talking head with native lip-sync)

**Workflow Steps:**
1. Navigate to `/ugc`
2. Paste script/dialogue in "Dialogue" field
3. Select motion tone (Casual, Testimonial, Cinematic, Dynamic, Narrator, Enthusiastic)
4. Configure avatar (default photorealistic or custom)
5. Configure voice (auto-generate or upload audio)
6. Set aspect ratio (9:16, 16:9, or 1:1)
7. Click **Generate**
8. Download → save to `./higgsfield-videos/project/`

**Output:** 1080p–4K, H.264
**Duration:** 30-60s generation time

**Motion Tones:**
- **Casual** — relaxed, natural gestures, social media vibe
- **Testimonial** — professional, warm, direct eye contact, trust-building
- **Cinematic** — polished, subtle motion, broadcast-quality
- **Dynamic** — high energy, expressive, engaging, hype
- **Narrator** — controlled, measured, authoritative, instructional
- **Enthusiastic** — upbeat, positive, celebratory energy

**Reference:** See `references/ugc-guide.md` for UGC Builder, UGC Factory (batch templates), Avatar Speech workflows

---

### Workflow D: Multi-Scene via Storyboard (Popcorn)

**Best for:** Complex narratives, multi-character stories, scene-by-scene cinematography, storyboard-to-video

**Navigate to:** https://higgsfield.ai/storyboard-generator

**Workflow Steps:**
1. Navigate to `/storyboard-generator`
2. Define scenes (manual: enter 2-8 scene descriptions, or auto with scene count slider)
3. Maintain character/style consistency across scenes
4. Export each scene frame/description
5. For each scene:
   - Navigate to appropriate model (Cinema Studio, Kling 3.0, Seedance 2.0, etc.)
   - Generate individual scene (3-5s each)
   - Download to `./higgsfield-videos/project/scene-XX.mp4`
6. Create `concat-list.txt` with all scene filenames
7. Run ffmpeg stitch: `ffmpeg -f concat -safe 0 -i concat-list.txt -c copy final.mp4`

**Output:** Custom per-scene, final concatenated video
**Duration:** Scene-by-scene (each 3-5s), total 15-60s+

**Reference:** See `references/scene-template.md` for scene definition and `references/stitching-guide.md` for ffmpeg stitching

---

## Scene Definition (Quick Template)

Before generating any scene, define it clearly:

```
Subject: [Who/what in frame, appearance, clothing, expression]
Action: [What happens, movement, dialogue, behavior]
Setting: [Location, environment, lighting conditions, time of day, atmosphere]
Camera Body: [ARRI Alexa 35 / RED V-Raptor / Sony Venice / etc.] (Cinema Studio only)
Lens: [Cooke S4 50mm / Hawk V-Lite Anamorphic / etc.] (Cinema Studio only)
Camera Movement: [Up to 3 stacked — Dolly In + Pan Right + Tilt Up, etc.]
Lighting: [Key light description, fill, rim, mood]
Duration: [Seconds — 3, 5, 8, etc.]
Aspect Ratio: [21:9 / 16:9 / 9:16 / 1:1]
Mood/Tone: [Emotional intent, color palette, style, brand aesthetic]
Cinematic Prompt: [Full prompt ready for Higgsfield]
Model: [Cinema Studio / Kling 3.0 / Veo 3.1 / WAN 2.5 / etc.]
```

**Reference:** See `references/scene-template.md` for complete template with full examples and multi-scene storyboards

---

## Camera Movement Presets (70+)

Stack up to 3 movements simultaneously:

**Standard (18):**
Dolly In/Out/Left/Right, Pan Left/Right, Tilt Up/Down, Crane Up, 360 Orbit, Zoom In/Out, Handheld, Steadicam, Static

**Advanced (40+):**
Whip Pan, Crash Zoom, YoYo Zoom, Bullet Time, Through Object In/Out, Super Dolly Out, Dutch Angle, 3D Rotation, Spiral, Arc Right/Left, Figure-8, Lateral Slide, Pendulum, Wiggle

**Specialty (20+):**
Glam Timelapse, Human Timelapse, Landscape Timelapse, Practical Timelapse, Film Grain, Anamorphic Flare, Bokeh Shift, Light Bloom, Chromatic Aberration

**Motion Tone Modifiers:**
Smooth (luxury), Dynamic (social), Contemplative (documentary), Playful (comedy), Cinematic (feature-film), Handheld (intimate), Mechanical (sci-fi)

**Stacking Rules:**
- Primary: one dominant movement (e.g., dolly in)
- Secondary: one complementary (e.g., pan right to follow)
- Tertiary: one accent/quality (e.g., handheld for texture)
- All three should harmonize, not conflict

**Reference:** See `references/camera-controls.md` for complete 70+ catalog, motion tones, stacking examples, and scene-type guidance

---

## Model Auto-Selection by Use Case

| Use Case | Recommended Model | Duration | Aspect | Quality |
|----------|---|---|---|---|
| **Luxury brand film** | Cinema Studio | 5-15s | 21:9 | 4K cinema |
| **Social reels** | Kling 3.0 | 3-15s | 9:16 | 1080p-4K |
| **Testimonial** | Veo 3.1 (UGC) | 5-30s | 9:16/16:9 | 1080p-4K |
| **Fast draft** | Kling 2.5 Turbo | 5-10s | 9:16 | 1080p |
| **Multi-input consistency** | Seedance 2.0 | 5-15s | 16:9 | 1080p-4K |
| **Camera mastery** | WAN 2.5 | 5-15s | 16:9 | 1080p-4K |
| **Color-coherent sequences** | Sora 2 | 5-15s | 16:9 | 1080p-4K |
| **Batch ads** | UGC Factory | Variable | 1080p-4K | 1080p-4K |

**Reference:** See `references/video-models.md` for detailed platform targets (TikTok, YouTube, LinkedIn, Facebook, etc.)

---

## Prompt Engineering Best Practices

### ✅ DO: Be Specific
```
"Woman in navy blazer seated at modern glass desk, reviewing Excel spreadsheet on desktop,
eyes scanning left to right, eyebrows raise at key data point, nods approvingly,
soft golden morning light streams from floor-to-ceiling window on left side,
subtle rim light on face, ARRI Alexa 35 with Cooke S4 50mm lens, dolly in slowly
(2cm/sec) + pan right gently (10 degrees) + subtle handheld wiggle, warm cinematic
mood, sophisticated color grade, professional broadcast quality, 9:16 aspect"
```

### ❌ DON'T: Be Vague
```
"Person at desk looking at spreadsheet"
```

### ✅ DO: Lead with Action/Emotion
```
"Coffee pouring into cup, steam rising in slow-motion, dramatic backlit lighting,
close-up macro detail, RED V-Raptor with macro lens, camera through steam effect,
high-contrast dynamic mood"
```

### ✅ DO: Combine Camera Body + Lens + Movement Intentionally
- **ARRI Alexa 35 + Cooke S4 + Dolly In** = warm, filmic, intimate approach
- **RED V-Raptor + Macro + Through Object** = sharp detail, discovery feeling
- **Panavision + Anamorphic + Crane Up + Orbit** = epic cinematography, storytelling

### ✅ DO: Describe Lighting Precisely
```
"Golden hour side light (key) + natural ambient fill (bouncing off walls) +
subtle rim light catching cup edge for separation, warm cinematic color grade"
```

### ✅ DO: Reference Brand Aesthetic
- Luxury → warm, soft, ARRI, smooth camera, sophisticated color
- Tech → clean, neutral, sharp, precise framing, modern
- UGC/Social → natural light, handheld, authentic, casual tone
- Cinematic → 3-point lighting, IMAX scope, complex moves, feature-film quality

**Reference:** See `references/nano-banana-realism-engine` for advanced cinematography language (color grading, visual effects, mood modifiers)

---

## Anti-Impossibility Constraints for Video (Prevent AI Physics Errors)

Video models frequently render physically impossible geometry — floating furniture, disconnected structures, see-through solid objects, broken perspective, impossible anatomy. Add these constraints to EVERY scene prompt:

**1. Grounding & Contact**
- All objects meant to touch ground/surfaces must have visible, continuous contact
- No floating furniture, levitating people, hovering structures
- Add to prompt: `"[object] sitting firmly on [surface] with no gap at base"`

**2. Structural Integrity**
- All load-bearing structures must have visible support — no floating edges, impossible cantilevers
- Multi-part objects must have complete, connected bases
- Add to prompt: `"structurally believable [object] with solid joinery and full support, no floating edges"`

**3. Material Opacity**
- Solid opaque objects cannot show other objects through them
- Surfaces cannot penetrate each other
- Add to prompt: `"opaque [material] with no visible [surface] showing through or beneath it"`

**4. Perspective Consistency**
- Vanishing points consistent throughout scene
- Parallel lines remain parallel or converge correctly
- Depth and shadow fall from single, consistent light source

**5. Anatomical Correctness**
- People must have correct anatomy: 2 visible hands, proper limb connection, realistic proportions
- Fixtures must have all distinct parts (taps with correct number of spouts, handles separate, not fused)
- No merged or disconnected components

**Anti-Pattern Language (Always Include One):**
```
Pattern A: "[object] grounded firmly on [surface] with complete, visible support and solid joinery"
Pattern B: "opaque [material] making full contact with supporting surface, no gaps or penetration"
Pattern C: "structurally believable geometry with all load-bearing visible and no impossible angles"
```

**Negative Constraints (Add to Any Prompt with Physics Risk):**
```
no floating [object]
no see-through solid surfaces
no impossible geometry
no disconnected structures
no fused components
no unsupported edges
no intersecting surfaces
```

**Pre-Generation Validation Checklist:**
- [ ] Do all grounded objects have full contact with surface? Any floating elements?
- [ ] Are all solid objects actually opaque, or can I see through them?
- [ ] Do all load-bearing structures have visible support?
- [ ] Do multi-part objects have distinct, separate components?
- [ ] Is perspective consistent? Any impossible angles?

If ANY fail, add anti-impossibility constraints to the prompt before generating.

---

## Platform-Specific Guidance

| Platform | Aspect | Duration | Model | Notes |
|---|---|---|---|---|
| **TikTok** | 9:16 | 3-60s | Kling 3.0, Kling 2.5T | Vertical, trending audio, punch in first 3s |
| **Instagram Reels** | 9:16 | 3-90s | Kling 3.0 | Native audio, lip-sync, character consistency |
| **YouTube Shorts** | 9:16 | 3-60s | Sora 2, Seedance 2.0 | High production quality, storytelling-focused |
| **YouTube (main)** | 16:9 | 5min+ | Cinema Studio multi-shot | Hero shots, cinematic quality, premium feel |
| **LinkedIn** | 16:9 | 3-10min | Seedance 2.0 | Professional tone, B2B narratives, testimonials |
| **Facebook Ads** | 1:1 / 16:9 | 5-15s | Kling 3.0, Veo 3.1 | Square or landscape, fast-moving, engaging |
| **Website Hero** | 21:9 | 5-15s | Cinema Studio | CinemaScope epic, brand premium, immersive |
| **Testimonial** | 16:9 / 9:16 | 10-30s | Veo 3.1 (UGC) | Talking head, authentic voice, trust-building |

**Reference:** See `references/video-models.md` for complete platform matrix

---

## Output & File Organization

### Standard Project Structure
```
./higgsfield-videos/
├── project-name/
│   ├── scene-01.mp4  (download from Higgsfield)
│   ├── scene-02.mp4  (download from Higgsfield)
│   ├── scene-03.mp4  (download from Higgsfield)
│   ├── concat-list.txt  (create manually for ffmpeg)
│   └── project-name-final.mp4  (output after stitching)
└── ...other projects
```

### Download Workflow
1. Generate scene in Higgsfield
2. Click **Download** → `~/Downloads/scene-01.mp4` (or auto-named)
3. Move to project folder: `mv ~/Downloads/scene-*.mp4 ./higgsfield-videos/project-name/`
4. Rename consistently: `scene-01.mp4`, `scene-02.mp4`, etc.

### Multi-Scene Stitching (FFmpeg)

**Create `concat-list.txt`:**
```
file 'scene-01.mp4'
file 'scene-02.mp4'
file 'scene-03.mp4'
```

**Run FFmpeg:**
```bash
ffmpeg -f concat -safe 0 -i concat-list.txt -c copy project-final.mp4
```

**Verify output:**
```bash
ffmpeg -i project-final.mp4  # Check duration = sum of all scenes
```

**Reference:** See `references/stitching-guide.md` for complete FFmpeg guide, video editor stitching, and troubleshooting

---

## Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| **Generation timeout / fails** | Complex moves + high resolution | Try 5s first, then scale up; simplify camera movements |
| **Audio out of sync** | Codec mismatch during stitch | Use `ffmpeg -c:a aac` for audio re-encode |
| **Clips won't concatenate** | Different codecs (H.264 vs ProRes) | Re-encode all to H.264 before concat |
| **Quality too low** | Wrong model for use case | Switch to Cinema Studio if quality is priority |
| **Camera motion jerky** | Too many movements (>3) | Limit to primary + secondary movement |
| **Aspect ratio wrong** | Didn't configure before generation | Always set aspect ratio in scene definition |

---

## Integration with Other Skills

### `nano-banana-realism-engine` (Cinematography Language)

When writing cinematic prompts for Higgsfield, leverage nano-banana-realism-engine for:
- Camera body aesthetic descriptions
- Lens behavior & rendering characteristics
- Lighting setup language (3-point, practical, etc.)
- Color grading & mood terminology
- Motion quality (smooth vs. handheld, weight, texture)

**Example Workflow:**
1. Use nano-banana-realism-engine to generate cinematography language
2. Feed that language into Higgsfield prompt
3. Combine with scene template (subject, action, setting)
4. Paste complete prompt into Higgsfield
5. Generate & download

---

## Reference Files

All detailed reference documentation is in `skills/higgsfield-video/references/`:

1. **`video-models.md`** (350+ lines)
   - 9 models: features, duration, resolution, use cases
   - Auto-selection guide by use case
   - Platform targets (TikTok, YouTube, LinkedIn, etc.)
   - Model-specific prompt engineering
   - Limitations & workarounds

2. **`cinema-studio.md`** (400+ lines)
   - 6 camera bodies with aesthetic descriptions
   - 11 lens options (spherical, anamorphic, specialty)
   - Step-by-step Cinema Studio workflow
   - Multi-shot/6-cut mode details
   - Lighting simulation (key, fill, rim, practical)
   - Example cinematic scenes

3. **`camera-controls.md`** (400+ lines)
   - 70+ movement presets (standard, advanced, specialty)
   - Motion tone modifiers
   - Stacking rules & examples
   - Scene-type guidance (establishing, action, product, etc.)
   - Prompt language examples
   - Creative tips

4. **`ugc-guide.md`** (300+ lines)
   - UGC Builder (Veo 3.1) workflow
   - UGC Factory (batch templates, 40+)
   - Avatar Speech tool
   - Best practices (script, tone, avatar, voice)
   - Integration with other workflows
   - Common UGC scenarios

5. **`scene-template.md`** (500+ lines)
   - Complete scene definition format
   - Abbreviated quick template
   - Full worked example (3-scene coffee brand video)
   - Scene variations by platform
   - Checklist before generation
   - Template variations (UGC, social, product, brand)

6. **`stitching-guide.md`** (600+ lines)
   - FFmpeg concat (lossless, recommended)
   - FFmpeg with transitions (fade, dissolve)
   - Audio stitching
   - Video editor stitching (Premiere, Final Cut, DaVinci)
   - Higgsfield multi-shot (automatic, no stitching needed)
   - Batch stitching scripts
   - Troubleshooting (codec, audio sync, frame rate)
   - Quick reference table

---

## Quick Access Links

- **Higgsfield Dashboard:** https://higgsfield.ai
- **Cinema Studio:** https://higgsfield.ai/cinema-studio
- **Standard Video:** https://higgsfield.ai/create/video
- **UGC Builder:** https://higgsfield.ai/ugc
- **Storyboard Generator:** https://higgsfield.ai/storyboard-generator
- **Keyframes (Frame interpolation):** https://higgsfield.ai/keyframes

---

## Next Steps

1. **Choose workflow** — Cinema Studio (premium), Standard Video (versatile), UGC Builder (talking heads), or Storyboard (multi-scene)
2. **Define scene(s)** — Use scene template from `references/scene-template.md`
3. **Select model** — Reference auto-selection table above or detailed guide in `references/video-models.md`
4. **Write prompt** — Use cinematography language; reference `references/camera-controls.md` and `nano-banana-realism-engine`
5. **Navigate & generate** — Go to Higgsfield URL, paste prompt, click generate
6. **Download & organize** — Save to `./higgsfield-videos/project/` with consistent naming
7. **Stitch (if multi-scene)** — Use ffmpeg from `references/stitching-guide.md`
8. **Deliver** — Ready for platform upload or video editor polish

---

## Support & Additional Resources

- All 4 workflows are browser-based (no CLI required)
- For Higgsfield API/CLI in future, documentation will be updated
- Integrates with browser-use automation for hands-free generation workflow
- Full skill prompt content available in `references/prompt-content.md`
