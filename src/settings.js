const DIFFICULTY_OPTIONS = [
  { id: 'easy', label: '初級' },
  { id: 'medium', label: '中級' },
  { id: 'hard', label: '上級' },
  { id: 'all', label: '全部' },
];

const SETTINGS_ROWS = ['BGM', 'BGM 音量', 'SE', 'SE 音量', '難易度フィルター'];
const VOLUME_ROW_INDICES = [1, 3];
const VOLUME_STEP = 0.05;
const SETTINGS_START_Y = 140;
const SETTINGS_LINE_HEIGHT = 52;
const SLIDER_X = 360;
const SLIDER_WIDTH = 320;

const SETTINGS_DEFAULTS = {
  bgm: true,
  se: true,
  bgmVolume: 1,
  seVolume: 1,
  difficultyFilter: 'all',
};

function getSettings() {
  const saved = JSON.parse(localStorage.getItem('emoji-soko-settings') || '{}');
  return { ...SETTINGS_DEFAULTS, ...saved };
}

function saveSettings(settings) {
  localStorage.setItem('emoji-soko-settings', JSON.stringify(settings));
}

function clampVolume(value) {
  return Math.min(1, Math.max(0, value));
}

function getVolumeProp(rowIndex) {
  return rowIndex === 1 ? 'bgmVolume' : 'seVolume';
}

function isVolumeRow(rowIndex) {
  return VOLUME_ROW_INDICES.includes(rowIndex);
}

function getSettingsRowY(rowIndex) {
  return SETTINGS_START_Y + rowIndex * SETTINGS_LINE_HEIGHT;
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
  if (rowIndex === 1) return `${Math.round(settings.bgmVolume * 100)}%`;
  if (rowIndex === 2) return settings.se ? 'ON' : 'OFF';
  if (rowIndex === 3) return `${Math.round(settings.seVolume * 100)}%`;
  return getDifficultyLabel(settings.difficultyFilter);
}

function setVolumeFromRow(settings, rowIndex, value) {
  const prop = getVolumeProp(rowIndex);
  settings[prop] = clampVolume(value);
  saveSettings(settings);

  if (prop === 'bgmVolume' && typeof applyBGMVolume === 'function') {
    applyBGMVolume();
  }
  if (prop === 'seVolume' && settings.se && typeof playSE === 'function') {
    playSE('move');
  }
}

function adjustSettingsValue(settings, rowIndex, delta) {
  if (isVolumeRow(rowIndex)) {
    const prop = getVolumeProp(rowIndex);
    setVolumeFromRow(settings, rowIndex, settings[prop] + delta);
    return;
  }

  if (rowIndex === 0) settings.bgm = !settings.bgm;
  else if (rowIndex === 2) settings.se = !settings.se;
  else settings.difficultyFilter = cycleDifficultyFilter(settings.difficultyFilter);

  saveSettings(settings);
}

function toggleSettingsValue(settings, rowIndex) {
  adjustSettingsValue(settings, rowIndex, isVolumeRow(rowIndex) ? VOLUME_STEP : 0);
}

function volumeFromPointerX(x) {
  return clampVolume((x - SLIDER_X) / SLIDER_WIDTH);
}

function drawVolumeSlider(ctx, y, value, selected) {
  const trackY = y - 4;
  const fillWidth = SLIDER_WIDTH * value;
  const thumbX = SLIDER_X + fillWidth;

  ctx.fillStyle = '#333';
  ctx.fillRect(SLIDER_X, trackY, SLIDER_WIDTH, 8);

  ctx.fillStyle = selected ? '#fff' : '#666';
  ctx.fillRect(SLIDER_X, trackY, fillWidth, 8);

  ctx.beginPath();
  ctx.arc(thumbX, y, selected ? 10 : 8, 0, Math.PI * 2);
  ctx.fillStyle = selected ? '#fff' : '#aaa';
  ctx.fill();
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

  SETTINGS_ROWS.forEach((label, index) => {
    const y = getSettingsRowY(index);
    const selected = index === selectedIndex;

    ctx.textAlign = 'left';
    ctx.font = selected
      ? 'bold 22px system-ui, sans-serif'
      : '20px system-ui, sans-serif';
    ctx.fillStyle = selected ? '#fff' : '#888';
    ctx.fillText(`${selected ? '▶ ' : '   '}${label}`, 80, y);

    if (isVolumeRow(index)) {
      drawVolumeSlider(ctx, y, settings[getVolumeProp(index)], selected);
      ctx.textAlign = 'right';
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillStyle = selected ? '#fff' : '#aaa';
      ctx.fillText(getSettingsValue(settings, index), canvas.width - 48, y);
      return;
    }

    ctx.textAlign = 'right';
    ctx.fillStyle = selected ? '#fff' : '#aaa';
    ctx.font = selected
      ? 'bold 22px system-ui, sans-serif'
      : '20px system-ui, sans-serif';
    ctx.fillText(getSettingsValue(settings, index), canvas.width - 80, y);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#666';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText(
    '↑↓ 選択　←→ 変更　スライダーはドラッグ可　Esc で戻る',
    canvas.width / 2,
    canvas.height - 40
  );
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

    const { settings, settingsMenuIndex } = getState();

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (isVolumeRow(settingsMenuIndex)) {
        callbacks.onAdjust(-VOLUME_STEP);
      } else {
        callbacks.onToggle();
      }
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isVolumeRow(settingsMenuIndex)) {
        callbacks.onAdjust(VOLUME_STEP);
      } else {
        callbacks.onToggle();
      }
    }
  });
}

function registerSettingsPointerInput(canvas, getState, onChange) {
  let draggingRow = -1;

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function rowFromY(y) {
    const index = Math.round((y - SETTINGS_START_Y) / SETTINGS_LINE_HEIGHT);
    if (index < 0 || index >= SETTINGS_ROWS.length) return -1;
    if (!isVolumeRow(index)) return -1;
    return index;
  }

  function updateFromEvent(event) {
    if (getState().screen !== 'settings') return;

    const point = canvasPoint(event);
    const row = draggingRow === -1 ? rowFromY(point.y) : draggingRow;
    if (row === -1) return;

    draggingRow = row;
    getState().settingsMenuIndex = row;
    setVolumeFromRow(getState().settings, row, volumeFromPointerX(point.x));
    onChange();
  }

  canvas.addEventListener('mousedown', (event) => {
    if (getState().screen !== 'settings') return;
    const point = canvasPoint(event);
    const row = rowFromY(point.y);
    if (row === -1) return;
    draggingRow = row;
    updateFromEvent(event);
  });

  canvas.addEventListener('mousemove', (event) => {
    if (draggingRow === -1) return;
    updateFromEvent(event);
  });

  window.addEventListener('mouseup', () => {
    draggingRow = -1;
  });
}
