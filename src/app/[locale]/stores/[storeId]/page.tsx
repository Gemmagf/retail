import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { KPICard } from "@/components/KPICard";
import { ShoeMark } from "@/components/ShoeMark";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Truck } from "lucide-react";
import { locations, locationById, channelMeta } from "@/data/locations";
import { getStoreDetail, getPurchaseOrders } from "@/data/series";
import { productById } from "@/data/products";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

export function generateStaticParams() {
  return locations
    .filter((l) => l.channel !== "warehouse")
    .map((l) => ({ storeId: l.id }));
}

export default async function StoreDetailPage({ params }: PageProps<"/[locale]/stores/[storeId]">) {
  const { locale, storeId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const detail = getStoreDetail(storeId);
  if (!detail) notFound();
  const loc = locationById.get(storeId)!;

  const incomingPOs = getPurchaseOrders()
    .filter((p) => p.toLocationId === storeId)
    .sort((a, b) => a.etaWeeks - b.etaWeeks);

  const totalSkus = detail.summary.skusInRange + detail.summary.atRiskSkus + detail.summary.stockOutSkus;
  const healthPct = totalSkus > 0 ? (detail.summary.skusInRange / totalSkus) * 100 : 0;

  return (
    <>
      <Link
        href="/stores"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("stores.back")}
      </Link>

      <PageHeader
        title={`${loc.city}${loc.partner ? ` · ${loc.partner}` : ""}`}
        subtitle={`${loc.country} · ${t(`regions.${loc.region}`)} · ${t(`channels.${loc.channel}`)}`}
      >
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium uppercase"
          style={{
            background: `${channelMeta[loc.channel].color}1a`,
            color: channelMeta[loc.channel].color,
          }}
        >
          {t(`channels.${loc.channel}`)}
        </span>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPICard
          label={t("stores.skuHealth")}
          value={`${healthPct.toFixed(0)}%`}
          help={`${detail.summary.skusInRange} / ${totalSkus} SKU`}
          accent={healthPct > 60 ? "success" : "warning"}
        />
        <KPICard
          label={t("stores.stockouts")}
          value={String(detail.summary.stockOutSkus)}
          help={`${detail.summary.atRiskSkus} ${t("stores.atRisk").toLowerCase()}`}
          accent={detail.summary.stockOutSkus > 0 ? "danger" : "default"}
        />
        <KPICard
          label={t("kpi.weeklyRevenue")}
          value={formatCurrency(detail.summary.weeklyRevenue, locale)}
          help={t("stores.weeklyRevenue")}
        />
        <KPICard
          label={t("kpi.missedRevenue")}
          value={formatCurrency(detail.summary.missedRevenue, locale)}
          help={t("kpi.missedRevenueHelp")}
          accent={detail.summary.missedRevenue > 0 ? "danger" : "default"}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title={t("stores.skusAtStore")} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 font-medium">{t("common.product")}</th>
                  <th className="px-2 py-2 font-medium text-right">{t("common.units")}</th>
                  <th className="px-2 py-2 font-medium text-right">{t("stores.avgCover")}</th>
                  <th className="px-2 py-2 font-medium">{t("stores.sizeGaps")}</th>
                  <th className="px-2 py-2 font-medium text-right">{t("stores.incoming")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {detail.rows.map((r) => {
                  const status =
                    r.units === 0 && r.velocity > 0.3
                      ? "stockout"
                      : r.weeksCover < 2
                        ? "atRisk"
                        : r.weeksCover > 12
                          ? "overstock"
                          : "healthy";
                  return (
                    <tr key={r.productId} className={cn(status === "stockout" && "bg-rose-50/40")}>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-11 shrink-0 rounded bg-muted p-1">
                            <ShoeMark color={r.productColor} className="h-full w-full" />
                          </div>
                          <span className="font-medium">{r.productName}</span>
                        </div>
                      </td>
                      <td
                        className={cn(
                          "px-2 py-2.5 text-right tabular-nums font-medium",
                          r.units === 0 && "text-rose-600",
                        )}
                      >
                        {formatNumber(r.units, locale)}
                      </td>
                      <td
                        className={cn(
                          "px-2 py-2.5 text-right tabular-nums",
                          status === "stockout" && "text-rose-600 font-semibold",
                          status === "atRisk" && "text-amber-600",
                          status === "overstock" && "text-amber-600",
                          status === "healthy" && "text-emerald-600",
                        )}
                      >
                        {status === "stockout" ? "0.0" : r.weeksCover.toFixed(1)} w
                      </td>
                      <td className="px-2 py-2.5">
                        {r.outSizes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {r.outSizes.map((sz) => (
                              <span
                                key={sz}
                                className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700"
                              >
                                {sz}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums text-xs">
                        {r.incomingUnits > 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <Truck className="h-3 w-3" />
                            {formatNumber(r.incomingUnits, locale)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title={t("po.title")} subtitle={t("po.subtitle")}>
          {incomingPOs.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <ul className="divide-y divide-border">
              {incomingPOs.map((po) => {
                const p = productById.get(po.productId)!;
                const from =
                  po.fromLocationId === "supplier-vn"
                    ? { city: t("po.supplier"), countryCode: "VN", partner: undefined }
                    : locationById.get(po.fromLocationId)!;
                return (
                  <li key={po.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <Truck className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {from.city} · {po.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold tabular-nums">
                        {formatNumber(po.units, locale)}
                      </div>
                      <div className="text-[11px] text-muted-foreground tabular-nums">
                        {t("po.eta")}: {po.etaWeeks}w
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
