export function cleanSpeechText(text: string): string {
  return text
    .replace(/[^\p{L}\p{N}\s.,?!'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speakText(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(cleanSpeechText(text));
  utter.rate = 1.05;
  if (onEnd) utter.onend = onEnd;
  window.speechSynthesis.speak(utter);
}
