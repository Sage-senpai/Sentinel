/**
 * SENTINEL — Notification Sound System
 *
 * Synthesized sounds using Web Audio API. No external files needed.
 * Each sound type has a unique tone signature. Users can customize
 * volume, enable/disable per type, or mute all.
 */

type SoundType =
  | 'cascade'       // Urgent alarm — descending tones
  | 'whale'         // Sonar ping — deep pulse
  | 'guard'         // Shield activation — rising tone
  | 'alert'         // General alert — double beep
  | 'success'       // Positive — ascending arpeggio
  | 'connect'       // Wallet connected — bright chord
  | 'disconnect';   // Wallet disconnected — falling tone

interface SoundConfig {
  enabled: boolean;
  volume: number; // 0-1
}

type SoundPreferences = Record<SoundType, SoundConfig>;

const DEFAULT_PREFS: SoundPreferences = {
  cascade:    { enabled: true, volume: 0.8 },
  whale:      { enabled: true, volume: 0.5 },
  guard:      { enabled: true, volume: 0.7 },
  alert:      { enabled: true, volume: 0.6 },
  success:    { enabled: true, volume: 0.4 },
  connect:    { enabled: true, volume: 0.3 },
  disconnect: { enabled: true, volume: 0.3 },
};

const STORAGE_KEY = 'sentinel-sound-prefs';

let audioCtx: AudioContext | null = null;
let masterMuted = false;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function getPrefs(): SoundPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return DEFAULT_PREFS;
}

function savePrefs(prefs: Partial<SoundPreferences>) {
  if (typeof window === 'undefined') return;
  const current = getPrefs();
  const merged = { ...current, ...prefs };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

// ── Sound Synthesizers ──────────────────────────────────────

function playCascade(vol: number) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(vol * 0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

  // Three descending urgent tones
  [880, 660, 440].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now + i * 0.15);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol * 0.4, now + i * 0.15);
    g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.3);
  });
}

function playWhale(vol: number) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Deep sonar ping
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.6);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.8);

  // Harmonic overtone
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(360, now + 0.05);
  osc2.frequency.exponentialRampToValueAtTime(240, now + 0.5);
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(vol * 0.15, now + 0.05);
  g2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  osc2.connect(g2);
  g2.connect(ctx.destination);
  osc2.start(now + 0.05);
  osc2.stop(now + 0.5);
}

function playGuard(vol: number) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Rising shield tone
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.5);
}

function playAlert(vol: number) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Double beep
  [0, 0.2].forEach((delay) => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now + delay);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.2, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 0.12);
  });
}

function playSuccess(vol: number) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Ascending arpeggio
  [523, 659, 784].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.1);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.3, now + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.25);
  });
}

function playConnect(vol: number) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Bright two-tone chord
  [440, 554, 659].forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  });
}

function playDisconnect(vol: number) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Falling tone
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.5);
}

const SOUND_MAP: Record<SoundType, (vol: number) => void> = {
  cascade: playCascade,
  whale: playWhale,
  guard: playGuard,
  alert: playAlert,
  success: playSuccess,
  connect: playConnect,
  disconnect: playDisconnect,
};

// ── Public API ──────────────────────────────────────────────

export function playSound(type: SoundType) {
  if (typeof window === 'undefined') return;
  if (masterMuted) return;

  const prefs = getPrefs();
  const config = prefs[type];
  if (!config?.enabled) return;

  try {
    SOUND_MAP[type](config.volume);
  } catch {
    // AudioContext may not be available
  }
}

export function setMasterMute(muted: boolean) {
  masterMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('sentinel-sound-muted', String(muted));
  }
}

export function isMasterMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('sentinel-sound-muted') === 'true';
}

export function updateSoundPrefs(type: SoundType, config: Partial<SoundConfig>) {
  const prefs = getPrefs();
  prefs[type] = { ...prefs[type], ...config };
  savePrefs(prefs);
}

export function getSoundPrefs(): SoundPreferences {
  return getPrefs();
}

export type { SoundType, SoundConfig, SoundPreferences };
