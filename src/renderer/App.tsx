import { useState, useEffect, useRef, useCallback } from "react";
import Avatar from "./components/Avatar";
import DialogBubble from "./components/DialogBubble";
import InputBar from "./components/InputBar";
import { speak, estimateSpeakDuration } from "./components/VoiceService";
import { askClaude, clearHistory } from "./components/ClaudeService";

const GREETINGS = [
  "Salut ! Je suis Navi, ton assistante ! ✨",
  "Bonjour ! Comment puis-je t'aider ? 💫",
  "Hé ! Pose-moi une question ! 🌸",
];

const IDLE_MESSAGES = [
  "Je suis là si tu as besoin... 💤",
  "Psst... parle-moi ! 👀",
  "Tout va bien ? Je veille sur toi~ 🌙",
];

export type AvatarState = "idle" | "talking" | "thinking" | "happy" | "waving";

// Configs API
let voiceConfig: { apiKey: string; voiceId: string } | null = null;
let claudeConfig: { apiKey: string } | null = null;

export default function App() {
  const [avatarState, setAvatarState] = useState<AvatarState>("waving");
  const [message, setMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Charge les config API ----
  useEffect(() => {
    (window as any).navi?.getVoiceConfig().then((c: any) => {
      voiceConfig = c;
      console.log("[Navi] Config voix");
    });
    (window as any).navi?.getClaudeConfig().then((c: any) => {
      claudeConfig = c;
      console.log("[Navi] Config Claude");
    });
  }, []);

  // ---- Affich un message et parle ----
  const showMessage = useCallback(
    async (text: string, state: AvatarState = "talking", duration?: number) => {
      if (messageTimer.current) clearTimeout(messageTimer.current);

      setMessage(text);
      setAvatarState(state);

      if (
        voiceConfig?.apiKey &&
        !isSpeaking &&
        (state === "talking" || state === "waving")
      ) {
        setIsSpeaking(true);
        setAvatarState("talking");
        await speak(
          text,
          voiceConfig!,
          () => setAvatarState("talking"),
          () => {
            setIsSpeaking(false);
            setAvatarState("idle");
            setMessage(null);
          }
        );
      } else {
        const dur = duration ?? estimateSpeakDuration(text);
        messageTimer.current = setTimeout(() => {
          setMessage(null);
          setAvatarState("idle");
        }, dur);
      }
    },
    [isSpeaking]
  );

  // ---- Envoie un message à Claude ----
  const handleUserMessage = useCallback(
    async (userText: string) => {
      if (isThinking || isSpeaking) return;

      setIsThinking(true);
      setAvatarState("thinking");
      setMessage("Hmm, laisse-moi réfléchir... ");

      const reply = await askClaude(
        userText,
        claudeConfig ?? { apiKey: "" },
        "Utilisateur sur Windows 10"
      );

      setIsThinking(false);
      await showMessage(reply, "talking");
    },
    [isThinking, isSpeaking, showMessage]
  );

  // ---- Bienvenue ----
  useEffect(() => {
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    setTimeout(() => showMessage(greeting, "waving"), 800);
  }, []); // eslint-disable-line

  // ---- Messages idle ----
  useEffect(() => {
    const schedule = () => {
      const delay = 20000 + Math.random() * 20000;
      idleTimer.current = setTimeout(() => {
        if (!isSpeaking && !isThinking) {
          const msg =
            IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
          showMessage(msg, "idle", 4000);
        }
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isSpeaking, isThinking, showMessage]);

  // ---- Drag ----
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = {
      mouseX: e.screenX,
      mouseY: e.screenY,
      winX: window.screenX,
      winY: window.screenY,
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.screenX - dragStart.current.mouseX;
      const dy = e.screenY - dragStart.current.mouseY;
      (window as any).navi?.moveWindow(
        dragStart.current.winX + dx,
        dragStart.current.winY + dy
      );
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  // ---- Clic sur l'avatar ----
  const handleAvatarClick = () => {
    if (isSpeaking || isThinking) return;
    const reactions = [
      { msg: "Tu m'as cliqué ! Hehe~ 😊", state: "happy" as AvatarState },
      { msg: "Pose-moi une question ! 💬", state: "waving" as AvatarState },
      { msg: "Je suis là pour toi ! 💪", state: "happy" as AvatarState },
    ];
    const r = reactions[Math.floor(Math.random() * reactions.length)];
    showMessage(r.msg, r.state);
  };

  return (
    <div className="app-container">
      {message && <DialogBubble message={message} />}

      <div
        className={`avatar-wrapper ${isDragging ? "dragging" : ""} ${
          isSpeaking ? "speaking" : ""
        } ${isThinking ? "thinking" : ""}`}
        onMouseDown={handleMouseDown}
        onClick={handleAvatarClick}
      >
        <Avatar state={avatarState} />
      </div>

      {isSpeaking && <div className="sound-indicator">🔊</div>}
      {isThinking && <div className="sound-indicator">💭</div>}

      {/* Zone de saisie */}
      <InputBar
        onSend={handleUserMessage}
        disabled={isSpeaking || isThinking}
      />

      {/* Bouton reset conversation */}
      <button
        className="reset-btn"
        onClick={() => {
          clearHistory();
          showMessage("Nouvelle conversation ! 😊", "happy");
        }}
        title="Réinitialiser la conversation"
      >
        ↺
      </button>

      <button
        className="close-btn"
        onClick={() => (window as any).navi?.quitApp()}
        title="Fermer Navi"
      >
        ×
      </button>
    </div>
  );
}
