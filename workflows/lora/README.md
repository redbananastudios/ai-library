# LoRA Training Workflows

Generic, reusable LoRA training pipeline for the AI Library. Any project — characters, products, styles, environments — can plug in by supplying paths and configuration.

**This is a v1 declarative workflow**, consistent with the rest of [`workflows/`](../README.md): the YAML specifies the sequence and the data contract, runtimes (agents, CLIs, future executors) consume it by invoking each step's skill in order.

## Workflows

| File                                                  | Purpose                                                     |
|-------------------------------------------------------|-------------------------------------------------------------|
| [`character_training.yaml`](./character_training.yaml) | Five-step LoRA training pipeline (works for any lora_class) |

The name `character_training.yaml` reflects the most common intake case, but the workflow handles every `lora_class`: `character`, `product`, `style`, `pose`, `environment`.

## Pipeline at a Glance

```
lora-prepare-dataset  →  lora-caption-dataset  →  lora-train  →  lora-evaluate  →  lora-version
     (gate)                (normalise)           (compute)      (quality check)     (register)
```

Each step is a skill in [`../../skills/`](../../skills/) and runs sequentially, passing shared context forward.

## Required Inputs

| Input            | Type     | Description |
|------------------|----------|-------------|
| `dataset_path`   | string   | Absolute path to a folder of training images |
| `output_path`    | string   | Absolute folder where model, metadata, and evaluation land |
| `model_name`     | string   | Base name for the output model (e.g. `willow-taps`) |
| `subject`        | string   | Free-text description of the concept being trained |
| `lora_class`     | enum     | `character` \| `product` \| `style` \| `pose` \| `environment` |
| `registry_path`  | string   | Absolute path to the LoRA registry JSON the caller maintains |

## Optional Inputs (`config`)

All fields are optional; sensible defaults are picked per step.

```yaml
config:
  budget_tier:      standard          # low | standard | high (training compute)
  backend:          kohya_ss          # kohya_ss | sd-scripts | onetrainer
  base_model:       sdxl_base_1.0     # identifier the backend understands
  captioner:        florence-2        # blip2 | florence-2 | llava | manual | keep-existing
  version_strategy: increment         # increment | semver | date
  eval_prompts:     [ ... ]           # custom eval grid; defaults derived from lora_class + subject
  weights:          [0.5, 0.7, 0.9]   # weight sweep used during evaluation
  thresholds:
    consistency:  0.7
    fidelity:     0.7
    overfitting:  0.6
    artefacts:    0.75
```

Unknown keys inside `config` are forwarded to `lora-train` as training-config overrides (rank, alpha, learning rate, steps, resolution, batch size, etc.).

## Expected Outputs

```yaml
outputs:
  - model_path          # absolute path to the trained .safetensors
  - evaluation_results  # pass/review/fail verdict + scores + recommended weight
  - run_metadata        # final registry entry, paths, consolidated run report
```

Files written under `output_path`:

```
{output_path}/
  prepare_report.json                  # from lora-prepare-dataset
  {final_id}.safetensors               # from lora-train (renamed by lora-version)
  {final_id}.run.json                  # run metadata
  {final_id}.training_config.json      # exact training config used
  {final_id}.evaluation.json           # evaluation report
  {final_id}.run.md                    # human-readable run summary
  grid/                                # evaluation test images
    p{prompt_idx}_w{weight}_{sample_idx}.png
```

The `registry_path` file is appended to with a new entry.

## Example Invocation

```json
{
  "dataset_path":   "/abs/path/to/my-project/datasets/taps-v1",
  "output_path":    "/abs/path/to/my-project/models/loras",
  "model_name":     "willow-taps",
  "subject":        "willow-weir chrome mixer taps",
  "lora_class":     "product",
  "trigger_token":  "rbsWillowTap",
  "registry_path":  "/abs/path/to/my-project/models/loras/registry.json",
  "config": {
    "budget_tier":  "standard",
    "backend":      "kohya_ss",
    "base_model":   "sdxl_base_1.0",
    "captioner":    "florence-2"
  }
}
```

## How Projects Integrate

This library doesn't own datasets, models, or registries — projects do. Integration pattern:

1. **Project owns the layout** — decide where datasets, models, and the registry live inside your project tree. The library never writes outside the paths you pass in.
2. **Project supplies credentials** — training/captioning backends read credentials from the invoker's environment (e.g. `LORA_TRAIN_BACKEND_URL`, `LORA_TRAIN_BACKEND_KEY`). Nothing is hardcoded in the library.
3. **Project calls the workflow** — an agent, CLI, or future executor loads `character_training.yaml`, provides the inputs above, and consumes the declared outputs.
4. **Project decides promotion** — training always yields `status: candidate`. Promoting to `approved` is an explicit human (or project-specific) decision outside this pipeline.

## Safety and Determinism

- Every step is idempotent on its report file and adversely clean on failure — rerunning `lora-prepare-dataset` won't duplicate data.
- `lora-version` never silently overwrites. If a version id collides with an unrelated file, it fails loudly.
- Candidate by default. The pipeline never auto-promotes a LoRA to `approved`.
- Dataset + config hashes are recorded in the registry entry so every LoRA is fully traceable to the inputs that produced it.

## Backend Neutrality

The library documents *what each backend needs* (endpoint + auth + a submit/poll/download contract) rather than shipping backend-specific adapter code. Concrete shims (e.g. a Runpod kohya_ss client, a local OneTrainer runner) belong in project repos or future executor packages.

## Execution Model

This workflow is declarative. Runtimes consuming it should:

1. **Load** `character_training.yaml`
2. **Validate** required inputs are present
3. **Initialise** a shared context with the provided inputs
4. **Execute** steps in order, passing `$input.…` and `$steps.…output` references correctly
5. **Return** the declared outputs — or fail fast with the step id that broke

See [`../README.md`](../README.md) for the full workflow schema and execution conventions.

## Related Skills

| Skill                                                          | Role                              |
|----------------------------------------------------------------|-----------------------------------|
| [`lora-prepare-dataset`](../../skills/lora-prepare-dataset/)   | Dataset validation + prep         |
| [`lora-caption-dataset`](../../skills/lora-caption-dataset/)   | Caption generation / normalisation |
| [`lora-train`](../../skills/lora-train/)                       | Training job execution            |
| [`lora-evaluate`](../../skills/lora-evaluate/)                 | Quality evaluation                |
| [`lora-version`](../../skills/lora-version/)                   | Versioning + registry write       |
| [`select-lora`](../../skills/select-lora/)                     | Runtime LoRA selection (separate) |
