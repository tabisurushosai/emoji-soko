// Development-only: ステージ 61-100 の自動生成ツール。
// 配布 zip (build_zip.sh) には含めない。Node.js 単独で実行: `node scripts/generate_hard.js`
// 詳細は scripts/README.md を参照。

const fs = require('fs');
const path = require('path');
const { parseStage, solve } = require('./stage_tools');

const DIRS = [
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
];

function gridToText(grid, player, boxes, goals) {
  const goalSet = new Set(goals.map((g) => `${g.x},${g.y}`));
  const boxSet = new Set(boxes.map((b) => `${b.x},${b.y}`));
  return `${grid
    .map((row, y) =>
      row
        .map((cell, x) => {
          if (cell === '#') return '#';
          const isGoal = goalSet.has(`${x},${y}`);
          const isBox = boxSet.has(`${x},${y}`);
          const isPlayer = player.x === x && player.y === y;
          if (isPlayer) return '@';
          if (isBox) return '$';
          if (isGoal) return '*';
          return '.';
        })
        .join('')
    )
    .join('\n')}\n`;
}

function hardReverseGenerate(config, seed) {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };

  const { width, height, boxes: boxCount, pulls, pillars = [] } = config;
  const grid = Array.from({ length: height }, () => Array(width).fill('.'));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) grid[y][x] = '#';
    }
  }
  for (const [px, py] of pillars) grid[py][px] = '#';

  const floors = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x] === '.') floors.push({ x, y });
    }
  }
  if (floors.length < boxCount + 1) return null;

  for (let i = floors.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [floors[i], floors[j]] = [floors[j], floors[i]];
  }

  const goals = floors.slice(0, boxCount);
  const goalSet = new Set(goals.map((g) => `${g.x},${g.y}`));
  const boxes = goals.map((g) => ({ ...g }));
  let player = floors[boxCount];
  const boxAt = (x, y) => boxes.find((b) => b.x === x && b.y === y);
  const isFloor = (x, y) => grid[y] && grid[y][x] !== '#';

  let appliedPulls = 0;
  for (let i = 0; i < pulls; i++) {
    const pullMoves = [];
    const walkMoves = [];

    for (const dir of DIRS) {
      const nx = player.x + dir.dx;
      const ny = player.y + dir.dy;
      if (!isFloor(nx, ny) || boxAt(nx, ny)) continue;

      const box = boxAt(player.x - dir.dx, player.y - dir.dy);
      if (!box) {
        walkMoves.push({ nx, ny });
        continue;
      }

      const boxDestX = player.x;
      const boxDestY = player.y;
      if (!isFloor(boxDestX, boxDestY) || boxAt(boxDestX, boxDestY)) continue;
      if (goalSet.has(`${boxDestX},${boxDestY}`)) continue;

      pullMoves.push({ nx, ny, box, boxDestX, boxDestY });
    }

    const moves = pullMoves.length ? pullMoves : walkMoves;
    if (moves.length === 0) break;

    const move = moves[Math.floor(rand() * moves.length)];
    player = { x: move.nx, y: move.ny };
    if (move.box) {
      move.box.x = move.boxDestX;
      move.box.y = move.boxDestY;
      appliedPulls++;
    }
  }

  const minPulls = Math.max(4, Math.floor(boxCount * 0.5));
  if (appliedPulls < minPulls) return null;
  if (boxes.some((b) => goalSet.has(`${b.x},${b.y}`))) return null;

  return gridToText(grid, player, boxes, goals);
}

const HARD_CONFIGS = [];
for (let i = 61; i <= 100; i++) {
  const tier = i - 61;
  const width = Math.min(15, 10 + Math.floor(tier / 4));
  const height = width;
  const boxes = Math.min(12, 6 + Math.floor(tier / 4));
  const pulls = 40 + tier * 3 + boxes * 8;
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);

  const pillars = [];
  if (tier >= 8 && tier % 8 === 0) pillars.push([cx, cy]);
  if (tier >= 10 && tier % 10 === 0) pillars.push([2, cy], [width - 3, cy]);

  HARD_CONFIGS.push({ num: i, width, height, boxes, pulls, pillars });
}

const stagesDir = path.join(__dirname, '..', 'stages');
const summary = [];

for (const config of HARD_CONFIGS) {
  let best = null;
  const variants = [
    config,
    { ...config, pillars: [] },
    { ...config, pulls: config.pulls + 30, pillars: [] },
    { ...config, width: config.width + 1, height: config.height + 1, pillars: [] },
  ].filter((v) => v.width <= 15);

  for (const tryConfig of variants) {
    if (best) break;
    for (let attempt = 0; attempt < 15000; attempt++) {
      const text = hardReverseGenerate(tryConfig, tryConfig.num * 1000 + attempt);
      if (!text) continue;

      const parsed = parseStage(text);
      if (parsed.boxes.length !== tryConfig.boxes) continue;
      if (parsed.goals.size !== tryConfig.boxes) continue;
      if (parsed.boxes.some((b) => parsed.goals.has(`${b.x},${b.y}`))) continue;

      let score = 0;
      for (const box of parsed.boxes) {
        for (const goalKey of parsed.goals) {
          const [gx, gy] = goalKey.split(',').map(Number);
          score += Math.abs(box.x - gx) + Math.abs(box.y - gy);
        }
      }

      if (!best || score > best.score) {
        best = { text, score, size: tryConfig.width };
      }
      if (score >= 120 + tryConfig.boxes * 20) break;
    }
  }

  if (!best) {
    console.error(`Failed to generate stage ${config.num}`);
    process.exit(1);
  }

  const file = path.join(stagesDir, `${String(config.num).padStart(2, '0')}.txt`);
  fs.writeFileSync(file, best.text);
  summary.push({
    num: config.num,
    size: `${best.size}x${best.size}`,
    boxes: config.boxes,
    score: best.score,
  });
}

for (const row of summary) {
  console.log(
    `${String(row.num).padStart(2, '0')}.txt: ${row.size}, ${row.boxes} boxes, score=${row.score}`
  );
}
