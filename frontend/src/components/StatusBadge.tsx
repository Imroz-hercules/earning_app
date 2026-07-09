import { CheckCircle2, Clock3, XCircle } from "lucide-react";

type Props = {
  status: string;
};

export function StatusBadge({ status }: Props) {
  const normalized = status.toLowerCase();
  const map = {
    approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
  } as const;
  const Icon = normalized === "approved" || normalized === "completed" ? CheckCircle2 : normalized === "rejected" ? XCircle : Clock3;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${
        map[normalized as keyof typeof map] ?? "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

