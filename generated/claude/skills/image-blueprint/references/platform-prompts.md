# Platform-Specific Prompt Engineering Guide

Each generative AI platform has unique syntax, conventions, and strengths. This guide provides platform-native prompt templates and rules for translating the image blueprint's technical analysis into effective generation prompts.

---

## Platform Overview

| Platform | Strength | Use Case | Syntax Style | Tone |
|----------|----------|----------|--------------|------|
| **Midjourney** | Aesthetic quality, style consistency | Fashion, product, illustration | Terse flags | Poetic, concise |
| **Flux** | Photorealism, technical detail | Photography, realism, cinematic | Descriptive prose | Verbose, specific |
| **Stable Diffusion** | Customization, controlnet, local control | Technical, experimental, control-heavy | Technical parameters | Structured, detailed |
| **Higgsfield** | Video generation, cinematic, camera control | Video, cinematic, motion | Narrative prose | Story-focused, directional |

---

## Midjourney Prompt Engineering

### Platform Characteristics
- **Strength**: Aesthetic consistency, style transfer, artistic quality
- **Weakness**: Technical precision, photorealism detail, camera control
- **Sweet Spot**: Stylized imagery, artistic direction, aesthetic reference
- **Limitation**: Less control over specific composition; prefers broad artistic direction

### Midjourney Prompt Template

```
[SUBJECT DESCRIPTION] in [SETTING]
| [CAMERA/LENS] | [LIGHTING] | [COLOR/MOOD] | [STYLE/MOOD WORDS]
--[VERSION] --style [STYLE] --aspect [RATIO] --stylize [50-150] --chaos [0-100]
```

### Syntax Rules

#### 1. Subject & Setting
- **Concise, evocative description** (2–5 words for subject)
- Include key adjectives upfront
- Avoid bullet points; use prose flow

**Examples:**
- ✅ "Young woman in sunlit bedroom"
- ✅ "Weathered wooden chair in stark white gallery"
- ❌ "Woman, long hair, sitting, wearing dress, in room"
- ❌ "Subject: female. Hair: curly. Location: interior."

#### 2. Camera & Lens (Optional but Recommended)
- Focal length for style implication
- Lens character if distinctive

**Examples:**
- "85mm Cooke lens" (implies soft character, shallow DOF)
- "24mm wide-angle" (environmental, contextual)
- "50mm prime" (natural perspective)
- "macro lens" (intimate detail)
- "telephoto compression" (background blur)

#### 3. Lighting Description
- **Use poetic descriptors**, not technical jargon
- Evoke mood through light quality
- Avoid "f-stops" or "Kelvin" values

**Examples:**
- ✅ "Golden hour sidelighting"
- ✅ "Soft window light, morning diffusion"
- ✅ "Dramatic rim lighting with crushed shadows"
- ❌ "f/2.8 aperture, 5500K color temperature"
- ❌ "3-point studio lighting setup"

#### 4. Color & Mood
- Hex colors sparingly (only if critical)
- Use emotional color language

**Examples:**
- ✅ "Warm peachy tones, cinematic color grade"
- ✅ "Cool blues with amber highlights"
- ✅ "Desaturated, melancholic mood"
- ❌ "#f5d5c0, #2b1810, #c9a876"
- ❌ "RGB values: 245, 213, 192"

#### 5. Style & Mood Words
- Place at end as "flavor"
- Use artistic/photographic references
- Stack short descriptors

**Examples:**
- "editorial, cinematic, timeless"
- "fine art, soft focus, nostalgic"
- "commercial, sharp, energetic"

#### 6. Midjourney Flags

| Flag | Values | Effect |
|------|--------|--------|
| `--v` | 6.1, 6.0, 5.3 | Model version (6.1 latest & best) |
| `--style` | raw, default | raw = less Midjourney stylization |
| `--aspect` | 16:9, 9:16, 1:1, 21:9, 3:2, 4:3 | Image aspect ratio |
| `--stylize` | 0–1000 (default 100) | MJ style strength (0=raw, 1000=heavy) |
| `--chaos` | 0–100 | Variation/surprise (0=consistent, 100=wild) |
| `--quality` | fast, standard, high | Processing quality |
| `--niji` | (flag alone) | Anime/illustration mode |

**Typical Flag Recommendations:**
- Standard photo/product: `--v 6.1 --style raw --stylize 50–75`
- Artistic/styled: `--v 6.1 --style default --stylize 75–150`
- Experimental: `--v 6.1 --chaos 50–100`

### Complete Midjourney Examples

**Example 1: Editorial Fashion Portrait**
```
Young woman in sunlit studio, warm ceramic vase beside her
| 85mm Cooke lens | Soft window light, golden hour
| Warm peachy tones, refined editorial mood
| cinematic, timeless, editorial
--v 6.1 --style raw --aspect 16:9 --stylize 75 --chaos 10
```

**Example 2: Product Photography**
```
Luxury leather handbag on marble table
| Symmetrical framing | Studio key light with fill reflector
| Warm neutrals, high-key elegance
| sharp, commercial, minimalist
--v 6.1 --style raw --aspect 1:1 --stylize 50 --chaos 0
```

**Example 3: Artistic Illustration**
```
Abstract forest landscape with layered mist
| Ethereal perspective | Diffused golden light filtering through trees
| Cool greens with warm amber accents, dreamlike
| painterly, ethereal, nostalgic
--v 6.1 --style default --aspect 3:2 --stylize 150 --chaos 50
```

---

## Flux Prompt Engineering

### Platform Characteristics
- **Strength**: Photorealism, technical accuracy, precise control
- **Weakness**: Artistic abstraction, illustration style
- **Sweet Spot**: Photography, realism, cinematic scenes with detail
- **Advantage**: Understands verbose, technical descriptions well

### Flux Prompt Template

```
[DETAILED SCENE DESCRIPTION WITH TECHNICAL ELEMENTS],
[LIGHTING DESCRIPTION WITH MOOD],
[COLOR PALETTE AND GRADING],
[TECHNICAL SPECIFICATIONS],
[MOOD/STYLE],
shot on [CAMERA/LENS]
```

### Syntax Rules

#### 1. Detailed Scene Description
- **Verbose, complete sentence structure** (unlike Midjourney's concise style)
- Paint the scene with words
- Include spatial relationships and scale

**Examples:**
- ✅ "A young woman with shoulder-length auburn hair wearing a cream linen shirt sits in a sunlit bedroom, morning light streaming through sheer curtains, casting soft shadows across her face and the rumpled white bedsheets"
- ❌ "Woman, sunlit room"

#### 2. Lighting with Technical Detail
- Describe light SOURCE, QUALITY, and MOOD
- Mention directional specifics
- Layer descriptive language

**Examples:**
- ✅ "Soft directional window light from upper left, creating gradual shadow transition on face, gentle rim light on hair, overall diffused and warm"
- ✅ "Hard directional sunlight, deep shadows, high contrast, dramatic side-lighting, backlighting on subject edges"
- ❌ "Good lighting"

#### 3. Color Palette & Grading
- Name color families
- Describe grading style
- Include emotional color context

**Examples:**
- ✅ "Warm color palette with peachy skin tones and golden highlights, subtle cool shadows, warm color grading similar to Kodak Portra film stock, lifted blacks for soft aesthetic"
- ✅ "Cool blue shadows with warm amber highlights, desaturated overall palette with high contrast blacks, cinematic color grading"
- ❌ "Pretty colors"

#### 4. Technical Specifications
- Camera body (implies aesthetic)
- Lens focal length and character
- Aperture for DOF suggestion
- Film stock or sensor quality

**Examples:**
- ✅ "shot on Canon 5D Mark IV with 85mm f/1.8 lens, f/2.8 aperture for shallow depth of field"
- ✅ "shot on Hasselblad 500C with Zeiss Planar 80mm lens, fine-grain medium format"
- ✅ "shot on RED V-Raptor with Cooke Anamorphic S4 50mm lens"

#### 5. Mood & Style Tags
- End with artistic tradition or photographic school
- Add texture/finish descriptors

**Examples:**
- "editorial fashion photography, refined, timeless"
- "fine art portrait, raw, documentary"
- "commercial product photography, sharp, minimal"

### Complete Flux Examples

**Example 1: Editorial Fashion Portrait**
```
Young woman with soft eyes and relaxed expression wearing a cream-colored linen shirt,
seated in a bright sunlit bedroom with white bedding. Soft directional window light
from upper left creates gentle shadows across her face and shoulders, with warm rim
light visible on her hair.

Warm peachy skin tones with golden highlights, subtle cool shadows, warm color
grading similar to Kodak Portra 400 film stock, lifted blacks for soft aesthetic,
moderate film grain visible.

Shot on Canon 5D Mark IV with 85mm f/1.8 lens at f/2.8 aperture, creating shallow
depth of field with creamy bokeh background. Professional editorial fashion photography,
timeless aesthetic, refined and intimate mood.
```

**Example 2: Cinematic Landscape**
```
Dramatic mountain landscape at golden hour with layered depth. Foreground shows
weathered rock formations, middle ground features dense evergreen forest, distant
mountains silhouetted against warm sky. Dynamic cloud formations with backlighting
creating luminous edges.

Hard directional sunlight from upper left, long shadows across terrain, dramatic
backlighting on distant mountains and clouds, high contrast overall scene, warm
golden light on foreground rocks.

Warm golden tones in lit areas, deep cool blue shadows, high saturation, cinematic
color grading with crushed blacks and bright highlights, slight warm-cool split tone.

Shot on RED V-Raptor with 24mm Zeiss Supreme Prime lens at f/8 for deep depth of
field. Cinematic landscape photography, dramatic, aspirational, timeless. 35mm
equivalent perspective, anamorphic mood.
```

---

## Stable Diffusion Prompt Engineering

### Platform Characteristics
- **Strength**: Technical control, customization, ControlNet integration
- **Weakness**: Consistent quality, style variation
- **Sweet Spot**: Technical precision, experimental work, specialized models
- **Advantage**: Parameter control (sampler, steps, CFG, seed)

### Stable Diffusion Prompt Template

```
[DETAILED DESCRIPTION], [CAMERA/LENS], [LIGHTING], [COLOR/GRADING],
[STYLE], [QUALITY TAGS], [NEGATIVE PROMPT]

Sampler: [DPM++ 2M Karras]
Steps: [20–50]
CFG Scale: [6–8]
Checkpoint: [recommended-model]
```

### Syntax Rules

#### 1. Main Prompt (Detailed Descriptive)
- Combine subject, setting, and technical elements
- Use adjectives liberally
- Include desired quality indicators

**Examples:**
- ✅ "A detailed portrait of a young woman with soft eyes, warm skin tones, sitting in natural window light, professional photography, award-winning, sharp focus, shallow depth of field, warm color grading, cinematic"
- ❌ "Woman sitting"

#### 2. Camera & Lens Specificity
- Name specific models when possible
- Include lens character indicators

**Examples:**
- "shot on Canon 5D Mark IV, 85mm f/1.8 lens"
- "shot on Sony A7R IV, Zeiss Otus 85mm"
- "shot on RED V-Raptor with Panavision C series"

#### 3. Lighting Descriptors
- **Technical + Poetic** combination works best
- Describe light quality

**Examples:**
- "soft window light with directional key, fill reflector, golden hour, warm light temperature"
- "studio lighting, three-point setup, key light from left, fill from right, rim light on back"
- "natural overcast diffused light, soft shadows, even illumination"

#### 4. Color & Grading
- Specific film stock references (if applicable)
- Grading style names

**Examples:**
- "warm color grading, Kodak Portra 400 aesthetic, lifted blacks"
- "cool moody tones, desaturated, cinematic, teal-orange color grade"
- "vibrant saturated colors, VSCO preset style"

#### 5. Style Tags
- Art movement, photographic tradition, illustrative style
- Quality descriptors

**Examples:**
- "editorial fashion photography, fine art, timeless"
- "commercial product photography, sharp, minimal, professional"
- "digital illustration, concept art, painterly"

#### 6. Quality Tags (Critical for SD)
These heavily influence output quality:

**Professional Quality Tags:**
- "professional," "award-winning," "masterpiece," "detailed," "intricate"
- "high quality," "high definition," "8k," "4k"
- "sharp focus," "in focus," "crisp"
- "bokeh," "depth of field," "professional lighting"

**Aesthetic Tags:**
- "cinematic," "moody," "atmospheric," "ethereal"
- "timeless," "editorial," "fine art"
- "magazine cover," "studio quality"

**Negative Prompt (What NOT to generate):**
```
blurry, low quality, distorted, poorly lit, bad anatomy, extra limbs,
missing fingers, oversaturated, out of focus, dull, amateur
```

### Generation Settings

| Parameter | Recommended | Effect |
|-----------|------------|--------|
| **Sampler** | DPM++ 2M Karras | Fast, quality consistent |
| **Steps** | 30–50 | 30=fast, 50=quality |
| **CFG Scale** | 6–8 | 7=balanced |
| **Checkpoint** | Model-dependent | Major quality factor |

### Popular Checkpoints

| Checkpoint | Best For | Character |
|-----------|----------|-----------|
| **Realistic Vision** | Photorealism, portraits | Sharp, detailed, realistic |
| **DreamShaper** | Balanced realism | Versatile, clean quality |
| **PROTEUS** | Fine art, painterly | Artistic, detailed, atmospheric |
| **Juggernaut** | Cinematic, dramatic | Cinematic lighting, moody |
| **Epicrealism** | Hyper-realism | Maximum detail, realism |

### Complete Stable Diffusion Examples

**Example 1: Editorial Portrait**
```
Prompt:
A detailed portrait of a young woman with warm skin tones and soft eyes,
wearing a cream linen shirt, seated in warm sunlit studio with soft window light,
professional editorial fashion photography, award-winning, sharp focus,
shallow depth of field, warm color grading similar to Kodak Portra 400,
fine art portrait, timeless, cinematic, intricate detail, 8k resolution

Negative:
blurry, low quality, out of focus, oversaturated, bad anatomy, distorted,
amateur lighting, harsh shadows, overprocessed

Settings:
Sampler: DPM++ 2M Karras
Steps: 40
CFG: 7
Checkpoint: Realistic Vision
```

**Example 2: Product Photography**
```
Prompt:
A luxury leather handbag on white marble table, symmetric composition,
studio lighting with key light and fill reflector, high-key professional product photography,
sharp focus, intricate leather texture detail, warm neutral color grading,
studio quality, award-winning, commercial product photography, 4k resolution,
professional lighting, crisp, detailed

Negative:
blurry, soft focus, shadows, low quality, amateur, harsh lighting,
out of focus, distorted proportions, cluttered background

Settings:
Sampler: DPM++ 2M Karras
Steps: 50
CFG: 7.5
Checkpoint: DreamShaper
```

---

## Higgsfield Prompt Engineering

### Platform Characteristics
- **Strength**: Video generation, cinematic quality, camera control
- **Weakness**: Static images (though supports image generation too)
- **Sweet Spot**: Cinematic video, motion, multi-scene composition
- **Unique**: Camera movement presets, lighting simulation, multi-shot generation

### Higgsfield Prompt Template (Video)

```
[SUBJECT ACTION/DESCRIPTION], positioned [POSITION/CAMERA DIRECTION],
in [SETTING AND ATMOSPHERE],
with [LIGHTING AND MOOD DESCRIPTION],
shot on [CAMERA BODY] + [LENS] with [MOVEMENT PRESET],
[TONE/BRAND DIRECTION]
```

### Syntax Rules (Video)

#### 1. Subject & Action (Present Tense)
- Use active verbs; describe what's happening
- Include spatial positioning

**Examples:**
- ✅ "Young woman lifts ceramic cup to lips, looking toward camera with soft smile"
- ✅ "Coffee pouring into white cup, steam rising, backlit by warm light"
- ❌ "Woman in cup"

#### 2. Setting & Atmosphere
- Describe environment with mood
- Include textures and context

**Examples:**
- ✅ "Sunlit minimalist cafe with marble tabletop, soft natural light, warm ambient mood"
- ✅ "Luxury hotel room with floor-to-ceiling windows, city skyline visible, evening light"
- ❌ "Indoor scene"

#### 3. Lighting & Color
- **Narrative, not technical**: evoke mood
- Reference time of day or light quality

**Examples:**
- ✅ "Golden hour sidelighting creating warm amber tones, soft shadows, cinematically lit"
- ✅ "Dramatic backlit steam with rim light, high contrast, cinematic"
- ❌ "f/2.8 aperture, 5500K Kelvin"

#### 4. Camera & Movement
- Specify camera body for aesthetic implication
- Name movement preset from Higgsfield options

**Examples:**
- ✅ "shot on ARRI Alexa 35 + Cooke S4 50mm with dolly in + slight pan right"
- ✅ "shot on RED V-Raptor + macro lens with zoom in + handheld slight wiggle"
- ❌ "standard camera movement"

#### 5. Tone & Brand Direction
- One-line creative direction
- Emotional intent for scene

**Examples:**
- "Warm, intimate, luxury brand aesthetic"
- "Cinematic, aspirational, premium product showcase"
- "Documentary, authentic, human moment"

### Higgsfield Model Selection Decision Tree

```
Is this a luxury brand / premium commercial?
  ├─ YES → Cinema Studio (4K ARRI/RED/IMAX simulation)
  └─ NO → Next question

Is this social content / TikTok/Reels format?
  ├─ YES → Kling 3.0 (fast, native 9:16)
  └─ NO → Next question

Is this a talking head / testimonial / avatar?
  ├─ YES → UGC Builder (native lip-sync, avatar control)
  └─ NO → Next question

Need consistent characters across multiple clips?
  ├─ YES → Seedance 2.0 (multi-input consistency)
  └─ NO → Default to Kling 3.0 or Seedance 2.0
```

### Higgsfield Camera Movement Presets

**Common Presets for Image Reference:**
- **Dolly In**: Camera moves forward toward subject
- **Dolly Out**: Camera pulls back from subject
- **Pan Right/Left**: Horizontal sweep
- **Tilt Up/Down**: Vertical sweep
- **Orbit**: Camera circles subject
- **Zoom In/Out**: Digital zoom effect
- **Through Object**: Camera moves through space or object
- **Handheld Wiggle**: Subtle natural camera shake
- **Crane Up/Down**: Vertical rise or fall (cinematic lift)

### Cinema Studio Specific Elements

If using Cinema Studio workflow:
- **Camera Body**: ARRI Alexa 35 (warm), RED V-Raptor (sharp), Sony Venice, IMAX, Panavision, Arriflex 16SR
- **Lens**: Cooke S4 (character), Zeiss Spherical (sharp), Anamorphic (flare/oval bokeh), Macro
- **Lighting Simulation**: Describe 3-point or other setup
- **Multi-Shot**: Can generate 6 cuts in 12–15s clip (describe transitions)

### Complete Higgsfield Examples

**Example 1: Luxury Coffee Brand Film (Cinema Studio)**
```
Artisan coffee beans cascading into white ceramic cup, positioned front-center,
in minimalist bright studio with marble surface and soft north-window diffusion,
with golden hour sidelighting creating warm amber tones on cup and beans,
shot on ARRI Alexa 35 + Cooke S4 50mm with dolly in + pan right,
Warm, intimate, premium artisanal brand aesthetic, slow cinematic motion, luxury focus.
```

**Example 2: Social UGC (Kling 3.0)**
```
Young woman speaking directly to camera with confident expression and hand gestures,
wearing cream linen shirt, positioned medium close-up,
in bright natural light sunlit backdrop with soft bokeh greenery,
with warm golden hour light creating glowing skin tones and rim light,
shot with natural camera movement (slight forward motion),
Energetic, authentic, relatable UGC testimonial, 9:16 portrait format, social media optimized.
```

**Example 3: Multi-Scene Storyboard (Seedance 2.0)**
```
Scene 1 - Close-up of hands holding coffee cup in morning light
Scene 2 - Wide shot of person enjoying coffee at café table overlooking city
Scene 3 - Detail of coffee pour, steam rising, dramatic backlighting

Consistent warm color grading and morning light throughout,
shot with smooth cinematic camera movements (orbit, slight pull back),
Warm, aspirational, premium coffee lifestyle aesthetic, consistent across all scenes.
```

---

## Platform Comparison Cheat Sheet

| Aspect | Midjourney | Flux | Stable Diffusion | Higgsfield |
|--------|-----------|------|-----------------|-----------|
| **Style** | Concise, poetic | Verbose, detailed | Technical + descriptive | Narrative, directional |
| **Length** | 50–100 words ideal | 150–300 words ideal | 100–200 words ideal | 100–150 words ideal |
| **Best For** | Aesthetics, artistry | Realism, photography | Control, customization | Video, motion, cinematic |
| **Camera Terms** | Poetic (e.g., "85mm Cooke") | Technical (e.g., "shot on Canon 5D") | Both combined | Movement presets, body names |
| **Color Descriptions** | Mood language | Technical + mood | Technical + adjectives | Lighting narrative |
| **Best Output** | Stylized, artistic | Photorealistic | Variable (checkpoint-dependent) | Cinematic video |
| **Control Level** | Flags/parameters | Text description | Parameters + negative | Presets + settings |

---

## Common Prompt Mistakes Across Platforms

| Mistake | Problem | Fix |
|---------|---------|-----|
| **Mixing Platform Syntax** | Using Midjourney flags in Flux | Match syntax to platform; no cross-platform flags |
| **Over-Technical Language** | "f/2.8 aperture, 5500K Kelvin" in MJ | Use poetic equivalents; MJ prefers mood language |
| **Vague Descriptions** | "nice lighting" instead of specific | Name light source, direction, quality, mood |
| **Too Much Information** | 500-word SD prompt; loses focus | Balance detail with clarity; prioritize key elements |
| **Conflicting Directions** | "sharp and soft" without context | Clarify: "sharp focus with soft background bokeh" |
| **Missing Key Details** | Forgetting lens/camera entirely | Name camera + lens for aesthetic implication |
| **Inconsistent Capitalization** | Random caps mid-prompt | Maintain consistent style (lowercase preferred) |
| **Overuse of Negative Prompt** | 50+ negative terms | Keep to 10–15 essential exclusions |

---

## Iterative Refinement Process

1. **Generate with Initial Prompt** → Evaluate output
2. **Identify What's Wrong** → Subject? Lighting? Composition? Color?
3. **Adjust Specific Section** → Only change problematic area
4. **Re-generate** → Compare to original
5. **Iterate** until satisfied

Example refinement cycle:
- V1: "Portrait of woman, soft light" → Too generic
- V2: Added "85mm lens, golden hour, warm color grading" → Better, but lighting too subtle
- V3: Changed to "dramatic golden hour rim lighting, soft key from left" → Closer
- V4: Added color specifics "peachy skin tones, warm grading" → Final version approved

