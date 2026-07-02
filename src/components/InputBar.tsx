import { useState, KeyboardEvent } from "react";

interface InputBarProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [text, setText] = useState("");
  const [justSent, setJustSent] = useState(false);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    setJustSent(true);
    setTimeout(() => setJustSent(false), 200);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="input-bar">
      <input
        type="text"
        className="input-bar__field"
        placeholder="Parle à Navi..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        maxLength={200}
      />
      <button
        className={`input-bar__btn ${justSent ? "sent" : ""}`}
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        title="Envoyer"
      >
        ➤
      </button>
    </div>
  );
}
