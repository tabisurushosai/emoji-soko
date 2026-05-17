// Development-only: ステージ 21-60 の自動生成ツール。
// 配布 zip (build_zip.sh) には含めない。Node.js 単独で実行: `node scripts/stage_tools.js`
// 詳細は scripts/README.md を参照。

const fs = require('fs');
const path = require('path');

const DIRS = [
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
];

function parseStage(text) {
  const grid = text.trim().split('\n').map((line) => [...line]);
  let player = null;
  const boxes = [];
  const goals = new Set();

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const ch = grid[y][x];
      if (ch === '@' || ch === 'P') player = { x, y };
      if (ch === '$' || ch === 'B') boxes.push({ x, y });
      if (ch === '*' || ch === 'B') goals.add(`${x},${y}`);
    }
  }

  boxes.sort((a, b) => a.y - b.y || a.x - b.x);
  return { grid, player, boxes, goals };
}

function isWall(grid, x, y) {
  return !grid[y] || grid[y][x] === '#';
}

function isFloor(grid, goals, x, y) {
  return !isWall(grid, x, y);
}

function stateKey(player, boxes) {
  return `${player.x},${player.y}|${boxes.map((b) => `${b.x},${b.y}`).join(';')}`;
}

function solve(text, maxMoves = 120) {
  const { grid, player, boxes, goals } = parseStage(text);
  const queue = [{ player, boxes, moves: 0 }];
  const visited = new Set([stateKey(player, boxes)]);

  while (queue.length) {
    const current = queue.shift();
    if (current.moves > maxMoves) continue;

    if (current.boxes.every((b) => goals.has(`${b.x},${b.y}`))) {
      return { solvable: true, moves: current.moves };
    }

    for (const dir of DIRS) {
      const nx = current.player.x + dir.dx;
      const ny = current.player.y + dir.dy;
      if (isWall(grid, nx, ny)) continue;

      const boxIndex = current.boxes.findIndex((b) => b.x === nx && b.y === ny);
      let nextBoxes = current.boxes;
      const nextPlayer = { x: nx, y: ny };

      if (boxIndex >= 0) {
        const bx = nx + dir.dx;
        const by = ny + dir.dy;
        if (isWall(grid, bx, by)) continue;
        if (current.boxes.some((b) => b.x === bx && b.y === by)) continue;
        nextBoxes = current.boxes.map((b, i) =>
          i === boxIndex ? { x: bx, y: by } : { ...b }
        );
      }

      const key = stateKey(nextPlayer, nextBoxes);
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ player: nextPlayer, boxes: nextBoxes, moves: current.moves + 1 });
    }
  }

  return { solvable: false, moves: null };
}

function createEmptyRoom(width, height) {
  const grid = Array.from({ length: height }, () => Array(width).fill('.'));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        grid[y][x] = '#';
      }
    }
  }
  return grid;
}

function addPillars(grid, positions) {
  for (const [x, y] of positions) {
    grid[y][x] = '#';
  }
}

function shuffle(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function gridToText(grid, player, boxes, goals) {
  const goalSet = new Set(goals.map((g) => `${g.x},${g.y}`));
  const boxSet = new Set(boxes.map((b) => `${b.x},${b.y}`));
  const lines = grid.map((row, y) =>
    row
      .map((cell, x) => {
        if (cell === '#') return '#';
        const isGoal = goalSet.has(`${x},${y}`);
        const isBox = boxSet.has(`${x},${y}`);
        const isPlayer = player.x === x && player.y === y;
        if (isPlayer) return isGoal ? 'P' : '@';
        if (isBox) return '$';
        if (isGoal) return '*';
        return '.';
      })
      .join('')
  );
  return `${lines.join('\n')}\n`;
}

function boxesOnGoals(boxes, goals) {
  const goalSet = new Set(goals.map((g) => `${g.x},${g.y}`));
  return boxes.some((b) => goalSet.has(`${b.x},${b.y}`));
}

function getFloorCells(grid) {
  const cells = [];
  for (let y = 1; y < grid.length - 1; y++) {
    for (let x = 1; x < grid[y].length - 1; x++) {
      if (grid[y][x] === '.') cells.push({ x, y });
    }
  }
  return cells;
}

function reverseGenerate(config, seed) {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };

  const { width, height, boxes: boxCount, pulls, pillars = [] } = config;
  const grid = createEmptyRoom(width, height);
  addPillars(grid, pillars);

  const floors = getFloorCells(grid);
  shuffle(floors, rand);
  const goals = floors.slice(0, boxCount);
  const goalSet = new Set(goals.map((g) => `${g.x},${g.y}`));
  let boxes = goals.map((g) => ({ ...g }));
  let player = floors[boxCount];

  const boxAt = (x, y) => boxes.find((b) => b.x === x && b.y === y);

  let appliedPulls = 0;
  for (let i = 0; i < pulls; i++) {
    const moves = [];
    for (const dir of DIRS) {
      const nx = player.x + dir.dx;
      const ny = player.y + dir.dy;
      if (!isFloor(grid, null, nx, ny)) continue;
      if (boxAt(nx, ny)) continue;

      const bx = player.x - dir.dx;
      const by = player.y - dir.dy;
      const box = boxAt(bx, by);
      if (!box) continue;

      const boxDestX = player.x;
      const boxDestY = player.y;
      if (!isFloor(grid, null, boxDestX, boxDestY)) continue;
      if (boxAt(boxDestX, boxDestY)) continue;
      if (goalSet.has(`${boxDestX},${boxDestY}`)) continue;

      moves.push({ dir, nx, ny, box, boxDestX, boxDestY });
    }

    if (moves.length === 0) break;
    const move = moves[Math.floor(rand() * moves.length)];
    player = { x: move.nx, y: move.ny };
    move.box.x = move.boxDestX;
    move.box.y = move.boxDestY;
    appliedPulls++;
  }

  if (appliedPulls < boxCount) {
    return null;
  }

  if (boxesOnGoals(boxes, goals)) {
    return null;
  }

  return gridToText(grid, player, boxes, goals);
}

const CONFIGS = [];
for (let i = 21; i <= 60; i++) {
  const tier = i - 21;
  const width = 7 + Math.floor(tier / 10);
  const height = width;
  const boxes = 3 + Math.floor(tier / 10);
  const pulls = 14 + tier + boxes * 3;
  const pillars =
    tier >= 8 && tier % 8 === 0
      ? [[Math.floor(width / 2), Math.floor(height / 2)]]
      : tier >= 12 && tier % 6 === 0
        ? [[2, Math.floor(height / 2)]]
        : [];

  CONFIGS.push({
    num: i,
    width,
    height,
    boxes,
    pulls,
    pillars,
    minMoves: 3,
  });
}

module.exports = {
  parseStage,
  solve,
  reverseGenerate,
  CONFIGS,
};

if (require.main !== module) {
  return;
}

const stagesDir = path.join(__dirname, '..', 'stages');
const summary = [];

for (const config of CONFIGS) {
  let best = null;
  const attempts = config.boxes >= 5 ? 20000 : 12000;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const text = reverseGenerate(config, config.num * 1000 + attempt);
    if (!text) continue;

    const parsed = parseStage(text);
    if (parsed.boxes.length !== config.boxes) continue;
    if (parsed.goals.size !== config.boxes) continue;

    const result = solve(text, 180);
    if (!result.solvable) continue;
    if (!best || result.moves > best.moves) {
      best = { text, moves: result.moves };
    }
    if (result.moves >= Math.max(config.minMoves, 8 + config.boxes)) {
      break;
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
    size: `${config.width}x${config.height}`,
    boxes: config.boxes,
    moves: best.moves,
  });
}

for (const row of summary) {
  console.log(
    `${String(row.num).padStart(2, '0')}.txt: ${row.size}, ${row.boxes} boxes, ~${row.moves} moves`
  );
}
