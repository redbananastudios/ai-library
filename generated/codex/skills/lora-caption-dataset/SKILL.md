---
name: lora-caption-dataset
description: Generate or validate captions for a LoRA training dataset. Enforces trigger-token usage and a consistent caption format so downstream training is reproducible.
---
# LoRA Caption Dataset

Produce or normalise `.txt` captions alongside every image in the dataset, with a guaranteed **trigger token** in a consistent position and a **consistent format**. This is the **second step** of the LoRA training pipeline.

Stay fully generic: no project-specific vocabulary, no assumed captioner. The caller chooses the captioner and supplies any API keys.

## Inputs

| Name             | Required | Description |
|------------------|----------|-------------|
| `dataset_path`   | yes      | Absolute path to the folder containing training images |
| `model_name`     | yes      | Base name of the LoRA being trained; used to derive `trigger_token` if one is not supplied |
| `trigger_token`  | no       | Unique token that must appear in every caption (e.g. `rbsWillowTap`). Should be ≥5 chars and rare in the base model's training data. If omitted, derived from `model_name` (see below). |
| `lora_class`     | yes      | `character` \| `product` \| `style` \| `pose` \| `environment` — informs caption template |
| `subject`        | yes      | Free-text description of the concept; seeds auto-captions with accurate subject words |
| `captioner`      | no       | `blip2` \| `florence-2` \| `llava` \| `manual` \| `keep-existing` — default `florence-2` |
| `style`          | no       | `verbose` (natural sentences) or `tags` (comma-separated) — default `verbose` |
| `overwrite`      | no       | Overwrite existing `.txt` captions. Default: false (existing captions are validated and normalised, not replaced) |

## Responsibilities

1. For every image in `dataset_path`, ensure a matching `<image-basename>.txt` exists
2. If a caption is missing or `overwrite: true`, generate one using the selected captioner
3. Enforce the trigger token in every caption (inserted at the start if missing)
4. Apply the class-specific template so captions are uniform
5. Strip leaked identifiers (model names, watermarks, "photo of") and other noise
6. Emit a summary report

## What This Skill Does NOT Do

- Does **not** revalidate dataset quality — assumes `lora-prepare-dataset` has passed
- Does **not** run training — that's `lora-train`
- Does **not** send images to third-party APIs without the caller supplying credentials
- Does **not** alter images, only captions

## Trigger Token Derivation

If `trigger_token` is not supplied, derive it from `model_name`:

1. Split on `-` / `_` / whitespace
2. Camel-case each segment (first char uppercase, rest lowercase)
3. Prefix with the literal namespace `lora`
4. Strip any non-alphanumeric characters

Examples:

| `model_name`      | Derived `trigger_token` |
|-------------------|-------------------------|
| `willow-taps`     | `loraWillowTaps`        |
| `bex_avatar_v1`   | `loraBexAvatarV1`       |
| `brand style 2`   | `loraBrandStyle2`       |

The derivation is deterministic so the same `model_name` always yields the same token, which matters because `lora-train` and any downstream generation must use the identical token.

## Captioner Options

| Captioner       | Where It Runs          | Notes |
|-----------------|-----------------------|-------|
| `blip2`         | local or hosted       | Fast, conservative. Decent for objects. |
| `florence-2`    | local or hosted       | Better for complex scenes; default. |
| `llava`         | local or hosted       | Best quality, slowest. |
| `manual`        | —                     | Skill only validates captions the user has written. |
| `keep-existing` | —                     | Only normalises existing captions (format + trigger token). |

Credentials / endpoints are supplied via the environment by the invoker. This skill specifies *what the captioner needs*, not *where to find it*.

## Caption Templates by Class

Apply these templates. `{trigger}` is the `trigger_token`. `{caption}` is the auto-generated or user-written description.

| Class       | Verbose Template                                 | Tags Template                             |
|-------------|--------------------------------------------------|-------------------------------------------|
| character   | `{trigger} person, {caption}`                    | `{trigger}, person, {caption}`            |
| product     | `{trigger}, {caption}`                           | `{trigger}, product, {caption}`           |
| style       | `{caption}, in {trigger} style`                  | `{caption}, {trigger} style`              |
| pose        | `{trigger} pose, {caption}`                      | `{trigger}, pose, {caption}`              |
| environment | `{trigger} location, {caption}`                  | `{trigger}, environment, {caption}`       |

## Normalisation Rules

- Trigger token appears exactly once, in the position the template specifies.
- Length target: verbose captions 12–40 words, tags 8–20 tokens.
- Lowercase except for proper nouns and the trigger token (which follows whatever case the caller provided).
- Strip: generic filler (`image of`, `picture of`, `photo showing`), model names, resolution references, "AI generated", file names, watermarks.

## Output (JSON)

```json
{
  "status": "pass" | "warning" | "fail",
  "dataset_path": "<absolute path>",
  "captioner": "florence-2",
  "trigger_token": "rbsWillowTap",
  "captions_written": 18,
  "captions_normalised": 3,
  "captions_skipped": 0,
  "issues": [
    {"file": "img_14.jpg", "reason": "Caption generation failed — keep existing or re-run with different captioner"}
  ],
  "examples": [
    {"file": "img_01.jpg", "caption": "rbsWillowTap, a polished chrome mixer tap on a marble counter, soft studio lighting"},
    {"file": "img_02.jpg", "caption": "rbsWillowTap, a brushed nickel tap above a white porcelain basin, natural light"}
  ],
  "ready_for_training": true
}
```

## Verdict Rules

- `pass` — every image has a valid caption with the trigger token
- `warning` — some captions failed; training can proceed if surviving count still meets the class minimum after exclusions
- `fail` — systemic failure (e.g. captioner unreachable) or surviving count below class minimum; cannot proceed

### Return Value (to the caller)

```json
{
  "status": "pass" | "warning" | "fail",
  "trigger_token": "rbsWillowTap",
  "report_path": "<dataset_path>/caption_report.json",
  "captions_written": 18,
  "ready_for_training": true,
  "error": null
}
```

`status` aligns with the rest of the pipeline (`pass` = all images captioned cleanly; `warning` = some failed but the surviving count still meets class minimums; `fail` = systemic captioner failure or count below minimum after exclusions).

## Safety Notes

- Never invent facts about the subject that weren't visible in the image (no "wearing blue" if the caption model didn't say so).
- Never leak real names or identifying info into captions unless the caller asked for them.
- Keep a backup of any caption file that is overwritten (write to `<name>.txt.bak` in the same folder).
