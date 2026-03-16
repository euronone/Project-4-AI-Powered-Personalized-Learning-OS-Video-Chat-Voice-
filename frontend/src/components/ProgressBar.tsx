interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
}

export default function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="w-full">
      {label && <span className="text-sm text-white/50">{label}</span>}
      <div className="w-full bg-white/10 rounded-full h-2">
        <div
          className="bg-accent h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-white/30">{percentage}%</span>
    </div>
  );
}
