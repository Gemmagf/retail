"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Clock,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { ShoeMark } from "@/components/ShoeMark";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import type { Product } from "@/data/products";
import type { Location } from "@/data/locations";
import type { Decision, DecisionType } from "@/data/series";

type Status = "pending" | "approved" | "deferred" | "escalated";

const TYPE_ICONS: Record<DecisionType, React.ComponentType<{ className?: string }>> = {
  stockOut: AlertTriangle,
  campaign: Sparkles,
  missedSize: TrendingDown,
  imbalance: TrendingUp,
  overstock: Clock,
};

const TYPE_TONE: Record<DecisionType, { bg: string; text: string }> = {
  stockOut: { bg: "bg-rose-100", text: "text-rose-800" },
  campaign: { bg: "bg-amber-100", text: "text-amber-800" },
  missedSize: { bg: "bg-fuchsia-100", text: "text-fuchsia-800" },
  imbalance: { bg: "bg-sky-100", text: "text-sky-800" },
  overstock: { bg: "bg-slate-100", text: "text-slate-700" },
};

type Props = {
  decisions: Decision[];
  productsById: Record<string, Product>;
  locationsById: Record<string, Location>;
};

export function DecisionsQueue({ decisions, productsById, locationsById }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  const visible = decisions;
  const pending = visible.filter((d) => (statuses[d.id] ?? "pending") === "pending");

  const totals = useMemo(() => {
    let pendingImpact = 0;
    let approvedImpact = 0;
    let approvedMargin = 0;
    let counts = { pending: 0, approved: 0, deferred: 0, escalated: 0 };
    for (const d of visible) {
      const s = statuses[d.id] ?? "pending";
      counts[s]++;
      if (s === "pending") pendingImpact += d.impact;
      if (s === "approved") {
        approvedImpact += d.impact;
        approvedMargin += d.margin;
      }
    }
    return { pendingImpact, approvedImpact, approvedMargin, counts };
  }, [visible, statuses]);

  function setStatus(id: string, status: Status) {
    setStatuses((prev) => {
      const next = { ...prev };
      if (next[id] === status) delete next[id];
      else next[id] = status;
      return next;
    });
  }

  function reset() {
    setStatuses({});
  }

  function contextLine(d: Decision): string {
    const parts: string[] = [];
    if (d.type === "stockOut" || d.type === "campaign") {
      if (d.weeksContext !== undefined) parts.push(t("decisions.context.weeksLeft", { weeks: d.weeksContext }));
      if (d.unitsHint !== undefined) parts.push(`+${formatNumber(d.unitsHint, locale)} ${t("common.units")}`);
      if (d.campaignLabel) parts.push(d.campaignLabel);
    }
    if (d.type === "missedSize") {
      if (d.sizesContext && d.sizesContext.length > 0)
        parts.push(t("decisions.context.sizesAffected", { sizes: d.sizesContext.slice(0, 4).join(", ") }));
      if (d.unitsHint !== undefined) parts.push(`~${formatNumber(d.unitsHint, locale)} ${t("common.units")}`);
    }
    if (d.type === "imbalance") {
      if (d.weeksContext !== undefined) parts.push(t("decisions.context.coverSpread", { weeks: d.weeksContext }));
      if (d.secondaryLocationId) {
        const sec = locationsById[d.secondaryLocationId];
        if (sec) parts.push(t("decisions.context.fromTo", { from: sec.city, to: locationsById[d.locationId].city }));
      }
    }
    if (d.type === "overstock") {
      if (d.unitsHint !== undefined)
        parts.push(t("decisions.context.excessUnits", { units: formatNumber(d.unitsHint, locale) }));
      if (d.weeksContext !== undefined) parts.push(`${d.weeksContext.toFixed(1)}w cover`);
    }
    return parts.join(" · ");
  }

  if (visible.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background p-6 text-center text-sm text-muted-foreground">
        {t("decisions.empty")}
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-background">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <Zap className="h-4 w-4 text-accent" />
            {t("decisions.title")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("decisions.subtitle", {
              count: pending.length,
              impact: formatCurrency(totals.pendingImpact, locale),
            })}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {totals.counts.approved > 0 && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {totals.counts.approved} {t("decisions.summary.approved")}
            </span>
          )}
          {totals.counts.deferred > 0 && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              {totals.counts.deferred} {t("decisions.summary.deferred")}
            </span>
          )}
          {totals.counts.escalated > 0 && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {totals.counts.escalated} {t("decisions.summary.escalated")}
            </span>
          )}
          {(totals.counts.approved > 0 ||
            totals.counts.deferred > 0 ||
            totals.counts.escalated > 0) && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              {t("allocation.filters.reset")}
            </button>
          )}
        </div>
      </header>

      {totals.counts.approved > 0 && (
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-border bg-emerald-50/40 px-5 py-2 text-xs text-emerald-800">
          <span>
            <span className="font-medium">{t("decisions.summary.approvedImpact")}:</span>{" "}
            <span className="font-semibold tabular-nums">
              {formatCurrency(totals.approvedImpact, locale)}
            </span>
          </span>
          <span>
            <span className="font-medium">{t("decisions.summary.approvedMargin")}:</span>{" "}
            <span className="font-semibold tabular-nums">
              {formatCurrency(totals.approvedMargin, locale)}
            </span>
          </span>
        </div>
      )}

      <ul className="divide-y divide-border">
        {visible.map((d) => {
          const product = productsById[d.productId];
          const loc = locationsById[d.locationId];
          if (!product || !loc) return null;
          const status = statuses[d.id] ?? "pending";
          const Icon = TYPE_ICONS[d.type];
          const tone = TYPE_TONE[d.type];

          return (
            <li
              key={d.id}
              className={cn(
                "flex flex-wrap items-center gap-3 px-5 py-3 transition-colors",
                status === "approved" && "bg-emerald-50/40",
                status === "deferred" && "opacity-50",
                status === "escalated" && "bg-amber-50/40",
              )}
            >
              <div className="h-9 w-14 shrink-0 rounded bg-muted p-1">
                <ShoeMark color={product.color} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                      tone.bg,
                      tone.text,
                    )}
                  >
                    <Icon className="h-2.5 w-2.5" />
                    {t(`decisions.types.${d.type}`)}
                  </span>
                  <span className="truncate text-sm font-medium">{product.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {loc.city}
                    {loc.partner ? ` · ${loc.partner}` : ""} · {loc.countryCode}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{contextLine(d)}</div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">
                  {formatCurrency(d.impact, locale)}
                </div>
                <div className="text-[11px] text-muted-foreground tabular-nums">
                  {formatCurrency(d.margin, locale)} margin
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setStatus(d.id, "approved")}
                  title={t("decisions.actions.approve")}
                  className={cn(
                    "rounded-md border p-1.5 transition-colors",
                    status === "approved"
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-600",
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setStatus(d.id, "deferred")}
                  title={t("decisions.actions.defer")}
                  className={cn(
                    "rounded-md border p-1.5 transition-colors",
                    status === "deferred"
                      ? "border-slate-400 bg-slate-400 text-white"
                      : "border-border text-muted-foreground hover:border-slate-400 hover:text-slate-600",
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setStatus(d.id, "escalated")}
                  title={t("decisions.actions.escalate")}
                  className={cn(
                    "rounded-md border p-1.5 transition-colors",
                    status === "escalated"
                      ? "border-amber-500 bg-amber-500 text-white"
                      : "border-border text-muted-foreground hover:border-amber-500 hover:text-amber-600",
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => router.push(d.href)}
                  title={t(`decisions.ctas.${d.ctaKey}`)}
                  className="ml-1 inline-flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {t(`decisions.ctas.${d.ctaKey}`)}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
