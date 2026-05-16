const DIFFICULTY_OPTIONS = [
  { id: 'easy', label: '初級' },
  { id: 'medium', label: '中級' },
  { id: 'hard', label: '上級' },
  { id: 'all', label: '全部' },
];

const SETTINGS_ROWS = ['BGM', 'SE', '難易度フィルター'];

function getSettings() {
  return (
    JSON.parse(localStorage.getItem('emoji-soko-settings')) || {
      bgm: true,
      se: true,
      difficultyFilter: 'all',
    }
  );
}

function saveSettings(settings) {
  localStorage.setItem('emoji-soko-settings', JSON.stringify(settings));
}

function getDifficultyLabel(filterId) {
  return DIFFICULTY_OPTIONS.find((o) => o.id === filterId)?.label ?? '全部';
}

function cycleDifficultyFilter(current) {
  const index = DIFFICULTY_OPTIONS.findIndex((o) => o.id === current);
  const next = (index + 1) % DIFFICULTY_OPTIONS.length;
  return DIFFICULTY_OPTIONS[next].id;
}

function isStageInDifficultyFilter(stageNum, filter) {
  if (filter === 'all') return true;
  if (filter === 'easy') return stageNum >= 1 && stageNum <= 20;
  if (filter === 'medium') return stageNum >= 21 && stageNum <= 60;
  if (filter === 'hard') return stageNum >= 61 && stageNum <= 100;
  return true;
}

function getSettingsValue(settings, rowIndex) {
  if (rowIndex === 0) return settings.bgm ? 'ON' : 'OFF';
  if (rowIndex === 1) return settings.se ? 'ON' : 'OFF';
  return getDifficultyLabel(settings.difficultyFilter);
}

function toggleSettingsValue(settings, rowIndex) {
  if (rowIndex === 0) settings.bgm = !settings.bgm;
  else if (rowIndex === 1) settings.se = !settings.se;
  else settings.difficultyFilter = cycleDifficultyFilter(settings.difficultyFilter);
  saveSettings(settings);
}

function drawSettingsScreen(ctx, settings, selectedIndex) {
  const canvas = ctx.canvas;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 40px system-ui, sans-serif';
  ctx.fillText('SETTINGS', canvas.width / 2, 50);

  const startY = 160;
  const lineHeight = 56;

  SETTINGS_ROWS.forEach((label, index) => {
    const y = startY + index * lineHeight;
    const selected = index === selectedIndex;

    ctx.textAlign = 'left';
    ctx.font = selected
      ? 'bold 24px system-ui, sans-serif'
      : '22px system-ui, sans-serif';
    ctx.fillStyle = selected ? '#fff' : '#888';
    ctx.fillText(`${selected ? '▶ ' : '   '}${label}`, 120, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = selected ? '#fff' : '#aaa';
    ctx.fillText(getSettingsValue(settings, index), canvas.width - 120, y);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#666';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('← → で変更　Esc でタイトルに戻る', canvas.width / 2, canvas.height - 40);
}

function registerSettingsInput(getState, callbacks) {
  window.addEventListener('keydown', (event) => {
    if (getState().screen !== 'settings') return;

    if (event.key === 'Escape') {
      event.preventDefault();
      callbacks.onBack();
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
      event.preventDefault();
      callbacks.onUp();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
      event.preventDefault();
      callbacks.onDown();
      return;
    }

    if (
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      callbacks.onToggle();
    }
  });
}
