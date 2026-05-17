#!/usr/bin/env bash
# Release readiness gate — 8 checks, exit 0 only if all pass.
# Usage: bash scripts/release_check.sh

set -u
cd "$(dirname "$0")/.."

PASS=0
FAIL=0
TODAY=$(date '+%Y-%m-%d')

ok() {
  echo "  ✓ $1"
  PASS=$((PASS + 1))
}

ng() {
  echo "  ✗ $1"
  FAIL=$((FAIL + 1))
}

echo "=== emoji-soko release check ==="
echo ""

# 1. git status clean (tracked changes only; untracked allowed)
echo "[1/8] git status clean"
if git status --porcelain | grep -qv '^??'; then
  ng "git has uncommitted tracked changes"
  git status --short
else
  ok "no uncommitted tracked changes"
fi

# 2. synced with origin/main
echo "[2/8] git sync with origin/main"
git fetch origin main 2>/dev/null || true
if ! git rev-parse origin/main >/dev/null 2>&1; then
  ng "origin/main not found (git fetch failed?)"
else
  AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 999)
  BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 999)
  if [ "$AHEAD" -eq 0 ] && [ "$BEHIND" -eq 0 ]; then
    ok "origin/main in sync (ahead=0 behind=0)"
  else
    ng "out of sync with origin/main (ahead=$AHEAD behind=$BEHIND)"
  fi
fi

# 3. stages 100/100 (use existing report if fresh, else run verify)
echo "[3/8] stage verification 100/100"
RUN_VERIFY=0
if [ ! -f verification_report.md ]; then
  RUN_VERIFY=1
elif ! grep -q "SUMMARY solved=100 failed=0 total=100" verification_report.md 2>/dev/null; then
  RUN_VERIFY=1
fi

if [ "$RUN_VERIFY" -eq 1 ]; then
  echo "      (running verify_stages.sh — may take several minutes)"
  if bash scripts/verify_stages.sh >/tmp/emoji_soko_verify.log 2>&1; then
    ok "verify_stages.sh: 100/100 solved"
  else
    ng "verify_stages.sh failed (see /tmp/emoji_soko_verify.log)"
    tail -5 /tmp/emoji_soko_verify.log 2>/dev/null | sed 's/^/        /'
  fi
else
  ok "verification_report.md: 100/100 solved"
fi

# 4. legal HTML (3 bilingual pages from 058; PRIVACY / TERMS / LICENSES)
echo "[4/8] legal/*.html present"
LEGAL_OK=1
for f in PRIVACY.html TERMS.html LICENSES.html; do
  if [ ! -f "legal/$f" ]; then
    LEGAL_OK=0
    ng "missing legal/$f"
  fi
done
if [ "$LEGAL_OK" -eq 1 ]; then
  ok "legal/*.html (PRIVACY, TERMS, LICENSES)"
fi

# 5. OGP meta in index.html
echo "[5/8] OGP meta in index.html"
if grep -q 'property="og:title"' index.html; then
  ok 'index.html contains og:title'
else
  ng 'index.html missing og:title'
fi

# 6. store cover image
echo "[6/8] assets/store/cover_630x500.png"
if [ -f assets/store/cover_630x500.png ]; then
  ok "assets/store/cover_630x500.png exists"
else
  ng "assets/store/cover_630x500.png missing"
fi

# 7. build_zip.sh runs and produces zip
echo "[7/8] build_zip.sh"
ZIP_CANDIDATE=""
if bash scripts/build_zip.sh >/tmp/emoji_soko_zip.log 2>&1; then
  if [ -f emoji-soko_store.zip ]; then
    ZIP_CANDIDATE="emoji-soko_store.zip"
  elif [ -d dist ] && ls dist/*.zip >/dev/null 2>&1; then
    ZIP_CANDIDATE=$(ls -t dist/*.zip | head -1)
  fi
  if [ -n "$ZIP_CANDIDATE" ] && [ -s "$ZIP_CANDIDATE" ]; then
    ok "build_zip produced $ZIP_CANDIDATE ($(wc -c < "$ZIP_CANDIDATE" | tr -d ' ') bytes)"
    rm -f "$ZIP_CANDIDATE"
    rm -f dist/*.zip 2>/dev/null || true
  else
    ng "build_zip ran but no zip found (emoji-soko_store.zip or dist/*.zip)"
  fi
else
  ng "build_zip.sh failed (see /tmp/emoji_soko_zip.log)"
fi

# 8. verification_report.md generated today
echo "[8/8] verification_report.md date"
if [ ! -f verification_report.md ]; then
  ng "verification_report.md missing"
elif grep -q "Generated: ${TODAY}" verification_report.md; then
  ok "verification_report.md generated today ($TODAY)"
else
  ng "verification_report.md not from today (expected $TODAY)"
  grep "Generated:" verification_report.md | head -1 | sed 's/^/        /'
fi

echo ""
echo "=== summary: ${PASS} passed, ${FAIL} failed ==="
if [ "$FAIL" -eq 0 ]; then
  echo ""
  echo "✓ Release ready"
  exit 0
else
  echo ""
  echo "✗ Not release ready — fix ${FAIL} issue(s) above"
  exit 1
fi
