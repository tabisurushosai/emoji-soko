async function loadStage(num) {
  const path = `stages/${String(num).padStart(2, '0')}.txt`;
  const response = await fetch(path);
  const text = await response.text();
  return parseStage(text);
}
