export async function speak(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  console.log("[VoiceService] speak() appelé ✅ (Web Speech API)");

  return new Promise<void>((resolve) => {
    try {
      if (!("speechSynthesis" in window)) {
        console.warn("[VoiceService] SpeechSynthesis non disponible");
        onStart?.();
        onEnd?.();
        resolve();
        return;
      }

      // Coupe toute synthèse en cours pour éviter les chevauchements
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;

      const voice = pickFrenchVoice();
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        console.warn("[VoiceService] TTS erreur :", event.error);
        onEnd?.();
        resolve(); // ne jamais reject
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("[VoiceService] erreur :", error);
      onEnd?.();
      resolve();
    }
  });
}

/**
 * Sélectionne une voix française si disponible.
 * Certains moteurs (Windows/macOS) exposent plusieurs voix fr-FR ;
 * on privilégie une voix "féminine" si son nom le suggère,
 * sinon la première voix fr-FR trouvée.
 */
function pickFrenchVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const frenchVoices = voices.filter((v) => v.lang.startsWith("fr"));

  if (frenchVoices.length === 0) return undefined;

  const feminineHints = [
    "female",
    "femme",
    "amelie",
    "audrey",
    "julie",
    "marie",
  ];
  const feminine = frenchVoices.find((v) =>
    feminineHints.some((hint) => v.name.toLowerCase().includes(hint))
  );

  return feminine ?? frenchVoices[0];
}

/**
 * Précharge les voix système. À appeler une fois au démarrage de l'app
 * (idéalement dans un useEffect de premier montage) pour que la
 * première synthèse ne subisse pas de délai de chargement.
 */
export function preloadVoices(): Promise<void> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve();
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => resolve();
  });
}

export function estimateSpeakDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;

  return Math.max(words * 400, 2000);
}
