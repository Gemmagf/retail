import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { SectionTabs } from "@/components/SectionTabs";
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Cpu,
  Loader2,
  Sparkles,
  XCircle,
  Zap,
} from "lucide-react";
import { getModelRegistry, getPipelineRuns, getDriftWatchlist } from "@/data/series";
import { cn } from "@/lib/utils";

const TRIGGER_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  drift: "Drift trigger",
  manual: "Manual",
  agentic: "Agentic auto-experiment",
};

export default async function LabPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const [models, runs, drift] = await Promise.all([
    getModelRegistry(),
    getPipelineRuns(10),
    getDriftWatchlist(8),
  ]);

  const champion = models.find((m) => m.status === "champion");
  const challengers = models.filter((m) => m.status === "challenger");
  const lastRun = runs.find((r) => r.status === "succeeded");

  return (
    <>
      <PageHeader
        title={t("lab.title")}
        subtitle={t("lab.subtitle")}
        info={t("info.labPage")}
      />
      <SectionTabs
        tabs={[
          { href: "/forecast", label: t("nav.forecast") },
          { href: "/lab", label: t("nav.lab") },
          { href: "/simulator", label: t("nav.simulator") },
        ]}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={Award}
          tone="emerald"
          label={t("lab.summary.champion")}
          value={champion?.name ?? "—"}
          help={champion ? `MAPE ${champion.mape.toFixed(1)}%` : ""}
        />
        <SummaryCard
          icon={Sparkles}
          tone="teal"
          label={t("lab.summary.challengers")}
          value={String(challengers.length)}
          help={t("lab.summary.challengersHelp")}
        />
        <SummaryCard
          icon={Activity}
          tone="sky"
          label={t("lab.summary.lastRun")}
          value={
            lastRun
              ? lastRun.startedHoursAgo < 24
                ? `${lastRun.startedHoursAgo}h`
                : `${lastRun.startedDaysAgo}d`
              : "—"
          }
          help={lastRun ? `${lastRun.modelsTrained} models · Δ ${lastRun.mapeDeltaPp > 0 ? "+" : ""}${lastRun.mapeDeltaPp}pp` : ""}
        />
        <SummaryCard
          icon={AlertTriangle}
          tone="amber"
          label={t("lab.summary.drift")}
          value={String(drift.length)}
          help={t("lab.summary.driftHelp")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          title={t("lab.registryTitle")}
          subtitle={t("lab.registrySubtitle")}
          info={t("info.modelRegistry")}
          className="lg:col-span-2"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 font-medium">{t("lab.cols.model")}</th>
                  <th className="px-2 py-2 font-medium">{t("lab.cols.family")}</th>
                  <th className="px-2 py-2 font-medium">{t("lab.cols.version")}</th>
                  <th className="px-2 py-2 font-medium text-right">MAPE</th>
                  <th className="px-2 py-2 font-medium text-right">Δ {t("lab.cols.baseline")}</th>
                  <th className="px-2 py-2 font-medium text-right">{t("lab.cols.lastTrained")}</th>
                  <th className="px-2 py-2 font-medium">{t("lab.cols.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {models.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="px-2 py-2.5 font-medium">{m.name}</td>
                    <td className="px-2 py-2.5">
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase",
                          m.family === "tsfm" && "bg-teal-100 text-teal-800",
                          m.family === "ml" && "bg-violet-100 text-violet-800",
                          m.family === "classic" && "bg-slate-100 text-slate-700",
                          m.family === "ensemble" && "bg-emerald-100 text-emerald-800",
                        )}
                      >
                        {m.family.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 font-mono text-xs text-muted-foreground">
                      v{m.version}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums">
                      {m.mape.toFixed(1)}%
                    </td>
                    <td
                      className={cn(
                        "px-2 py-2.5 text-right tabular-nums text-xs",
                        m.deltaPp < 0 ? "text-emerald-700" : "text-rose-700",
                      )}
                    >
                      {m.deltaPp > 0 ? "+" : ""}
                      {m.deltaPp.toFixed(1)}pp
                    </td>
                    <td className="px-2 py-2.5 text-right text-xs text-muted-foreground">
                      {m.lastTrainedDaysAgo === 0 ? t("lab.today") : `${m.lastTrainedDaysAgo}d`}
                    </td>
                    <td className="px-2 py-2.5">
                      <ModelStatusBadge status={m.status} t={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title={t("lab.driftTitle")}
          subtitle={t("lab.driftSubtitle")}
          info={t("info.drift")}
        >
          <ul className="divide-y divide-border">
            {drift.map((d) => (
              <li key={d.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className={cn(
                    "mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    d.driftScore > 0.85
                      ? "bg-rose-100 text-rose-600"
                      : d.driftScore > 0.7
                        ? "bg-amber-100 text-amber-600"
                        : "bg-slate-100 text-slate-500",
                  )}
                >
                  <AlertTriangle className="h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{d.scope}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-medium uppercase">
                      {t(`lab.patterns.${d.pattern}`)}
                    </span>
                    <span className="tabular-nums">
                      {t("lab.driftScore")}: {d.driftScore.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
                    <Zap className="h-3 w-3 text-accent" />
                    {t(`lab.actions.${d.recommendedAction}`)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4">
        <Card
          title={t("lab.runsTitle")}
          subtitle={t("lab.runsSubtitle")}
          info={t("info.pipelineRuns")}
        >
          <ul className="divide-y divide-border">
            {runs.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                <RunStatusIcon status={r.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-medium">{r.id}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase",
                        r.trigger === "agentic" && "bg-violet-100 text-violet-800",
                        r.trigger === "drift" && "bg-amber-100 text-amber-800",
                        r.trigger === "scheduled" && "bg-slate-100 text-slate-700",
                        r.trigger === "manual" && "bg-sky-100 text-sky-800",
                      )}
                    >
                      {t(`lab.triggers.${r.trigger}`)}
                    </span>
                    {r.notes && (
                      <span className="text-xs text-muted-foreground">· {r.notes}</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span>
                      {r.startedHoursAgo < 24
                        ? `${r.startedHoursAgo}h ago`
                        : `${r.startedDaysAgo}d ago`}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {r.durationMinutes} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Cpu className="h-3 w-3" />
                      {r.modelsTrained} models
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      r.status === "succeeded" && r.mapeDeltaPp < 0 && "text-emerald-700",
                      r.status === "succeeded" && r.mapeDeltaPp > 0 && "text-rose-700",
                      r.status !== "succeeded" && "text-muted-foreground",
                    )}
                  >
                    {r.status === "running"
                      ? "—"
                      : `${r.mapeDeltaPp > 0 ? "+" : ""}${r.mapeDeltaPp}pp`}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {r.status === "succeeded"
                      ? t("lab.runs.mapeDelta")
                      : r.status === "running"
                        ? t("lab.runs.running")
                        : t("lab.runs.failed")}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function SummaryCard({
  icon: Icon,
  tone,
  label,
  value,
  help,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "teal" | "sky" | "amber";
  label: string;
  value: string;
  help: string;
}) {
  const toneClass: Record<typeof tone, string> = {
    emerald: "text-emerald-600 bg-emerald-50",
    teal: "text-teal-600 bg-teal-50",
    sky: "text-sky-600 bg-sky-50",
    amber: "text-amber-600 bg-amber-50",
  };
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
            toneClass[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="mt-1 truncate text-lg font-semibold tabular-nums">{value}</div>
          {help && <div className="text-[11px] text-muted-foreground">{help}</div>}
        </div>
      </div>
    </div>
  );
}

function ModelStatusBadge({
  status,
  t,
}: {
  status: "champion" | "challenger" | "production" | "training" | "deprecated";
  t: (key: string) => string;
}) {
  if (status === "champion")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
        <Award className="h-3 w-3" />
        {t("forecastLab.champion")}
      </span>
    );
  if (status === "challenger")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-teal-800">
        <Sparkles className="h-3 w-3" />
        {t("forecastLab.challenger")}
      </span>
    );
  if (status === "deprecated")
    return (
      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500 line-through">
        {t("lab.statuses.deprecated")}
      </span>
    );
  return (
    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-700">
      {t("lab.statuses.production")}
    </span>
  );
}

function RunStatusIcon({ status }: { status: "succeeded" | "failed" | "running" }) {
  if (status === "succeeded")
    return <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />;
  if (status === "failed") return <XCircle className="h-5 w-5 shrink-0 text-rose-600" />;
  return <Loader2 className="h-5 w-5 shrink-0 animate-spin text-sky-600" />;
}
