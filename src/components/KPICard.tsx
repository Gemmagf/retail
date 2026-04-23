import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  help?: string;
  trend?: number;
  accent?: "default" | "success" | "warning" | "danger";
};

const accentClass: Record<NonNullable<Props["accent"]>, string> = {
  default: "text-foreground",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-rose-600",
};

export function KPICard({ label, value, help, trend, accent = "default" }: Props) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-2 text-3xl font-semibold tracking-tight tabular-nums", accentClass[accent])}>
        {value}
      </div>
      {(help || trend !== undefined) && (
        <div className="mt-2 flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
          {help && <span className="leading-snug">{help}</span>}
          {trend !== undefined && (
            <span
              className={cn(
                "ml-auto font-medium",
                trend > 0 ? "text-emerald-600" : trend < 0 ? "text-rose-600" : "",
              )}
            >
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
