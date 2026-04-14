# Higgsfield Video Skill - Main Content (for prompt.md)

## Overview

The Higgsfield Video skill enables high-quality video generation via Higgsfield.ai's 9+ video models. Generate UGC testimonials, social reels, cinematic brand films, and product demonstrations in 4K cinema quality with advanced camera control, lighting simulation, and multi-scene stitching.

---

## Video Generation Workflows (4 Primary)

### Workflow A: Cinema Studio (4K Cinematic, ARRI/RED/IMAX)

**Best for:** Premium brand films, luxury commercials, hero shots, product demos, high-end advertising

**Access:** https://higgsfield.ai/cinema-studio

**Setup:**
- Camera body selection (ARRI Alexa 35 / RED V-Raptor / Sony Venice / IMAX / Panavision / Arriflex 16SR)
- Lens selection (11 options: ARRI Signature, Cooke S4, Anamorphic, Macro, etc.)
- Scene definition with up to 3 stacked camera movements (70+ presets)
- Lighting configuration (key, fill, rim, practical lights)
- Multi-shot mode: up to 6 cuts in 12-15s clip (zero stitching required)

**Duration:** 5-15s single shot, 12-15s multi-shot (6 cuts)
**Resolution:** 4K (3840×2160)
**Output:** ProRes 422 (16-bit cinema grade)

**Reference:** See `cinema-studio.md` for full camera body/lens guide and step-by-step workflow

---

### Workflow B: Standard Video (/create/video)

**Best for:** Social media, fast turnaround, variety of models (Kling, Sora, WAN, Seedance), UGC content

**Access:** https://higgsfield.ai/create/video

**Models available in dropdown:**
- Kling 3.0 (native audio, lip-sync, multi-cut)
- Kling 2.5 Turbo (fast, frame control)
- Seedance 2.0 (multi-input, consistent characters)
- WAN 2.5 (full camera control)
- Sora 2 (color-coherent sequences)
- Minimax Hailuo 02 (budget tier)

**Setup:**
- Model selection from dropdown
- Duration: 5s, 10s, or 15s
- Aspect ratio: 9:16 (social), 16:9 (landscape), 1:1 (square), 21:9 (cinema)
- Quality: 1080p or 4K (where available)
- Text prompt (reference scene template for clarity)

**Resolution:** 1080p–4K (varies by model)
**Output:** H.264 or ProRes

**Reference:** See `video-models.md` for auto-selection guide by use case

---

### Workflow C: UGC Builder (/ugc)

**Best for:** Talking heads, testimonials, avatar-based ads, educational videos, voice-over content

**Access:** https://higgsfield.ai/ugc

**Model:** Veo 3.1 (photorealistic talking head with native lip-sync)

**Setup:**
- Script/dialogue input (paste full voiceover text)
- Motion tone selection (Casual / Testimonial / Cinematic / Dynamic / Narrator / Enthusiastic)
- Avatar customization (default photorealistic or custom)
- Voice: auto-generate (100+ voices, any language) or upload audio
- Emotion control (subtle expressions, eye contact, gestures)

**Duration:** 5-30s
**Resolution:** 1080p–4K
**Output:** H.264

**Reference:** See `ugc-guide.md` for complete UGC Builder, UGC Factory (batch templates), and Avatar Speech workflows

---

### Workflow D: Multi-Scene via Storyboard (Popcorn Generator)

**Best for:** Complex narratives, multiple character consistency, cinematic storytelling, multi-scene sequences

**Access:** https://higgsfield.ai/storyboard-generator

**Setup:**
- Define scenes (manual or auto, up to 8 scenes)
- Character/style consistency maintained across all scenes
- Export each frame/scene to video model (Cinema Studio, Kling 3.0, Seedance 2.0)
- Stitch final sequence

**Duration:** Scene-by-scene (each 3-5s), final 15-60s+
**Workflow:** Storyboard → individual scenes → stitch with ffmpeg

**Reference:** See `scene-template.md` for scene definition format and `stitching-guide.md` for ffmpeg stitching

---

## Authentication

### Fast-Path (If Avatar Visible)
If you see your user avatar/profile icon in the top-right corner of Higgsfield.ai, you're already authenticated. Skip to workflow.

### Full Authentication Flow (First Time)
1. Navigate to https://higgsfield.ai
2. Click "Login" or "Sign In"
3. **Google OAuth (Recommended):**
   - Click "Sign in with Google"
   - Select account
   - Confirm permissions
   - Redirected to dashboard

4. **Email/Password:**
   - Enter email address
   - Click "Continue"
   - Check email for verification link
   - Click link
   - Set password
   - Confirm

5. **Verification:** Once logged in, profile icon appears in top-right corner

---

## Scene Definition (Quick Reference)

Before generating, define your scene using this format:

```
Subject: [Who/what is in frame, appearance, expression]
Action: [What happens, movement, dialogue]
Setting: [Location, environment, lighting conditions, time of day]
Camera Body: [ARRI Alexa 35 / RED V-Raptor / Sony Venice / etc. — Cinema Studio only]
Lens: [Cooke S4 50mm / Hawk V-Lite Anamorphic / etc. — Cinema Studio only]
Camera Movement: [Up to 3 stacked: Dolly In + Pan Right + Tilt Up, etc.]
Lighting: [Key light, fill, rim, mood]
Duration: [Seconds: 3 / 5 / 8 / etc.]
Aspect Ratio: [21:9 / 16:9 / 9:16 / 1:1]
Mood: [Emotional tone, color palette, style]
Cinematic Prompt: [Full prompt ready for Higgsfield]
Model: [Cinema Studio / Kling 3.0 / Veo 3.1 / etc.]
```

**Reference:** See `scene-template.md` for full template with examples, multi-scene storyboards, and platform variations

---

## Camera Movement Presets (70+)

All workflows support camera movements. Stack up to 3 simultaneously:

**Standard (18):** Dolly In/Out/Left/Right, Pan Left/Right, Tilt Up/Down, Crane Up, 360 Orbit, Zoom In/Out, Handheld, Steadicam, Static

**Advanced (40+):** Whip Pan, Crash Zoom, YoYo Zoom, Through Object In/Out, Super Dolly Out, Dutch Angle, 3D Rotation, Arc Right/Left, Figure-8, Lateral Slide, Pendulum, Wiggle

**Specialty (20+):** Glam Timelapse, Human Timelapse, Landscape Timelapse, Film Grain, Anamorphic Flare, Bokeh Shift, Light Bloom, Chromatic Aberration

**Motion tone modifiers:** Smooth, Dynamic, Contemplative, Playful, Cinematic, Handheld, Mechanical

**Reference:** See `camera-controls.md` for complete 70+ preset catalog, motion tones, stacking rules, and scene-type guidance

---

## Model Auto-Selection

**Choose model based on your use case:**

| Use Case | Model | Duration | Aspect | Quality |
|----------|-------|----------|--------|---------|
| Luxury brand film, ARRI/RED aesthetic | Cinema Studio | 5-15s | 21:9 | 4K cinema |
| Social reels, TikTok/Reels, native audio | Kling 3.0 | 3-15s | 9:16 | 1080p-4K |
| Talking heads, testimonials, lip-sync | Veo 3.1 (UGC) | 5-30s | 9:16 or 16:9 | 1080p-4K |
| Fast draft, budget, turnaround | Kling 2.5 Turbo | 5-10s | 9:16 | 1080p |
| Multi-input consistency, text+image+audio | Seedance 2.0 | 5-15s | 16:9 | 1080p-4K |
| Full camera control, cinematography | WAN 2.5 | 5-15s | 16:9 | 1080p-4K |
| Color-coherent sequences, storyboard | Sora 2 | 5-15s | 16:9 | 1080p-4K |
| Batch ad templates, 40+ presets | UGC Factory | Variable | 1080p-4K | 1080p-4K |

**Reference:** See `video-models.md` for detailed guide with platform targets (TikTok, YouTube, LinkedIn, etc.)

---

## Output Management

### File Organization

```
./higgsfield-videos/
├── project-01/
│   ├── scene-01.mp4
│   ├── scene-02.mp4
│   ├── scene-03.mp4
│   ├── concat-list.txt
│   └── project-01-final.mp4  (after stitching)
├── project-02/
│   └── ...
└── README.md (project notes)
```

### Download & Storage

1. Generate scene in Higgsfield
2. Click **Download** → saves to `~/Downloads/`
3. Move to project folder: `mv ~/Downloads/scene-01.mp4 ./higgsfield-videos/my-project/`
4. Rename consistently: `scene-01.mp4`, `scene-02.mp4`, `scene-03.mp4`

### Multi-Scene Stitching

**If generating multiple scenes separately:**

1. Generate all scenes individually
2. Collect in one folder
3. Create `concat-list.txt` listing all files
4. Use ffmpeg: `ffmpeg -f concat -safe 0 -i concat-list.txt -c copy output-final.mp4`

**If using Higgsfield multi-shot (6 cuts in one clip):**

No stitching needed — download single pre-stitched clip.

**Reference:** See `stitching-guide.md` for complete ffmpeg guide, troubleshooting, and editor-based stitching

---

## Prompt Engineering Tips

### Keep It Specific
❌ "Create a video of a person"
✅ "Woman in navy blazer at glass desk, reviewing spreadsheet, confident expression, morning golden light from window, ARRI Alexa 35, dolly in slowly, warm cinematic mood"

### Lead with Action
❌ "Coffee cup on table"
✅ "Hands pouring coffee into white ceramic cup, steam rising, macro detail, backlit, dynamic energy"

### Use Camera Language
❌ "Move the camera"
✅ "Dolly in slowly (3 inches per second), pan right gently following subject's gaze, subtle handheld wiggle for intimacy"

### Combine Body + Lens + Movement Intentionally
- **ARRI Alexa 35 + Cooke S4 + Dolly In** = warm, filmic, intimate
- **RED V-Raptor + Macro + Through Object** = sharp, detailed, discovering
- **Panavision + Anamorphic + Crane Up + Orbit** = cinematic, storytelling, epic

### Reference Brand Aesthetic
- Luxury brands → warm tones, soft lighting, smooth camera, ARRI aesthetic
- Tech products → clean lines, neutral lighting, sharp focus, precision
- UGC/Social → natural light, handheld feel, authentic movement, casual tone
- Cinematic brands → 3-point lighting, IMAX scope, complex camera moves

**Reference:** See `nano-banana-realism-engine` skill for advanced cinematography language (camera, lighting, color grading)

---

## Platform-Specific Guidance

| Platform | Aspect | Duration | Resolution | Model | Tips |
|----------|--------|----------|------------|-------|------|
| **TikTok** | 9:16 | 3-60s | 1080p–4K | Kling 3.0, Kling 2.5T | Vertical, trending audio, punch in first 3s |
| **Instagram Reels** | 9:16 | 3-90s | 1080p–4K | Kling 3.0 | Native audio, lip-sync, character consistency |
| **YouTube Shorts** | 9:16 | 3-60s | 1080p | Sora 2, Seedance 2.0 | Higher production quality, storytelling |
| **YouTube (main)** | 16:9 | 5min+ | 4K | Cinema Studio multi-shot | Hero shots, cinematic, premium production |
| **LinkedIn** | 16:9 | 3-10min | 1080p | Seedance 2.0 (B2B) | Professional tone, authentic testimonials |
| **Facebook Ads** | 1:1 or 16:9 | 5-15s | 1080p–4K | Kling 3.0, Veo 3.1 | Square or landscape, fast-moving visuals |
| **Website Hero** | 21:9 | 5-15s | 4K | Cinema Studio | CinemaScope epic, brand premium quality |
| **Testimonial** | 16:9 or 9:16 | 10-30s | 1080p–4K | Veo 3.1 (UGC) | Talking head, authentic voice, trust-building |

---

## Common Workflows

### Single-Scene Generation (5-15s)
1. Navigate to `/cinema-studio` or `/create/video`
2. Define scene (use scene template)
3. Configure settings (duration, aspect, quality)
4. Generate
5. Download to `./higgsfield-videos/project/scene-01.mp4`

### Multi-Scene with Stitching (3+ scenes, 9-30s total)
1. Generate Scene 1 → download
2. Generate Scene 2 → download
3. Generate Scene 3 → download
4. Create `concat-list.txt` with all files
5. Run ffmpeg stitch command
6. Output: `project-final.mp4`

### UGC Testimonial (Talking Head)
1. Navigate to `/ugc`
2. Paste script/dialogue
3. Select motion tone (Testimonial)
4. Configure avatar (default or custom)
5. Generate
6. Download

### Multi-Shot In One Clip (6 scenes, 12-15s, zero stitching)
1. Navigate to `/cinema-studio` or `/kling-3.0`
2. Enable "Multi-shot mode"
3. Enter 6 separate scene descriptions
4. Generate once (takes 2-5 minutes)
5. Download one pre-stitched clip
6. Ready for delivery

---

## Troubleshooting

### Generation Failed / Timeout
- **Cause:** Complex camera movements + high resolution
- **Fix:** Try 5s duration first, then scale up
- **Or:** Simplify camera movement (single dolly vs. triple stacking)

### Audio Out of Sync
- **Cause:** Codec mismatch during stitching
- **Fix:** Use ffmpeg with audio re-encoding: `-c:a aac`
- **Or:** Stitch in video editor (Premiere, Final Cut)

### Clips Won't Stitch (Codec Error)
- **Cause:** Different codecs in source clips (H.264 vs. ProRes)
- **Fix:** Re-encode all to H.264 before concat
- **Or:** Use ffmpeg with explicit codec conversion

### Quality Too Low
- **Cause:** Model not suited for use case
- **Fix:** Switch to Cinema Studio if priority is quality
- **Or:** Increase resolution (1080p → 4K if available in model)

### Camera Movement Not Smooth
- **Cause:** Too many movements stacked (limit 3)
- **Fix:** Simplify to primary + secondary movement only
- **Or:** Choose slower speed (Slow vs. Fast)

---

## References

All reference files are located in `skills/higgsfield-video/references/`:

1. **`video-models.md`** — 9 models catalog, auto-selection guide, platform targets, settings, limitations
2. **`cinema-studio.md`** — Camera bodies (6), lenses (11), step-by-step workflow, multi-shot guide, lighting simulation
3. **`camera-controls.md`** — 70+ movement presets, stacking rules, motion tones, scene-type guidance, creative tips
4. **`ugc-guide.md`** — UGC Builder, UGC Factory, Avatar Speech workflows, best practices, examples
5. **`scene-template.md`** — Standard scene definition format, full template, multi-scene examples, variations by platform
6. **`stitching-guide.md`** — FFmpeg concat (recommended), video editor stitching, Higgsfield multi-shot (automatic), troubleshooting

---

## Integration with Other Skills

### `nano-banana-realism-engine` (Cinematography Language)
When writing cinematic prompts, use cinematic language from nano-banana-realism-engine for:
- Camera body aesthetic language
- Lens behavior and rendering
- Lighting setup descriptions
- Color grading and mood
- Motion quality (smooth vs. handheld)

Example integration:
```
[nano-banana-realism-engine guidance] →
"Use ARRI Alexa 35 for warm, soft cinematic feel. Cooke S4 50mm renders natural bokeh.
Golden hour light creates intimate mood with soft shadows. Dolly in slowly for
approaching-subject feel. Warm color grade, moody sophistication."

→ [Higgsfield Video prompt]
"Woman at desk reviewing spreadsheet, morning golden hour light from window,
ARRI Alexa 35 with Cooke S4 50mm, dolly in slowly + pan right, warm cinematic mood,
sophisticated color grade, professional broadcast quality"
```

---

## Performance & Quality Targets

| Factor | Target | Notes |
|--------|--------|-------|
| **Lip-sync accuracy** (UGC Builder) | 95%+ | Photorealistic talking heads |
| **Camera movement smoothness** | No jitter | Stabilized, unless handheld intentional |
| **Color consistency** (multi-scene) | Match across all clips | Use same color grade language in all prompts |
| **Duration accuracy** | ±0.2s tolerance | FFmpeg stitching may add slight gaps |
| **Generation time** | 30-90s per scene | Longer for 4K + complex camera movements |
| **Audio sync** (stitched) | ±0.05s tolerance | FFmpeg concat is generally tight |

---

## Next Steps

1. **Choose workflow** — Cinema Studio (premium), Standard Video (variety), UGC Builder (talking heads), or Storyboard (multi-scene)
2. **Define scene** — Use scene template from `scene-template.md`
3. **Select model** — Reference auto-selection guide in `video-models.md`
4. **Write prompt** — Use cinematography language from `nano-banana-realism-engine` and `camera-controls.md`
5. **Generate** — Navigate to Higgsfield URL, paste prompt, click generate
6. **Download & organize** — Save to `./higgsfield-videos/project/`
7. **Stitch (if multi-scene)** — Use ffmpeg command from `stitching-guide.md`
8. **Deliver** — Upload to platform or video editor for final polish

---

## Quick Access Links

- **Higgsfield Dashboard:** https://higgsfield.ai
- **Cinema Studio:** https://higgsfield.ai/cinema-studio
- **Standard Video:** https://higgsfield.ai/create/video
- **UGC Builder:** https://higgsfield.ai/ugc
- **Storyboard Generator:** https://higgsfield.ai/storyboard-generator
- **Keyframes (Frame interpolation):** https://higgsfield.ai/keyframes

---

## Support

If Higgsfield API/CLI is needed in future (currently browser-only), CLI documentation will be added. For now, all workflows are browser-based with browser-use automation.
