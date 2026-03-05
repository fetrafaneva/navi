import { useState, useEffect, useRef, useCallback } from "react";
import Avatar from "./components/Avatar";
import DialogBubble from "./components/DialogBubble";
import { speak, estimateSpeakDuration } from "./components/VoiceService";

const GREETINGS = [
  "Salut ! Je suis Navi, ton assistante ! ✨",
  "Bonjour ! Besoin d'aide aujourd'hui ? 💫",
  "Hé ! Je suis là si tu as besoin de moi ! 🌸",
];

const IDLE_MESSAGES = [
  "Je suis là si tu as besoin... 💤",
  "Psst... clique sur moi ! 👀",
  "Tout va bien ? Je veille sur toi~ 🌙",
  "N'hésite pas à me parler ! 💬",
];

export type AvatarState = "idle" | "talking" | "thinking" | "happy" | "waving";

let voiceConfig: { apiKey: string; voiceId: string } | null = null;

export default function App() {
  const [avatarState, setAvatarState] = useState<AvatarState>("waving");
  const [message, setMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Charge la config voix depuis Electron ----
  useEffect(() => {
    (window as any).navi?.getVoiceConfig().then((config: any) => {
      voiceConfig = config;
      console.log("[Navi] Config voix chargée ✅");
    });
  }, []);

  // ---- Affiche un message + parle ----
  const showMessage = useCallback(
    async (text: string, state: AvatarState = "talking", duration?: number) => {
      if (messageTimer.current) clearTimeout(messageTimer.current);

      setMessage(text);
      setAvatarState(state);

      // ✅ Bug corrigé : parenthèses autour des états valides pour la voix
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
          () => setAvatarState("talking"), // onStart
          () => {
            // onEnd
            setIsSpeaking(false);
            setAvatarState("idle");
            setMessage(null); // ✅ Cache le message quand la voix finit
          }
        );
      } else {
        // Fallback sans voix : durée estimée
        const dur = duration ?? estimateSpeakDuration(text);
        messageTimer.current = setTimeout(() => {
          setMessage(null);
          setAvatarState("idle");
        }, dur);
      }
    },
    [isSpeaking]
  );

  // ---- Bienvenue au démarrage ----
  useEffect(() => {
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    setTimeout(() => showMessage(greeting, "waving"), 800);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Messages idle ----
  useEffect(() => {
    const schedule = () => {
      const delay = 20000 + Math.random() * 20000;
      idleTimer.current = setTimeout(() => {
        if (!isSpeaking) {
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
  }, [isSpeaking, showMessage]);

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
    if (isSpeaking) return;
    const reactions = [
      { msg: "Tu m'as cliqué ! Hehe~ 😊", state: "happy" as AvatarState },
      {
        msg: "Je t'écoute ! Qu'est-ce qu'il y a ?",
        state: "talking" as AvatarState,
      },
      { msg: "Concentrons-nous ! 💪", state: "happy" as AvatarState },
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
        }`}
        onMouseDown={handleMouseDown}
        onClick={handleAvatarClick}
      >
        <Avatar state={avatarState} />
      </div>

      {isSpeaking && <div className="sound-indicator">🔊</div>}

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
