export async function speak(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  console.log("[VoiceService] speak() appelé ✅");

  try {
    onStart?.();

    const result = await (window as any).navi.ttsSpeak(text);

    if (!result.success) {
      console.warn("[VoiceService] TTS erreur :", result.error);
      return; // on stop la voix MAIS pas l'app
    }

    const audio = new Audio(`data:audio/mpeg;base64,${result.audio}`);
    audio.volume = 1.0;

    await audio.play();

    await new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      audio.onerror = () => resolve(); // ⚠️ ne jamais reject
    });
  } catch (error) {
    console.error("[VoiceService] erreur :", error);
  } finally {
    onEnd?.();
  }
}

export function estimateSpeakDuration(text: string): number {
  return Math.max(text.trim().split(/\s+/).length * (60 / 130) * 1000, 800);
}
