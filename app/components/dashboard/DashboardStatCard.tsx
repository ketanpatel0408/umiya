import type { LucideIcon } from "lucide-react";

type DashboardStatCardProps = {
  label: string;
  value: string;
  subvalue?: string;
  icon: LucideIcon;
};

export default function DashboardStatCard({
  label,
  value,
  subvalue,
  icon: Icon,
}: DashboardStatCardProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-zinc-900">
          {value}
        </p>
        {subvalue && (
          <p className="mt-1 truncate text-xs text-zinc-500">{subvalue}</p>
        )}
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
        <Icon size={20} />
      </div>
    </div>
  );
}
