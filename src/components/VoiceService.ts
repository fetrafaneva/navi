export async function speak(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  console.log("[VoiceService] speak() appelé avec :", text); // 🆕
  try {
    onStart?.();
    const result = await (window as any).navi.ttsSpeak(text);
    console.log("[VoiceService] résultat :", result.success); // 🆕

    if (!result.success) throw new Error(result.error);

    const audio = new Audio(`data:audio/mpeg;base64,${result.audio}`);
    audio.volume = 1.0;
    const playResult = await audio.play(); // 🆕 await direct
    console.log("[VoiceService] play() :", playResult); // 🆕

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject();
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
