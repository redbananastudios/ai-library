# Cinema Studio - Professional 4K Cinematic Workflow

## Camera Bodies (6 Options)

| Body | Aesthetic | Sensor | Use Case |
|------|-----------|--------|----------|
| **ARRI Alexa 35** | Warm, soft highlights, film-like | Super 35 digital | Premium dramas, luxury brands, cinematic baseline |
| **RED V-Raptor** | Sharp, dynamic range, bold | 8K capable | High-octane action, sci-fi, technical mastery |
| **Sony Venice** | Clean, HDR-ready, neutral | Full-frame | documentaries, broadcast, tech products |
| **IMAX Film Camera** | Massive scale, epic scope | Large format film | Hero shots, brand films, awe-inspiring |
| **Panavision Millennium DXL2** | Anamorphic character, bokeh | Anamorphic-native | Prestige films, storytelling, character focus |
| **Arriflex 16SR** | Retro, warm, nostalgic | 16mm film stock | Vintage aesthetic, indie brands, heritage |

---

## Lens Options (11 Total)

### Spherical Lenses
- **ARRI Signature Prime** — premium spherical, minimal distortion, warm rendering
- **Cooke S4** — cinematic standard, warm color, natural bokeh
- **Canon K-35** — vintage cinema aesthetic, flare characteristics
- **Laowa Macro** — extreme close-up, creative distortion

### Anamorphic Lenses
- **Hawk V-Lite** — modern anamorphic, clean, widescreen bokeh
- **Panavision C-Series** — classic anamorphic, signature blue flare
- **Petzval** — artistic compression, dreamy character

### Creative/Specialty
- **Lensbaby** — selective focus, artistic tilt
- **Zeiss** — precision German optics
- Others — bespoke creative lenses

### Focal Length
- **Wide (18–35mm):** epic, landscape, environmental storytelling
- **Standard (35–50mm):** natural perspective, conversational
- **Telephoto (70–85mm):** intimate, compressed, subject isolation
- **Macro/Specialty:** product detail, creative distortion

---

## Cinema Studio Workflow

### Step 1: Navigate to Cinema Studio
```
Navigate to https://higgsfield.ai/cinema-studio
```
Confirm login (fast-path: if avatar visible, skip auth).

### Step 2: Select Camera Body
Click camera body selector. Choose one of 6 bodies based on aesthetic:
- **ARRI Alexa 35** for classic cinematic warmth
- **RED V-Raptor** for dynamic HDR action
- **Panavision** for anamorphic storytelling
- **IMAX** for epic scope
- **Sony Venice** for clean broadcast
- **Arriflex 16SR** for retro/vintage

### Step 3: Select Lens
Click lens picker. Choose from 11 lens options:
- Spherical for clean/natural look
- Anamorphic for character/flare
- Specialty for creative effects

### Step 4: Enter Scene Description
Use the Scene Template format:
```
Subject: [who/what in frame]
Action: [movement, expression, behavior]
Setting: [location, environment, lighting conditions]
Camera movement: [up to 3 stacked from 70+ presets]
Lighting: [key light, fill, rim, practicals]
Duration: [5s / 10s / 15s for single shot, up to 12s for multi-shot]
Mood: [emotional tone, color grade, atmosphere]
```

### Step 5: Configure Camera Movements
Select up to 3 camera movement presets to stack:
- **Dolly In / Out / Left / Right** — forward/backward or horizontal trucking
- **Pan Left / Right** — rotate camera horizontally
- **Tilt Up / Down** — rotate camera vertically
- **Crane Up** — upward motion
- **360 Orbit** — circle subject
- **Handheld / Steadicam** — motion quality
- **Whip Pan** — fast pan transition
- **Through Object** — camera passes through scenery
- **Zoom In / Out** — focal length change
- **Wiggle / Timelapse** — special effects

### Step 6: Configure Settings
- **Duration:** 5s, 10s, or 15s (12s for multi-shot with cuts)
- **Aspect ratio:** 21:9 (Cinema default), 16:9, 1:1, 9:16
- **Resolution:** 4K (16-bit cinema)
- **Multi-shot:** if 6 cuts desired, enable 6-shot mode (enter 6 prompts, one per cut)

### Step 7: Enter Full Cinematic Prompt
Build prompt using the Scene Template info:
```
[Subject + Action] in [Setting], [Lighting type], [Camera movement] with [Camera body] and [Lens type], [Mood], [Color grade], [Cinematic quality modifiers]
```

Example:
```
Entrepreneur sitting at desk, reviewing spreadsheet, soft golden morning light from window, dolly in + pan right, ARRI Alexa 35 with Cooke S4 50mm, warm cinematic, moody boardroom, sophisticated color grading, professional grade cinema
```

### Step 8: Enable Prompt Enhancement (Optional)
Toggle "Prompt Enhancement" to let Cinema Studio expand basic prompts into full cinematic detail.

### Step 9: Generate
Click **Generate**. Cinema Studio will:
1. Simulate the selected camera body and lens
2. Apply the configured camera movements
3. Render with cinematic lighting physics
4. Output in 4K/16-bit cinema format

Generation time: 30–90s depending on duration and camera complexity.

### Step 10: Download
Once rendered, click **Download** to save clip to Downloads folder.
Move to workspace: `mkdir -p ./higgsfield-videos/{project-name}` and rename to `{project}-cinema-scene-01.mov`

---

## Multi-Shot / 6-Cut Mode

Cinema Studio 3.0 supports generating up to 6 cuts/shots within a single 12–15 second clip.

### How to Use Multi-Shot
1. Enable "Multi-Shot Mode" (toggle in settings)
2. Set duration to 12s or 15s (required for multi-shot)
3. Enter 6 scene prompts, one per cut:
   - **Shot 1 (2–3s):** "Subject walks through door, ARRI Alexa 35, dolly in, warm light"
   - **Shot 2 (2–3s):** "Cut to close-up face, Cooke lens, pan left, subtle tilt"
   - **Shot 3 (2–3s):** "Wide shot of room, crane up, window light"
   - etc.
4. Cinema Studio will cut between scenes with smooth transitions
5. Character consistency maintained across all shots

**Advantage:** No stitching required — 6 different scenes in one 12s clip.

---

## Camera Movement Presets (70+)

### Standard Movements (18)
- Dolly In, Dolly Out, Dolly Left, Dolly Right
- Pan Left, Pan Right
- Tilt Up, Tilt Down
- Crane Up
- Zoom In, Zoom Out
- 360 Orbit
- Handheld, Steadicam, Crane
- Static (no movement)

### Advanced Movements (40+)
- **Whip Pan** — fast pan blur transition
- **Crash Zoom In** — snap zoom
- **YoYo Zoom** — zoom in and out
- **Through Object In / Out** — camera passes through scenery
- **Super Dolly Out** — extreme pullback
- **3D Rotation** — rotate camera on multiple axes
- **Arc Right / Arc Left** — curved camera path
- **Bullet Time** — slow-motion with camera rotation
- **Wiggle** — slight vibration/uncertainty
- **Timelapse** — fast-forwarded motion

### Specialty Movements (20+)
- **Glam Timelapse** — stylized fast-motion for beauty/luxury
- **Human Timelapse** — natural fast-motion for daily routines
- **Landscape Timelapse** — wide environmental changes
- Anamorphic lens flare effects
- Film grain effects
- Practical light variations

### Stacking Rule
You may stack up to **3 movements simultaneously**. Examples:
- Dolly In + Pan Right + Tilt Up = complex tracking shot
- Handheld + Through Object + Pan = documentary-style movement
- Crane Up + 360 Orbit + Zoom = complex establishing shot

---

## Lighting in Cinema Studio

Cinema Studio simulates real-world camera physics and light behavior:

### Key Light (Primary)
- **Golden hour side light:** warm, soft shadows, cinematic
- **Window light:** practical, directional, realistic
- **Practical lights:** lamps, screens, practicals in scene
- **Studio key:** soft box, broad source, professional

### Fill Light
- **Natural fill:** ambient environmental light bouncing back
- **Reflector fill:** modeled as secondary surface
- **Low fill:** high contrast, moody
- **High fill:** flat, editorial

### Rim / Back Light
- **Hair light:** edge-lit subjects, separation
- **Rim light:** subject backlit, silhouette potential
- **Kicker:** side back light for dimension

### Practical Lights (In-Scene)
- **Lamps, screens, practicals** — rendered with realistic falloff
- **Ambient light variations** — time of day shifts, practical color shifts

### Suggested Lighting Phrases
- "Golden hour side light, soft shadows"
- "Soft window light from left, natural fill"
- "High-key studio, soft box, flat lighting"
- "Moody practical lights only, high contrast"
- "Cinematic 3-point: key + fill + rim, warm tones"

---

## Output & Delivery

Cinema Studio produces:
- **Resolution:** 4K (UHD 3840×2160) or 21:9 cinema (aspect-preserved)
- **Bit depth:** 16-bit cinema grade
- **Format:** ProRes or DNxHD (professional format)
- **Frame rate:** 24fps (cinema standard) or 30fps (broadcast)

Download → move to workspace → ready for post-production color grading, sound design, etc.

---

## Example Scene: Cinema Studio Multi-Shot Cinematic

```
Project: Coffee Brand Hero Film

Scene 1 — Opening (3s)
- Subject: Hands opening coffee bag, close-up of beans
- Camera body: ARRI Alexa 35
- Lens: Cooke S4 50mm
- Movement: Dolly in + pan right
- Lighting: Warm practical light from coffee shop window
- Mood: Intimate, sensory, luxurious
- Prompt: "Hands open artisan coffee bag, close-up, warm golden light from window, ARRI Alexa 35 with Cooke S4 50mm, dolly in and pan right slowly, cinematic focus on beans, luxurious mood, coffee shop ambiance"

Scene 2 — Pour (3s)
- Subject: Coffee pouring into cup, foam rising
- Camera body: RED V-Raptor (sharp, dynamic)
- Lens: Macro (detail, creative)
- Movement: Through object (camera through steam)
- Lighting: Backlit steam, key light on cup
- Mood: Dynamic, sensory, high-contrast
- Prompt: "Coffee pouring into white cup, steam rising, backlit, RED V-Raptor with macro lens, camera through steam, high contrast key light, dramatic moment, 24fps cinema"

Scene 3 — Wide Shot (3s)
- Subject: Coffee shop interior, person holding finished cup
- Camera body: Panavision (anamorphic)
- Lens: Anamorphic hawk V-lite
- Movement: Crane up + 360 orbit
- Lighting: Practical shop lights, window light, warm tones
- Mood: Cinematic, storytelling, anamorphic flare
- Prompt: "Coffee shop interior, person holds steaming cup, warm ambient light, Panavision with Hawk V-lite anamorphic, crane up and orbit camera, anamorphic bokeh and flare, cinematic framing, sophisticated narrative mood"
```

Output: 12s multi-shot cinematic clip (3 professional cuts, zero stitching).
