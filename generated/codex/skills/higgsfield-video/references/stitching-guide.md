# Video Stitching Guide - Multi-Scene Concatenation

## Overview

When generating multi-scene videos in Higgsfield, each scene is typically generated as a separate file. **Stitching** is the process of concatenating (combining) these individual scene files into a final, seamless video.

This guide covers:
1. **ffmpeg-based stitching** (command-line, lossless, recommended)
2. **Video editor stitching** (Premiere Pro, Final Cut Pro, DaVinci Resolve)
3. **Higgsfield multi-shot stitching** (automatic, no stitching needed for 6-cut clips)
4. **Troubleshooting** (sync issues, gaps, transitions)

---

## Method 1: FFmpeg Stitching (Recommended)

### Why FFmpeg?
- **Lossless:** Concatenates without re-encoding (preserves quality)
- **Fast:** Combines clips in minutes, not hours
- **Cross-platform:** Works on Mac, Windows, Linux
- **Free:** No license needed
- **Scriptable:** Automate batch stitching

### Prerequisites

#### Install FFmpeg

**Windows (via Chocolatey):**
```bash
choco install ffmpeg
```

**Windows (manual):**
Download from https://ffmpeg.org/download.html, add to PATH

**Mac (via Homebrew):**
```bash
brew install ffmpeg
```

**Linux (apt):**
```bash
sudo apt-get install ffmpeg
```

**Verify installation:**
```bash
ffmpeg -version
```

### Step 1: Prepare Your Clips

Generate all scenes from Higgsfield and save to a project folder:

```
./higgsfield-videos/my-project/
├── scene-01.mp4
├── scene-02.mp4
├── scene-03.mp4
└── (final output will be generated here)
```

**Important:** All clips must have:
- Same resolution (1080p or 4K)
- Same frame rate (24fps or 30fps)
- Same codec (H.264 or ProRes)
- Same aspect ratio

If Higgsfield generates clips with different settings, you'll need to re-generate with consistent settings.

### Step 2: Create Concat File

Create a text file named `concat-list.txt` in your project folder:

```
file 'scene-01.mp4'
file 'scene-02.mp4'
file 'scene-03.mp4'
```

**Important:** Each line must start with `file` followed by a space and the filename in single quotes.

**File paths:**
- Relative (if concat-list.txt is in same folder): `file 'scene-01.mp4'`
- Absolute: `file '/Users/peter/higgsfield-videos/my-project/scene-01.mp4'`

### Step 3: Run FFmpeg Concat

From the project folder, run:

```bash
ffmpeg -f concat -safe 0 -i concat-list.txt -c copy output-final.mp4
```

**Breakdown:**
- `-f concat` — Use concat demuxer (concatenation format)
- `-safe 0` — Allow unsafe file paths (relative paths)
- `-i concat-list.txt` — Input file list
- `-c copy` — Copy streams without re-encoding (lossless, fast)
- `output-final.mp4` — Output filename

**Output:**
```
[concat @ 0x...] Concat read 3 segments
frame=  7200 fps=0.0 q=-1 Lbar=    0 | Lfile=    0 kB | t=00:02:06 (3 seconds x 3 clips total)
```

### Step 4: Verify Output

```bash
ffmpeg -i output-final.mp4
```

Check:
- Duration matches sum of input clips (e.g., 3s + 3s + 3s = 9s)
- Resolution correct (1920x1080 or 3840x2160)
- Frame rate correct (24fps or 30fps)

---

## Method 1B: FFmpeg Concat with Transitions (Fade)

If you want smooth fade transitions between clips:

```bash
ffmpeg -i scene-01.mp4 -i scene-02.mp4 -i scene-03.mp4 \
  -filter_complex \
  "[0][1]crossfade=d=0.5:curve=tri[v01]; \
   [v01][2]crossfade=d=0.5:curve=tri[v]" \
  -map "[v]" -map "[0]" -map "[1]" -map "[2]" \
  -c:a aac output-final.mp4
```

Or simpler, using a filter file:

**Create `filter.txt`:**
```
[0]fade=t=out:st=2.5:d=0.5[v0];
[1]fade=t=in:st=0:d=0.5[v1];
[v0][v1]concat=n=2:v=1:a=0[v];
[v]fade=t=out:st=2.5:d=0.5[v2];
[2]fade=t=in:st=0:d=0.5[v3];
[v2][v3]concat=n=2:v=1:a=0[out]
```

**Run:**
```bash
ffmpeg -i scene-01.mp4 -i scene-02.mp4 -i scene-03.mp4 \
  -filter_complex_script filter.txt \
  -map "[out]" output-final.mp4
```

This creates 0.5-second fade transitions between scenes.

---

## Method 2: FFmpeg Concat + Audio Stitching

If clips have separate audio tracks, stitch audio and video together:

```bash
ffmpeg -f concat -safe 0 -i concat-list.txt \
  -c:v copy -c:a aac output-final.mp4
```

Or with audio re-encoding (if audio codecs differ):

```bash
ffmpeg -f concat -safe 0 -i concat-list.txt \
  -c:v copy -c:a libmp3lame -q:a 4 output-final.mp4
```

---

## Method 3: Video Editor Stitching

### Adobe Premiere Pro

1. **Create new project** with same settings as your clips (1920×1080, 24fps, H.264)
2. **Import clips** — drag Scene 1, 2, 3 into the project panel
3. **Arrange clips** — drag to timeline in order (Scene 1 → Scene 2 → Scene 3)
4. **Add transitions** (optional) — drag fade transition between clips
5. **Export** — File → Export Media → choose format (ProRes 422 for editing, H.264 for delivery)

**File export settings:**
- Format: H.264 or ProRes 422
- Resolution: 1920×1080 or 3840×2160 (match input)
- Frame rate: 24fps or 30fps (match input)
- Bitrate: 50 Mbps (1080p) or 150 Mbps (4K)

### Final Cut Pro X

1. **New project** — File → New → Project (match clip settings)
2. **Import clips** — File → Import Media (Scene 1, 2, 3)
3. **Create sequence** — File → New → Event (auto-matches clip settings)
4. **Arrange in timeline** — drag clips in order to timeline
5. **Transitions** (optional) — add fade/dissolve from Effects library
6. **Share** — File → Share → Master File or YouTube (choose export settings)

**Export settings:**
- Format: ProRes 422 or H.264
- Resolution: 1920×1080 or 3840×2160
- Frame rate: 24fps or 30fps

### DaVinci Resolve (Free)

1. **New project** — File → New Project (match clip resolution/frame rate)
2. **Import clips** — File → Import Media (Scene 1, 2, 3)
3. **Arrange timeline** — drag to media pool, then timeline panel
4. **Transitions** (optional) — Fusion tab → add Dissolve, Fade, etc.
5. **Export** — File → Export → choose codec (ProRes 422 or H.264)

**Export settings:**
- Format: H.264 or ProRes 422
- Resolution: 1920×1080 or 3840×2160
- Frame rate: 24fps or 30fps
- Quality: High (VBR, 2-pass)

---

## Method 4: Higgsfield Multi-Shot (Automatic Stitching)

**No stitching needed!** If using Kling 3.0 multi-shot mode or Cinema Studio 6-cut mode, Higgsfield generates all 6 scenes in one 12–15s clip without stitching required.

### Kling 3.0 Multi-Cut (6 scenes, 12–15s)

1. Navigate to `/kling-3.0`
2. Enable "Multi-shot mode"
3. Set duration to 12–15s
4. Enter 6 separate scene prompts (2–3s each)
5. Generate once
6. Download one pre-stitched clip

### Cinema Studio 6-Cut (6 scenes, 12–15s)

1. Navigate to `/cinema-studio`
2. Enable "Multi-shot mode"
3. Set duration to 12–15s
4. Configure camera body/lens once (applies to all 6 cuts)
5. Enter 6 scene descriptions
6. Generate
7. Download one pre-stitched clip with all 6 scenes and smooth cuts

**Advantage:** Zero stitching, character consistency maintained, cuts are automatic and smooth.

---

## Workflow: Scene-by-Scene Generation + FFmpeg Stitching

### Complete Example: 3-Scene Coffee Brand Video

#### Step 1: Generate Each Scene in Higgsfield
```
Scene 1: Bean reveal (3s, 9:16, Cinema Studio)
  → Download: scene-01.mp4

Scene 2: Pour & steam (3s, 9:16, Cinema Studio)
  → Download: scene-02.mp4

Scene 3: Wide shot (3s, 9:16, Cinema Studio)
  → Download: scene-03.mp4
```

#### Step 2: Organize Files
```
mkdir -p ~/higgsfield-videos/coffee-brand
cd ~/higgsfield-videos/coffee-brand

# Move downloaded files here
mv ~/Downloads/scene-01.mp4 .
mv ~/Downloads/scene-02.mp4 .
mv ~/Downloads/scene-03.mp4 .

# Verify all clips are present and readable
ls -lh *.mp4
ffmpeg -i scene-01.mp4 2>&1 | grep -E "Duration|Stream"
ffmpeg -i scene-02.mp4 2>&1 | grep -E "Duration|Stream"
ffmpeg -i scene-03.mp4 2>&1 | grep -E "Duration|Stream"
```

#### Step 3: Create Concat File
```
cat > concat-list.txt << EOF
file 'scene-01.mp4'
file 'scene-02.mp4'
file 'scene-03.mp4'
EOF
```

#### Step 4: Run FFmpeg Concat
```bash
ffmpeg -f concat -safe 0 -i concat-list.txt -c copy coffee-brand-final.mp4
```

#### Step 5: Verify Output
```bash
ffmpeg -i coffee-brand-final.mp4
# Should show Duration: 00:00:09 (3+3+3 seconds)
```

#### Step 6: Ready for Delivery
```
~/higgsfield-videos/coffee-brand/coffee-brand-final.mp4
```

Upload to platform (Instagram, TikTok, YouTube, etc.)

---

## Troubleshooting Stitching Issues

### Problem: Clips Won't Concatenate (Codec Mismatch)

**Error:**
```
[concat @ ...] Could not find matching stream specifier for label 'a:0'
```

**Solution:** Re-encode clips to match codec.

```bash
# Convert all clips to H.264 before stitching
ffmpeg -i scene-01.mp4 -c:v libx264 -crf 23 scene-01-h264.mp4
ffmpeg -i scene-02.mp4 -c:v libx264 -crf 23 scene-02-h264.mp4
ffmpeg -i scene-03.mp4 -c:v libx264 -crf 23 scene-03-h264.mp4

# Then concat the re-encoded files
ffmpeg -f concat -safe 0 -i concat-list.txt -c copy final.mp4
```

### Problem: Audio Out of Sync After Stitching

**Solution:** Use `-c:a aac` to re-encode audio instead of copy:

```bash
ffmpeg -f concat -safe 0 -i concat-list.txt -c:v copy -c:a aac final.mp4
```

Or provide explicit audio handling:

```bash
ffmpeg -f concat -safe 0 -i concat-list.txt \
  -c:v copy -c:a libmp3lame -q:a 4 final.mp4
```

### Problem: Concat File Not Found

**Error:**
```
concat-list.txt: No such file or directory
```

**Solution:** Make sure you're in the correct directory and file exists:

```bash
# Check current directory
pwd

# List files
ls -la

# Create concat-list.txt with correct paths
cat > concat-list.txt << EOF
file 'scene-01.mp4'
file 'scene-02.mp4'
file 'scene-03.mp4'
EOF

# Verify file created
cat concat-list.txt
```

### Problem: Clips Have Different Frame Rates (24fps vs 30fps)

**Solution:** Re-encode all to same frame rate before stitching:

```bash
# Convert all to 30fps
ffmpeg -i scene-01.mp4 -vf fps=30 scene-01-30fps.mp4
ffmpeg -i scene-02.mp4 -vf fps=30 scene-02-30fps.mp4
ffmpeg -i scene-03.mp4 -vf fps=30 scene-03-30fps.mp4

# Update concat-list.txt to point to new files
# Then concat
ffmpeg -f concat -safe 0 -i concat-list.txt -c copy final.mp4
```

### Problem: Output File Corruption

**Solution:** Ensure all clips finish generating before stitching.

```bash
# Check each clip is complete and readable
ffmpeg -i scene-01.mp4 -f null - 2>&1 | grep "time=" | tail -1
ffmpeg -i scene-02.mp4 -f null - 2>&1 | grep "time=" | tail -1
ffmpeg -i scene-03.mp4 -f null - 2>&1 | grep "time=" | tail -1

# Only proceed if all show completion (time=duration of clip)
```

---

## Advanced: Batch Stitching Multiple Projects

If you have multiple video projects to stitch, automate with a script:

**`stitch-all.sh` (Mac/Linux):**
```bash
#!/bin/bash

# Loop through all project folders
for project_dir in ~/higgsfield-videos/*/; do
    project_name=$(basename "$project_dir")

    # Skip if no scenes found
    if [ ! -f "$project_dir/scene-01.mp4" ]; then
        echo "Skipping $project_name (no scenes found)"
        continue
    fi

    echo "Stitching $project_name..."

    # Create concat file
    cd "$project_dir"
    ls scene-*.mp4 | sort -V | sed 's/^/file '\''/' | sed "s/'$//' > concat-list.txt

    # Run FFmpeg
    ffmpeg -f concat -safe 0 -i concat-list.txt -c copy "$project_name-final.mp4"

    echo "✓ $project_name complete: $project_name-final.mp4"
done
```

**Run:**
```bash
chmod +x stitch-all.sh
./stitch-all.sh
```

---

## Post-Stitching: Color Grading & Sound Design

After stitching, your video is ready for optional post-production:

### Color Grading
- Use DaVinci Resolve (free) or Premiere Pro
- Adjust overall color balance, contrast, saturation across all clips
- Ensure consistent color treatment across all 3 scenes

### Sound Design
- Add background music (purchase from stock library: Artlist, AudioJungle)
- Add ambient sound (coffee shop ambiance, pour sounds)
- Mix voiceover/dialogue if applicable
- Export final with video + audio mixed down

---

## Quick Reference: FFmpeg Commands

| Task | Command |
|------|---------|
| Concat 3 clips (lossless) | `ffmpeg -f concat -safe 0 -i concat-list.txt -c copy output.mp4` |
| Concat + add fade transitions | `ffmpeg -i s1.mp4 -i s2.mp4 -filter_complex "[0][1]crossfade=d=0.5[out]" -map "[out]" output.mp4` |
| Convert codec to H.264 | `ffmpeg -i input.mp4 -c:v libx264 -crf 23 output.mp4` |
| Change frame rate to 30fps | `ffmpeg -i input.mp4 -vf fps=30 output.mp4` |
| Verify clip integrity | `ffmpeg -i input.mp4 -f null - 2>&1 \| grep "time="` |
| Get clip info | `ffmpeg -i input.mp4` |
| Extract first frame | `ffmpeg -i input.mp4 -vf "select=eq(n\,0)" -q:v 3 frame.jpg` |

---

## Delivery Checklist

Before delivering final video:

- [ ] All scenes generated and downloaded
- [ ] Clips verified (resolution, frame rate, codec match)
- [ ] Concat list created and verified
- [ ] FFmpeg stitching completed without errors
- [ ] Output file duration matches expected (sum of scene durations)
- [ ] Output file plays without glitches in media player
- [ ] Color and audio consistent across all scenes
- [ ] Aspect ratio correct for platform (9:16 for social, 16:9 for broadcast, 21:9 for cinema)
- [ ] Ready for upload to platform or video editor for final polish

---

## When to Use Each Method

| Method | Best For | Speed | Quality | Ease |
|--------|----------|-------|---------|------|
| **FFmpeg Concat** | Quick delivery, no editing, lossless | ⚡ Fast | ⭐⭐⭐⭐⭐ Lossless | ⭐⭐ Terminal |
| **FFmpeg + Transitions** | Professional finish, smooth cuts | ⚡⚡ Moderate | ⭐⭐⭐⭐⭐ Lossless | ⭐ Complex cmd |
| **Premiere Pro** | Full color grading, music, voiceover | 🐢 Slow | ⭐⭐⭐⭐⭐ Full control | ⭐⭐⭐ GUI |
| **Final Cut Pro** | Professional editing, performance | 🐢 Moderate | ⭐⭐⭐⭐⭐ Full control | ⭐⭐⭐ GUI |
| **DaVinci Resolve** | Color grading, free, professional | 🐢 Moderate | ⭐⭐⭐⭐⭐ Full control | ⭐⭐⭐ GUI |
| **Higgsfield Multi-Shot** | Simple multi-cut, no editing | ⚡ Fast | ⭐⭐⭐⭐⭐ Built-in | ⭐⭐⭐⭐⭐ Automatic |

**Recommendation:** Use FFmpeg for quick delivery, video editor for professional polish.
