#!/usr/bin/env bash
# Development-only: 全ステージ solvability 検証 → verification_report.md
# Usage: bash scripts/verify_stages.sh

set -u
cd "$(dirname "$0")/.."

REPORT="verification_report.md"
TMP="$(mktemp)"

echo "Verifying stages 01-100 (push-BFS, node cap 600000, timeout 60s per stage)..."
python3 scripts/verify_stages.py stages 1 100 | tee "$TMP"
STATUS=${PIPESTATUS[0]}

SOLVED=$(grep -c '^✓' "$TMP" || true)
FAILED=$(grep -c '^✗' "$TMP" || true)
FAILED_LIST=$(grep '^✗' "$TMP" | sed 's/.*\(STAGE_[0-9]*\).*/\1/' | tr '\n' ', ' | sed 's/,$//')

{
  echo "# Stage Verification Report (01-100)"
  echo ""
  echo "- Generated: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "- Tool: \`scripts/verify_stages.py\` (push-BFS, node cap 600000, timeout 60s/stage)"
  echo "- ✗ = unsolvable, timeout, node cap, or parse error"
  echo ""
  echo "## Results"
  echo ""
  echo '```'
  cat "$TMP"
  echo '```'
  echo ""
  echo "## Summary"
  echo ""
  echo "| Metric | Count |"
  echo "|--------|------:|"
  echo "| Solved | ${SOLVED} |"
  echo "| Failed | ${FAILED} |"
  echo "| Total  | 100 |"
  echo ""
  if [ -n "$FAILED_LIST" ]; then
    echo "### Failed stages"
    echo ""
    echo "$FAILED_LIST"
  else
    echo "All stages verified solvable within limits."
  fi
} > "$REPORT"

rm -f "$TMP"
echo ""
echo "→ Wrote $REPORT (exit=$STATUS)"
exit "$STATUS"
