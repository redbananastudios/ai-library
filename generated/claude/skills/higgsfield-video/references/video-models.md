# Higgsfield Video Models - Complete Reference

## Model Overview (9 Models)

| Model | Best For | Duration | Resolution | Native Features | URL |
|-------|----------|----------|------------|-----------------|-----|
| **Cinema Studio** | 4K cinematic, ARRI/RED/IMAX, brand films, multi-shot | 5–15s (12s multi-shot) | 4K + 16-bit cinema | Camera body/lens simulation, 70+ camera movements, genre logic, multi-shot cuts | `/cinema-studio` |
| **Kling 3.0** | Premium UGC, social reels, native audio, consistent characters | Up to 15s | 1080p–4K | 6-shot multi-cut, native lip-sync, audio sync, unified video+audio+image | `/kling-3.0` |
| **Kling 2.5 Turbo** | Fast generation, frame interpolation | 5–10s | 1080p | Start+end frame control, motion control | `/create/video` (dropdown) |
| **Seedance 2.0** | Multi-input (text/image/video/audio), consistent characters | 5–15s | 1080p–4K | Native character consistency, multi-modal input, audio sync | `/seedance/2.0` |
| **Veo 3.1 (UGC Builder)** | Talking heads, testimonials, avatar ads | 5–30s | 1080p–4K | Lip-sync, emotion control, voice integration, realism engine | `/ugc` |
| **WAN 2.5** | Cinematography control, advanced camera work | 5–15s | 1080p–4K | Full digital cinematography, camera control mastery | `/create/video` (dropdown) |
| **Sora 2** | Color-coherent sequences, storyboard workflows | 5–15s | 1080p–4K | Exposure + color alignment across scenes, export-ready | `/create/video` (dropdown) |
| **Minimax Hailuo 02** | Fast performance tier, budget-conscious | 5–15s | 1080p | Lower latency, cost-effective | `/create/video` (dropdown) |
| **UGC Factory** | Batch ad production, pre-built templates | Variable | 1080p–4K | 40+ ad templates, voice+script input, fast scaling | `/flow/builder` |

---

## Auto-Selection Guide by Use Case

### UGC & Testimonials
- **Talking head, single avatar** → **Veo 3.1 (UGC Builder)** — native lip-sync, emotion control
- **Multi-person testimonial** → **Kling 3.0** — character consistency, native audio
- **Batch ad templates** → **UGC Factory** — 40+ ready-made scenarios, fast production

### Social Media & Reels
- **TikTok/Instagram Reels (9:16, 15s max)** → **Kling 3.0** — native audio, lip-sync, character consistency
- **YouTube Shorts (9:16, 60s)** → **Sora 2** (multiple clips stitched) or **Seedance 2.0** for consistency
- **Instagram Story ads (9:16, 5–15s)** → **Kling 2.5 Turbo** — fast, frame control
- **TikTok Creator Fund (varied aspect, trendy pacing)** → **WAN 2.5** — full camera control

### Brand & Commercial
- **4K brand film, ARRI/RED aesthetic** → **Cinema Studio** — camera body/lens simulation, multi-shot
- **Cinematic product demo (21:9)** → **Cinema Studio** — wide cinema scope, lighting control
- **Hero shot, hero video** → **Seedance 2.0** (multi-input) or **Cinema Studio** (full control)
- **Before/after, transformation** → **Sora 2** — color/exposure coherence + transitions

### Multi-Scene Production
- **Storyboard → motion (6+ scenes, consistent world)** → **Popcorn** (/storyboard-generator) → export to **Kling 3.0** or **Seedance 2.0**
- **360° product spin** → **WAN 2.5** (360 Orbit camera preset)
- **Character consistency across 3+ clips** → **Seedance 2.0** or **Soul 2.0** integration via Kling

---

## Duration & Resolution Targets by Platform

| Platform | Aspect | Duration | Resolution | Recommended Model |
|----------|--------|----------|------------|------------------|
| **TikTok** | 9:16 (portrait) | 3–60s | 1080p–4K | Kling 3.0 or Kling 2.5 Turbo |
| **Instagram Reels** | 9:16 (portrait) | 3–90s | 1080p–4K | Kling 3.0 |
| **YouTube Shorts** | 9:16 (portrait) | 3–60s | 1080p | Sora 2 or Seedance 2.0 |
| **YouTube (main feed)** | 16:9 (landscape) | 5min+ | 4K | Cinema Studio (multi-shot) |
| **Facebook Ads** | 1:1 (square) or 16:9 | 5–15s | 1080p–4K | Kling 3.0 or Veo 3.1 |
| **LinkedIn Video Post** | 16:9 (landscape) | 3–10min | 1080p | Seedance 2.0 (B2B narrative) |
| **Website Hero Video** | 21:9 (CinemaScope) | 5–15s | 4K | Cinema Studio |
| **Testimonial/Case Study** | 16:9 or 9:16 | 10–30s | 1080p–4K | Veo 3.1 (UGC Builder) |

---

## Prompt Engineering by Model

### Cinema Studio
- Emphasize **camera movement, lens, lighting, mood**
- Example: "ARRI Alexa 35 with Cooke S4 50mm, dolly in + pan right, golden hour, moody cinematic, IMAX aspect"
- Use `nano-banana-realism-engine` for camera/lighting language

### Kling 3.0
- Focus on **emotion, action, character, environment**
- Native audio/lip-sync: mention dialogue or voice tone in prompt
- Example: "Excited person holding coffee mug, warm kitchen, golden morning light, natural motion, speaking enthusiastically"

### Veo 3.1 (UGC Builder)
- Input **script/dialogue first**, then visual style
- Platform: `higgsfield.ai/ugc` → paste script → choose motion tone (casual/testimonial/cinematic/dynamic)

### Seedance 2.0
- Leverage **multi-input capability**: text prompt + reference image + audio URL
- Example: "Subject from reference image, motion from prompt, consistent emotion, smooth camera movement"

### Sora 2
- Focus on **scene composition, color mood, transitions**
- Best for sequences: "Scene 1: [prompt]. Scene 2: [prompt]. Scene 3: [prompt]"
- Color continuity: "warm golden tones throughout all 3 scenes"

### WAN 2.5
- Emphasize **camera angles, lens effects, creative cinematography**
- Use all 70+ camera movement presets
- Example: "360 orbit around subject, shallow depth of field, anamorphic lens flare"

---

## Settings for Each Workflow

### Cinema Studio Settings
- Camera body: ARRI Alexa 35 / RED V-Raptor / Sony Venice / IMAX Film Camera / Panavision Millennium DXL2 / Arriflex 16SR
- Lens type: Spherical (ARRI Signature, Cooke S4, Canon K-35) or Anamorphic (Hawk V-Lite, Panavision C, Petzval)
- Focal length: adjustable per lens
- Camera movements: stack up to 3 (dolly + pan + tilt, etc.)
- Duration: 5–15s (12s for multi-shot / 6 cuts)
- Aspect ratio: 21:9 (CinemaScope default), 16:9, 1:1

### Standard Video Settings (/create/video)
- Model: selected from dropdown
- Duration: 5s, 10s, or 15s
- Aspect ratio: 9:16 (portrait/social), 16:9 (landscape), 1:1 (square), 21:9 (cinema)
- Quality: 1080p or 4K (where available)
- Start frame / end frame: optional reference images (Kling 2.5T, Sora 2)

### UGC Builder Settings (/ugc)
- Script/dialogue: paste directly
- Motion tone: casual, testimonial, cinematic, dynamic
- Duration: 5–30s
- Aspect ratio: inherits from setup
- Voice: auto-generated or upload existing

### UGC Factory Settings (/flow/builder)
- Template: choose from 40+ ad templates
- Script: fill in dialogue per scene
- Voice: select tone, language, accent
- Duration: template-dependent (typically 10–30s)

---

## Model Limitations & Tradeoffs

| Model | Strength | Limitation | Workaround |
|-------|----------|-----------|-----------|
| Cinema Studio | Maximum quality + control | Longer generation time | Pre-plan all camera movements |
| Kling 3.0 | Native audio + consistency | Up to 15s max | Use multi-shot feature (6 cuts) |
| Veo 3.1 | Photorealistic talking heads | Limited to avatar/dialogue | Combine with Kling for full-body action |
| Seedance 2.0 | Multi-input flexibility | Less predictable output | Use reference images for consistency |
| WAN 2.5 | Full camera control | Smaller model | Test with 5s clips first |
| Sora 2 | Color coherence | Slower generation | Use for final polish, not drafts |
| Minimax | Fast | Lower quality | Use for batch/testing, not final |

---

## Stitch Guidance

Multiple scenes should be generated individually, then concatenated:
1. Generate Scene 1 → download `scene-01.mp4`
2. Generate Scene 2 → download `scene-02.mp4`
3. Generate Scene 3 → download `scene-03.mp4`
4. Use ffmpeg: `ffmpeg -f concat -safe 0 -i filelist.txt -c copy final.mp4`
5. If no ffmpeg: provide ordered file list, suggest manual stitching in Premiere/Final Cut

Note: Kling 3.0's 6-shot multi-cut (12–15s) eliminates stitching for short sequences.
