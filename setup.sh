#!/bin/bash
# AI Library Setup - run on any device to sync skills, agents and plugins
# Usage: bash setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

echo "=== AI Library Setup ==="
echo "Source: $SCRIPT_DIR"
echo "Target: $CLAUDE_DIR"
echo ""

# 1. Pull latest
echo "[1/5] Pulling latest from GitHub..."
cd "$SCRIPT_DIR"
git pull origin main
echo ""

# 2. Validate
echo "[2/5] Validating library..."
python scripts/validate-library.py 2>&1 | tail -3
echo ""

# 3. Build all
echo "[3/5] Building all items..."
python scripts/build-all.py 2>&1 | tail -3
echo ""

# 4. Deploy to ~/.claude/
echo "[4/5] Deploying to Claude..."
mkdir -p "$CLAUDE_DIR/skills"
mkdir -p "$CLAUDE_DIR/agents"
cp -r generated/claude/skills/* "$CLAUDE_DIR/skills/"
cp generated/claude/agents/*.md "$CLAUDE_DIR/agents/"
echo "  Deployed: $(ls "$CLAUDE_DIR/skills/" | wc -l) skills, $(ls "$CLAUDE_DIR/agents/" | wc -l) agents"
echo ""

# 5. Check superpowers plugin
echo "[5/5] Checking Obra Superpowers..."
if [ -f "$CLAUDE_DIR/plugins/installed_plugins.json" ]; then
    if grep -q "superpowers" "$CLAUDE_DIR/plugins/installed_plugins.json" 2>/dev/null; then
        VERSION=$(grep -o '"version": "[^"]*"' "$CLAUDE_DIR/plugins/installed_plugins.json" | head -1 | cut -d'"' -f4)
        echo "  Superpowers installed (v$VERSION)"
    else
        echo "  WARNING: Superpowers not installed. Run: claude plugins install superpowers"
    fi
else
    echo "  WARNING: No plugins found. Run: claude plugins install superpowers"
fi
echo ""

echo "=== Setup complete ==="
