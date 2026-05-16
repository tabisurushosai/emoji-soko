function getProgress() {
  return (
    JSON.parse(localStorage.getItem('emoji-soko-progress')) || {
      cleared: [],
      currentStage: 1,
      bestMoves: {},
    }
  );
}

function saveProgress(progress) {
  localStorage.setItem('emoji-soko-progress', JSON.stringify(progress));
}
