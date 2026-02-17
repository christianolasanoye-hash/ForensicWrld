interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon = "◈",
}: StatsCardProps) {
  const changeColors = {
    positive: "text-green-400",
    negative: "text-red-400",
    neutral: "text-white/40",
  };

  return (
    <div className="border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {change && (
            <p className={`mt-1 text-[10px] font-bold ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <span className="text-2xl text-white/20">{icon}</span>
      </div>
    </div>
  );
}
