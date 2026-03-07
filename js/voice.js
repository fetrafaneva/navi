// ================================
// voice.js — Synthèse vocale ElevenLabs
// ================================

const VoiceService = {
  // ---- Configuration ----
  config: {
    apiKey: "", // Mets ta clé ici (ou via le panneau de config)
    voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel — voix douce
    enabled: false, // false si pas de clé API
  },

  // ---- État interne ----
  isSpeaking: false,
  currentAudio: null,

  // ---- Initialise avec une clé API ----
  init(apiKey, voiceId = null) {
    this.config.apiKey = apiKey;
    this.config.voiceId = voiceId || this.config.voiceId;
    this.config.enabled = apiKey.length > 0;
    console.log("[VoiceService] Initialisé ✅");
  },

  // ---- Parle ! ----
  async speak(text, onStart, onEnd) {
    // Si pas de clé ou déjà en train de parler → on skip
    if (!this.config.enabled || this.isSpeaking) return;

    try {
      this.isSpeaking = true;
      onStart?.();

      const response = await fetch(
        `http://localhost:3000/api/tts/${this.config.voiceId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.3,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail?.message || response.statusText);
      }

      // Crée et joue l'audio
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      await this._playAudio(audioUrl);
      URL.revokeObjectURL(audioUrl);
    } catch (error) {
      console.error("[VoiceService] Erreur :", error);
    } finally {
      this.isSpeaking = false;
      onEnd?.();
    }
  },

  // ---- Joue un audio, retourne une Promise ----
  _playAudio(url) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      this.currentAudio = audio;
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      audio.play().catch(reject);
    });
  },

  // ---- Coupe le son ----
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isSpeaking = false;
  },

  // ---- Durée estimée sans API (fallback) ----
  estimateDuration(text) {
    const words = text.trim().split(/\s+/).length;
    return Math.max(words * (60 / 130) * 1000, 800);
  },
};
