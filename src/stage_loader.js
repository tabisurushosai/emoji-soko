async function stageExists(num) {
  const path = `stages/${String(num).padStart(2, '0')}.txt`;
  const response = await fetch(path);
  return response.ok;
}

async function loadStage(num) {
  const path = `stages/${String(num).padStart(2, '0')}.txt`;
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Stage ${num} not found`);
  }
  const text = await response.text();
  return parseStage(text);
}
