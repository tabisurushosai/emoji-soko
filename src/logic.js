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

  if (nextType === 'BOX' || nextType === 'BOX_ON_GOAL') return false;

  if (nextType === 'FLOOR' || nextType === 'GOAL') {
    const currentCell = state.stage[py][px];
    currentCell.type = floorTypeUnderPlayer(currentCell.type);
    nextCell.type = playerTypeOn(nextType);
    state.player = { x: nx, y: ny };
    return true;
  }

  return false;
}
