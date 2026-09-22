/**
 * Web Audio API synthesizer for tactile game sound effects and chill background music
 */

let audioCtx: AudioContext | null = null;
let bgmGainNode: GainNode | null = null;
let isBgmPlaying = false;
let bgmVolume = 0.28;
let bgmTimer: number | null = null;
let bgmStep = 0;
const bgmListeners = new Set<(playing: boolean) => void>();

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(650, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

export function playHoverSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(520, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(580, ctx.currentTime + 0.04);

  gain.gain.setValueAtTime(0.02, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.04);
}

export function playCorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

    const startTime = ctx.currentTime + idx * 0.08;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.25);
  });
}

export function playIncorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.2);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.22);
}

export function playCoinSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
  osc1.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(1975.53, ctx.currentTime);
  osc2.frequency.setValueAtTime(2637.02, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start();
  osc2.start();
  osc1.stop(ctx.currentTime + 0.35);
  osc2.stop(ctx.currentTime + 0.35);
}

export function playFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [
    { freq: 523.25, time: 0, dur: 0.15 },
    { freq: 659.25, time: 0.12, dur: 0.15 },
    { freq: 783.99, time: 0.24, dur: 0.15 },
    { freq: 1046.5, time: 0.36, dur: 0.4 },
    { freq: 880.0, time: 0.55, dur: 0.15 },
    { freq: 1046.5, time: 0.72, dur: 0.6 },
  ];

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.time);

    const start = ctx.currentTime + n.time;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + n.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + n.dur);
  });
}

export function playFootstepSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140 + Math.random() * 40, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.04);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(350, ctx.currentTime);

  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

export function playWhooshSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(260, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.18);
}

/**
 * Sound effect for zooming into a regional map
 */
export function playZoomInSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  // Deep rising sweep
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(140, t);
  osc1.frequency.exponentialRampToValueAtTime(720, t + 0.32);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, t);
  filter.frequency.exponentialRampToValueAtTime(2400, t + 0.32);

  gain1.gain.setValueAtTime(0.001, t);
  gain1.gain.linearRampToValueAtTime(0.12, t + 0.08);
  gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

  osc1.connect(filter);
  filter.connect(gain1);
  gain1.connect(ctx.destination);

  osc1.start(t);
  osc1.stop(t + 0.35);

  // Sparkle chime on arrival
  const chime = ctx.createOscillator();
  const chimeGain = ctx.createGain();
  chime.type = 'triangle';
  chime.frequency.setValueAtTime(880, t + 0.2);
  chime.frequency.exponentialRampToValueAtTime(1174.66, t + 0.38);

  chimeGain.gain.setValueAtTime(0.001, t + 0.2);
  chimeGain.gain.linearRampToValueAtTime(0.06, t + 0.24);
  chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

  chime.connect(chimeGain);
  chimeGain.connect(ctx.destination);

  chime.start(t + 0.2);
  chime.stop(t + 0.42);
}

/**
 * Sound effect for zooming out of a region back to the whole country
 */
export function playZoomOutSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(760, t);
  osc.frequency.exponentialRampToValueAtTime(160, t + 0.35);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2200, t);
  filter.frequency.exponentialRampToValueAtTime(320, t + 0.35);

  gain.gain.setValueAtTime(0.001, t);
  gain.gain.linearRampToValueAtTime(0.11, t + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 0.38);
}

export function playTaDaSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const chords = [
    { f: 523.25, t: 0, d: 0.12 },
    { f: 659.25, t: 0.08, d: 0.12 },
    { f: 783.99, t: 0.16, d: 0.12 },
    { f: 1046.5, t: 0.24, d: 0.45 },
    { f: 1318.5, t: 0.24, d: 0.45 },
  ];

  chords.forEach((c) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(c.f, ctx.currentTime + c.t);

    const start = ctx.currentTime + c.t;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + c.d);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + c.d);
  });
}

// =========================================================================
// PROCEDURAL BACKGROUND SOUNDSCAPES & MUSIC (5 Exciting & Vibrant Cameroon Themes)
// =========================================================================

export interface BgmTrack {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  category: 'groove' | 'cultural' | 'carnival' | 'epic' | 'afrojam';
}

export const BGM_TRACKS: BgmTrack[] = [
  {
    id: 'makossa_groove',
    name: 'Makossa Party Groove',
    tagline: 'High-energy Douala bassline, funky brass stabs & rhythmic cowbell',
    icon: '🎸',
    category: 'groove',
  },
  {
    id: 'bikutsi_power',
    name: 'Bikutsi Forest Power Beats',
    tagline: 'Galloping 6/8 talking drums, fast balafon riffs & wooden claps',
    icon: '🪘',
    category: 'cultural',
  },
  {
    id: 'douala_fiesta',
    name: 'Douala Market Fiesta',
    tagline: 'Celebration carnival horns, bouncy marimba jam & party whistle',
    icon: '🎺',
    category: 'carnival',
  },
  {
    id: 'lions_triumph',
    name: "Lion's Quest Fanfare",
    tagline: 'Epic RPG adventure theme, heroic brass melodies & marching drums',
    icon: '🦁',
    category: 'epic',
  },
  {
    id: 'kalimba_afrojam',
    name: 'Savanna Kalimba Afro-Jam',
    tagline: 'Upbeat Afro-pop thumb piano hooks, log bass & sunny wooden flute',
    icon: '🪕',
    category: 'afrojam',
  },
];

let activeTrackId = 'makossa_groove';
const trackListeners = new Set<(track: BgmTrack) => void>();

// --- SOUND SYNTHESIS ENGINE FOR VIBRANT PROCEDURAL INSTRUMENTS ---

// 1. Punchy Kick Drum
function playPunchyKick(ctx: AudioContext, destination: AudioNode, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, time);
  osc.frequency.exponentialRampToValueAtTime(42, time + 0.08);

  gain.gain.setValueAtTime(0.24, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc.stop(time + 0.12);
}

// 2. Snappy Rimshot / Snare
function playSnappySnare(ctx: AudioContext, destination: AudioNode, time: number) {
  // Tonal punch
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, time);
  osc.frequency.exponentialRampToValueAtTime(80, time + 0.05);

  oscGain.gain.setValueAtTime(0.12, time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

  osc.connect(oscGain);
  oscGain.connect(destination);
  osc.start(time);
  osc.stop(time + 0.06);

  // Noise snap
  const bufferSize = Math.floor(ctx.sampleRate * 0.07);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1800, time);
  filter.Q.setValueAtTime(1.8, time);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.14, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(destination);

  noise.start(time);
  noise.stop(time + 0.07);
}

// 3. African Cowbell / Agogo
function playAgogoBell(ctx: AudioContext, destination: AudioNode, time: number, isHigh: boolean) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  const freq1 = isHigh ? 840 : 587;
  const freq2 = isHigh ? 1260 : 880;

  osc1.type = 'square';
  osc1.frequency.setValueAtTime(freq1, time);
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq2, time);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(freq1 * 1.2, time);
  filter.Q.setValueAtTime(3.0, time);

  gain.gain.setValueAtTime(0.08, time);
  gain.gain.exponentialRampToValueAtTime(0.0005, time + 0.09);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + 0.09);
  osc2.stop(time + 0.09);
}

// 4. Funky Makossa Bass (punchy & syncopated)
function playMakossaBass(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  time: number,
  duration: number
) {
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, time);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq, time);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1400, time);
  filter.frequency.exponentialRampToValueAtTime(320, time + 0.12);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.18, time + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc2.start(time);
  osc.stop(time + duration);
  osc2.stop(time + duration);
}

// 5. Bright Horn / Brass Stabs ("DA-DA!")
function playBrassStab(
  ctx: AudioContext,
  destination: AudioNode,
  freqs: number[],
  time: number,
  duration = 0.16
) {
  freqs.forEach((f, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f + (idx % 2 === 0 ? 1.5 : -1.5), time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, time);
    filter.frequency.exponentialRampToValueAtTime(700, time + duration);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.09, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0005, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(time);
    osc.stop(time + duration);
  });
}

// 6. Resonant Bikutsi Talking Drums (Djembe tone)
function playBikutsiDrum(
  ctx: AudioContext,
  destination: AudioNode,
  time: number,
  type: 'bass' | 'open' | 'slap'
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (type === 'bass') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.16);

    gain.gain.setValueAtTime(0.22, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
  } else if (type === 'open') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, time);
    osc.frequency.exponentialRampToValueAtTime(160, time + 0.1);

    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
  } else {
    // Sharp slap
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, time);
    osc.frequency.exponentialRampToValueAtTime(180, time + 0.04);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  }

  osc.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc.stop(time + 0.2);
}

// 7. Balafon / Marimba Pluck (Fast wooden xylophone)
function playBalafonPluck(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  time: number
) {
  const osc = ctx.createOscillator();
  const oscHarm = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, time);

  oscHarm.type = 'sine';
  oscHarm.frequency.setValueAtTime(freq * 3, time);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(freq * 1.8, time);
  filter.Q.setValueAtTime(3.2, time);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.11, time + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0005, time + 0.22);

  osc.connect(filter);
  oscHarm.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  osc.start(time);
  oscHarm.start(time);
  osc.stop(time + 0.22);
  oscHarm.stop(time + 0.22);
}

// 8. Carnival Whistle Chirp
function playCarnivalWhistle(ctx: AudioContext, destination: AudioNode, time: number) {
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1900, time);

  lfo.frequency.setValueAtTime(26, time); // rapid vibrato trill
  lfoGain.gain.setValueAtTime(160, time);

  lfo.connect(osc.frequency);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.07, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

  osc.connect(gain);
  gain.connect(destination);

  lfo.start(time);
  osc.start(time);
  lfo.stop(time + 0.16);
  osc.stop(time + 0.16);
}

// 9. Heroic RPG Lead Trumpet
function playHeroicLead(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  time: number,
  dur: number
) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(freq, time);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 1.004, time);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2200, time);
  filter.frequency.linearRampToValueAtTime(1200, time + dur);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.12, time + 0.04);
  gain.gain.setValueAtTime(0.11, time + dur - 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + dur);
  osc2.stop(time + dur);
}

// 10. Orchestral Timpani Boom
function playTimpaniBoom(ctx: AudioContext, destination: AudioNode, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(95, time);
  osc.frequency.exponentialRampToValueAtTime(62, time + 0.28);

  gain.gain.setValueAtTime(0.24, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc.stop(time + 0.45);
}

// 11. Modern Afro-pop Log Drum Sub
function playLogDrumSub(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  time: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq * 1.5, time);
  osc.frequency.exponentialRampToValueAtTime(freq, time + 0.05);

  gain.gain.setValueAtTime(0.26, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc.stop(time + 0.28);
}

// 12. Sunny African Bamboo Flute
function playAfroFlute(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  time: number,
  dur: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);
  // Warm vibrato
  osc.frequency.linearRampToValueAtTime(freq * 1.012, time + dur * 0.5);
  osc.frequency.linearRampToValueAtTime(freq, time + dur);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, time);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.09, time + 0.03);
  gain.gain.setValueAtTime(0.08, time + dur - 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc.stop(time + dur);
}

// 13. Crisp Highpass Shaker
function playCrispShaker(ctx: AudioContext, destination: AudioNode, time: number, isAccent = false) {
  const bufferSize = Math.floor(ctx.sampleRate * 0.035);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(6200, time);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(isAccent ? 0.045 : 0.022, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  noise.start(time);
  noise.stop(time + 0.035);
}

// --- MUSICAL NOTATIONS & CHORD SCALES ---

// C Major / A Minor Pentatonic Roots
const MAKOSSA_BASS_NOTES = [
  65.41, 65.41, 130.81, 98.0, // C2, C2, C3, G2
  87.31, 87.31, 174.61, 130.81, // F2, F2, F3, C3
  98.0, 98.0, 196.0, 146.83, // G2, G2, G3, D3
  110.0, 110.0, 220.0, 164.81, // A2, A2, A3, E3
];

const BRASS_STAB_CHORDS = [
  [523.25, 659.25, 783.99], // C Maj
  [440.0, 554.37, 659.25], // F/A
  [587.33, 739.99, 880.0], // G Maj
  [440.0, 523.25, 659.25], // A Min
];

const BIKUTSI_BALAFON_SCALE = [440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

const HEROIC_THEME_NOTES = [
  523.25, null, 659.25, 783.99, // C5, E5, G5
  1046.5, null, 880.0, 783.99,  // C6, A5, G5
  880.0, null, 1046.5, 1174.66, // A5, C6, D6
  1046.5, null, 783.99, 659.25, // C6, G5, E5
];

const AFROJAM_KALIMBA_HOOK = [
  659.25, null, 783.99, 880.0, null, 783.99, 659.25, 523.25,
  587.33, null, 659.25, 783.99, null, 659.25, 587.33, 440.0,
];

// --- MASTER MUSIC SCHEDULER ---
function scheduleMusicBeat() {
  if (!isBgmPlaying) return;
  const ctx = getAudioContext();
  if (!ctx || !bgmGainNode) return;

  const now = ctx.currentTime;
  const stepIn16 = bgmStep % 16;
  const stepIn32 = bgmStep % 32;

  // 1. MAKOSSA URBAN GROOVE (~118 BPM, 16th-note syncopation)
  if (activeTrackId === 'makossa_groove') {
    const stepDuration = 0.128; // ~117 BPM

    // Four-on-the-floor driving kick
    if (stepIn16 % 4 === 0) {
      playPunchyKick(ctx, bgmGainNode, now);
    }
    // Snappy snare rimshot on backbeats 4 and 12
    if (stepIn16 === 4 || stepIn16 === 12) {
      playSnappySnare(ctx, bgmGainNode, now);
    }
    // High-energy Agogo cowbell syncopation
    if (stepIn16 === 2 || stepIn16 === 5 || stepIn16 === 8 || stepIn16 === 11 || stepIn16 === 14) {
      playAgogoBell(ctx, bgmGainNode, now, stepIn16 === 2 || stepIn16 === 11);
    }
    // Crisp shaker groove
    playCrispShaker(ctx, bgmGainNode, now, stepIn16 % 2 === 0);

    // Syncopated Makossa Bassline
    const bassIdx = Math.floor(stepIn32 / 2) % MAKOSSA_BASS_NOTES.length;
    if (stepIn16 % 2 === 0 || stepIn16 === 3 || stepIn16 === 7 || stepIn16 === 11) {
      const freq = MAKOSSA_BASS_NOTES[bassIdx];
      playMakossaBass(ctx, bgmGainNode, freq, now, stepDuration * 1.5);
    }

    // Funky Brass Stabs on offbeats ("BA-BAM!")
    if (stepIn16 === 3 || stepIn16 === 11) {
      const chord = BRASS_STAB_CHORDS[Math.floor(stepIn32 / 8) % BRASS_STAB_CHORDS.length];
      playBrassStab(ctx, bgmGainNode, chord, now, 0.14);
    }

    bgmStep = (bgmStep + 1) % 32;
    bgmTimer = window.setTimeout(scheduleMusicBeat, stepDuration * 1000);
  }

  // 2. BIKUTSI FOREST POWER BEATS (Fast 6/8 driving African rhythm ~136 BPM)
  else if (activeTrackId === 'bikutsi_power') {
    const stepDuration = 0.11; // fast 6/8 triplet pulse
    const stepIn6 = bgmStep % 6;

    // Resonant Talking Drum pattern
    if (stepIn6 === 0) {
      playBikutsiDrum(ctx, bgmGainNode, now, 'bass');
    } else if (stepIn6 === 2 || stepIn6 === 4) {
      playBikutsiDrum(ctx, bgmGainNode, now, 'open');
    } else if (stepIn6 === 5) {
      playBikutsiDrum(ctx, bgmGainNode, now, 'slap');
    }

    // Wooden slit drum clacks
    if (stepIn6 === 1 || stepIn6 === 3) {
      playAgogoBell(ctx, bgmGainNode, now, false);
    }

    // Rapid Balafon polyrhythm
    const balafonNote = BIKUTSI_BALAFON_SCALE[(bgmStep * 3 + stepIn6) % BIKUTSI_BALAFON_SCALE.length];
    playBalafonPluck(ctx, bgmGainNode, balafonNote, now);

    // Forest birds and shakers
    playCrispShaker(ctx, bgmGainNode, now, stepIn6 === 0);

    bgmStep = (bgmStep + 1) % 48;
    bgmTimer = window.setTimeout(scheduleMusicBeat, stepDuration * 1000);
  }

  // 3. DOUALA MARKET FIESTA (~124 BPM Carnival & Brass)
  else if (activeTrackId === 'douala_fiesta') {
    const stepDuration = 0.122; // ~123 BPM

    // Bouncy carnival kick on beats
    if (stepIn16 % 4 === 0) {
      playPunchyKick(ctx, bgmGainNode, now);
    }
    if (stepIn16 === 4 || stepIn16 === 12) {
      playSnappySnare(ctx, bgmGainNode, now);
    }

    // Continuous tropical shaker
    playCrispShaker(ctx, bgmGainNode, now, stepIn16 % 4 === 2);

    // Bouncy Marimba Arpeggio
    const marimbaFreq = BIKUTSI_BALAFON_SCALE[(stepIn16 * 2) % BIKUTSI_BALAFON_SCALE.length];
    if (stepIn16 % 2 === 0) {
      playBalafonPluck(ctx, bgmGainNode, marimbaFreq, now);
    }

    // Upbeat Trumpet Horn Melody
    if (stepIn16 === 0 || stepIn16 === 6 || stepIn16 === 10) {
      const hornNotes = [523.25, 659.25, 783.99, 880.0];
      const note = hornNotes[Math.floor(stepIn32 / 4) % hornNotes.length];
      playBrassStab(ctx, bgmGainNode, [note, note * 1.25], now, 0.22);
    }

    // Playful carnival whistle every 32 steps!
    if (stepIn32 === 28) {
      playCarnivalWhistle(ctx, bgmGainNode, now);
    }

    bgmStep = (bgmStep + 1) % 32;
    bgmTimer = window.setTimeout(scheduleMusicBeat, stepDuration * 1000);
  }

  // 4. LION'S QUEST FANFARE (~106 BPM Epic Adventure Fanfare)
  else if (activeTrackId === 'lions_triumph') {
    const stepDuration = 0.142; // ~106 BPM heroic cadence

    // Timpani impacts on measure 1 and 3
    if (stepIn16 === 0) {
      playTimpaniBoom(ctx, bgmGainNode, now);
    }

    // Marching snare rolls building excitement
    if (stepIn16 === 6 || stepIn16 === 7 || stepIn16 === 14 || stepIn16 === 15) {
      playSnappySnare(ctx, bgmGainNode, now);
    } else if (stepIn16 % 4 === 0) {
      playPunchyKick(ctx, bgmGainNode, now);
    }

    // Heroic French Horn & Trumpet Lead Melody
    const leadNote = HEROIC_THEME_NOTES[stepIn16];
    if (leadNote) {
      playHeroicLead(ctx, bgmGainNode, leadNote, now, stepDuration * 1.8);
    }

    // Grand brass backing chords on strong beats
    if (stepIn16 === 0 || stepIn16 === 8) {
      const chord = BRASS_STAB_CHORDS[Math.floor(stepIn32 / 8) % BRASS_STAB_CHORDS.length];
      playBrassStab(ctx, bgmGainNode, chord, now, 0.45);
    }

    bgmStep = (bgmStep + 1) % 32;
    bgmTimer = window.setTimeout(scheduleMusicBeat, stepDuration * 1000);
  }

  // 5. SAVANNA KALIMBA AFRO-JAM (~110 BPM Modern Afro-Pop / Amapiano)
  else if (activeTrackId === 'kalimba_afrojam') {
    const stepDuration = 0.136; // ~110 BPM groove

    // Deep resonant Log Bass Drop on syncopated beats
    if (stepIn16 === 0 || stepIn16 === 6 || stepIn16 === 10) {
      const subFreq = stepIn32 < 16 ? 48 : 55;
      playLogDrumSub(ctx, bgmGainNode, subFreq, now);
    }

    // Punchy kick on 0 and 8
    if (stepIn16 === 0 || stepIn16 === 8) {
      playPunchyKick(ctx, bgmGainNode, now);
    }

    // Crisp high-hat / shaker swing
    playCrispShaker(ctx, bgmGainNode, now, stepIn16 % 2 === 1);

    // Sparkling Kalimba hook
    const kalimbaNote = AFROJAM_KALIMBA_HOOK[stepIn16];
    if (kalimbaNote) {
      playBalafonPluck(ctx, bgmGainNode, kalimbaNote, now);
    }

    // Warm bamboo flute runs
    if (stepIn16 === 4 || stepIn16 === 12) {
      playAfroFlute(ctx, bgmGainNode, 587.33, now, stepDuration * 2);
    }

    bgmStep = (bgmStep + 1) % 32;
    bgmTimer = window.setTimeout(scheduleMusicBeat, stepDuration * 1000);
  }
}

export function startBackgroundMusic() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (isBgmPlaying) return;

  if (!bgmGainNode) {
    bgmGainNode = ctx.createGain();
    bgmGainNode.gain.setValueAtTime(bgmVolume, ctx.currentTime);
    bgmGainNode.connect(ctx.destination);
  } else {
    bgmGainNode.gain.cancelScheduledValues(ctx.currentTime);
    bgmGainNode.gain.linearRampToValueAtTime(bgmVolume, ctx.currentTime + 0.5);
  }

  isBgmPlaying = true;
  bgmStep = 0;
  scheduleMusicBeat();
  notifyBgmListeners();
}

export function stopBackgroundMusic() {
  if (!isBgmPlaying) return;
  const ctx = getAudioContext();
  if (ctx && bgmGainNode) {
    bgmGainNode.gain.cancelScheduledValues(ctx.currentTime);
    bgmGainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  }

  if (bgmTimer) {
    clearTimeout(bgmTimer);
    bgmTimer = null;
  }

  isBgmPlaying = false;
  notifyBgmListeners();
}

export function toggleBackgroundMusic(): boolean {
  if (isBgmPlaying) {
    stopBackgroundMusic();
    return false;
  } else {
    startBackgroundMusic();
    return true;
  }
}

export function getIsMusicPlaying(): boolean {
  return isBgmPlaying;
}

export function setMusicVolume(vol: number) {
  bgmVolume = Math.max(0, Math.min(1, vol));
  const ctx = getAudioContext();
  if (ctx && bgmGainNode) {
    bgmGainNode.gain.cancelScheduledValues(ctx.currentTime);
    bgmGainNode.gain.setValueAtTime(bgmVolume, ctx.currentTime);
  }
}

export function getMusicVolume(): number {
  return bgmVolume;
}

export function getCurrentBgmTrack(): BgmTrack {
  return BGM_TRACKS.find((t) => t.id === activeTrackId) || BGM_TRACKS[0];
}

export function getBgmTracks(): BgmTrack[] {
  return BGM_TRACKS;
}

export function switchBgmTrack(trackId: string): BgmTrack {
  const found = BGM_TRACKS.find((t) => t.id === trackId);
  if (found) {
    activeTrackId = found.id;
    bgmStep = 0;
    if (bgmTimer) {
      clearTimeout(bgmTimer);
      bgmTimer = null;
    }
    if (isBgmPlaying) {
      scheduleMusicBeat();
    }
    trackListeners.forEach((cb) => cb(found));
    return found;
  }
  return getCurrentBgmTrack();
}

export function nextBgmTrack(): BgmTrack {
  const currentIndex = BGM_TRACKS.findIndex((t) => t.id === activeTrackId);
  const nextIndex = (currentIndex + 1) % BGM_TRACKS.length;
  return switchBgmTrack(BGM_TRACKS[nextIndex].id);
}

export function prevBgmTrack(): BgmTrack {
  const currentIndex = BGM_TRACKS.findIndex((t) => t.id === activeTrackId);
  const prevIndex = (currentIndex - 1 + BGM_TRACKS.length) % BGM_TRACKS.length;
  return switchBgmTrack(BGM_TRACKS[prevIndex].id);
}

export function subscribeToBgmTrack(callback: (track: BgmTrack) => void) {
  trackListeners.add(callback);
  callback(getCurrentBgmTrack());
  return () => {
    trackListeners.delete(callback);
  };
}

export function subscribeToMusicState(callback: (playing: boolean) => void) {
  bgmListeners.add(callback);
  callback(isBgmPlaying);
  return () => {
    bgmListeners.delete(callback);
  };
}

function notifyBgmListeners() {
  bgmListeners.forEach((cb) => cb(isBgmPlaying));
}

