import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "sky",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "sky" | "mint" | "amber" | "coral";
}) {
  const tones = {
    sky: "bg-sky/10 text-sky",
    mint: "bg-mint/10 text-mint",
    amber: "bg-amber/10 text-amber",
    coral: "bg-coral/10 text-coral",
  };
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-steel">{label}</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-md ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

