const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  stage: null,
  player: { x: 0, y: 0 },
  history: [],
  cleared: false,
  currentStage: 1,
  progress: null,
  showStageSelect: false,
  screen: 'title',
  titleMenuIndex: 0,
  settings: null,
  settingsMenuIndex: 0,
  moves: 0,
  playerAnim: null,
  boxShake: null,
  goalStarEffects: [],
};

let transitionTimer = null;

function cancelStageTransition() {
  if (transitionTimer) {
    clearTimeout(transitionTimer);
    transitionTimer = null;
  }
}

function applyStageToState(stage) {
  state.stage = stage;
  state.player = { x: 0, y: 0 };
  state.history = [];
  state.cleared = false;
  state.clearEffect = null;
  state.moves = 0;
  state.playerAnim = null;
  state.boxShake = null;
  state.goalStarEffects = [];

  for (const row of state.stage) {
    for (const cell of row) {
      if (cell.type === 'PLAYER' || cell.type === 'PLAYER_ON_GOAL') {
        state.player = { x: cell.x, y: cell.y };
      }
    }
  }
}

async function init() {
  state.progress = getProgress();
  state.settings = getSettings();
  state.currentStage = state.progress.currentStage;
  state.screen = 'title';
  state.titleMenuIndex = 0;
  state.settingsMenuIndex = 0;
}

async function startGame(fromContinue) {
  state.screen = 'game';
  state.showStageSelect = false;
  cancelStageTransition();

  if (fromContinue) {
    state.currentStage = state.progress.currentStage;
  } else {
    state.currentStage = 1;
    state.progress.currentStage = 1;
    saveProgress(state.progress);
  }

  applyStageToState(await loadStage(state.currentStage));

  if (!fromContinue && state.settings.bgm) {
    playBGM();
  }

  render();
}

function handleTitleConfirm() {
  const choice = TITLE_MENU[state.titleMenuIndex];

  if (choice === 'PLAY') {
    startGame(false);
    return;
  }

  if (choice === 'CONTINUE') {
    startGame(true);
    return;
  }

  if (choice === 'STAGE SELECT') {
    state.screen = 'game';
    state.showStageSelect = true;
    state.stage = null;
    cancelStageTransition();
    render();
    return;
  }

  if (choice === 'HELP') {
    state.screen = 'help';
    render();
    return;
  }

  if (choice === 'SETTINGS') {
    state.screen = 'settings';
    state.settingsMenuIndex = 0;
    render();
  }
}

function goToTitle() {
  state.screen = 'title';
  state.showStageSelect = false;
  state.cleared = false;
  state.clearEffect = null;
  cancelStageTransition();
  render();
}

function showEnding() {
  state.screen = 'ending';
  state.cleared = false;
  state.clearEffect = null;
  state.stage = null;
  cancelStageTransition();
  render();
}

async function goToNextStage() {
  const nextStage = state.currentStage + 1;
  if (!(await stageExists(nextStage))) {
    return;
  }

  state.currentStage = nextStage;
  state.progress.currentStage = nextStage;
  saveProgress(state.progress);
  applyStageToState(await loadStage(nextStage));
  render();
}

function onStageClear() {
  const stageKey = String(state.currentStage);
  const prevBest = state.progress.bestMoves[stageKey];
  const isNewBest = prevBest === undefined || state.moves < prevBest;

  beginStageClear(state, { isNewBest });

  if (!state.progress.cleared.includes(state.currentStage)) {
    state.progress.cleared.push(state.currentStage);
  }

  if (isNewBest) {
    state.progress.bestMoves[stageKey] = state.moves;
  }

  state.progress.totalClearMoves =
    (state.progress.totalClearMoves ?? 0) + state.moves;

  saveProgress(state.progress);

  cancelStageTransition();
  transitionTimer = setTimeout(async () => {
    if (!state.cleared) return;
    if (isAllStagesCleared(state.progress)) {
      showEnding();
      return;
    }
    await goToNextStage();
  }, 2000);
}

async function selectStage(num) {
  state.currentStage = num;
  state.progress.currentStage = num;
  saveProgress(state.progress);
  cancelStageTransition();
  applyStageToState(await loadStage(num));
  state.showStageSelect = false;
  render();
}

function toggleStageSelect() {
  state.showStageSelect = !state.showStageSelect;
  if (state.showStageSelect) {
    cancelStageTransition();
  }
  render();
}

async function resetStage() {
  cancelStageTransition();
  applyStageToState(await loadStage(state.currentStage));
  render();
}

function render() {
  if (state.screen === 'title') {
    drawTitleScreen(ctx, state.titleMenuIndex, state.progress);
    return;
  }

  if (state.screen === 'help') {
    drawHelpScreen(ctx);
    return;
  }

  if (state.screen === 'settings') {
    drawSettingsScreen(ctx, state.settings, state.settingsMenuIndex);
    return;
  }

  if (state.screen === 'ending') {
    drawEndingScreen(ctx, state.progress);
    return;
  }

  if (state.showStageSelect) {
    drawStageSelect(ctx, state.progress, state.settings.difficultyFilter);
    return;
  }

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state.stage) {
    if (state.playerAnim && !isPlayerAnimating(state.playerAnim)) {
      state.playerAnim = null;
    }
    if (state.boxShake && !isBoxShaking(state.boxShake)) {
      state.boxShake = null;
    }
    state.goalStarEffects = state.goalStarEffects.filter(isGoalStarEffectActive);
    renderStage(ctx, state.stage, state.player, state.playerAnim, state.boxShake);
    drawGoalStarEffects(ctx, state.goalStarEffects);
    drawMoveHud(ctx, state.currentStage, state.moves, state.progress.bestMoves);
  }

  if (state.clearEffect) {
    drawClearEffect(ctx, state.clearEffect);
  }
}

function gameLoop() {
  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('load', async () => {
  await init();
  registerStageSelectInput(canvas, () => state, selectStage);
  registerHelpInput(() => state, goToTitle);
  registerEndingInput(() => state, goToTitle);
  registerSettingsInput(() => state, {
    onUp() {
      state.settingsMenuIndex =
        (state.settingsMenuIndex - 1 + SETTINGS_ROWS.length) %
        SETTINGS_ROWS.length;
      render();
    },
    onDown() {
      state.settingsMenuIndex =
        (state.settingsMenuIndex + 1) % SETTINGS_ROWS.length;
      render();
    },
    onToggle() {
      toggleSettingsValue(state.settings, state.settingsMenuIndex);
      render();
    },
    onAdjust(delta) {
      adjustSettingsValue(state.settings, state.settingsMenuIndex, delta);
      render();
    },
    onBack: goToTitle,
  });
  registerSettingsPointerInput(canvas, () => state, render);
  registerTitleInput(() => state, {
    onUp() {
      state.titleMenuIndex =
        (state.titleMenuIndex - 1 + TITLE_MENU.length) % TITLE_MENU.length;
      render();
    },
    onDown() {
      state.titleMenuIndex = (state.titleMenuIndex + 1) % TITLE_MENU.length;
      render();
    },
    onConfirm: handleTitleConfirm,
  });
  registerInput(
    (dir) => {
      if (state.screen !== 'game' || state.showStageSelect || state.cleared) return;
      if (isPlayerAnimating(state.playerAnim)) return;

      const fromX = state.player.x;
      const fromY = state.player.y;
      const result = tryMove(state, dir);
      if (result) {
        state.playerAnim = createPlayerAnim(
          fromX,
          fromY,
          state.player.x,
          state.player.y
        );
        if (result === 'push') {
          const delta = DIR_DELTA[dir];
          const boxX = state.player.x + delta.x;
          const boxY = state.player.y + delta.y;
          state.boxShake = createBoxShake(boxX, boxY, dir);
          if (state.stage[boxY][boxX].type === 'BOX_ON_GOAL') {
            state.goalStarEffects.push(
              createGoalStarEffect(
                boxX,
                boxY,
                state.stage[0].length,
                state.stage.length,
                canvas
              )
            );
          }
        }
        state.moves++;
        if (checkClear(state)) {
          onStageClear();
        }
      }
    },
    () => {
      if (state.screen !== 'game' || state.showStageSelect || state.cleared) return false;
      if (isPlayerAnimating(state.playerAnim)) return false;
      if (undo(state)) {
        state.playerAnim = null;
        state.boxShake = null;
        state.goalStarEffects = [];
        render();
        return true;
      }
      return false;
    },
    () => {
      if (state.screen !== 'game' || state.showStageSelect || state.cleared) return;
      if (isPlayerAnimating(state.playerAnim)) return;
      resetStage();
    },
    () => {
      if (state.screen !== 'game') return;
      if (isPlayerAnimating(state.playerAnim)) return;
      toggleStageSelect();
    }
  );
  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (state.screen === 'game') {
      event.preventDefault();
      goToTitle();
    }
  });
  gameLoop();
});
