const BGM_BPM = 100;
const BGM_VOLUME = 0.1;
const SE_VOLUME = 0.15;
const BGM_BARS = 8;
const BEATS_PER_BAR = 4;

const BGM_CHORDS = [
  [261.63, 329.63, 392.0, 329.63],
  [392.0, 493.88, 587.33, 493.88],
  [220.0, 261.63, 329.63, 261.63],
  [174.61, 220.0, 261.63, 220.0],
];

let audioCtx = null;
let bgmPlaying = false;
let bgmLoopTimer = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function play8BitNote(freq, startTime, duration, volume = BGM_VOLUME) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function scheduleBGMPhrase(startTime) {
  const ctx = getAudioContext();
  const beatSec = 60 / BGM_BPM;
  const beatsPerChord = BEATS_PER_BAR * 2;
  const totalBeats = BGM_BARS * BEATS_PER_BAR;

  for (let beat = 0; beat < totalBeats; beat++) {
    const chordIndex = Math.floor(beat / beatsPerChord) % BGM_CHORDS.length;
    const notes = BGM_CHORDS[chordIndex];
    const freq = notes[beat % notes.length];
    const time = startTime + beat * beatSec;
    play8BitNote(freq, time, beatSec * 0.85);

    const bassFreq = notes[0] / 2;
    play8BitNote(bassFreq, time, beatSec * 0.85, BGM_VOLUME * 0.5);
  }

  return startTime + totalBeats * beatSec;
}

function scheduleBGMLoop() {
  if (!bgmPlaying) return;

  const ctx = getAudioContext();
  const startTime = ctx.currentTime + 0.05;
  const endTime = scheduleBGMPhrase(startTime);
  const delayMs = Math.max(0, (endTime - ctx.currentTime) * 1000);

  bgmLoopTimer = setTimeout(scheduleBGMLoop, delayMs);
}

function stopBGM() {
  bgmPlaying = false;
  if (bgmLoopTimer) {
    clearTimeout(bgmLoopTimer);
    bgmLoopTimer = null;
  }
}

async function playBGM() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  stopBGM();
  bgmPlaying = true;
  scheduleBGMLoop();
}

function playSETone(freq, duration, volume, type, delay) {
  const ctx = getAudioContext();
  const startTime = ctx.currentTime + (delay || 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type || 'square';
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function playSE(name) {
  if (typeof getSettings === 'function' && !getSettings().se) return;

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  switch (name) {
    case 'move':
      playSETone(880, 0.04, SE_VOLUME);
      break;
    case 'push':
      playSETone(110, 0.12, SE_VOLUME * 1.2);
      break;
    case 'goal':
      playSETone(1174.66, 0.08, SE_VOLUME);
      playSETone(1567.98, 0.1, SE_VOLUME * 0.85, 'square', 0.06);
      break;
    case 'clear':
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        playSETone(freq, 0.14, SE_VOLUME, 'square', i * 0.12);
      });
      break;
    case 'error':
      playSETone(220, 0.06, SE_VOLUME);
      playSETone(165, 0.08, SE_VOLUME, 'square', 0.05);
      break;
    case 'undo':
      playSETone(620, 0.05, SE_VOLUME * 0.7, 'triangle');
      break;
    default:
      break;
  }
}
