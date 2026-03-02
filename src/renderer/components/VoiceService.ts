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
