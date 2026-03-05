// ================================
// VoiceService.ts
// Gère la synthèse vocale via ElevenLabs
// ================================

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

// Ces valeurs viennent du processus principal via IPC
// (les .env ne sont pas accessibles directement dans le renderer)
interface VoiceConfig {
  apiKey: string;
  voiceId: string;
}

/**
 * Génère et joue un audio TTS depuis ElevenLabs.
 * Retourne la durée estimée en ms pour synchroniser la bouche.
 */
export async function speak(
  text: string,
  config: VoiceConfig,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  try {
    onStart?.();

    const response = await fetch(`${ELEVENLABS_API_URL}/${config.voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": config.apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2", // Supporte le français
        voice_settings: {
          stability: 0.5, // 0-1 : stabilité de la voix
          similarity_boost: 0.8, // 0-1 : ressemblance au modèle
          style: 0.3, // 0-1 : expressivité
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(
        `ElevenLabs error: ${err.detail?.message || response.statusText}`
      );
    }

    // Convertit la réponse en blob audio
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Joue l'audio
    await playAudio(audioUrl);

    // Libère la mémoire
    URL.revokeObjectURL(audioUrl);
  } catch (error) {
    console.error("[VoiceService] Erreur TTS :", error);
  } finally {
    onEnd?.();
  }
}

/**
 * Joue un fichier audio depuis une URL blob.
 * Retourne une Promise qui se résout quand l'audio se termine.
 */
function playAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);

    audio.onended = () => resolve();
    audio.onerror = (e) => reject(e);

    audio.play().catch(reject);
  });
}

/**
 * Estime la durée de parole en ms (environ 130 mots/minute).
 * Utile pour l'animation de bouche sans analyser l'audio.
 */
export function estimateSpeakDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  const msPerWord = (60 / 130) * 1000; // 130 mots/minute
  return Math.max(words * msPerWord, 800);
}
