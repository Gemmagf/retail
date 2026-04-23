import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { KPICard } from "@/components/KPICard";
import { Card } from "@/components/Card";
import { SalesByRegionChart } from "@/components/charts/SalesByRegionChart";
import { StockByRegionChart } from "@/components/charts/StockByRegionChart";
import { ShoeMark } from "@/components/ShoeMark";
import {
  getKPIs,
  getWeeklyByRegion,
  getInventory,
  getTopMovers,
  getAtRisk,
  regionColor,
} from "@/data/series";
import { products, productById } from "@/data/products";
import { locationById, type Region } from "@/data/locations";
import { formatCurrency, formatNumber } from "@/lib/utils";

const REGIONS: Region[] = ["EMEA", "AMER", "APAC"];

export default async function DashboardPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const kpis = getKPIs();
  const weekly = getWeeklyByRegion(26);

  const weeksSet = Array.from(new Set(weekly.map((w) => w.week))).sort((a, b) => a - b);
  const chartData = weeksSet.map((w) => {
    const row: Record<string, number | string> = { week: w };
    for (const r of REGIONS) {
      row[r] = weekly.find((x) => x.week === w && x.region === r)?.units ?? 0;
    }
    return row;
  });

  const inv = getInventory();
  const stockByRegion = REGIONS.map((r) => {
    const rows = inv.filter((row) => locationById.get(row.locationId)!.region === r);
    const cover = rows.reduce((a, b) => a + b.weeksCover, 0) / Math.max(1, rows.length);
    return { region: t(`regions.${r}`), weeksCover: cover, color: regionColor(r) };
  });

  const colorsMap: Record<Region, string> = {
    EMEA: regionColor("EMEA"),
    AMER: regionColor("AMER"),
    APAC: regionColor("APAC"),
  };

  const topMovers = getTopMovers(5);
  const atRisk = getAtRisk(8);

  return (
    <>
      <PageHeader title={t("dashboard.title")} subtitle={t("dashboard.subtitle")} />

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
          help={t("kpi.weeklyRevenueHelp")}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          title={t("dashboard.salesByRegion")}
          subtitle={t("dashboard.salesByRegionHelp")}
          className="lg:col-span-2"
        >
          <SalesByRegionChart
            data={chartData}
            regions={REGIONS}
            colors={colorsMap}
            weekLabel={t("common.week")}
          />
        </Card>
        <Card title={t("dashboard.stockByRegion")} subtitle={t("dashboard.stockByRegionHelp")}>
          <StockByRegionChart data={stockByRegion} />
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title={t("dashboard.topMovers")}>
          <ul className="divide-y divide-border">
            {topMovers.map((m) => {
              const p = productById.get(m.productId)!;
              return (
                <li key={m.productId} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="h-10 w-16 shrink-0 rounded-md bg-muted p-1.5">
                    <ShoeMark color={p.color} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t(`products.categories.${p.category}`)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums">
                      {formatNumber(m.units, locale)} {t("common.units")}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {formatCurrency(m.revenue, locale)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title={t("dashboard.atRisk")} subtitle={t("dashboard.atRiskHelp")}>
          <ul className="divide-y divide-border">
            {atRisk.map((r) => {
              const p = productById.get(r.productId)!;
              const loc = locationById.get(r.locationId)!;
              return (
                <li key={`${r.productId}-${r.locationId}`} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {loc.city}, {loc.countryCode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums text-rose-600">
                      {r.weeksCover.toFixed(1)} w
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {formatNumber(r.units, locale)} {t("common.units")}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
