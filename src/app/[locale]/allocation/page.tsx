import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { ShoeMark } from "@/components/ShoeMark";
import { ArrowRight } from "lucide-react";
import { getAllocationRecommendations } from "@/data/series";
import { productById } from "@/data/products";
import { locationById } from "@/data/locations";
import { formatNumber } from "@/lib/utils";

export default async function AllocationPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const recs = getAllocationRecommendations().slice(0, 30);

  return (
    <>
      <PageHeader title={t("allocation.title")} subtitle={t("allocation.subtitle")} />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 font-medium">{t("common.product")}</th>
                <th className="px-2 py-2 font-medium">{t("common.location")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("allocation.current")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("allocation.delta")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("allocation.recommended")}</th>
                <th className="px-2 py-2 font-medium">{t("allocation.reasoning")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recs.map((r, i) => {
                const p = productById.get(r.productId)!;
                const from = locationById.get(r.fromLocationId)!;
                const to = locationById.get(r.toLocationId)!;
                const reasonText =
                  r.reasonKey === "stockOut"
                    ? t("allocation.reasonStockOut", { weeks: r.reasonWeeks })
                    : r.reasonKey === "overstock"
                      ? t("allocation.reasonOverstock", { weeks: r.reasonWeeks })
                      : r.reasonKey === "campaign"
                        ? t("allocation.reasonCampaign")
                        : t("allocation.reasonSeasonality");

                return (
                  <tr key={i} className="hover:bg-muted/40">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-12 shrink-0 rounded bg-muted p-1">
                          <ShoeMark color={p.color} className="h-full w-full" />
                        </div>
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="rounded border border-border px-1.5 py-0.5">
                          {from.city}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="rounded bg-foreground px-1.5 py-0.5 text-background">
                          {to.city}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums text-muted-foreground">
                      {formatNumber(r.current, locale)}
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums font-semibold text-emerald-600">
                      +{formatNumber(r.delta, locale)}
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums font-semibold">
                      {formatNumber(r.recommended, locale)}
                    </td>
                    <td className="px-2 py-3 text-xs text-muted-foreground">{reasonText}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
