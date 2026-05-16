const BGM_BPM = 100;
const BGM_VOLUME = 0.1;
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
