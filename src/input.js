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

function registerInput(onMove) {
  window.addEventListener('keydown', (event) => {
    const dir = keyMap[event.key];
    if (!dir) return;

    event.preventDefault();
    onMove(dir);
  });
}
