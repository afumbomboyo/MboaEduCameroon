/**
 * Speech Synthesis Helper for "Read with Me" interactive question reading
 * and Scholar Avatar voice speech across the Cameroon Quest Map.
 */

export interface ReadQuestionOptions {
  prompt: string;
  contextText?: string;
  options?: string[];
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export interface SpeakAvatarOptions {
  rate?: number;
  pitch?: number;
  gender?: 'male' | 'female';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let isCurrentlySpeaking = false;
let currentSpokenText = '';
const listeners = new Set<(speaking: boolean, text?: string) => void>();

export function isSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window
  );
}

export function isReading(): boolean {
  return isCurrentlySpeaking;
}

export function isSpeaking(): boolean {
  return isCurrentlySpeaking;
}

export function getCurrentSpokenText(): string {
  return currentSpokenText;
}

export function subscribeToReadingState(
  callback: (reading: boolean, text?: string) => void
) {
  listeners.add(callback);
  callback(isCurrentlySpeaking, currentSpokenText);
  return () => {
    listeners.delete(callback);
  };
}

export function subscribeToSpeechState(
  callback: (speaking: boolean, text?: string) => void
) {
  return subscribeToReadingState(callback);
}

function notifyListeners(speaking: boolean, text: string = '') {
  isCurrentlySpeaking = speaking;
  currentSpokenText = speaking ? text : '';
  listeners.forEach((cb) => cb(speaking, currentSpokenText));
}

export function stopReading() {
  stopSpeech();
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
  activeUtterance = null;
  notifyListeners(false, '');
}

function getBestEnglishVoice(gender?: 'male' | 'female'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const enVoices = voices.filter((v) => v.lang.startsWith('en'));
  const candidatePool = enVoices.length > 0 ? enVoices : voices;

  if (gender === 'female') {
    const femaleVoice = candidatePool.find(
      (v) =>
        v.name.includes('Female') ||
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Karen') ||
        v.name.includes('Zira') ||
        v.name.includes('Jenny') ||
        v.name.includes('Sonia') ||
        v.name.includes('Google UK English Female') ||
        v.name.includes('en-US-Standard-C') ||
        v.name.includes('en-US-Standard-E')
    );
    if (femaleVoice) return femaleVoice;
  } else if (gender === 'male') {
    const maleVoice = candidatePool.find(
      (v) =>
        v.name.includes('Male') ||
        v.name.includes('Daniel') ||
        v.name.includes('David') ||
        v.name.includes('Arthur') ||
        v.name.includes('George') ||
        v.name.includes('Oliver') ||
        v.name.includes('Guy') ||
        v.name.includes('Google UK English Male') ||
        v.name.includes('en-US-Standard-B') ||
        v.name.includes('en-US-Standard-D')
    );
    if (maleVoice) return maleVoice;
  }

  // Fallback to warm English voice
  return (
    candidatePool.find(
      (v) =>
        v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Samantha')
    ) ||
    candidatePool[0] ||
    null
  );
}

/**
 * Avatar talks directly to the student pupil!
 */
export function speakAvatarText(
  text: string,
  options?: SpeakAvatarOptions
) {
  if (!isSpeechSupported()) {
    options?.onError?.('Speech synthesis is not supported on this browser.');
    options?.onEnd?.();
    return;
  }

  // Cancel any previous speech
  stopSpeech();

  const cleanText = text.trim();
  if (!cleanText) {
    options?.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  activeUtterance = utterance;

  // Natural articulation for primary school pupils (comfortable, calm reading speed)
  utterance.rate = options?.rate ?? 0.85;

  // Set gender-appropriate default pitch
  if (options?.pitch !== undefined) {
    utterance.pitch = options.pitch;
  } else if (options?.gender === 'female') {
    utterance.pitch = 1.14;
  } else if (options?.gender === 'male') {
    utterance.pitch = 0.93;
  } else {
    utterance.pitch = 1.05;
  }

  const voice = getBestEnglishVoice(options?.gender);
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onstart = () => {
    notifyListeners(true, cleanText);
    options?.onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    notifyListeners(false, '');
    options?.onEnd?.();
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    notifyListeners(false, '');
    if (e.error !== 'interrupted' && e.error !== 'canceled') {
      options?.onError?.(e);
    }
    options?.onEnd?.();
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    notifyListeners(false, '');
    options?.onError?.(err);
    options?.onEnd?.();
  }
}

export function readQuestionWithMe({
  prompt,
  contextText,
  options,
  onStart,
  onEnd,
  onError,
}: ReadQuestionOptions) {
  if (!isSpeechSupported()) {
    onError?.('Speech synthesis is not supported on this browser.');
    return;
  }

  // Cancel any ongoing speech
  stopSpeech();

  // Build the script according to user specifications with gentle pauses:
  // 1. "Read with me"
  // 2. Question passage / prompt
  // 3. Multiple choice options
  // 4. "Hope you read with me, that was great"
  const parts: string[] = [];

  parts.push('Read with me:');

  if (contextText && contextText.trim()) {
    parts.push(contextText.trim() + '.');
  }

  parts.push(prompt.trim() + '.');

  if (options && options.length > 0) {
    options.forEach((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      parts.push(`Option ${letter}: ${opt}.`);
    });
  }

  parts.push('Hope you read with me, that was great!');

  const fullText = parts.join(' ');

  // Reduced, friendly reading pace (0.78) so children can easily follow along
  speakAvatarText(fullText, {
    rate: 0.78,
    pitch: 1.05,
    onStart,
    onEnd,
    onError,
  });
}

