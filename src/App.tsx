import { useState, useEffect, useRef, useCallback } from "react";
import Avatar from "./components/Avatar";
import DialogBubble from "./components/DialogBubble";
import InputBar from "./components/InputBar";
import { speak, estimateSpeakDuration } from "./components/VoiceService";
import { askClaude, clearHistory } from "./components/ClaudeService";

const GREETINGS = [
  "Salut ! Je suis Navi, ton assistante !",
  "Bonjour ! Comment puis-je t'aider ?",
  "Hé ! Pose-moi une question !",
];

const IDLE_MESSAGES = [
  "Je suis là si tu as besoin...",
  "Psst... parle-moi !",
  "Tout va bien ? Je veille sur toi~",
  "Are you ok ?",
];

export type AvatarState = "idle" | "talking" | "thinking" | "happy" | "waving";

export default function App() {
  const [avatarState, setAvatarState] = useState<AvatarState>("waving");
  const [message, setMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const isSpeakingRef = useRef(false);
  const isThinkingRef = useRef(false);
  const isUnlockedRef = useRef(false);
  const isDraggingRef = useRef(false); // 🆕
  const dragStart = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const dragTimer = useRef<ReturnType<typeof setTimeout> | null>(null); // 🆕
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSpeaking = (val: boolean) => {
    isSpeakingRef.current = val;
    setIsSpeaking(val);
  };
  const setThinking = (val: boolean) => {
    isThinkingRef.current = val;
    setIsThinking(val);
  };

  // ---- Déverrouille l'audio au premier clic ----
  const unlockAudio = useCallback(() => {
    if (isUnlockedRef.current) return;
    isUnlockedRef.current = true;
    setIsUnlocked(true);
    const ctx = new AudioContext();
    ctx.resume().then(() => ctx.close());
  }, []);

  // ---- Affiche un message + parle ----
  const showMessage = useCallback(
    async (text: string, state: AvatarState = "talking", duration?: number) => {
      if (messageTimer.current) clearTimeout(messageTimer.current);
      setMessage(text);
      setAvatarState(state);

      const shouldSpeak =
        state === "talking" || state === "waving" || state === "happy";

      if (isUnlockedRef.current && !isSpeakingRef.current && shouldSpeak) {
        setSpeaking(true);
        setAvatarState("talking");
        await speak(
          text,
          () => setAvatarState("talking"),
          () => {
            setSpeaking(false);
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
    []
  );

  // ---- Envoie un message à Claude ----
  const handleUserMessage = useCallback(
    async (userText: string) => {
      if (isThinkingRef.current || isSpeakingRef.current) return;
      setThinking(true);
      setAvatarState("thinking");
      setMessage("Hmm, laisse-moi réfléchir...");
      const reply = await askClaude(userText);
      setThinking(false);
      await showMessage(reply, "talking");
    },
    [showMessage]
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
        if (!isSpeakingRef.current && !isThinkingRef.current) {
          const msg =
            IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
          showMessage(msg, "talking", 4000);
        }
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []); // eslint-disable-line

  // ---- Drag avec délai anti-zoom ----
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragStart.current = {
      mouseX: e.screenX,
      mouseY: e.screenY,
      winX: window.screenX,
      winY: window.screenY,
    };
    // 🆕 Délai 200ms avant d'activer le drag
    dragTimer.current = setTimeout(() => {
      isDraggingRef.current = true;
      setIsDragging(true);
    }, 200);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return; // 🆕 utilise la ref
      const dx = e.screenX - dragStart.current.mouseX;
      const dy = e.screenY - dragStart.current.mouseY;
      // 🆕 Bouge seulement si déplacement > 5px
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      (window as any).navi?.moveWindow(
        dragStart.current.winX + dx,
        dragStart.current.winY + dy
      );
    };
    const onUp = () => {
      // 🆕 Annule le timer si on relâche avant 200ms
      if (dragTimer.current) clearTimeout(dragTimer.current);
      isDraggingRef.current = false;
      setIsDragging(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []); // 🆕 plus de dépendance isDragging

  // ---- Clic sur l'avatar ----
  const handleAvatarClick = () => {
    unlockAudio();
    if (isSpeakingRef.current || isThinkingRef.current) return;
    const reactions = [
      { msg: "Tu m'as cliqué ! Hehe~", state: "talking" as AvatarState },
      { msg: "Pose-moi une question !", state: "waving" as AvatarState },
      { msg: "Je suis là pour toi !", state: "talking" as AvatarState },
    ];
    const r = reactions[Math.floor(Math.random() * reactions.length)];
    showMessage(r.msg, r.state);
  };

  return (
    <div className="app-container" onClick={unlockAudio}>
      {message && <DialogBubble message={message} />}

      <div
        className={`avatar-wrapper ${isDragging ? "dragging" : ""} ${
          isSpeaking ? "speaking" : ""
        } ${isThinking ? "thinking" : ""}`}
        onMouseDown={handleMouseDown}
        onClick={handleAvatarClick}
        onDragStart={(e) => e.preventDefault()}
        draggable={false}
      >
        <Avatar state={avatarState} />
      </div>

      {isSpeaking && <div className="sound-indicator">🔊</div>}
      {isThinking && <div className="sound-indicator">💭</div>}

      {!isUnlocked && (
        <div className="unlock-hint">👆 Clique pour activer la voix</div>
      )}

      <InputBar
        onSend={handleUserMessage}
        disabled={isSpeaking || isThinking}
      />

      <button
        className="reset-btn"
        onClick={(e) => {
          e.stopPropagation();
          clearHistory();
          showMessage("Nouvelle conversation !", "talking");
        }}
        title="Réinitialiser"
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
