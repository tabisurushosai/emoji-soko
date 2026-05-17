#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ZIP_NAME="emoji-soko_store.zip"

rm -f "$ZIP_NAME"

zip -rq "$ZIP_NAME" \
  index.html \
  style.css \
  src/ \
  stages/ \
  assets/icon.png \
  assets/ogp_1200x630.png \
  -x "*.DS_Store" "*/.git/*" "*.bak*" "*.md" "TODO.*" "node_modules/*" "scripts/*" "*.py" "assets/*.py"

echo "Created: $ROOT/$ZIP_NAME"
echo "Size: $(du -h "$ZIP_NAME" | cut -f1) ($(wc -c < "$ZIP_NAME" | tr -d ' ') bytes)"
