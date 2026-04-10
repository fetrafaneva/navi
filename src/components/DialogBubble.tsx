interface DialogBubbleProps {
  message: string;
}

export default function DialogBubble({ message }: DialogBubbleProps) {
  return (
    <div className="bg-black text-white px-4 py-2 rounded-xl max-w-xs">
      {message}
    </div>
  );
}
