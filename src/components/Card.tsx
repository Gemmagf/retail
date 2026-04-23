import { cn } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  info?: string;
};

export function Card({ title, subtitle, children, className, action, info }: Props) {
  return (
    <section className={cn("rounded-lg border border-border bg-background", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            {title && (
              <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                {title}
                {info && <InfoTooltip text={info} />}
              </h2>
            )}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
