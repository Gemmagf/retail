"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/Card";
import { ForecastChart } from "@/components/charts/ForecastChart";
import type { Product } from "@/data/products";

type ForecastPoint = {
  week: number;
  actual?: number;
  forecast?: number;
  low?: number;
  high?: number;
  ly?: number;
};

type SpendPoint = { week: number; spend: number };

type Props = {
  products: Product[];
  forecastByKey: Record<string, ForecastPoint[]>;
  spendByRegion: Record<string, SpendPoint[]>;
};

const REGIONS = ["ALL", "EMEA", "AMER", "APAC"] as const;

export function ForecastClient({ products, forecastByKey, spendByRegion }: Props) {
  const t = useTranslations();
  const [productId, setProductId] = useState(products[0].id);
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("ALL");

  const product = useMemo(() => products.find((p) => p.id === productId)!, [products, productId]);
  const forecast = forecastByKey[`${productId}|${region}`] ?? [];
  const spend = region === "ALL" ? [] : spendByRegion[region] ?? [];
  const spendByWeek = new Map(spend.map((s) => [s.week, s.spend]));

  const data = forecast.map((p) => ({
    ...p,
    spend: spendByWeek.get(p.week),
  }));

  return (
    <Card
      title={`${product.name} · ${region === "ALL" ? t("common.all") : t(`regions.${region}`)}`}
      info={t("info.forecastChart")}
      action={
        <div className="flex flex-wrap gap-2">
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
            aria-label={t("forecast.selectProduct")}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as (typeof REGIONS)[number])}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
            aria-label={t("forecast.selectRegion")}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r === "ALL" ? t("common.all") : t(`regions.${r}`)}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <ForecastChart
        data={data}
        primaryColor={product.color}
        labels={{
          actual: t("forecast.actual"),
          forecast: t("forecast.forecasted"),
          band: t("forecast.confidenceBand"),
          spend: t("forecast.marketingSpend"),
          ly: t("forecast.ly"),
          week: t("common.week"),
        }}
      />
    </Card>
  );
}
