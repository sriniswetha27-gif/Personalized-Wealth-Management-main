import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  tone: "mint" | "coral" | "ocean" | "amber";
  icon: LucideIcon;
};

const tones = {
  mint: "bg-mint/12 text-mint",
  coral: "bg-coral/12 text-coral",
  ocean: "bg-ocean/12 text-ocean",
  amber: "bg-amber/15 text-amber"
};

export function MetricCard({ label, value, tone, icon: Icon }: Props) {
  return (
    <article className="panel p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-md ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-ink">{value}</p>
    </article>
  );
}
