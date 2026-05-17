#!/usr/bin/env bash
# Development-only: stages 61-100 の solvability 検証を実行し
# verification_report.md を生成する。
#
# 使い方: bash scripts/verify_stages.sh

set -u
cd "$(dirname "$0")/.."

REPORT="verification_report.md"
TMP="$(mktemp)"

python3 scripts/verify_stages.py stages 61 100 | tee "$TMP"
STATUS=${PIPESTATUS[0]}

{
  echo "# Stage Verification Report (61-100)"
  echo ""
  echo "- Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "- Tool: \`scripts/verify_stages.py\` (BFS, node cap 200000, timeout 30s)"
  echo "- Note: \"unverified\" はノード上限 / タイムアウト到達による打ち切り (解不能ではない)"
  echo ""
  echo '```'
  cat "$TMP"
  echo '```'
} > "$REPORT"

rm -f "$TMP"
echo ""
echo "→ $REPORT を生成しました (exit=$STATUS)"
exit $STATUS
