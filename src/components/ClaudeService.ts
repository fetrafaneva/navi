interface Message {
  role: "user" | "assistant";
  content: string;
}

const history: Message[] = [];

export async function askClaude(
  userMessage: string,
  onThinking?: () => void,
  onAnswer?: (reply: string) => void
): Promise<string> {
  onThinking?.();
  history.push({ role: "user", content: userMessage });

  const result = await (window as any).navi.claudeAsk(
    history,
    "L'utilisateur utilise Windows 10"
  );

  if (!result.success) {
    const err = `Erreur : ${result.error} 😅`;
    history.pop();
    onAnswer?.(err);
    return err;
  }

  history.push({ role: "assistant", content: result.reply });
  if (history.length > 10) history.splice(0, 2);

  onAnswer?.(result.reply);
  return result.reply;
}

export function clearHistory(): void {
  history.length = 0;
}
