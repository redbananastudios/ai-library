# ControlNet Guide for Image Reproduction

ControlNet is a powerful conditioning mechanism for generative AI models that allows precise spatial control over generation. This guide helps you determine which ControlNet maps to use based on image type, composition, and reproduction goals.

---

## ControlNet Maps Overview

| Map | Purpose | Use When | Strength Range | Best Models |
|-----|---------|----------|-----------------|-------------|
| **Depth** | Preserves 3D spatial relationships (foreground/middle/background) | Composition has clear depth layers; spatial accuracy critical | 0.3–0.8 | SD 1.5, SDXL, most checkpoints |
| **Canny Edge** | Preserves edge definition and linework | Strong linear/graphic elements; sharp edge detail important | 0.3–0.7 | SD 1.5, SDXL, illustration-heavy images |
| **Pose** | Controls human figure position and body language | Human subjects; figure pose is central to composition | 0.4–0.9 | SD 1.5, SDXL, portrait/figure work |
| **Lineart** | Extracts and preserves line structure | Graphic/artistic style; comic/illustration aesthetic | 0.2–0.6 | SD 1.5, SDXL, illustration models |
| **IP-Adapter** | Style transfer via image prompt (image-to-image guidance) | Aesthetic/style is critical; iterating variations on same style | 0.5–0.9 | SDXL, newer models with IP-Adapter support |
| **OpenPose** | More granular human pose (skeletal keypoints) | Fine-grained pose control; multiple figures; specific gesture | 0.5–0.9 | SD 1.5, SDXL |
| **Inpaint** | Mask-based region-specific generation | Replacing parts of image; local adjustments | Variable | Context-dependent |

---

## Decision Matrix by Image Type

### Portrait (Single Human Subject)

**Use Combination:** Pose + Depth + IP-Adapter (optional)

- **Primary: Pose**
  - Strength: 0.7–0.9
  - Reason: Body language and expression are central
  - Notes: Extract pose before conditioning; includes hand/arm/head orientation

- **Secondary: Depth**
  - Strength: 0.4–0.6
  - Reason: Maintain camera distance and background separation
  - Notes: Less critical than pose; optional if background is non-essential

- **Tertiary: IP-Adapter (optional)**
  - Strength: 0.5–0.7
  - Reason: Preserve aesthetic/mood if iterating variations
  - Notes: Use if visual style is primary goal; can conflict with pose if overweighted

**Example Pipeline:**
```
Pose (0.8) + Depth (0.5) + Text Prompt
→ Maintains figure position + spatial separation + artistic direction
```

---

### Product/Object Photography

**Use Combination:** Depth + Canny Edge + IP-Adapter (optional)

- **Primary: Depth**
  - Strength: 0.6–0.8
  - Reason: Product shape, volume, and spatial positioning critical
  - Notes: Extract depth from high-contrast or multi-angle product shots

- **Secondary: Canny Edge**
  - Strength: 0.4–0.6
  - Reason: Product boundary and detail definition
  - Notes: Useful for angular/geometric products; less for organic shapes

- **Tertiary: IP-Adapter (optional)**
  - Strength: 0.5–0.7
  - Reason: Preserve product-specific color/branding if critical
  - Notes: Use if product color/finish is trademark element

**Example Pipeline:**
```
Depth (0.7) + Canny Edge (0.5) + IP-Adapter (0.6)
→ Maintains product form + edges + brand color consistency
```

---

### Landscape/Architectural

**Use Combination:** Depth + Canny Edge + IP-Adapter (optional)

- **Primary: Depth**
  - Strength: 0.7–0.9
  - Reason: Foreground/middle/background relationship essential
  - Notes: Landscape requires strong depth layering for cinematic feel

- **Secondary: Canny Edge**
  - Strength: 0.4–0.6
  - Reason: Preserve architectural lines or horizon definition
  - Notes: Stronger for structured environments; weaker for organic nature

- **Tertiary: IP-Adapter (optional)**
  - Strength: 0.5–0.7
  - Reason: Preserve light/color mood (golden hour, blue hour, etc.)
  - Notes: Critical if time-of-day lighting is signature element

**Example Pipeline:**
```
Depth (0.8) + Canny Edge (0.4) + IP-Adapter (0.6)
→ Maintains spatial depth + architectural clarity + light mood
```

---

### Fashion/Clothing on Figure

**Use Combination:** Pose + IP-Adapter + Canny Edge (optional)

- **Primary: Pose**
  - Strength: 0.8–0.95
  - Reason: Garment silhouette, fit, and figure positioning
  - Notes: High strength to maintain clothing drape and body position

- **Secondary: IP-Adapter**
  - Strength: 0.7–0.9
  - Reason: Preserve fabric texture, color, pattern
  - Notes: Critical for branded/specific garments

- **Tertiary: Canny Edge (optional)**
  - Strength: 0.3–0.5
  - Reason: Garment boundary definition
  - Notes: Lower strength to avoid over-constraining fabric appearance

**Example Pipeline:**
```
Pose (0.85) + IP-Adapter (0.8) + Canny Edge (0.3)
→ Maintains silhouette + fabric identity + garment edges
```

---

### Illustration/Artwork

**Use Combination:** Lineart + Canny Edge + IP-Adapter

- **Primary: Lineart**
  - Strength: 0.5–0.8
  - Reason: Preserve artistic line style and composition
  - Notes: Essential for hand-drawn or vector aesthetics

- **Secondary: Canny Edge**
  - Strength: 0.4–0.7
  - Reason: Enhance graphic clarity and line definition
  - Notes: Works synergistically with lineart for consistent style

- **Tertiary: IP-Adapter**
  - Strength: 0.6–0.8
  - Reason: Preserve artistic style, color palette, mood
  - Notes: High strength for consistent art direction

**Example Pipeline:**
```
Lineart (0.7) + Canny Edge (0.5) + IP-Adapter (0.75)
→ Maintains artistic style + line quality + aesthetic consistency
```

---

### Group Photo/Multiple Figures

**Use Combination:** Pose + Depth + IP-Adapter

- **Primary: Pose**
  - Strength: 0.8–0.9
  - Reason: Figure positioning and group composition
  - Notes: Slightly lower than single portrait to allow variation

- **Secondary: Depth**
  - Strength: 0.5–0.7
  - Reason: Maintain spatial relationships between figures
  - Notes: Important for depth layering (foreground/background placement)

- **Tertiary: IP-Adapter**
  - Strength: 0.5–0.7
  - Reason: Consistent mood/lighting across all figures
  - Notes: Helpful for group consistency

**Example Pipeline:**
```
Pose (0.85) + Depth (0.6) + IP-Adapter (0.6)
→ Maintains figure layout + spatial depth + consistent mood
```

---

### Cinematic/Environmental Scene

**Use Combination:** Depth + IP-Adapter + Canny Edge (optional)

- **Primary: Depth**
  - Strength: 0.8–1.0
  - Reason: Scene scale and depth crucial for cinematic feel
  - Notes: High strength for layered depth (extreme foreground to distant background)

- **Secondary: IP-Adapter**
  - Strength: 0.6–0.8
  - Reason: Preserve lighting mood, color grade, cinematography
  - Notes: High strength for consistent visual tone

- **Tertiary: Canny Edge (optional)**
  - Strength: 0.2–0.4
  - Reason: Subtle edge preservation for composition clarity
  - Notes: Very low strength; mostly for subtle structural guidance

**Example Pipeline:**
```
Depth (0.9) + IP-Adapter (0.75) + Canny Edge (0.3)
→ Maintains cinematic depth + mood/grading + composition clarity
```

---

## Strength Guidelines

### Strength Ranges Explained

| Range | Effect | Use Case |
|-------|--------|----------|
| **0.2–0.4 (Subtle)** | Gentle guidance; allows model freedom | When composition/style is starting point, not requirement |
| **0.4–0.6 (Moderate)** | Clear conditioning; model respects structure | Standard use; balances control with creative variation |
| **0.6–0.8 (Strong)** | Tight adherence to map; minimal deviation | When accuracy to original is critical |
| **0.8–1.0 (Very Strong)** | Maximum control; minimal model interpretation | When exact reproduction of spatial/pose elements required |

### When to Use Each Range

- **0.2–0.4**: Mood/aesthetic reference; iterating variations; starting point from existing image
- **0.4–0.6**: Standard reproduction; balancing fidelity with creative interpretation
- **0.6–0.8**: Technical accuracy required; spatial/pose precision important
- **0.8–1.0**: Maximum fidelity; exact pose/depth reproduction necessary; limited variation desired

---

## ControlNet Extraction Workflow

### Step 1: Identify Image Type
Determine primary category (portrait, landscape, product, etc.) from blueprint's `subject_details` and `composition`.

### Step 2: Select Primary Map
Choose primary map from decision matrix based on image type and what aspect is most critical to preserve.

### Step 3: Consider Secondary Maps
Secondary maps add refinement but may increase computation and complexity. Evaluate trade-offs.

### Step 4: Determine Strengths
Assign strength values based on:
- How critical is accurate reproduction?
- How much creative variation is desired?
- Are there conflicting visual elements (e.g., pose vs. depth)?

### Step 5: Test Pipeline
Start with recommended pipeline. If results don't match original:
- Increase primary map strength (accuracy)
- Add secondary map if missing key element
- Lower strength on secondary if over-constraining variation

### Step 6: Iterate and Refine
ControlNet is iterative. Test, evaluate, adjust strengths, test again.

---

## Pipeline Combinations and Interactions

### Synergistic Combinations (Work Well Together)

| Pipeline | Reason | Strength Allocation |
|----------|--------|-------------------|
| **Depth + IP-Adapter** | Spatial structure + aesthetic consistency | Depth 0.6–0.8, IP 0.6–0.8 |
| **Pose + IP-Adapter** | Figure position + style preservation | Pose 0.7–0.85, IP 0.6–0.75 |
| **Canny + Lineart** | Edge definition + artistic line | Canny 0.4–0.6, Lineart 0.5–0.7 |
| **Depth + Canny** | Spatial depth + edge clarity | Depth 0.6–0.7, Canny 0.4–0.5 |

### Conflicting Combinations (Use Carefully)

| Pipeline | Conflict | Resolution |
|----------|----------|-----------|
| **Pose + Depth (High)** | Pose may want different camera angle than depth suggests | Lower one (usually depth 0.4–0.5) |
| **IP-Adapter (High) + Lineart (High)** | Style transfer may override line structure | Balance: IP 0.6, Lineart 0.5 |
| **Canny + Lineart (Both High)** | Over-emphasis on edges; may look mechanical | Use one or low both: Canny 0.3, Lineart 0.5 |
| **Multiple Maps (All High)** | Over-constraining; model produces less variation | Use 2 maps max at high strength; third at 0.3–0.4 |

---

## Recommended Pipelines by Common Goals

### Goal: Exact Visual Reproduction
```
Primary Map (0.7–0.9) + IP-Adapter (0.7–0.8)
Example: Depth (0.8) + IP-Adapter (0.75)
Rationale: Spatial accuracy + aesthetic preservation
```

### Goal: Pose/Figure Recreation (Portrait/Fashion)
```
Pose (0.75–0.9) + IP-Adapter (0.6–0.75)
Optional: + Canny Edge (0.3–0.4)
Rationale: Figure position + style + subtle edge clarity
```

### Goal: Scene/Composition Recreation (Landscape/Cinematic)
```
Depth (0.75–0.9) + IP-Adapter (0.6–0.75)
Optional: + Canny Edge (0.3–0.4)
Rationale: Spatial depth + mood/lighting + subtle structure
```

### Goal: Style/Aesthetic Iteration (Variations)
```
IP-Adapter (0.7–0.8)
Optional: + Depth (0.4–0.5) [for spatial guidance]
Rationale: Style transfer with light spatial guidance
```

### Goal: Artistic/Linework Preservation (Illustration)
```
Lineart (0.5–0.8) + Canny Edge (0.4–0.6) + IP-Adapter (0.6–0.75)
Rationale: Artistic lines + edge clarity + aesthetic consistency
```

---

## ControlNet + Platform Recommendations

### Stable Diffusion + ControlNet
- **Best Support**: SDXL (supports multiple maps simultaneously)
- **Typical Pipeline**: 2–3 maps at moderate strengths
- **Example**: `Depth (0.6) + IP-Adapter (0.7) + Text Prompt`
- **Limitations**: Some older checkpoints don't support all maps

### Flux + ControlNet
- **Support Level**: Limited (newer maps still rolling out)
- **Recommended**: Depth + IP-Adapter (most stable)
- **Strength Guidance**: Generally 0.5–0.7 for stability
- **Note**: Check Flux docs for current supported maps

### ComfyUI ControlNet Workflow
- **Advantage**: Visual node-based ControlNet stacking
- **Typical Setup**: Extract → Condition → Generate → Composite
- **Strength Control**: Per-node strength adjustment (fine-grained)
- **Best For**: Experimentation and testing multiple pipelines

---

## Troubleshooting ControlNet

| Issue | Cause | Solution |
|-------|-------|----------|
| **Output ignores ControlNet** | Strength too low or map incompatible with checkpoint | Increase strength to 0.6–0.8; verify checkpoint supports map |
| **Output too similar to map (over-constrained)** | Strength too high; multiple conflicting maps | Lower primary to 0.5–0.6; remove secondary map |
| **Artifacts or visual glitches** | Incompatible map + checkpoint combination | Switch to different map; test on known-good checkpoint |
| **Pose looks wrong** | Poor pose extraction or wrong pose keypoints | Re-extract pose from clearer source; try OpenPose instead |
| **Colors washed out or wrong** | IP-Adapter too strong or conflicting lighting guidance | Lower IP-Adapter to 0.5; combine with low-strength depth instead |
| **Depth doesn't preserve composition** | Map extracted from wrong perspective or low quality | Use high-quality depth map; extract from similar viewpoint |

---

## Quick Reference Chart

### By Image Type

```
PORTRAIT
├─ Pose (0.75–0.9) [primary]
├─ Depth (0.4–0.6) [optional]
└─ IP-Adapter (0.5–0.7) [optional]

PRODUCT
├─ Depth (0.6–0.8) [primary]
├─ Canny Edge (0.4–0.6) [optional]
└─ IP-Adapter (0.5–0.7) [optional]

LANDSCAPE/ARCHITECTURE
├─ Depth (0.7–0.9) [primary]
├─ Canny Edge (0.4–0.6) [optional]
└─ IP-Adapter (0.5–0.7) [optional]

FASHION/CLOTHING
├─ Pose (0.8–0.95) [primary]
├─ IP-Adapter (0.7–0.9) [secondary]
└─ Canny Edge (0.3–0.5) [optional]

ILLUSTRATION/ARTWORK
├─ Lineart (0.5–0.8) [primary]
├─ Canny Edge (0.4–0.7) [secondary]
└─ IP-Adapter (0.6–0.8) [secondary]

CINEMATIC/SCENE
├─ Depth (0.8–1.0) [primary]
├─ IP-Adapter (0.6–0.8) [secondary]
└─ Canny Edge (0.2–0.4) [optional]
```

