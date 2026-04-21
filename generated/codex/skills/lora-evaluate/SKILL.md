---
name: lora-evaluate
description: Evaluate a trained LoRA by generating a test grid and scoring it for subject consistency, prompt fidelity, overfitting, and visual artefacts. Produces a pass/fail verdict with evidence.
---
# LoRA Evaluate

Generate a small, structured test grid from a freshly trained LoRA and score the results. This is the **fourth step** of the LoRA training pipeline. Its job is to catch the common failure modes — underfitting, overfitting, concept leakage, style bleed, artefacts — before the model gets versioned and promoted.

Stay fully generic: no project-specific prompts, no default styles, no assumptions about where images end up. The caller supplies the model path, the output path, and any evaluation overrides.

## Inputs

| Name                | Required | Description |
|---------------------|----------|-------------|
| `model_path`        | yes      | Absolute path to the `.safetensors` produced by `lora-train` |
| `run_metadata_path` | yes      | Absolute path to the `{model_name}.run.json` from `lora-train` |
| `output_path`       | yes      | Absolute folder where the test images and evaluation report will be written |
| `eval_prompts`      | no       | Array of prompts to test. If omitted, defaults are derived from `lora_class` + `subject` in the run metadata |
| `weights`           | no       | Array of LoRA weights to sweep. Default: `[0.5, 0.7, 0.9]` |
| `samples_per_cell`  | no       | Images per (prompt × weight) cell. Default: 2 |
| `thresholds`        | no       | Overrides for pass thresholds (see below) |

## Responsibilities

1. Build an evaluation prompt set (default or provided)
2. For every (prompt × weight × sample) combination, call the `generate-image` skill with the candidate LoRA applied
3. Save outputs into a flat grid under `output_path/grid/`
4. Score each image across four axes (see below)
5. Emit a structured report with a pass / review / fail verdict

## What This Skill Does NOT Do

- Does **not** train anything
- Does **not** promote the LoRA to `approved` — that's a separate, explicit step
- Does **not** delete or modify the model file
- Does **not** publish images anywhere

## Default Prompt Strategy (by class)

When no `eval_prompts` are supplied, derive prompts from the run metadata so the evaluation stays project-neutral. The prompts cover four intents:

1. **Identity** — does the subject come through at normal strength?
2. **Flexibility** — does the subject survive a new context/pose/setting?
3. **Style neutrality** — does the subject survive a very different style prompt?
4. **Negative control** — a prompt that does NOT mention the subject, to check for concept leakage.

| Class       | Identity                                | Flexibility                                   | Style Neutrality                              | Negative Control                    |
|-------------|-----------------------------------------|-----------------------------------------------|-----------------------------------------------|-------------------------------------|
| character   | `{trigger} {subject}, portrait`         | `{trigger} {subject}, walking in a forest`    | `{trigger} {subject}, oil painting`           | `a generic stock photo of a desk`   |
| product     | `{trigger} {subject} on a white background` | `{trigger} {subject} in a kitchen`        | `{trigger} {subject}, watercolour illustration` | `a generic photo of a houseplant` |
| style       | `{subject} in {trigger} style`          | `a coastal landscape in {trigger} style`      | `a stylised logo in {trigger} style`          | `a plain document page`             |
| pose        | `{trigger} pose, person`                | `{trigger} pose, person in a park`            | `{trigger} pose, anime illustration`          | `person sitting at a desk`          |
| environment | `{trigger} location`                    | `a person inside {trigger} location`          | `{trigger} location, watercolour`             | `a plain white room`                |

## Scoring Axes (0–1 per axis)

| Axis                | What It Measures                                                       |
|---------------------|------------------------------------------------------------------------|
| `consistency`       | Does the subject look like the same thing across the identity cells?   |
| `fidelity`          | Does the subject match the training data? (Compare to a reference caption from the training set.) |
| `overfitting`       | Inverse of memorisation. 1.0 = flexible, 0.0 = rigid. Detected by the flexibility and style-neutrality cells. |
| `artefacts`         | Inverse of visible artefacts (anatomical errors, smearing, colour bleed). 1.0 = clean. |

### Default Thresholds

```yaml
consistency: 0.7
fidelity: 0.7
overfitting: 0.6
artefacts: 0.75
```

### Pass Logic

- `pass` — all axes meet or exceed their threshold; negative-control images do NOT show the subject
- `review` — one axis is below threshold by <0.1, OR negative control shows mild leakage. Needs human judgement.
- `fail` — any axis is >0.1 below threshold, OR negative control clearly shows the subject

## Output

### Files

```
{output_path}/
  grid/
    p{prompt_idx}_w{weight}_{sample_idx}.png
  evaluation.json
  evaluation.md                        # human-readable summary
```

### Evaluation Report (`evaluation.json`)

```json
{
  "status": "pass" | "review" | "fail",
  "model_path": "<absolute path>",
  "evaluated_date": "2026-04-21T14:55:00Z",
  "prompts_used": [
    {"intent": "identity", "prompt": "…"},
    {"intent": "flexibility", "prompt": "…"},
    {"intent": "style_neutrality", "prompt": "…"},
    {"intent": "negative_control", "prompt": "…"}
  ],
  "weights_tested": [0.5, 0.7, 0.9],
  "samples_per_cell": 2,
  "scores": {
    "consistency": 0.82,
    "fidelity": 0.79,
    "overfitting": 0.71,
    "artefacts": 0.80
  },
  "thresholds": {
    "consistency": 0.7,
    "fidelity": 0.7,
    "overfitting": 0.6,
    "artefacts": 0.75
  },
  "recommended_weight": 0.7,
  "findings": [
    "Subject identity is strong at weights 0.5–0.7",
    "At weight 0.9 the model resists new styles — lower the default weight to 0.7",
    "Negative control clean — no concept leakage"
  ],
  "grid_dir": "<output_path>/grid"
}
```

### Return Value (to the caller)

```json
{
  "status": "pass" | "review" | "fail" | "error",
  "evaluation_path": "<output_path>/evaluation.json",
  "grid_dir": "<output_path>/grid",
  "recommended_weight": 0.7,
  "scores": { "consistency": 0.82, "fidelity": 0.79, "overfitting": 0.71, "artefacts": 0.80 },
  "error": null
}
```

## Safety Notes

- Never change the model file or its metadata. This skill is strictly read-only on the model.
- Never pass evaluation images to any third-party scoring service without the caller's explicit consent.
- If the `generate-image` skill is unavailable, return `status: "error"` — do not silently skip.
- The evaluation verdict is advisory. Final promotion to `approved` is a human decision.
