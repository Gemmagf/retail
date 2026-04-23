"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { KPICard } from "@/components/KPICard";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import type { DashboardKPIs } from "@/data/series";

type RegionKey = "EMEA" | "AMER" | "APAC" | "ALL";

type Props = {
  kpisAll: DashboardKPIs;
  kpisByRegion: Record<Exclude<RegionKey, "ALL">, DashboardKPIs & { missedRevenueTotal: number }>;
  missedByRegion: Record<Exclude<RegionKey, "ALL">, number>;
  missedTotal: number;
  imbalanceCost: number;
  yoy: { revenueGrowthPct: number; marginGrowthPct: number };
};

const REGIONS: RegionKey[] = ["EMEA", "AMER", "APAC", "ALL"];

export function DashboardKPIBar({
  kpisAll,
  kpisByRegion,
  missedByRegion,
  missedTotal,
  imbalanceCost,
  yoy,
}: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const [region, setRegion] = useState<RegionKey>("EMEA");

  const kpis = region === "ALL" ? kpisAll : kpisByRegion[region];
  const missedRevenue =
    region === "ALL" ? missedTotal : missedByRegion[region] ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {t("region.selector")}:
        </span>
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              region === r
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {r === "ALL" ? t("region.all") : t(`regions.${r}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
        <KPICard
          label={t("kpi.stockHealth")}
          value={`${kpis.stockHealthPct.toFixed(0)}%`}
          help={t("kpi.stockHealthHelp")}
          accent={kpis.stockHealthPct > 60 ? "success" : "warning"}
        />
        <KPICard
          label={t("kpi.sellThrough")}
          value={`${kpis.sellThroughPct.toFixed(1)}%`}
          help={t("kpi.sellThroughHelp")}
        />
        <KPICard
          label={t("kpi.stockOuts")}
          value={String(kpis.stockOutCount)}
          help={t("kpi.stockOutsHelp")}
          accent={kpis.stockOutCount > 5 ? "danger" : "default"}
        />
        <KPICard
          label={t("kpi.weeklyRevenue")}
          value={formatCurrency(kpis.weeklyRevenue, locale)}
          help={`${t("kpi.vsLY")} ${yoy.revenueGrowthPct > 0 ? "+" : ""}${yoy.revenueGrowthPct.toFixed(1)}%`}
          trend={yoy.revenueGrowthPct}
        />
        <KPICard
          label={t("kpi.weeklyMargin")}
          value={formatCurrency(kpis.weeklyMargin, locale)}
          help={`${t("kpi.vsLY")} ${yoy.marginGrowthPct > 0 ? "+" : ""}${yoy.marginGrowthPct.toFixed(1)}%`}
          trend={yoy.marginGrowthPct}
          accent="success"
        />
        <KPICard
          label={t("kpi.inTransit")}
          value={formatNumber(kpis.inTransitUnits, locale)}
          help={t("kpi.inTransitHelp")}
        />
        <KPICard
          label={t("kpi.forecastMape")}
          value={`${kpis.forecastMape.toFixed(1)}%`}
          help={t("kpi.forecastMapeHelp")}
          accent={kpis.forecastMape < 12 ? "success" : kpis.forecastMape < 20 ? "warning" : "danger"}
        />
        <KPICard
          label={t("kpi.missedRevenue")}
          value={formatCurrency(missedRevenue, locale)}
          help={t("kpi.missedRevenueHelp")}
          accent={missedRevenue > 5000 ? "danger" : "default"}
        />
      </div>

      <div className="rounded-lg border border-border bg-foreground/[0.03] p-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{t("kpi.imbalanceCost")}:</span>{" "}
        {formatCurrency(imbalanceCost, locale)} / {t("common.week")} ·{" "}
        <span>{t("kpi.imbalanceCostHelp")}</span>
      </div>
    </div>
  );
}
