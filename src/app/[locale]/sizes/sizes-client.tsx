"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/Card";
import { ShoeMark } from "@/components/ShoeMark";
import type { Product, Size } from "@/data/products";
import type { Location } from "@/data/locations";
import type { SizeMatrixCell } from "@/data/series";
import { cn } from "@/lib/utils";

type Props = {
  products: Product[];
  sizes: Size[];
  locations: Location[];
  matricesByProduct: Record<string, SizeMatrixCell[]>;
};

export function SizesClient({ products, sizes, locations, matricesByProduct }: Props) {
  const t = useTranslations();
  const [productId, setProductId] = useState(products[0].id);
  const product = useMemo(() => products.find((p) => p.id === productId)!, [products, productId]);
  const cells = matricesByProduct[productId] ?? [];

  const byLocSize = useMemo(() => {
    const m = new Map<string, SizeMatrixCell>();
    for (const c of cells) m.set(`${c.locationId}|${c.size}`, c);
    return m;
  }, [cells]);

  const storesOutPerSize = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of sizes) {
      m[s] = cells.filter((c) => c.size === s && c.isStockout).length;
    }
    return m;
  }, [cells, sizes]);

  const maxUnits = Math.max(1, ...cells.map((c) => c.units));

  return (
    <Card
      action={
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          aria-label={t("sizes.selectProduct")}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      }
      title={product.name}
      subtitle={`${product.gender} · ${t(`products.categories.${product.category}`)}`}
    >
      <div className="flex flex-wrap items-center gap-4 pb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-rose-400" />
          <span className="text-muted-foreground">{t("sizes.legend.stockout")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-amber-300" />
          <span className="text-muted-foreground">{t("sizes.legend.low")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-emerald-300" />
          <span className="text-muted-foreground">{t("sizes.legend.healthy")}</span>
        </div>
        <div className="ml-auto hidden items-center gap-2 text-muted-foreground md:flex">
          <div className="h-3 w-3 rounded-sm" style={{ background: product.color }} />
          <span>{product.name}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left">
              <th className="py-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                {t("common.location")}
              </th>
              {sizes.map((s) => (
                <th
                  key={s}
                  className={cn(
                    "w-10 py-2 text-center font-medium tabular-nums",
                    storesOutPerSize[s] > 0 ? "text-rose-600" : "text-muted-foreground",
                  )}
                  title={t("sizes.storesOut", { n: storesOutPerSize[s] })}
                >
                  {s}
                </th>
              ))}
            </tr>
            <tr>
              <td className="pb-3" />
              {sizes.map((s) => {
                const exp = cells.find((c) => c.size === s)?.velocityShare ?? 0;
                return (
                  <td key={s} className="pb-3">
                    <div className="h-1 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground/60"
                        style={{ width: `${Math.min(100, exp * 100 * 6)}%` }}
                      />
                    </div>
                  </td>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc.id} className="border-t border-border">
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-8 shrink-0 items-center justify-center rounded bg-muted p-0.5">
                      <ShoeMark color={product.color} className="h-full w-full" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {loc.city}
                        {loc.partner ? (
                          <span className="ml-1 text-[10px] text-muted-foreground">{loc.partner}</span>
                        ) : null}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{loc.countryCode}</div>
                    </div>
                  </div>
                </td>
                {sizes.map((s) => {
                  const cell = byLocSize.get(`${loc.id}|${s}`);
                  if (!cell) return <td key={s} />;
                  const relative = cell.units / maxUnits;
                  const bg = cell.isStockout
                    ? "#f87171"
                    : cell.isLow
                      ? "#fcd34d"
                      : `color-mix(in oklab, #10b981 ${Math.min(100, Math.max(20, relative * 100))}%, white)`;
                  return (
                    <td key={s} className="px-0.5 py-1">
                      <div
                        title={`${loc.city} · ${s}: ${cell.units}${cell.isStockout ? " (stock-out)" : ""}`}
                        className="flex h-7 items-center justify-center rounded text-[10px] font-semibold tabular-nums"
                        style={{
                          background: bg,
                          color: cell.isStockout ? "white" : "#0a0a0a",
                        }}
                      >
                        {cell.isStockout ? "—" : cell.units}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
