import { cn } from "@/lib/utils";

type Bucket = { label: string; units: number; stockoutLocations: number };

type Props = {
  buckets: Bucket[];
  stockoutLabelTemplate: (n: number) => string;
};

export function SizeGrid({ buckets, stockoutLabelTemplate }: Props) {
  const max = Math.max(1, ...buckets.map((b) => b.units));
  return (
    <div className="grid grid-cols-10 gap-1">
      {buckets.map((b) => {
        const pct = (b.units / max) * 100;
        const out = b.stockoutLocations > 0;
        return (
          <div
            key={b.label}
            title={out ? stockoutLabelTemplate(b.stockoutLocations) : `${b.label}: ${b.units}`}
            className="flex flex-col items-center gap-1"
          >
            <div className="relative h-10 w-full overflow-hidden rounded-sm bg-muted">
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 transition-all",
                  out ? "bg-rose-400" : "bg-foreground/70",
                )}
                style={{ height: `${Math.max(8, pct)}%` }}
              />
            </div>
            <span className={cn("text-[10px] tabular-nums", out ? "text-rose-600 font-semibold" : "text-muted-foreground")}>
              {b.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
