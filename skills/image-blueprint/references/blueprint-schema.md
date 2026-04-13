# Image Blueprint JSON Schema

This document provides the complete template and field descriptions for the image reverse-engineering JSON blueprint.

---

## Blueprint Template (Blank)

```json
{
  "blueprint_version": "1.0",
  "source_image": "",
  "analyzed_at": "",

  "composition": {
    "framing": "",
    "aspect_ratio": "",
    "estimated_focal_length_mm": null,
    "camera_angle": "",
    "camera_distance": "",
    "rule_of_thirds": null,
    "subject_placement": "",
    "depth_of_field": "",
    "estimated_aperture": "",
    "foreground_elements": [],
    "background_elements": [],
    "leading_lines": [],
    "symmetry": null,
    "negative_space": "",
    "horizon_position": "",
    "notes": ""
  },

  "lighting": {
    "primary_source": "",
    "source_direction": "",
    "source_quality": "",
    "estimated_kelvin": null,
    "time_of_day": "",
    "shadow_behavior": "",
    "fill_light": "",
    "highlights": "",
    "contrast_level": "",
    "catchlights": "",
    "practical_lights_in_frame": [],
    "notes": ""
  },

  "color": {
    "palette_hex": [],
    "dominant_hue": "",
    "color_temperature_feel": "",
    "saturation_level": "",
    "color_grade_style": "",
    "skin_tone_rendering": "",
    "background_color_relationship": "",
    "notes": ""
  },

  "technical_style": {
    "medium": "",
    "camera_body_guess": "",
    "film_stock_or_sensor": "",
    "render_engine": "",
    "lens_character": "",
    "grain_or_noise": "",
    "post_processing_level": "",
    "art_movement": "",
    "notes": ""
  },

  "subject_details": {
    "primary_subject": "",
    "subject_count": null,
    "human_present": null,
    "approximate_age_range": "",
    "apparent_gender": "",
    "ethnicity_descriptor": "",
    "wardrobe": [],
    "expression": "",
    "body_language": "",
    "skin_texture_rendered": "",
    "key_materials": [],
    "key_textures": [],
    "props": [],
    "environment": "",
    "notes": ""
  },

  "artistic_dna": {
    "style_signature": "",
    "emotional_tone": "",
    "mood_words": [],
    "visual_influences": [],
    "creator_tendencies": [],
    "uniqueness_fingerprint": "",
    "brand_alignment": [],
    "notes": ""
  },

  "reproduction_prompts": {
    "midjourney": "",
    "flux": "",
    "stable_diffusion": "",
    "higgsfield": {
      "recommended_model": "",
      "model_slug": "",
      "prompt": "",
      "settings": {
        "aspect_ratio": "",
        "quality": "",
        "duration_seconds": null
      }
    },
    "notes": ""
  },

  "controlnet_recommendations": {
    "use_controlnet": null,
    "primary_map": "",
    "depth": {
      "use": null,
      "reason": "",
      "strength_suggested": null,
      "notes": ""
    },
    "canny": {
      "use": null,
      "reason": "",
      "strength_suggested": null,
      "notes": ""
    },
    "pose": {
      "use": null,
      "reason": "",
      "strength_suggested": null,
      "notes": ""
    },
    "lineart": {
      "use": null,
      "reason": "",
      "strength_suggested": null,
      "notes": ""
    },
    "ip_adapter": {
      "use": null,
      "reason": "",
      "strength_suggested": null,
      "notes": ""
    },
    "recommended_pipeline": "",
    "pipeline_explanation": ""
  },

  "generation_settings": {
    "midjourney": {
      "version": "",
      "style": "",
      "stylize": null,
      "aspect_ratio": "",
      "chaos": null,
      "quality": "",
      "additional_flags": {}
    },
    "stable_diffusion": {
      "sampler": "",
      "steps": null,
      "cfg_scale": null,
      "resolution": "",
      "recommended_checkpoint": "",
      "additional_settings": {}
    },
    "flux": {
      "steps": null,
      "guidance": null,
      "resolution": "",
      "additional_settings": {}
    },
    "notes": ""
  }
}
```

---

## Field Definitions

### Root Level

| Field | Type | Description |
|-------|------|-------------|
| `blueprint_version` | string | Version of this blueprint schema (currently "1.0") |
| `source_image` | string | URL or file path to the source image analyzed |
| `analyzed_at` | string | ISO 8601 timestamp when analysis was performed (e.g., "2026-04-13T14:30:00Z") |

---

### Composition Section

| Field | Type | Description | Example Values |
|-------|------|-------------|-----------------|
| `framing` | string | How the subject is framed in the shot | "extreme close-up", "medium close-up", "environmental portrait", "wide establishing", "aerial", "full-body" |
| `aspect_ratio` | string | Estimated aspect ratio | "3:2", "16:9", "21:9", "9:16", "1:1", "4:5" |
| `estimated_focal_length_mm` | number \| null | Estimated lens focal length | 24, 35, 50, 85, 100, 135, 200 |
| `camera_angle` | string | Angle of camera relative to subject | "eye-level", "low angle", "bird's eye", "high angle", "dutch tilt", "overhead" |
| `camera_distance` | string | Perceived distance of camera from subject | "intimate", "medium", "distant", "extreme wide" |
| `rule_of_thirds` | boolean \| null | Is subject positioned on rule-of-thirds line or intersection? | true, false |
| `subject_placement` | string | Where subject sits within frame | "left third", "center", "right third", "upper third", "lower third", "off-frame" |
| `depth_of_field` | string | Apparent depth of field | "shallow (f/1.2-f/2.8)", "moderate (f/4-f/8)", "deep (f/11+)" |
| `estimated_aperture` | string | Best estimate of aperture used | "f/1.2", "f/1.8", "f/2.8", "f/5.6", "f/11" |
| `foreground_elements` | array[string] | Objects/elements visible in foreground | ["out-of-focus greenery", "bokeh lights"] |
| `background_elements` | array[string] | Objects/elements visible in background | ["blurred cityscape", "neutral wall"] |
| `leading_lines` | array[string] | Lines guiding viewer's eye | ["road leading to horizon", "fence line", "architectural edges"] |
| `symmetry` | boolean \| null | Is composition symmetrical? | true, false |
| `negative_space` | string | Description of empty/negative space | "vast sky above subject", "white void", "minimal space" |
| `horizon_position` | string | Position of horizon line if visible | "upper third", "lower third", "center", "not visible" |
| `notes` | string | Additional composition observations | Free text notes |

---

### Lighting Section

| Field | Type | Description | Example Values |
|-------|------|-------------|-----------------|
| `primary_source` | string | Main light source illuminating subject | "natural window", "sun (direct)", "sun (diffused/overcast)", "studio softbox", "studio key light", "practical lamp", "mixed sources", "unknown" |
| `source_direction` | string | Direction light is coming from | "45° upper left", "side light (90°)", "rim/backlighting", "front-lit", "under-lit", "directional from above" |
| `source_quality` | string | Hard vs. soft light characteristic | "hard shadow", "soft/diffused", "mixed hard and soft", "volumetric/god rays" |
| `estimated_kelvin` | number \| null | Color temperature in Kelvin | 3200 (tungsten), 5500 (daylight), 6500 (overcast), 7000+ (shade) |
| `time_of_day` | string | Inferred time based on light quality | "golden hour", "midday (harsh)", "overcast (soft)", "night/artificial", "blue hour", "interior" |
| `shadow_behavior` | string | How shadows fall and transition | "sharp/defined", "gradual rolloff", "minimal/absent", "dramatic contrast", "rim lighting" |
| `fill_light` | string | Secondary light reducing shadow darkness | "present (bounce/reflector)", "present (secondary light)", "absent", "slight ambient fill" |
| `highlights` | string | Behavior of bright areas | "clipped/blown out", "controlled with detail", "natural rolloff", "high contrast" |
| `contrast_level` | string | Overall scene contrast ratio | "low/flat", "medium", "high (dramatic)", "cinematic (crushing blacks/bright highlights)" |
| `catchlights` | string | Reflection in eyes (if human subject present) | "present (one)", "present (multiple)", "absent", "not applicable" |
| `practical_lights_in_frame` | array[string] | Light sources visible in scene | ["window light", "overhead ceiling lights", "lamp"] |
| `notes` | string | Additional lighting observations | Free text notes |

---

### Color Section

| Field | Type | Description | Example Values |
|-------|------|-------------|-----------------|
| `palette_hex` | array[string] | Dominant colors in hex format | ["#f5d5c0", "#2b1810", "#c9a876"] |
| `dominant_hue` | string | Primary color family | "warm (orange/gold)", "cool (blue/teal)", "neutral", "desaturated", "monochrome" |
| `color_temperature_feel` | string | Warm, cool, or neutral overall impression | "warm", "cool", "neutral", "split-toned (warm + cool)", "cool shadows with warm highlights" |
| `saturation_level` | string | Color intensity | "muted/desaturated", "natural", "punchy/vibrant", "oversaturated" |
| `color_grade_style` | string | Post-processing color aesthetic | "film emulation (Kodak/Fuji)", "digital clean", "cross-processed", "teal-and-orange", "desaturated", "monochrome", "lifted blacks" |
| `skin_tone_rendering` | string | How skin tones are colored | "warm (golden/peachy)", "neutral", "cool (pink/magenta)", "not applicable" |
| `background_color_relationship` | string | How background relates to subject colors | "complementary contrast", "analogous harmony", "monochromatic", "neutral separation" |
| `notes` | string | Additional color observations | Free text notes |

---

### Technical Style Section

| Field | Type | Description | Example Values |
|-------|------|-------------|-----------------|
| `medium` | string | What the image is made of | "photography (digital)", "photography (film)", "digital illustration", "oil painting", "3D render", "mixed media" |
| `camera_body_guess` | string | Estimated camera model if photography | "Canon 5D Mark IV", "Sony A7 IV", "ARRI Alexa 35", "RED V-Raptor", "Hasselblad", "unknown" |
| `film_stock_or_sensor` | string | Film type or sensor characteristics | "Kodak Portra 400", "Fujifilm Velvia", "Sony Exmor", "RED MONSTRO", "CCD" |
| `render_engine` | string | 3D rendering software (if applicable) | "Octane Render", "Unreal Engine 5", "Blender Cycles", "V-Ray", "Arnold", "not applicable" |
| `lens_character` | string | Optical signature of lens used | "sharp throughout", "vintage soft focus", "anamorphic oval bokeh", "macro (1:1)", "fisheye distortion", "tilt-shift blur" |
| `grain_or_noise` | string | Film grain or digital noise visible | "film grain (fine/coarse)", "digital noise (visible/minimal)", "clean/noiseless", "intentional grain for aesthetic" |
| `post_processing_level` | string | Degree of post-work apparent | "minimal (straight shot)", "moderate (standard adjustments)", "heavy retouching (skin smoothing, object removal)", "stylized (significant grading/effects)" |
| `art_movement` | string | Artistic tradition or style | "documentary/photojournalism", "commercial/advertising", "editorial/fashion", "fine art", "surrealism", "conceptual", "illustration style" |
| `notes` | string | Additional technical observations | Free text notes |

---

### Subject Details Section

| Field | Type | Description | Example Values |
|-------|------|-------------|-----------------|
| `primary_subject` | string | Main focus of image | "woman", "landscape", "product (coffee cup)", "architectural detail", "abstract composition" |
| `subject_count` | number \| null | How many subjects visible | 1, 2, 5, etc. |
| `human_present` | boolean \| null | Is a human in the image? | true, false |
| `approximate_age_range` | string | Age estimate if human | "newborn", "child (5-12)", "teen (13-18)", "young adult (20s)", "adult (30s-40s)", "senior (50+)" |
| `apparent_gender` | string | Gender expression if human | "masculine", "feminine", "neutral/non-binary", "not apparent", "not applicable" |
| `ethnicity_descriptor` | string | Skin tone/ethnicity in neutral terms | "light skin", "medium skin", "dark skin", "olive complexion", "not applicable" |
| `wardrobe` | array[string] | Clothing items and colors | ["cream linen shirt", "blue jeans", "leather boots"] |
| `expression` | string | Facial expression if applicable | "neutral", "smiling", "serious", "contemplative", "candid/unaware", "not applicable" |
| `body_language` | string | Body position and attitude | "confident/upright", "relaxed/casual", "tense", "posed/formal", "in motion", "reclined" |
| `skin_texture_rendered` | string | Detail level of skin | "natural pores visible", "smoothed/retouched", "illustrated (drawn)", "painted" |
| `key_materials` | array[string] | Prominent materials in scene | ["fabric (cotton)", "metal (brushed aluminum)", "wood (weathered)", "glass", "concrete"] |
| `key_textures` | array[string] | Surface textures prominent | ["smooth/polished", "rough/weathered", "glossy", "matte", "bumpy", "reflective"] |
| `props` | array[string] | Objects in scene | ["coffee cup", "book", "chair", "mirror"] |
| `environment` | string | Setting or location | "studio (white background)", "outdoor (urban)", "outdoor (nature)", "interior (home)", "interior (commercial)" |
| `notes` | string | Additional subject observations | Free text notes |

---

### Artistic DNA Section

| Field | Type | Description | Example Values |
|-------|------|-------------|-----------------|
| `style_signature` | string | Unique visual fingerprint in 1–2 sentences | "Saturated colors + dramatic sidelighting + shallow DOF = commercial portrait aesthetic" |
| `emotional_tone` | string | Mood/feeling the image evokes | "luxurious", "intimate", "energetic", "melancholic", "aspirational", "professional", "playful", "serious", "vulnerable" |
| `mood_words` | array[string] | 5–10 descriptive words | ["cinematic", "moody", "editorial", "dreamy", "sharp", "nostalgic", "raw", "ethereal"] |
| `visual_influences` | array[string] | Artistic or photographic traditions evident | ["fashion photography", "cinema (cinematography)", "fine art (impressionism)", "commercial advertising", "documentary", "Japanese aesthetic"] |
| `creator_tendencies` | array[string] | Likely habits/preferences of creator | ["prefers warm lighting", "favors symmetry", "uses shallow DOF", "minimal props", "high saturation", "dramatic shadows"] |
| `uniqueness_fingerprint` | string | What makes this distinctly different from generic images in the category | "Unlike typical fashion photography, this embraces imperfection (visible texture, natural wrinkles)" |
| `brand_alignment` | array[string] | If this were a brand, what positioning would fit? | ["luxury fashion", "sustainable/eco", "startup (energetic/modern)", "heritage/traditional", "premium lifestyle"] |
| `notes` | string | Additional artistic observations | Free text notes |

---

### Reproduction Prompts Section

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| `midjourney` | string | Midjourney-native prompt with flags | Include version, style, aspect ratio, etc. |
| `flux` | string | Flux-native prompt (descriptive) | More verbose than Midjourney; technical language |
| `stable_diffusion` | string | Stable Diffusion prompt + checkpoint | Include recommended model/checkpoint |
| `higgsfield.recommended_model` | string | Which Higgsfield model best suited | "Cinema Studio", "Kling 3.0", "Seedance 2.0", "Veo 3.1", "WAN 2.5" |
| `higgsfield.model_slug` | string | Slugified model identifier | "cinema-studio", "kling-3.0", etc. |
| `higgsfield.prompt` | string | Full prompt ready for Higgsfield | Narrative form, camera + lighting + mood |
| `higgsfield.settings.aspect_ratio` | string | Recommended aspect ratio | "16:9", "9:16", "21:9", "1:1" |
| `higgsfield.settings.quality` | string | Quality/detail level | "standard", "high", "ultra" |
| `higgsfield.settings.duration_seconds` | number \| null | If generating video, duration in seconds | 3, 5, 10, 15 |
| `notes` | string | Additional prompt notes | "Tested on Midjourney v6 with best results", etc. |

---

### ControlNet Recommendations Section

| Field | Type | Description | Example Values |
|-------|------|-------------|-----------------|
| `use_controlnet` | boolean \| null | Should ControlNet be used? | true, false |
| `primary_map` | string | Most important ControlNet map | "Depth", "Canny", "Pose", "Lineart", "IP-Adapter" |
| `depth.use` | boolean \| null | Use depth map? | true, false |
| `depth.reason` | string | Why depth is beneficial | "Composition has clear foreground/mid/background layering" |
| `depth.strength_suggested` | number \| null | Recommended strength (0.0–1.0) | 0.5, 0.7 |
| `depth.notes` | string | Technical guidance | "Apply to preserve spatial relationships" |
| `canny.use` | boolean \| null | Use Canny edge detection? | true, false |
| `canny.reason` | string | Why Canny is beneficial | "Strong linear composition with architectural elements" |
| `canny.strength_suggested` | number \| null | Recommended strength | 0.4, 0.6 |
| `canny.notes` | string | Technical guidance | "Moderate strength to avoid over-emphasizing edges" |
| `pose.use` | boolean \| null | Use pose estimation? | true, false |
| `pose.reason` | string | Why pose is beneficial | "Human figure is central to composition and gesture is important" |
| `pose.strength_suggested` | number \| null | Recommended strength | 0.5, 0.8 |
| `pose.notes` | string | Technical guidance | "Extract pose from source before applying" |
| `lineart.use` | boolean \| null | Use lineart map? | true, false |
| `lineart.reason` | string | Why lineart is beneficial | "Subject has strong line definition or graphic quality" |
| `lineart.strength_suggested` | number \| null | Recommended strength | 0.3, 0.5 |
| `lineart.notes` | string | Technical guidance | "Use to preserve outline integrity" |
| `ip_adapter.use` | boolean \| null | Use IP-Adapter (image prompt)? | true, false |
| `ip_adapter.reason` | string | Why IP-Adapter is beneficial | "Style and aesthetic are critical to preserve across iterations" |
| `ip_adapter.strength_suggested` | number \| null | Recommended strength | 0.5, 0.7 |
| `ip_adapter.notes` | string | Technical guidance | "Use source image directly as style reference" |
| `recommended_pipeline` | string | Suggested pipeline combination | "Depth + IP-Adapter (sequential)", "Pose + Depth (simultaneous)" |
| `pipeline_explanation` | string | Why this pipeline works best | "Depth map preserves composition while IP-Adapter maintains aesthetic consistency" |

---

### Generation Settings Section

#### Midjourney

| Field | Type | Description | Example Values |
|-------|------|-------------|-----------------|
| `version` | string | Midjourney version | "v6.1", "v5.3", "niji" |
| `style` | string | Style mode | "raw", "default" |
| `stylize` | number \| null | Stylization strength (0–1000) | 50, 100, 250 |
| `aspect_ratio` | string | Image ratio | "16:9", "9:16", "1:1", "21:9" |
| `chaos` | number \| null | Randomness/variation (0–100) | 10, 50, 100 |
| `quality` | string | Quality setting | "fast", "standard", "high" |
| `additional_flags` | object | Other flags as key-value pairs | `{"repeat": 2}` |

#### Stable Diffusion

| Field | Type | Description | Example Values |
|-------|------|-------------|-----------------|
| `sampler` | string | Sampling algorithm | "DPM++ 2M Karras", "Euler A", "DDIM" |
| `steps` | number \| null | Sampling steps | 20, 30, 50 |
| `cfg_scale` | number \| null | Classifier-free guidance scale | 6.5, 7.5, 15 |
| `resolution` | string | Output resolution | "512x512", "768x512", "1024x1024" |
| `recommended_checkpoint` | string | Recommended model/checkpoint | "Realistic Vision", "DreamShaper", "PROTEUS" |
| `additional_settings` | object | Other settings as key-value pairs | `{"seed": 12345}` |

#### Flux

| Field | Type | Description | Example Values |
|-------|------|-------------|-----------------|
| `steps` | number \| null | Number of sampling steps | 20, 30, 50 |
| `guidance` | number \| null | Guidance scale | 3.5, 7.5 |
| `resolution` | string | Output resolution | "1024x1024", "1024x768" |
| `additional_settings` | object | Other settings | `{"seed": 12345}` |

---

## Usage Examples

### Example 1: Fashion Editorial Portrait

```json
{
  "blueprint_version": "1.0",
  "source_image": "https://example.com/fashion-portrait.jpg",
  "analyzed_at": "2026-04-13T14:30:00Z",
  "composition": {
    "framing": "medium close-up",
    "aspect_ratio": "3:2",
    "estimated_focal_length_mm": 85,
    "camera_angle": "eye-level",
    "camera_distance": "medium",
    "rule_of_thirds": true,
    "subject_placement": "right third",
    "depth_of_field": "shallow (f/1.2-f/2.8)",
    "estimated_aperture": "f/2.8",
    "foreground_elements": [],
    "background_elements": ["neutral beige wall, slightly out of focus"],
    "leading_lines": [],
    "symmetry": false,
    "negative_space": "neutral wall behind subject",
    "horizon_position": "not visible",
    "notes": "Classic editorial framing with shallow DOF for separation"
  }
}
```

---

## Notes for Analysts

- Use `null` for genuinely unknown values, not empty strings
- For array fields with no values, use `[]`
- All numeric estimates should be single best values with ranges noted in `notes` fields
- Descriptive fields should use specific terminology (e.g., "Cooke S4" not just "lens")
- Include uncertainty qualifiers where appropriate ("estimated," "appears to be")
- The schema is designed for both photography and 3D/illustration — mark "not applicable" for fields that don't apply

