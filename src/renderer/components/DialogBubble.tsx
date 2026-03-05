interface DialogBubbleProps {
  message: string;
}

export default function DialogBubble({ message }: DialogBubbleProps) {
  return (
    <div className="dialog-bubble">
      <div className="dialog-bubble__text">{message}</div>
      <div className="dialog-bubble__tail" />
    </div>
  );
}
