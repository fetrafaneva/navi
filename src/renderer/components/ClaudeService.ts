// ================================
// ClaudeService.ts
// Gère la communication avec Claude API
// ================================

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

interface ClaudeConfig {
  apiKey: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Historique de la conversation (mémoire de Navi)
const conversationHistory: Message[] = [];

/**
 * Envoie un message à Claude et retourne la réponse.
 */
export async function askClaude(
  userMessage: string,
  config: ClaudeConfig,
  context: string = "",
  onThinking?: () => void,
  onAnswer?: (response: string) => void
): Promise<string> {
  onThinking?.();

  // Ajoute le message de l'utilisateur à l'historique
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": config.apiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 150,
        system: `Tu es Navi, une assistante anime mignonne et utile qui flotte sur le bureau Windows de l'utilisateur.
Tu parles toujours en français, de façon courte, chaleureuse et amicale (2-3 phrases maximum).
Tu utilises des emojis avec modération.
Tu es serviable, positive et tu gardes tes réponses concises car tu apparais dans une petite bulle.
Contexte actuel : ${context || "L'utilisateur utilise son ordinateur."}`,
        messages: conversationHistory,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || response.statusText);
    }

    const data = await response.json();
    const reply = data.content[0].text as string;

    // Ajoute la réponse de Navi à l'historique
    conversationHistory.push({
      role: "assistant",
      content: reply,
    });

    // Garde l'historique à 10 messages max pour éviter les coûts
    if (conversationHistory.length > 10) {
      conversationHistory.splice(0, 2);
    }

    onAnswer?.(reply);
    return reply;
  } catch (error) {
    console.error("[ClaudeService] Erreur :", error);
    const fallback =
      "Oups, je n'arrive pas à me connecter ! 😅 Vérifie ta connexion.";
    onAnswer?.(fallback);
    return fallback;
  }
}

/**
 * Vide l'historique de conversation.
 */
export function clearHistory(): void {
  conversationHistory.length = 0;
}
