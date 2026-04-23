import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { ShoeMark } from "@/components/ShoeMark";
import { products } from "@/data/products";
import { getInventory } from "@/data/series";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default async function ProductsPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const inv = getInventory();
  const summary = new Map<string, { units: number; cover: number; n: number }>();
  for (const r of inv) {
    const s = summary.get(r.productId) ?? { units: 0, cover: 0, n: 0 };
    s.units += r.units;
    s.cover += r.weeksCover;
    s.n += 1;
    summary.set(r.productId, s);
  }

  return (
    <>
      <PageHeader title={t("products.title")} subtitle={t("products.subtitle")} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => {
          const s = summary.get(p.id)!;
          const cover = s.cover / s.n;
          const accent =
            cover < 2 ? "text-rose-600" : cover > 10 ? "text-amber-600" : "text-emerald-600";
          return (
            <article
              key={p.id}
              className="rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-sm"
            >
              <div
                className="mb-3 flex h-32 w-full items-center justify-center rounded-md p-4"
                style={{ background: `${p.color}10` }}
              >
                <ShoeMark color={p.color} className="h-full w-full" />
              </div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold tracking-tight">{p.name}</h3>
                <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {t(`products.categories.${p.category}`)}
                </span>
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
            </article>
          );
        })}
      </div>
    </>
  );
}
