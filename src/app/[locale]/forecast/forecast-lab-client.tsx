"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Award, Sparkles } from "lucide-react";
import { Card } from "@/components/Card";
import { cn, formatNumber } from "@/lib/utils";
import type { Product } from "@/data/products";
import type { ForecastMethod, MethodForecast, HierarchicalRow } from "@/data/series";

const METHOD_COLOR: Record<ForecastMethod, string> = {
  "seasonal-naive": "#94a3b8",
  ets: "#0ea5e9",
  prophet: "#8b5cf6",
  chronos: "#0d9488",
  timesfm: "#d97706",
  ensemble: "#0a2540",
};

const METHOD_LABEL: Record<ForecastMethod, string> = {
  "seasonal-naive": "Seasonal Naive",
  ets: "ETS",
  prophet: "Prophet",
  chronos: "Chronos",
  timesfm: "TimesFM",
  ensemble: "Ensemble",
};

const FAMILY_LABEL: Record<MethodForecast["family"], string> = {
  classic: "Classic",
  ml: "ML",
  tsfm: "TSFM",
  ensemble: "Ensemble",
};

type Props = {
  products: Product[];
  methodsByKey: Record<string, MethodForecast[]>;
  hierarchical: HierarchicalRow[];
};

const REGIONS = ["ALL", "EMEA", "AMER", "APAC"] as const;

export function ForecastLabClient({ products, methodsByKey, hierarchical }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const [productId, setProductId] = useState(products[0].id);
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("ALL");
  const [showChallengers, setShowChallengers] = useState(true);

  const product = useMemo(
    () => products.find((p) => p.id === productId)!,
    [products, productId],
  );

  const methods = methodsByKey[`${productId}|${region}`] ?? [];
  const champion = methods.find((m) => m.isChampion) ?? methods[0];
  const challengers = methods.filter(
    (m) => !m.isChampion && (m.family === "tsfm" || m.family === "ml"),
  );

  const data = useMemo(() => {
    if (!champion) return [];
    const championPoints = new Map(champion.points.map((p) => [p.week, p]));
    const allWeeks = champion.points.map((p) => p.week);
    return allWeeks.map((week) => {
      const champ = championPoints.get(week)!;
      const row: Record<string, number | undefined | null> = {
        week,
        actual: champ.actual,
        championForecast: champ.forecast,
        p10: champ.p10,
        p90: champ.p90,
        band:
          champ.p10 !== undefined && champ.p90 !== undefined ? champ.p90 - champ.p10 : undefined,
      };
      for (const ch of challengers) {
        const p = ch.points.find((x) => x.week === week);
        row[ch.method] = p?.forecast;
      }
      return row;
    });
  }, [champion, challengers]);

  return (
    <div className="space-y-4">
      <Card
        title={`${product.name} · ${region === "ALL" ? t("common.all") : t(`regions.${region}`)}`}
        subtitle={`Champion: ${METHOD_LABEL[champion?.method ?? "ensemble"]} · MAPE 1w ${champion?.mapeByHorizon[1].toFixed(1)}%`}
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
            <label className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs">
              <input
                type="checkbox"
                checked={showChallengers}
                onChange={(e) => setShowChallengers(e.target.checked)}
                className="accent-foreground"
              />
              {t("forecastLab.showChallengers")}
            </label>
          </div>
        }
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={METHOD_COLOR[champion?.method ?? "ensemble"]}
                    stopOpacity={0.18}
                  />
                  <stop
                    offset="100%"
                    stopColor={METHOD_COLOR[champion?.method ?? "ensemble"]}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eaeae6" />
              <XAxis
                dataKey="week"
                tickFormatter={(w) => `${t("common.week")} ${w}`}
                tick={{ fontSize: 11, fill: "#5b5b58" }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#5b5b58" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  border: "1px solid #e6e6e3",
                  borderRadius: 8,
                  background: "white",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              <Area
                type="monotone"
                dataKey="p90"
                stroke="none"
                fill="url(#band)"
                name={t("forecastLab.bandP90")}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="p10"
                stroke="none"
                fill="white"
                fillOpacity={1}
                name={t("forecastLab.bandP10")}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name={t("forecast.actual")}
                stroke="#0a0a0a"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="championForecast"
                name={`${t("forecastLab.champion")} · ${METHOD_LABEL[champion?.method ?? "ensemble"]}`}
                stroke={METHOD_COLOR[champion?.method ?? "ensemble"]}
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={false}
              />
              {showChallengers &&
                challengers.map((ch) => (
                  <Line
                    key={ch.method}
                    type="monotone"
                    dataKey={ch.method}
                    name={`${METHOD_LABEL[ch.method]}`}
                    stroke={METHOD_COLOR[ch.method]}
                    strokeWidth={1.5}
                    strokeDasharray="2 3"
                    dot={false}
                  />
                ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card
        title={t("forecastLab.compareTitle")}
        subtitle={t("forecastLab.compareSubtitle")}
        info={t("info.forecastCompare")}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 font-medium">{t("forecastLab.method")}</th>
                <th className="px-2 py-2 font-medium">{t("forecastLab.family")}</th>
                <th className="px-2 py-2 font-medium text-right">1w</th>
                <th className="px-2 py-2 font-medium text-right">4w</th>
                <th className="px-2 py-2 font-medium text-right">8w</th>
                <th className="px-2 py-2 font-medium text-right">13w</th>
                <th className="px-2 py-2 font-medium text-right">{t("forecastLab.bias")}</th>
                <th className="px-2 py-2 font-medium">{t("forecastLab.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {methods.map((m) => (
                <tr
                  key={m.method}
                  className={cn("hover:bg-muted/30", m.isChampion && "bg-emerald-50/30")}
                >
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: METHOD_COLOR[m.method] }}
                      />
                      <span className="font-medium">{METHOD_LABEL[m.method]}</span>
                    </div>
                  </td>
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
                      {FAMILY_LABEL[m.family]}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">
                    {m.mapeByHorizon[1].toFixed(1)}%
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">
                    {m.mapeByHorizon[4].toFixed(1)}%
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">
                    {m.mapeByHorizon[8].toFixed(1)}%
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">
                    {m.mapeByHorizon[13].toFixed(1)}%
                  </td>
                  <td
                    className={cn(
                      "px-2 py-2.5 text-right tabular-nums text-xs",
                      Math.abs(m.bias) > 1 && "text-amber-700",
                    )}
                  >
                    {m.bias > 0 ? "+" : ""}
                    {m.bias.toFixed(1)}
                  </td>
                  <td className="px-2 py-2.5">
                    {m.isChampion ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                        <Award className="h-3 w-3" />
                        {t("forecastLab.champion")}
                      </span>
                    ) : m.family === "tsfm" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-teal-800">
                        <Sparkles className="h-3 w-3" />
                        {t("forecastLab.challenger")}
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase text-muted-foreground">
                        {t("forecastLab.production")}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card
        title={t("forecastLab.hierTitle")}
        subtitle={t("forecastLab.hierSubtitle")}
        info={t("info.hierarchical")}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 font-medium">{t("forecastLab.level")}</th>
                <th className="px-2 py-2 font-medium">{t("forecastLab.scope")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("forecastLab.bottomUp4w")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("forecastLab.reconciled4w")}</th>
                <th className="px-2 py-2 font-medium text-right">Δ 4w</th>
                <th className="px-2 py-2 font-medium text-right">{t("forecastLab.bottomUp8w")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("forecastLab.reconciled8w")}</th>
                <th className="px-2 py-2 font-medium text-right">Δ 8w</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {hierarchical.map((row) => (
                <tr key={`${row.level}-${row.key}`} className="hover:bg-muted/30">
                  <td className="px-2 py-2.5">
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase",
                        row.level === "network" && "bg-indigo-100 text-indigo-800",
                        row.level === "region" && "bg-sky-100 text-sky-800",
                        row.level === "store" && "bg-slate-100 text-slate-700",
                        row.level === "sku" && "bg-emerald-100 text-emerald-800",
                      )}
                    >
                      {t(`forecastLab.levels.${row.level}`)}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 font-medium">{row.label}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">
                    {formatNumber(row.bottomUp4w, locale)}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums font-semibold">
                    {formatNumber(row.reconciled4w, locale)}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-2.5 text-right tabular-nums text-xs",
                      Math.abs(row.delta4wPct) > 3 ? "text-amber-700" : "text-muted-foreground",
                    )}
                  >
                    {row.delta4wPct > 0 ? "+" : ""}
                    {row.delta4wPct.toFixed(1)}%
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">
                    {formatNumber(row.bottomUp8w, locale)}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums font-semibold">
                    {formatNumber(row.reconciled8w, locale)}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-2.5 text-right tabular-nums text-xs",
                      Math.abs(row.delta8wPct) > 3 ? "text-amber-700" : "text-muted-foreground",
                    )}
                  >
                    {row.delta8wPct > 0 ? "+" : ""}
                    {row.delta8wPct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t("forecastLab.hierFooter")}</p>
      </Card>
    </div>
  );
}
