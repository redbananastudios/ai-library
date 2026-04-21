---
name: cleanup-temp
description: Safely remove temporary files and failed job artifacts from the ai-image-system project folder. Preserves approved outputs and registered LoRAs.
trigger: clean up images, remove temp files, free space
---
---
name: Cleanup Temp
description: Safely remove temporary and failed artifacts from ai-image-system
trigger: when user wants to clean up temp files or free disk space
---

# Cleanup Temp

Safely remove temporary files from the ai-image-system project folder. Never deletes approved outputs or registered LoRAs.

## Safe to Delete

- `./ai-image-system/temp/*` — always safe
- `./ai-image-system/jobs/failed/*` — safe after confirmation
- Rejected job outputs older than 7 days — safe after confirmation
- Orphaned files in `jobs/active/` older than 24 hours — likely stale

## Never Delete

- `./ai-image-system/outputs/*/selected/*` — approved images
- `./ai-image-system/memory/*` — learning data
- `./ai-image-system/models/loras/` with status `approved` — registered LoRAs
- `./ai-image-system/workflows/*` — workflow templates
- Any `metadata.json` or `prompt.txt` in completed jobs

## Procedure

1. Scan `temp/` and report size
2. Scan `jobs/failed/` and report count + size
3. Scan `jobs/active/` for stale jobs (>24h) and report
4. Scan rejected outputs older than 7 days
5. Present summary to user with totals
6. Ask for confirmation before deleting anything
7. Delete confirmed items
8. Report freed space

## Output

```
Cleanup Summary:
- temp/: {size} — {action}
- failed jobs: {count} ({size}) — {action}
- stale active jobs: {count} — {action}
- old rejected outputs: {count} ({size}) — {action}
Total freed: {total_size}
```
