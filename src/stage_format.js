const STAGE_CELL = {
  FLOOR: '.',
  WALL: '#',
  GOAL: '*',
  BOX: '$',
  PLAYER: '@',
  BOX_ON_GOAL: 'B',
  PLAYER_ON_GOAL: 'P',
};

const EMOJI_MAP = {
  FLOOR: null,
  WALL: '🟫',
  GOAL: '⭐',
  BOX: '📦',
  PLAYER: '🧑',
  BOX_ON_GOAL: '🎁',
  PLAYER_ON_GOAL: '🧑‍⭐',
};

const CHAR_TO_TYPE = Object.fromEntries(
  Object.entries(STAGE_CELL).map(([type, ch]) => [ch, type])
);

function parseStage(text) {
  const lines = text.trim().split('\n');
  return lines.map((line, y) =>
    [...line].map((ch, x) => {
      // 半角空白は FLOOR として扱う (Sokoban 伝統記法との互換、UNKNOWN化を防ぐ)
      if (ch === ' ') {
        return { type: 'FLOOR', x, y };
      }
      return {
        type: CHAR_TO_TYPE[ch] ?? 'UNKNOWN',
        x,
        y,
      };
    })
  );
}
