export async function speak(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  try {
    onStart?.();
    const result = await (window as any).navi.ttsSpeak(text);
    if (!result.success) throw new Error(result.error);

    const audio = new Audio(`data:audio/mpeg;base64,${result.audio}`);
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject();
      audio.play();
    });
  } catch (error) {
    console.error("[VoiceService]", error);
  } finally {
    onEnd?.();
  }
}

export function estimateSpeakDuration(text: string): number {
  return Math.max(text.trim().split(/\s+/).length * (60 / 130) * 1000, 800);
}
