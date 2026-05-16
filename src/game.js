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
  state.currentStage = state.progress.currentStage;
  state.screen = 'title';
  state.titleMenuIndex = 0;
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
  }
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
  beginStageClear(state);
  if (!state.progress.cleared.includes(state.currentStage)) {
    state.progress.cleared.push(state.currentStage);
  }
  saveProgress(state.progress);

  cancelStageTransition();
  transitionTimer = setTimeout(async () => {
    if (!state.cleared) return;
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
    drawTitleScreen(ctx, state.titleMenuIndex);
    return;
  }

  if (state.showStageSelect) {
    drawStageSelect(ctx, state.progress);
    return;
  }

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state.stage) {
    renderStage(ctx, state.stage);
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
      if (tryMove(state, dir)) {
        if (checkClear(state)) {
          onStageClear();
        }
        render();
      }
    },
    () => {
      if (state.screen !== 'game' || state.showStageSelect || state.cleared) return;
      if (undo(state)) {
        render();
      }
    },
    () => {
      if (state.screen !== 'game' || state.showStageSelect || state.cleared) return;
      resetStage();
    },
    () => {
      if (state.screen !== 'game') return;
      toggleStageSelect();
    }
  );
  gameLoop();
});
