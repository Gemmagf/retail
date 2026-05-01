import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { SalesByRegionChart } from "@/components/charts/SalesByRegionChart";
import { StockByRegionChart } from "@/components/charts/StockByRegionChart";
import { ShoeMark } from "@/components/ShoeMark";
import { DashboardKPIBar } from "./dashboard-client";
import { Truck } from "lucide-react";
import {
  getKPIs,
  getKPIsForRegion,
  getWeeklyByRegion,
  getInventory,
  getTopMovers,
  getAtRisk,
  getPurchaseOrders,
  getMissedSales,
  getMissedSalesTotals,
  getMissedSalesWithDiagnosis,
  getYoYComparison,
  getStockImbalances,
  getTotalImbalanceCost,
  getTopDecisions,
  regionColor,
} from "@/data/series";
import { getProducts } from "@/data/products";
import { locationById, locations, type Region } from "@/data/locations";
import { DecisionsQueue } from "./decisions-queue";
import { MissedOpportunitiesClient } from "./missed-opportunities-client";
import { formatCurrency, formatNumber } from "@/lib/utils";

const REGIONS: Region[] = ["EMEA", "AMER", "APAC"];

export default async function DashboardPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const products = await getProducts();
  const productById = new Map(products.map((p) => [p.id, p]));

  const [kpisAll, kpisEMEA, kpisAMER, kpisAPAC] = await Promise.all([
    getKPIs(),
    getKPIsForRegion("EMEA"),
    getKPIsForRegion("AMER"),
    getKPIsForRegion("APAC"),
  ]);
  const kpisByRegion = { EMEA: kpisEMEA, AMER: kpisAMER, APAC: kpisAPAC };

  const weekly = await getWeeklyByRegion(26);
  const weeksSet = Array.from(new Set(weekly.map((w) => w.week))).sort((a, b) => a - b);
  const chartData = weeksSet.map((w) => {
    const row: Record<string, number | string> = { week: w };
    for (const r of REGIONS) {
      row[r] = weekly.find((x) => x.week === w && x.region === r)?.units ?? 0;
    }
    return row;
  });

  const inv = await getInventory();
  const stockByRegion = REGIONS.map((r) => {
    const rows = inv.filter(
      (row) =>
        locationById.get(row.locationId)!.region === r &&
        locationById.get(row.locationId)!.channel !== "warehouse",
    );
    const cover = rows.reduce((a, b) => a + b.weeksCover, 0) / Math.max(1, rows.length);
    return { region: t(`regions.${r}`), weeksCover: cover, color: regionColor(r) };
  });

  const colorsMap: Record<Region, string> = {
    EMEA: regionColor("EMEA"),
    AMER: regionColor("AMER"),
    APAC: regionColor("APAC"),
  };

  const [topMovers, atRisk, purchaseOrders, missedSales, missedTotals, missedDiag, yoy, imbalances, imbalanceCost, decisions] =
    await Promise.all([
      getTopMovers(5),
      getAtRisk(8),
      getPurchaseOrders(),
      getMissedSales(),
      getMissedSalesTotals(),
      getMissedSalesWithDiagnosis(),
      getYoYComparison(),
      getStockImbalances(),
      getTotalImbalanceCost(),
      getTopDecisions(12),
    ]);

  const upcomingPOs = purchaseOrders
    .filter((po) => po.etaWeeks <= 3)
    .sort((a, b) => a.etaWeeks - b.etaWeeks)
    .slice(0, 6);
  const missed = missedSales.slice(0, 8);
  const missedDiagTop = missedDiag.slice(0, 8);
  const imbalancesTop = imbalances.slice(0, 6);

  const missedByRegion = {
    EMEA: missedSales
      .filter((m) => locationById.get(m.locationId)!.region === "EMEA")
      .reduce((a, b) => a + b.missedRevenue, 0),
    AMER: missedSales
      .filter((m) => locationById.get(m.locationId)!.region === "AMER")
      .reduce((a, b) => a + b.missedRevenue, 0),
    APAC: missedSales
      .filter((m) => locationById.get(m.locationId)!.region === "APAC")
      .reduce((a, b) => a + b.missedRevenue, 0),
  };

  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
  const locationsById = Object.fromEntries(locations.map((l) => [l.id, l]));

  return (
    <>
      <PageHeader title={t("dashboard.title")} subtitle={t("dashboard.subtitle")} />

      <div className="mb-6">
        <DecisionsQueue
          decisions={decisions}
          productsById={productsById}
          locationsById={locationsById}
        />
      </div>

      <DashboardKPIBar
        kpisAll={kpisAll}
        kpisByRegion={kpisByRegion}
        missedByRegion={missedByRegion}
        missedTotal={missedTotals.totalRevenue}
        imbalanceCost={imbalanceCost}
        yoy={yoy}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          title={t("dashboard.salesByRegion")}
          subtitle={t("dashboard.salesByRegionHelp")}
          info={t("info.salesByRegion")}
          className="lg:col-span-2"
        >
          <SalesByRegionChart
            data={chartData}
            regions={REGIONS}
            colors={colorsMap}
            weekLabel={t("common.week")}
          />
        </Card>
        <Card
          title={t("dashboard.stockByRegion")}
          subtitle={t("dashboard.stockByRegionHelp")}
          info={t("info.stockByRegion")}
        >
          <StockByRegionChart data={stockByRegion} />
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title={t("dashboard.topMovers")} info={t("info.topMovers")}>
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

        <Card
          title={t("dashboard.atRisk")}
          subtitle={t("dashboard.atRiskHelp")}
          info={t("info.atRisk")}
        >
          <ul className="divide-y divide-border">
            {atRisk.map((r) => {
              const p = productById.get(r.productId)!;
              const loc = locationById.get(r.locationId)!;
              return (
                <li
                  key={`${r.productId}-${r.locationId}`}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {loc.city}, {loc.countryCode}
                      {loc.partner ? ` · ${loc.partner}` : ""}
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

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title={t("imbalances.title")}
          subtitle={t("imbalances.subtitle")}
          info={t("info.imbalances")}
        >
          <ul className="divide-y divide-border">
            {imbalancesTop.map((im) => {
              const p = productById.get(im.productId)!;
              const low = locationById.get(im.lowestLocationId)!;
              const high = locationById.get(im.highestLocationId)!;
              return (
                <li key={im.productId} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="h-9 w-14 shrink-0 rounded bg-muted p-1">
                    <ShoeMark color={p.color} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 tabular-nums">
                        {low.city} {im.minCover.toFixed(1)}w
                      </span>
                      <span>↔</span>
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 tabular-nums">
                        {high.city} {im.maxCover.toFixed(1)}w
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums text-amber-700">
                      {formatCurrency(im.weeklyCarryingCost, locale)}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {formatNumber(im.overstockUnits, locale)} excess
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <MissedOpportunitiesClient
          items={missedDiagTop}
          productsById={productsById}
          locationsById={locationsById}
        />
      </div>

      <div className="mt-4">
        <Card title={t("po.title")} subtitle={t("po.subtitle")} info={t("info.inTransit")}>
          <ul className="divide-y divide-border">
            {upcomingPOs.map((po) => {
              const p = productById.get(po.productId)!;
              const from =
                po.fromLocationId === "supplier-vn"
                  ? { city: t("po.supplier"), countryCode: "VN", partner: undefined }
                  : locationById.get(po.fromLocationId)!;
              const to = locationById.get(po.toLocationId)!;
              return (
                <li key={po.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <Truck className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {p.name}{" "}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">{po.id}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {from.city}
                      {"partner" in from && from.partner ? ` (${from.partner})` : ""} → {to.city}
                      {to.partner ? ` (${to.partner})` : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums">
                      {formatNumber(po.units, locale)} {t("common.units")}
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {t("po.eta")}: {po.etaWeeks}w
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
