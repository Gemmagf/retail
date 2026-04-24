import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { SectionTabs } from "@/components/SectionTabs";
import { getCategorySummaries } from "@/data/series";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

function Spark({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const max = Math.max(1, ...values);
  const w = 120;
  const h = 28;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  const areaPoints = `${points} ${w},${h} 0,${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-32" aria-hidden>
      <polyline points={areaPoints} fill="currentColor" opacity="0.1" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default async function CategoriesPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const summaries = getCategorySummaries().sort((a, b) => b.weeklyRevenue - a.weeklyRevenue);

  return (
    <>
      <PageHeader
        title={t("categories.title")}
        subtitle={t("categories.subtitle")}
        info={t("info.categories")}
      />
      <SectionTabs
        tabs={[
          { href: "/products", label: t("nav.products") },
          { href: "/categories", label: t("nav.categories") },
          { href: "/sizes", label: t("nav.sizes") },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {summaries.map((s) => {
          const coverAccent =
            s.avgCover < 2 ? "text-rose-600" : s.avgCover > 10 ? "text-amber-600" : "text-emerald-600";
          return (
            <Card key={s.category}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold tracking-tight">
                    {t(`products.categories.${s.category}`)}
                  </h3>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {s.skuCount} {t("categories.skus")}
                  </div>
                </div>
                <div className="text-muted-foreground">
                  <Spark values={s.weeklyHistory} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
                <div>
                  <div className="text-muted-foreground">{t("kpi.weeklyRevenue")}</div>
                  <div className="mt-0.5 text-lg font-semibold tabular-nums">
                    {formatCurrency(s.weeklyRevenue, locale)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t("kpi.weeklyMargin")}</div>
                  <div className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-700">
                    {formatCurrency(s.weeklyMargin, locale)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t("categories.sellThrough")}</div>
                  <div className="mt-0.5 font-semibold tabular-nums">
                    {s.sellThroughPct.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t("categories.cover")}</div>
                  <div className={cn("mt-0.5 font-semibold tabular-nums", coverAccent)}>
                    {s.avgCover.toFixed(1)} w
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t("categories.stockouts")}</div>
                  <div
                    className={cn(
                      "mt-0.5 font-semibold tabular-nums",
                      s.stockoutCount > 3 ? "text-rose-600" : "",
                    )}
                  >
                    {s.stockoutCount}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t("categories.missedRevenue")}</div>
                  <div
                    className={cn(
                      "mt-0.5 font-semibold tabular-nums",
                      s.missedRevenue > 1000 ? "text-rose-600" : "",
                    )}
                  >
                    {formatCurrency(s.missedRevenue, locale)}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-muted-foreground">
                {t("categories.weeklyTrend")} · {formatNumber(
                  s.weeklyHistory[s.weeklyHistory.length - 1] ?? 0,
                  locale,
                )}{" "}
                {t("common.units")}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
