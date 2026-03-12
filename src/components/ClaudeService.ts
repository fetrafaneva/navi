interface Message {
  role: "user" | "assistant";
  content: string;
}

const history: Message[] = [];

export async function askClaude(userMessage: string): Promise<string> {
  // Détecte si l'utilisateur demande des news
  const newsKeywords = [
    "news",
    "latest",
    "recent",
    "world",
    "happening",
    "today",
    "current events",
  ];
  const isNewsRequest = newsKeywords.some((k) =>
    userMessage.toLowerCase().includes(k)
  );

  let contextExtra = "";

  if (isNewsRequest) {
    const newsResult = await (window as any).navi.fetchNews(userMessage);
    if (newsResult.success) {
      contextExtra = `\n\nHere are the latest headlines:\n${newsResult.headlines}\n\nSummarize them briefly and naturally.`;
    }
  }

  history.push({ role: "user", content: userMessage + contextExtra });

  const result = await (window as any).navi.claudeAsk(
    history,
    "User is on Windows 10"
  );

  if (!result.success) {
    const err = `Error: ${result.error}`;
    history.pop();
    return err;
  }

  history.push({ role: "assistant", content: result.reply });
  if (history.length > 10) history.splice(0, 2);

  return result.reply;
}

export function clearHistory(): void {
  history.length = 0;
}
