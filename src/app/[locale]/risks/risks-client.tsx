"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AlertTriangle, TrendingUp, Sparkles } from "lucide-react";
import { Card } from "@/components/Card";
import { ShoeMark } from "@/components/ShoeMark";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import type { Product } from "@/data/products";
import type { Location } from "@/data/locations";
import type { Risk, Opportunity } from "@/data/series";

type Props = {
  risks: Risk[];
  opportunities: Opportunity[];
  productsById: Record<string, Product>;
  locationsById: Record<string, Location>;
};

const BUCKETS = ["ALL", "2w", "4w", "6w"] as const;

export function RisksClient({ risks, opportunities, productsById, locationsById }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const [tab, setTab] = useState<"risks" | "opportunities">("risks");
  const [bucket, setBucket] = useState<(typeof BUCKETS)[number]>("ALL");

  const filteredRisks = useMemo(
    () => risks.filter((r) => bucket === "ALL" || r.bucket === bucket),
    [risks, bucket],
  );

  const riskTotals = useMemo(
    () => ({
      revenue: filteredRisks.reduce((a, b) => a + b.revenueAtRisk, 0),
      margin: filteredRisks.reduce((a, b) => a + b.marginAtRisk, 0),
      count: filteredRisks.length,
    }),
    [filteredRisks],
  );

  const oppTotals = useMemo(
    () => ({
      revenue: opportunities.reduce((a, b) => a + b.redistributableRevenue, 0),
      margin: opportunities.reduce((a, b) => a + b.redistributableMargin, 0),
      count: opportunities.length,
    }),
    [opportunities],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label={t("risks.tabRisks")}
          value={String(riskTotals.count)}
          accent="danger"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <Stat
          label={t("risks.revenueAtRisk")}
          value={formatCurrency(riskTotals.revenue, locale)}
          accent="danger"
        />
        <Stat
          label={t("risks.tabOpportunities")}
          value={String(oppTotals.count)}
          accent="success"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <Stat
          label={t("risks.redistributable")}
          value={formatCurrency(oppTotals.revenue, locale)}
          accent="success"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-md border border-border bg-background p-1">
          <button
            onClick={() => setTab("risks")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === "risks" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t("risks.tabRisks")} ({riskTotals.count})
          </button>
          <button
            onClick={() => setTab("opportunities")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === "opportunities" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t("risks.tabOpportunities")} ({oppTotals.count})
          </button>
        </div>
        {tab === "risks" && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground">{t("risks.bucket")}:</span>
            {BUCKETS.map((b) => (
              <button
                key={b}
                onClick={() => setBucket(b)}
                className={cn(
                  "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                  bucket === b
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {b === "ALL" ? t("risks.allBuckets") : b}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === "risks" ? (
        <Card subtitle={t("risks.riskSubtitle")}>
          <ul className="divide-y divide-border">
            {filteredRisks.slice(0, 40).map((r, i) => {
              const p = productsById[r.productId];
              const loc = locationsById[r.locationId];
              return (
                <li key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="h-9 w-14 shrink-0 rounded bg-muted p-1">
                    <ShoeMark color={p.color} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{p.name}</span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                          r.bucket === "2w"
                            ? "bg-rose-100 text-rose-800"
                            : r.bucket === "4w"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700",
                        )}
                      >
                        {r.bucket}
                      </span>
                      {r.upcomingCampaign && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-amber-800">
                          <Sparkles className="h-2.5 w-2.5" />
                          {r.upcomingCampaign}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {loc.city}
                      {loc.partner ? ` · ${loc.partner}` : ""} · {loc.countryCode} ·{" "}
                      {r.velocity.toFixed(1)} u/w
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="text-xs text-muted-foreground">{t("risks.weeksOut")}</div>
                    <div className="text-sm font-semibold tabular-nums">
                      {r.weeksToStockout.toFixed(1)} w
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums text-rose-600">
                      {formatCurrency(r.revenueAtRisk, locale)}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {formatCurrency(r.marginAtRisk, locale)} margin
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : (
        <Card subtitle={t("risks.opportunitySubtitle")}>
          <ul className="divide-y divide-border">
            {opportunities.slice(0, 40).map((o, i) => {
              const p = productsById[o.productId];
              const loc = locationsById[o.locationId];
              return (
                <li key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="h-9 w-14 shrink-0 rounded bg-muted p-1">
                    <ShoeMark color={p.color} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{p.name}</span>
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                        {o.reason === "overstock"
                          ? t("risks.reasonOverstock")
                          : o.reason === "slowMoving"
                            ? t("risks.reasonSlowMoving")
                            : t("risks.reasonIdleCapital")}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {loc.city}
                      {loc.partner ? ` · ${loc.partner}` : ""} · {o.weeksCover.toFixed(1)}w cover ·{" "}
                      {formatNumber(o.excessUnits, locale)} {t("risks.excessUnits").toLowerCase()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums text-emerald-700">
                      +{formatCurrency(o.redistributableRevenue, locale)}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      +{formatCurrency(o.redistributableMargin, locale)} margin
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: "danger" | "success";
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div
        className={cn(
          "mt-1.5 text-2xl font-semibold tabular-nums",
          accent === "danger" ? "text-rose-600" : "text-emerald-700",
        )}
      >
        {value}
      </div>
    </div>
  );
}
