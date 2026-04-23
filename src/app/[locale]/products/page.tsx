import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { ShoeMark } from "@/components/ShoeMark";
import { SizeGrid } from "@/components/SizeGrid";
import { Sparkles } from "lucide-react";
import { products, SIZE_GRID } from "@/data/products";
import { getInventory, getProductSizeBreakdown } from "@/data/series";
import { locationById } from "@/data/locations";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default async function ProductsPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const inv = getInventory();
  const summary = new Map<string, { units: number; cover: number; n: number }>();
  for (const r of inv) {
    if (locationById.get(r.locationId)!.channel === "warehouse") continue;
    const s = summary.get(r.productId) ?? { units: 0, cover: 0, n: 0 };
    s.units += r.units;
    s.cover += r.weeksCover;
    s.n += 1;
    summary.set(r.productId, s);
  }

  return (
    <>
      <PageHeader title={t("products.title")} subtitle={t("products.subtitle")} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => {
          const s = summary.get(p.id) ?? { units: 0, cover: 0, n: 1 };
          const cover = s.cover / s.n;
          const accent =
            cover < 2 ? "text-rose-600" : cover > 10 ? "text-amber-600" : "text-emerald-600";
          const sizeBreakdown = getProductSizeBreakdown(p.id);
          const buckets = SIZE_GRID.map((sz) => {
            const row = sizeBreakdown.find((b) => b.size === sz)!;
            return {
              label: sz,
              units: row.units,
              stockoutLocations: row.stockoutLocations,
            };
          });

          return (
            <article
              key={p.id}
              className="rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-sm"
            >
              <div
                className="relative mb-3 flex h-32 w-full items-center justify-center rounded-md p-4"
                style={{ background: `${p.color}10` }}
              >
                <ShoeMark color={p.color} className="h-full w-full" />
                {p.isNewIn && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
                    <Sparkles className="h-3 w-3" />
                    New
                  </span>
                )}
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold tracking-tight">{p.name}</h3>
                  <div className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {t(`products.categories.${p.category}`)} · {p.gender}
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
                <div>
                  <div className="text-muted-foreground">{t("products.price")}</div>
                  <div className="mt-0.5 font-semibold tabular-nums">
                    {formatCurrency(p.price, locale)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t("products.globalStock")}</div>
                  <div className="mt-0.5 font-semibold tabular-nums">
                    {formatNumber(s.units, locale)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t("products.weeksCover")}</div>
                  <div className={`mt-0.5 font-semibold tabular-nums ${accent}`}>
                    {cover.toFixed(1)}
                  </div>
                </div>
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t("size.title")}
                </div>
                <SizeGrid
                  buckets={buckets}
                  stockoutLabelTemplate={(n) => t("size.stockout", { n })}
                />
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
