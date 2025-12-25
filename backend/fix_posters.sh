#!/bin/bash
# ============================================
# Fix Movie Posters Script
# ============================================
#
# This script updates movie poster URLs.
#
# Usage: ./fix_posters.sh
# ============================================

set -e

cd "$(dirname "$0")"

source .venv/bin/activate

echo "🖼️  Fixing movie poster URLs..."
python -m app.fix_posters

echo "✅ Done!"
