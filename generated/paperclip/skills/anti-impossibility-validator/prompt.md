# Anti-Impossibility Validator

Validate generated images and videos against 5 core physical law constraints. Catch AI geometry errors before expensive regeneration — fast QA gating designed to run on Claude Haiku for minimal cost (~$0.01 per image).

## Purpose

This skill validates outputs from image and video generation pipelines (Higgsfield, Nano Banana, etc.) against a structured checklist of physics violations. Use to:

- Quality gate outputs before final delivery
- Identify specific constraint violations for targeted regeneration
- Recommend prompt fixes when validation fails
- Cost-optimize workflows (validate cheap → regen targeted → validate again)

## 5 Core Constraints

### 1. Grounding & Contact
**Rule:** All objects meant to be grounded (furniture, people standing, structures) must have visible, continuous contact with their supporting surface.

**Violations to catch:**
- Floating furniture (floor visible underneath)
- Levitating people (feet not touching ground)
- Hovering structures (disconnected from base)
- Gaps between object base and surface

**Validation question:** "Are all grounded objects touching their surface with full, continuous contact? Any floating or hovering elements?"

### 2. Structural Integrity
**Rule:** Load-bearing structures must have visible support. Objects must have complete, connected bases — not fragmented, transparent, or floating at contact points.

**Violations to catch:**
- Floating tops without visible base (chairs, tables)
- Unsupported cantilevers (worktops floating over nothing)
- Disconnected structure parts (floating roof sections, unsupported beams)
- Incomplete bases (object appears to have missing bottom)

**Validation question:** "Do all load-bearing structures have visible, believable support? Any floating edges or unsupported overhangs?"

### 3. Material Opacity
**Rule:** Solid opaque objects cannot have other objects visible through or beneath them. Surfaces cannot penetrate each other.

**Violations to catch:**
- Floor showing through solid cabinetry base
- Wall visible through furniture back
- Objects intersecting (one passing through another)
- Transparency where solid material should be

**Validation question:** "Are all solid objects truly opaque? Can I see other surfaces/objects through them? Any impossible intersections?"

### 4. Perspective Consistency
**Rule:** Vanishing points must be consistent throughout the frame. Parallel lines remain parallel or converge correctly. Depth cues align (shadows, overlap, scale).

**Violations to catch:**
- Inconsistent vanishing points (lines converging to different horizons)
- Impossible angles (parallel lines not parallel, converging incorrectly)
- Broken shadow direction (shadows falling inconsistently from light source)
- Distorted proportions (objects scale incorrectly with depth)

**Validation question:** "Are vanishing points and perspective lines consistent? Do shadows fall from a single light source? Any impossible angles or distorted proportions?"

### 5. Anatomical & Functional Correctness
**Rule:** Objects with standard forms (fixtures, furniture, anatomy) must match real-world specifications. Multi-part objects have all distinct parts (not fused or merged).

**Violations to catch:**
- Fused components (tap with 2 spouts rendered as 1)
- Missing parts (only 1 door handle visible when 2 expected)
- Merged anatomy (fingers fused together, limbs disconnected)
- Impossible configurations (door hinges at wrong angles, fixture mounts floating)

**Validation question:** "Do all multi-part objects have distinct, separate components? Any fused parts or missing expected elements? Are fixture/furniture configurations anatomically correct?"

## Validation Workflow

### Input

Provide one or both:
1. **Generated image file** (screenshot, render, or file path)
2. **Image blueprint JSON** (from image-reverse-engineer or similar analysis)

Optional:
- Prompt that was used to generate the image
- Expected scene type (kitchen, portrait, product, etc.)

### Output Format

```json
{
  "validation_status": "PASS" | "FAIL",
  "overall_score": 0.0 - 100.0,
  "constraints": {
    "grounding_contact": {
      "status": "PASS" | "FAIL",
      "score": 0-100,
      "violations": ["floor visible under cabinets on right side", ...],
      "evidence": "Kitchen unit on right side has visible gap with floor showing through",
      "severity": "critical" | "high" | "medium" | "low"
    },
    "structural_integrity": {
      "status": "PASS" | "FAIL",
      "score": 0-100,
      "violations": [...],
      "evidence": "...",
      "severity": "..."
    },
    "material_opacity": {
      "status": "PASS" | "FAIL",
      "score": 0-100,
      "violations": [...],
      "evidence": "...",
      "severity": "..."
    },
    "perspective_consistency": {
      "status": "PASS" | "FAIL",
      "score": 0-100,
      "violations": [...],
      "evidence": "...",
      "severity": "..."
    },
    "anatomical_correctness": {
      "status": "PASS" | "FAIL",
      "score": 0-100,
      "violations": [...],
      "evidence": "...",
      "severity": "..."
    }
  },
  "regen_recommendations": {
    "pass": "Image passes all constraints. Ready for delivery.",
    "fail": "Add these constraints to prompt before regenerating:\n- solid kitchen cabinetry grounded firmly on floor with continuous plinth/kickboard at base\n- opaque cabinet bases, no visible gap between cabinets and floor\n- floor surface stops at cabinet plinth and does not appear under or behind units"
  },
  "estimated_cost_to_fix": "$X (if regeneration needed)"
}
```

## Usage Patterns

### Pattern 1: Validate Generated Image
**Input:** Screenshot from Higgsfield generation
**Output:** Pass/fail with specific violations
**Use case:** QA gate before final delivery

**Example:**
```
User: I just generated a kitchen scene in Higgsfield. Here's the screenshot. Does it pass?
[screenshot attached]

Validator output:
✅ PASS (94/100)
- Grounding: ✅ PASS — cabinets sit flush on floor
- Structural: ✅ PASS — all supports visible
- Opacity: ✅ PASS — no see-through solids
- Perspective: ✅ PASS — consistent vanishing points
- Anatomy: ✅ PASS — all fixture parts distinct
```

### Pattern 2: Validate + Recommend Fixes
**Input:** Failed image + original prompt
**Output:** Specific violations + improved prompt additions
**Use case:** Cost-optimized regeneration

**Example:**
```
User: This generation has errors. What do I add to the prompt to fix it?
[failed image + original prompt]

Validator output:
❌ FAIL (62/100)
Critical violation: Grounding & Contact
- Floor visible under cabinet bases on right side

REGEN RECOMMENDATIONS:
Add to prompt:
"kitchen cabinetry with solid plinth/kick at base sitting flush against floor"
"no visible floor beneath or through cabinetry"
"solid joinery, grounded furniture"

Estimated regen cost: $2 (Seedream 5.0)
```

### Pattern 3: Batch Validation (Cost Analysis)
**Input:** 10 generated images
**Output:** Pass/fail breakdown + cost to fix all failures
**Use case:** Portfolio QA before campaign launch

**Example:**
```
User: Validate these 10 kitchen hero shots. What's the cost to fix failures?

Validator output:
Results: 7/10 PASS, 3/10 FAIL
Failures:
- kitchen-v1: Floating cabinets (grounding) → Regen cost $2
- kitchen-v3: Fused tap spouts (anatomy) → Regen cost $2
- kitchen-v7: Inconsistent perspective → Regen cost $2

Total fix cost: $6 (3 regens)
Recommendation: Regenerate v1, v3, v7 with added constraints
```

### Pattern 4: Architect Integration
**Input:** Image blueprint (JSON)
**Output:** Validation against constraints + feedback to architecture
**Use case:** Blueprint refinement before generation

**Example:**
```
User: Does this blueprint describe a physically possible scene?
[blueprint JSON with composition, lighting, subject, etc.]

Validator output:
✅ Blueprint is valid — describes physically possible composition
No impossibilities detected in:
- Object placement
- Material properties
- Structural support
- Perspective setup

Ready to generate.
```

## When to Use This Skill

✅ **Always use:**
- Before final delivery of generated images
- After large batch generations (10+ images)
- When experimenting with new prompts or models
- To cost-optimize regen workflows (validate → fix → regen → validate again)

✅ **Use for efficiency:**
- Fast QA gate (runs on Claude Haiku, ~$0.01 per image)
- Identifies specific violations (not just "this looks wrong")
- Recommends targeted prompt fixes (not blind regen)

❌ **Don't use:**
- As a substitute for human creative review (validation is physics-only)
- For aesthetic/compositional feedback (only physical law violations)
- On non-photorealistic content (constraints apply to realism-focused work)

## Integration with Other Skills

### With `nano-banana-realism-engine`
1. Generate 3-5 concept prompts
2. Create draft image with cheap model (Nano Banana 2.5)
3. Validate with this skill
4. If PASS → Upscale to premium model (Seedream)
5. If FAIL → Refine prompt + regen with anti-impossibility additions

### With `higgsfield-video`
1. Generate video scene
2. Validate against constraints
3. If floating or structural errors → Add constraints to scene template
4. Regenerate with constraints

### With `image-reverse-engineer`
1. Generate image
2. Run image-reverse-engineer to create blueprint
3. Run this validator on the blueprint
4. Use violations to improve future blueprints

## Cost Savings Example

**Without validator (blind regen):**
```
Generate: $2
Deliver (33% error rate, regen 3 times): $2 × 3 = $6
Total: $6 per final image
```

**With validator (smart regen):**
```
Generate draft: $0.50
Validate (Haiku): $0.01
If PASS → Upscale: $2 + Validate: $0.01 = $2.01
If FAIL → Fix prompt: Free + Regen: $0.50 + Validate: $0.01 = $0.51
Average (70% pass rate): ($2.01 × 0.7) + ($0.51 × 0.3) = $1.56
Total: $2.07 per final image
```

**Savings: 65% cost reduction**

## Guardrails

- This skill validates **physics and geometry only** — not aesthetics, composition, or creative direction
- Constraints assume **photorealistic imagery** — not applicable to illustration, cartoon, or stylized work
- Severity scoring is **physics-based** — cultural, historical, or domain-specific accuracy is outside scope
- All violations are **specific and actionable** — never generic ("looks wrong")

## Next Steps

1. **Use this skill to validate your generated images** before final delivery
2. **Log failures** to identify pattern errors in your prompts
3. **Track cost savings** (regen cost avoided vs. validation cost)
4. **Iterate on anti-impossibility constraints** based on real failures
5. **Build cost-optimized workflows** (draft → validate → upscale → validate)
