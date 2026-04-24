import { InfoTooltip } from "./InfoTooltip";

type Props = {
  title: string;
  subtitle?: string;
  info?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, subtitle, info, children }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          {title}
          {info && <InfoTooltip text={info} />}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
