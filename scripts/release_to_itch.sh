#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

GAME="tabisurushosai/emoji-soko-tabisurushosai"
CHANNEL="html"
ZIP_PATH="emoji-soko_store.zip"

if ! command -v butler >/dev/null 2>&1; then
  echo "error: butler not found. See docs/release.md" >&2
  exit 1
fi

bash scripts/build_zip.sh

if [ ! -f "$ZIP_PATH" ]; then
  echo "error: $ZIP_PATH not found after build" >&2
  exit 1
fi

echo "Pushing $ZIP_PATH → ${GAME}:${CHANNEL}"
butler push "$ZIP_PATH" "${GAME}:${CHANNEL}"
butler status "$GAME"
