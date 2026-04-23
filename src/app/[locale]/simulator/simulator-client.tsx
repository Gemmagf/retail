"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card } from "@/components/Card";
import { KPICard } from "@/components/KPICard";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Product } from "@/data/products";

type RegionKey = "EMEA" | "AMER" | "APAC";

type Props = {
  products: Product[];
  baseDemand: Record<string, Record<RegionKey, number>>;
  baseSpend: Record<RegionKey, number>;
};

const REGIONS: RegionKey[] = ["EMEA", "AMER", "APAC"];

export function SimulatorClient({ products, baseDemand, baseSpend }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const [productId, setProductId] = useState(products[0].id);
  const [region, setRegion] = useState<RegionKey>("EMEA");
  const [mktMult, setMktMult] = useState(1.2);
  const [leadTime, setLeadTime] = useState(4);
  const [target, setTarget] = useState(6);

  const product = useMemo(() => products.find((p) => p.id === productId)!, [products, productId]);

  const baseSales = baseDemand[productId][region];
  const elasticity = 0.35;
  const liftFactor = 1 + (mktMult - 1) * elasticity;
  const expectedSales = Math.round(baseSales * liftFactor * 8);
  const expectedRevenue = expectedSales * product.price;

  const weeklyDemand = baseSales * liftFactor;
  const targetUnits = Math.round(weeklyDemand * (target + leadTime));
  const stockOutRisk = Math.max(0, Math.min(100, 80 - (target + leadTime) * 6));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card title={t("simulator.title")} className="lg:col-span-1">
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {t("common.product")}
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {t("common.region")}
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as RegionKey)}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {t(`regions.${r}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                {t("simulator.marketingMultiplier")}
              </span>
              <span className="font-semibold tabular-nums">×{mktMult.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.05}
              value={mktMult}
              onChange={(e) => setMktMult(parseFloat(e.target.value))}
              className="w-full accent-foreground"
            />
            <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">
              {formatCurrency(baseSpend[region] * mktMult, locale)} / {t("common.week")}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">{t("simulator.leadTime")}</span>
              <span className="font-semibold tabular-nums">{leadTime} w</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={leadTime}
              onChange={(e) => setLeadTime(parseInt(e.target.value))}
              className="w-full accent-foreground"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                {t("simulator.targetWeeksCover")}
              </span>
              <span className="font-semibold tabular-nums">{target} w</span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              step={1}
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value))}
              className="w-full accent-foreground"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-2">
        <KPICard
          label={t("simulator.expectedSales")}
          value={`${formatNumber(expectedSales, locale)} ${t("common.units")}`}
          help="8-week horizon"
        />
        <KPICard
          label={t("simulator.expectedRevenue")}
          value={formatCurrency(expectedRevenue, locale)}
          help="8-week horizon"
        />
        <KPICard
          label={t("simulator.stockOutRisk")}
          value={`${stockOutRisk.toFixed(0)}%`}
          accent={stockOutRisk > 30 ? "danger" : stockOutRisk > 15 ? "warning" : "success"}
        />
        <KPICard
          label={t("simulator.recommendedTransfer")}
          value={`${formatNumber(targetUnits, locale)} ${t("common.units")}`}
          help={`${t(`regions.${region}`)} · ${target + leadTime} w cover`}
        />
      </div>
    </div>
  );
}
