"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowRight,
  Check,
  ChevronDown,
  RotateCcw,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { Card } from "@/components/Card";
import { ShoeMark } from "@/components/ShoeMark";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { type Product } from "@/data/products";
import { type Region, type Channel, type Location, channelMeta } from "@/data/locations";
import { type AllocationRecommendation } from "@/data/series";

type Status = "pending" | "approved" | "rejected";

type Props = {
  recommendations: AllocationRecommendation[];
  productsById: Record<string, Product>;
  locationsById: Record<string, Location>;
};

const REGION_OPTIONS: (Region | "ALL")[] = ["ALL", "EMEA", "AMER", "APAC"];
const CHANNEL_OPTIONS: (Channel | "ALL")[] = ["ALL", "flagship", "retail", "warehouse", "ecom"];

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length === 0) return null;
  const max = Math.max(1, ...values);
  const w = 100;
  const h = 24;
  const step = w / (values.length - 1);
  const points = values
    .map((v, i) => `${i * step},${h - (v / max) * h}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-6 w-24" aria-hidden>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={i * step} cy={h - (v / max) * h} r="1.5" fill={color} />
      ))}
    </svg>
  );
}

export function AllocationClient({ recommendations, productsById, locationsById }: Props) {
  const t = useTranslations();
  const locale = useLocale();

  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<(typeof REGION_OPTIONS)[number]>("ALL");
  const [channel, setChannel] = useState<(typeof CHANNEL_OPTIONS)[number]>("ALL");
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return recommendations.filter((r) => {
      const status = statuses[r.id] ?? "pending";
      if (status !== "pending") return true;
      const product = productsById[r.productId];
      const dest = locationsById[r.toLocationId];
      if (region !== "ALL" && dest.region !== region) return false;
      if (channel !== "ALL" && dest.channel !== channel) return false;
      if (
        search &&
        !product.name.toLowerCase().includes(search.toLowerCase()) &&
        !dest.city.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [recommendations, search, region, channel, statuses, productsById, locationsById]);

  const visiblePending = filtered.filter((r) => (statuses[r.id] ?? "pending") === "pending");

  const summary = useMemo(() => {
    let units = 0;
    let revenue = 0;
    let margin = 0;
    for (const r of visiblePending) {
      units += r.delta;
      revenue += r.expectedRevenueImpact;
      margin += r.expectedMarginImpact;
    }
    return { count: visiblePending.length, units, revenue, margin };
  }, [visiblePending]);

  const approvedCount = Object.values(statuses).filter((s) => s === "approved").length;
  const rejectedCount = Object.values(statuses).filter((s) => s === "rejected").length;

  function setStatus(id: string, status: Status) {
    setStatuses((prev) => {
      const next = { ...prev };
      if (next[id] === status) delete next[id];
      else next[id] = status;
      return next;
    });
  }

  function reset() {
    setSearch("");
    setRegion("ALL");
    setChannel("ALL");
    setStatuses({});
    setExpanded(null);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryStat label={t("allocation.summary.totalRecs")} value={String(summary.count)} accent="default" />
        <SummaryStat
          label={t("allocation.summary.totalUnits")}
          value={`${formatNumber(summary.units, locale)}`}
          accent="default"
        />
        <SummaryStat
          label={t("allocation.summary.revenueImpact")}
          value={formatCurrency(summary.revenue, locale)}
          accent="success"
        />
        <SummaryStat
          label={t("allocation.summary.marginImpact")}
          value={formatCurrency(summary.margin, locale)}
          accent="success"
        />
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("allocation.filters.search")}
              className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-2 text-sm focus:border-foreground focus:outline-none"
            />
          </div>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as (typeof REGION_OPTIONS)[number])}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            {REGION_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r === "ALL" ? t("allocation.filters.allRegions") : t(`regions.${r}`)}
              </option>
            ))}
          </select>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as (typeof CHANNEL_OPTIONS)[number])}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            {CHANNEL_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c === "ALL" ? t("allocation.filters.allChannels") : t(`channels.${c}`)}
              </option>
            ))}
          </select>
          {(approvedCount > 0 || rejectedCount > 0 || search || region !== "ALL" || channel !== "ALL") && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              {t("allocation.filters.reset")}
            </button>
          )}
          {(approvedCount > 0 || rejectedCount > 0) && (
            <div className="ml-auto text-xs tabular-nums text-muted-foreground">
              {approvedCount > 0 && (
                <span className="mr-3 inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {approvedCount} {t("allocation.summary.approved")}
                </span>
              )}
              {rejectedCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  {rejectedCount} {t("allocation.summary.rejected")}
                </span>
              )}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("allocation.empty")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((r) => {
              const product = productsById[r.productId];
              const from = locationsById[r.fromLocationId];
              const to = locationsById[r.toLocationId];
              const status = statuses[r.id] ?? "pending";
              const isExpanded = expanded === r.id;

              const reasonText =
                r.reasonKey === "stockOut"
                  ? t("allocation.reasonStockOut", { weeks: r.reasonWeeks })
                  : r.reasonKey === "overstock"
                    ? t("allocation.reasonOverstock", { weeks: r.reasonWeeks })
                    : r.reasonKey === "campaign"
                      ? t("allocation.reasonCampaign")
                      : t("allocation.reasonSeasonality");

              return (
                <li
                  key={r.id}
                  className={cn(
                    "transition-opacity",
                    status === "rejected" && "opacity-40",
                    status === "approved" && "bg-emerald-50/40",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-3 py-3">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : r.id)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <div className="h-9 w-14 shrink-0 rounded bg-muted p-1">
                        <ShoeMark color={product.color} className="h-full w-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{product.name}</span>
                          {r.reasonKey === "campaign" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-amber-800">
                              <Sparkles className="h-2.5 w-2.5" />
                              {r.campaignLabel}
                            </span>
                          )}
                          {r.reasonKey === "stockOut" && (
                            <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-rose-800">
                              stock-out
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="rounded border border-border px-1 py-0.5">
                            {from.city}
                            {from.partner ? ` · ${from.partner}` : ""}
                          </span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="rounded bg-foreground px-1 py-0.5 text-background">
                            {to.city}
                            {to.partner ? ` · ${to.partner}` : ""}
                          </span>
                          <span
                            className="ml-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase"
                            style={{
                              background: `${channelMeta[to.channel].color}1a`,
                              color: channelMeta[to.channel].color,
                            }}
                          >
                            {t(`channels.${to.channel}`)}
                          </span>
                        </div>
                      </div>
                    </button>

                    <div className="hidden items-baseline gap-1 sm:flex">
                      <span className="tabular-nums text-xs text-muted-foreground">
                        {formatNumber(r.current, locale)}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="tabular-nums text-sm font-semibold">
                        {formatNumber(r.recommended, locale)}
                      </span>
                      <span className="ml-1 rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-emerald-700">
                        +{formatNumber(r.delta, locale)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setStatus(r.id, "approved")}
                        title={t("allocation.approve")}
                        className={cn(
                          "rounded-md border p-1.5 transition-colors",
                          status === "approved"
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-600",
                        )}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setStatus(r.id, "rejected")}
                        title={t("allocation.reject")}
                        className={cn(
                          "rounded-md border p-1.5 transition-colors",
                          status === "rejected"
                            ? "border-rose-500 bg-rose-500 text-white"
                            : "border-border text-muted-foreground hover:border-rose-500 hover:text-rose-600",
                        )}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : r.id)}
                        className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted"
                      >
                        <ChevronDown
                          className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")}
                        />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mb-3 grid grid-cols-1 gap-4 rounded-md bg-muted/40 p-4 text-xs md:grid-cols-3">
                      <div>
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("allocation.expand.origin")} — {from.city}
                          {from.partner ? ` · ${from.partner}` : ""}
                        </div>
                        <dl className="space-y-1">
                          <Row label={t("common.units")} value={formatNumber(r.originUnits, locale)} />
                          <Row label={t("allocation.expand.cover")} value={`${r.originCover.toFixed(1)} w`} />
                        </dl>
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase"
                          style={{
                            background: `${channelMeta[from.channel].color}1a`,
                            color: channelMeta[from.channel].color,
                          }}
                        >
                          {t(`channels.${from.channel}`)}
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("allocation.expand.destination")} — {to.city}
                        </div>
                        <dl className="space-y-1">
                          <Row label={t("allocation.expand.velocity")} value={`${r.destVelocity.toFixed(1)} u/w`} />
                          <Row
                            label={t("allocation.expand.cover")}
                            value={
                              <>
                                <span className="text-rose-600">{r.destCoverNow.toFixed(1)}w</span>
                                <span className="mx-1 text-muted-foreground">→</span>
                                <span className="text-emerald-600 font-semibold">{r.destCoverAfter.toFixed(1)}w</span>
                                <span className="ml-1 text-muted-foreground">{t("allocation.expand.afterTransfer")}</span>
                              </>
                            }
                          />
                        </dl>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {t("allocation.expand.recentSales")}
                          </span>
                          <Sparkline values={r.recentSales} color={product.color} />
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("allocation.expand.expectedImpact")}
                        </div>
                        <div className="mb-2 inline-flex items-start gap-2">
                          <TrendingUp className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                          <div>
                            <div className="font-semibold tabular-nums text-emerald-700">
                              {formatCurrency(r.expectedRevenueImpact, locale)}
                            </div>
                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              {t("kpi.weeklyRevenue").toLowerCase()}
                            </div>
                          </div>
                        </div>
                        <div className="inline-flex items-start gap-2">
                          <TrendingUp className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                          <div>
                            <div className="font-semibold tabular-nums text-emerald-700">
                              {formatCurrency(r.expectedMarginImpact, locale)}
                            </div>
                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              {t("kpi.weeklyMargin").toLowerCase()}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 rounded-md border border-border bg-background p-2 text-[11px] text-muted-foreground">
                          {reasonText}
                          {r.campaignLabel && (
                            <>
                              <br />
                              <span className="font-medium text-foreground">
                                {t("allocation.expand.campaign")}: {r.campaignLabel}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "default" | "success";
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1.5 text-2xl font-semibold tabular-nums",
          accent === "success" ? "text-emerald-700" : "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-dashed border-border/60 py-1 last:border-b-0">
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-xs font-medium tabular-nums">{value}</dd>
    </div>
  );
}
