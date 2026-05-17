// Development-only: ステージ 61-100 の自動生成ツール。
// 配布 zip (build_zip.sh) には含めない。Node.js 単独で実行: `node scripts/generate_hard.js`
// 詳細は scripts/README.md を参照。
//
// reverseGenerate + Python BFS 検証 (verify_stages.py) で 200k ノード上限内の解を保証。

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { parseStage, solve, reverseGenerate } = require('./stage_tools');

const ROOT = path.join(__dirname, '..');
const stagesDir = path.join(ROOT, 'stages');

function verifyWithPython(stageNum) {
  try {
    const out = execSync(
      `python3 scripts/verify_stages.py stages ${stageNum} ${stageNum}`,
      { cwd: ROOT, encoding: 'utf8', timeout: 90000 }
    );
    return out.includes(`✓ STAGE_${String(stageNum).padStart(2, '0')} solved`);
  } catch {
    return false;
  }
}

const rangeStart = parseInt(process.argv[2], 10) || 61;
const rangeEnd = parseInt(process.argv[3], 10) || 100;

const HARD_CONFIGS = [];
for (let i = rangeStart; i <= rangeEnd; i++) {
  const tier = i - 61;
  const width = 10 + Math.floor(tier / 20);
  const height = width;
  const boxes = Math.min(5, 4 + Math.floor(tier / 20));
  const pulls = 28 + tier * 2 + boxes * 5;
  const pillars =
    tier >= 12 && tier % 12 === 0
      ? [[Math.floor(width / 2), Math.floor(height / 2)]]
      : [];

  HARD_CONFIGS.push({
    num: i,
    width,
    height,
    boxes,
    pulls,
    pillars,
    minMoves: 6,
  });
}

const summary = [];

for (const config of HARD_CONFIGS) {
  let written = null;

  const variants = [
    config,
    { ...config, pillars: [] },
    { ...config, boxes: Math.max(3, config.boxes - 1), pillars: [] },
    { ...config, width: config.width - 1, height: config.height - 1, pillars: [] },
  ].filter((v) => v.width >= 9 && v.height >= 9);

  outer: for (const tryConfig of variants) {
    const attempts = 25000;

    for (let attempt = 0; attempt < attempts; attempt++) {
      const text = reverseGenerate(tryConfig, tryConfig.num * 1000 + attempt);
      if (!text) continue;

      const parsed = parseStage(text);
      if (parsed.boxes.length !== tryConfig.boxes) continue;
      if (parsed.goals.size !== tryConfig.boxes) continue;
      if (parsed.boxes.some((b) => parsed.goals.has(`${b.x},${b.y}`))) continue;

      const result = solve(text, 200);
      if (!result.solvable) continue;

      const file = path.join(stagesDir, `${String(config.num).padStart(2, '0')}.txt`);
      fs.writeFileSync(file, text);

      if (verifyWithPython(config.num)) {
        written = {
          size: `${tryConfig.width}x${tryConfig.height}`,
          boxes: tryConfig.boxes,
          moves: result.moves,
          variant: tryConfig.width !== config.width ? 'smaller' : 'default',
        };
        break outer;
      }
    }
  }

  if (!written) {
    console.error(`Failed to generate verifiable stage ${config.num}`);
    process.exit(1);
  }

  summary.push({ num: config.num, ...written });
}

for (const row of summary) {
  console.log(
    `${String(row.num).padStart(2, '0')}.txt: ${row.size}, ${row.boxes} boxes, ~${row.moves} moves (${row.variant})`
  );
}
