const STAGE_CELL = {
  FLOOR: '.',
  WALL: '#',
  GOAL: '*',
  BOX: '$',
  PLAYER: '@',
  BOX_ON_GOAL: 'B',
  PLAYER_ON_GOAL: 'P',
};

const CHAR_TO_TYPE = Object.fromEntries(
  Object.entries(STAGE_CELL).map(([type, ch]) => [ch, type])
);

function parseStage(text) {
  const lines = text.trim().split('\n');
  return lines.map((line, y) =>
    [...line].map((ch, x) => ({
      type: CHAR_TO_TYPE[ch] ?? 'UNKNOWN',
      x,
      y,
    }))
  );
}
