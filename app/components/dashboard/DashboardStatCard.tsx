import type { LucideIcon } from "lucide-react";

type Accent = "indigo" | "emerald" | "amber" | "sky";

const ACCENTS: Record<Accent, { tile: string; bar: string }> = {
  indigo: { tile: "bg-indigo-50 text-indigo-600", bar: "bg-indigo-500" },
  emerald: { tile: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-500" },
  amber: { tile: "bg-amber-50 text-amber-600", bar: "bg-amber-500" },
  sky: { tile: "bg-sky-50 text-sky-600", bar: "bg-sky-500" },
};

type DashboardStatCardProps = {
  label: string;
  value: string;
  subvalue?: string;
  icon: LucideIcon;
  accent?: Accent;
};

export default function DashboardStatCard({
  label,
  value,
  subvalue,
  icon: Icon,
  accent = "indigo",
}: DashboardStatCardProps) {
  const colors = ACCENTS[accent];
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`absolute inset-x-0 top-0 h-0.5 ${colors.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
            {value}
          </p>
          {subvalue && (
            <p className="mt-1 truncate text-xs text-slate-500">{subvalue}</p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.tile}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
