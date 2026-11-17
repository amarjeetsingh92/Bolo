// Rock-solid Web Speech API helper for child pronunciation
// Overcomes Chrome/Edge cancel race conditions and voice loading latency

let cachedVoices = [];

function initVoices() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }
}

initVoices();

/**
 * Pronounces a word or phrase clearly.
 * @param {string} text - The word to speak
 * @param {object} options - Optional callbacks & rate
 */
export function speakWord(text, options = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (options.onEnd) options.onEnd();
    return;
  }

  // Strip anything in parentheses like "(Sukhasana)" or notes for clean speech
  const cleanText = text.replace(/\(.*?\)/g, "").trim();

  // If paused, resume
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  // Cancel prior utterance
  window.speechSynthesis.cancel();

  // 40ms timeout ensures previous cancel is cleared in Chromium without cancelling the new utterance
  setTimeout(() => {
    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = options.rate !== undefined ? options.rate : 0.88;
      utterance.pitch = options.pitch !== undefined ? options.pitch : 1.05;
      utterance.volume = 1.0;
      utterance.lang = "en-US";

      // Select natural English voice if available
      const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferred = voices.find(
          (v) =>
            (v.name.includes("Natural") ||
              v.name.includes("Google") ||
              v.name.includes("Samantha") ||
              v.name.includes("Jenny")) &&
            v.lang.startsWith("en")
        ) || voices.find((v) => v.lang.startsWith("en")) || voices[0];

        if (preferred) {
          utterance.voice = preferred;
          utterance.lang = preferred.lang;
        }
      }

      if (options.onStart) {
        utterance.onstart = options.onStart;
      }

      utterance.onend = () => {
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (e) => {
        console.warn("Speech notice:", e);
        if (options.onEnd) options.onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech error:", e);
      if (options.onEnd) options.onEnd();
    }
  }, 40);
}

export function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
