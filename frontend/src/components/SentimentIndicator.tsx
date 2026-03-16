interface SentimentIndicatorProps {
  emotion: string;
  confidence: number;
}

const emotionColors: Record<string, string> = {
  engaged: "bg-green-500",
  happy: "bg-green-400",
  confused: "bg-yellow-500",
  bored: "bg-orange-500",
  frustrated: "bg-red-500",
  drowsy: "bg-gray-500",
};

export default function SentimentIndicator({ emotion, confidence }: SentimentIndicatorProps) {
  return (
    <div className="flex items-center gap-2 bg-dark/80 backdrop-blur-sm px-2 py-1 rounded-md">
      <div className={`w-2.5 h-2.5 rounded-full ${emotionColors[emotion] || "bg-gray-500"}`} />
      <span className="text-xs capitalize text-white/80">{emotion}</span>
      <span className="text-xs text-white/30">({Math.round(confidence * 100)}%)</span>
    </div>
  );
}
