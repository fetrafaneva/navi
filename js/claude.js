const ClaudeService = {
  config: { enabled: true }, // Toujours activé, clé côté serveur
  history: [],
  isBusy: false,

  async ask(userMessage, onThinking, onAnswer) {
    onThinking?.();
    this.isBusy = true;

    this.history.push({ role: "user", content: userMessage });

    try {
      // ✅ Appel vers ton proxy local — pas de CORS !
      const response = await fetch("http://localhost:3000/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 150,
          system: `Tu es Navi, une assistante anime mignonne sur Windows.
  Tu parles en français, de façon courte et amicale (2-3 phrases max).
  Utilise des emojis avec modération. Sois utile et positive !`,
          messages: this.history,
        }),
      });

      const data = await response.json();
      const reply = data.content[0].text;

      this.history.push({ role: "assistant", content: reply });

      // Garde max 10 messages
      if (this.history.length > 10) this.history.splice(0, 2);

      onAnswer?.(reply);
    } catch (error) {
      console.error("[Claude] Erreur :", error);
      onAnswer?.("Oups ! Le serveur proxy n'est pas démarré 😅");
    } finally {
      this.isBusy = false;
    }
  },

  clearHistory() {
    this.history = [];
  },
};
