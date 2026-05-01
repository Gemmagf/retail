import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { locationById, channelMeta } from "@/data/locations";
import { getStoreSummaries } from "@/data/series";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

export default async function StoresPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const summaries = (await getStoreSummaries()).sort((a, b) => b.missedRevenue - a.missedRevenue);

  return (
    <>
      <PageHeader
        title={t("stores.title")}
        subtitle={t("stores.subtitle")}
        info={t("info.imbalances")}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 font-medium">{t("stores.name")}</th>
                <th className="px-2 py-2 font-medium">{t("common.region")}</th>
                <th className="px-2 py-2 font-medium">{t("channelsLabel")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("stores.skuHealth")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("stores.atRisk")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("stores.stockouts")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("stores.avgCover")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("stores.weeklyRevenue")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("stores.missedRevenue")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("stores.incoming")}</th>
                <th className="px-2 py-2 font-medium" aria-label="" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {summaries.map((s) => {
                const loc = locationById.get(s.locationId)!;
                const totalSkus = s.skusInRange + s.atRiskSkus + s.stockOutSkus;
                const healthPct = totalSkus > 0 ? (s.skusInRange / totalSkus) * 100 : 0;
                return (
                  <tr key={s.locationId} className="hover:bg-muted/40">
                    <td className="px-2 py-3">
                      <Link href={`/stores/${s.locationId}`} className="block">
                        <div className="font-medium">
                          {loc.city}
                          {loc.partner ? <span className="ml-1 text-muted-foreground">· {loc.partner}</span> : null}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {loc.country} · {loc.countryCode}
                        </div>
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-xs">{t(`regions.${loc.region}`)}</td>
                    <td className="px-2 py-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase"
                        style={{
                          background: `${channelMeta[loc.channel].color}1a`,
                          color: channelMeta[loc.channel].color,
                        }}
                      >
                        {t(`channels.${loc.channel}`)}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full",
                              healthPct > 60 ? "bg-emerald-500" : healthPct > 30 ? "bg-amber-500" : "bg-rose-500",
                            )}
                            style={{ width: `${healthPct}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-xs text-muted-foreground">
                          {healthPct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums text-amber-600">{s.atRiskSkus}</td>
                    <td className="px-2 py-3 text-right tabular-nums text-rose-600">{s.stockOutSkus}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{s.avgCover.toFixed(1)} w</td>
                    <td className="px-2 py-3 text-right tabular-nums font-medium">
                      {formatCurrency(s.weeklyRevenue, locale)}
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums font-semibold text-rose-600">
                      {formatCurrency(s.missedRevenue, locale)}
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums text-xs text-muted-foreground">
                      {formatNumber(s.incomingUnits, locale)}
                    </td>
                    <td className="px-2 py-3 text-right text-muted-foreground">
                      <Link href={`/stores/${s.locationId}`} aria-label="View store">
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
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
