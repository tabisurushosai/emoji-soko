const keyMap = {
  ArrowUp: 'up',
  W: 'up',
  I: 'up',
  ArrowDown: 'down',
  S: 'down',
  K: 'down',
  ArrowLeft: 'left',
  A: 'left',
  J: 'left',
  ArrowRight: 'right',
  D: 'right',
  L: 'right',
};

function registerInput(onMove, onUndo, onReset) {
  window.addEventListener('keydown', (event) => {
    if (event.key === 'z' || event.key === 'Z') {
      event.preventDefault();
      onUndo();
      return;
    }

    if (event.key === 'r' || event.key === 'R') {
      event.preventDefault();
      onReset();
      return;
    }

    const dir = keyMap[event.key];
    if (!dir) return;

    event.preventDefault();
    onMove(dir);
  });
}
