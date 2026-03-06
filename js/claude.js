// ================================
// claude.js — Claude AI Service
// ================================

const ClaudeService = {
  // ---- Configuration ----
  config: {
    apiKey: "",
    enabled: false,
  },

  // ---- Historique de conversation ----
  history: [],

  // ---- Initialise avec une clé API ----
  init(apiKey) {
    this.config.apiKey = apiKey;
    this.config.enabled = apiKey.length > 0;
    this.history = [];
    console.log("[ClaudeService] Initialisé ✅");
  },

  // ---- Envoie un message à Claude ----
  async ask(userMessage, onThinking, onAnswer) {
    if (!this.config.enabled) {
      onAnswer?.("Je n'ai pas de clé Claude ! Configure-moi 🔑");
      return;
    }

    onThinking?.();

    // Ajoute le message utilisateur à l'historique
    this.history.push({ role: "user", content: userMessage });

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": this.config.apiKey,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          // Requis pour appels depuis le navigateur
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 150,
          system: `Tu es Navi, une assistante anime mignonne qui flotte sur le bureau Windows.
  Tu parles en français, de façon courte et amicale (2-3 phrases max).
  Tu utilises des emojis avec modération. Sois utile et positive !`,
          messages: this.history,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || response.statusText);
      }

      const data = await response.json();
      const reply = data.content[0].text;

      // Ajoute la réponse à l'historique
      this.history.push({ role: "assistant", content: reply });

      // Limite l'historique à 10 messages
      if (this.history.length > 10) this.history.splice(0, 2);

      onAnswer?.(reply);
      return reply;
    } catch (error) {
      console.error("[ClaudeService] Erreur :", error);
      const fallback = "Oups, erreur de connexion ! 😅 Vérifie ta clé API.";
      onAnswer?.(fallback);
      return fallback;
    }
  },

  // ---- Vide l'historique ----
  clearHistory() {
    this.history = [];
    console.log("[ClaudeService] Historique vidé");
  },
};
