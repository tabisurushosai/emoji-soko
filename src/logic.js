const DIR_DELTA = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function floorTypeUnderPlayer(playerType) {
  return playerType === 'PLAYER_ON_GOAL' ? 'GOAL' : 'FLOOR';
}

function playerTypeOn(targetType) {
  return targetType === 'GOAL' ? 'PLAYER_ON_GOAL' : 'PLAYER';
}

function boxTypeOn(targetType) {
  return targetType === 'GOAL' ? 'BOX_ON_GOAL' : 'BOX';
}

function playerTypeOnBoxCell(boxType) {
  return boxType === 'BOX_ON_GOAL' ? 'PLAYER_ON_GOAL' : 'PLAYER';
}

function createStateSnapshot(state) {
  return {
    stage: state.stage.map((row) => row.map((cell) => ({ ...cell }))),
    player: { ...state.player },
    cleared: state.cleared,
    clearEffect: null,
  };
}

function undo(state) {
  const snapshot = state.history.pop();
  if (!snapshot) return false;

  const restored = JSON.parse(snapshot);
  state.stage = restored.stage;
  state.player = restored.player;
  state.cleared = restored.cleared;
  state.clearEffect = restored.clearEffect ?? null;
  return true;
}

function tryMove(state, dir) {
  const delta = DIR_DELTA[dir];
  if (!delta) return false;

  const { x: px, y: py } = state.player;
  const nx = px + delta.x;
  const ny = py + delta.y;
  const nextCell = state.stage[ny]?.[nx];
  if (!nextCell) return false;

  const nextType = nextCell.type;

  if (nextType === 'WALL') return false;

  if (nextType === 'BOX' || nextType === 'BOX_ON_GOAL') {
    const bx = nx + delta.x;
    const by = ny + delta.y;
    const beyondCell = state.stage[by]?.[bx];
    if (!beyondCell) return false;

    const beyondType = beyondCell.type;
    if (beyondType !== 'FLOOR' && beyondType !== 'GOAL') return false;

    state.history.push(JSON.stringify(createStateSnapshot(state)));

    const currentCell = state.stage[py][px];
    currentCell.type = floorTypeUnderPlayer(currentCell.type);
    beyondCell.type = boxTypeOn(beyondType);
    nextCell.type = playerTypeOnBoxCell(nextType);
    state.player = { x: nx, y: ny };
    return true;
  }

  if (nextType === 'FLOOR' || nextType === 'GOAL') {
    state.history.push(JSON.stringify(createStateSnapshot(state)));

    const currentCell = state.stage[py][px];
    currentCell.type = floorTypeUnderPlayer(currentCell.type);
    nextCell.type = playerTypeOn(nextType);
    state.player = { x: nx, y: ny };
    return true;
  }

  return false;
}

function checkClear(state) {
  let looseBoxes = 0;
  let boxesOnGoal = 0;

  for (const row of state.stage) {
    for (const cell of row) {
      if (cell.type === 'BOX') looseBoxes++;
      if (cell.type === 'BOX_ON_GOAL') boxesOnGoal++;
    }
  }

  return looseBoxes === 0 && boxesOnGoal > 0;
}

const CLEAR_EFFECT_DURATION = 1500;

function beginStageClear(state) {
  state.cleared = true;
  state.clearEffect = {
    startTime: performance.now(),
    particles: null,
  };
}

function getClearEffectProgress(clearEffect) {
  if (!clearEffect) return 0;
  return Math.min(
    (performance.now() - clearEffect.startTime) / CLEAR_EFFECT_DURATION,
    1
  );
}
