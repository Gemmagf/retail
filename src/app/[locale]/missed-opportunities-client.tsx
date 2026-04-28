"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  AlertOctagon,
  Check,
  ChevronDown,
  ClipboardCheck,
  Lightbulb,
  Truck,
  TrendingDown,
} from "lucide-react";
import { Card } from "@/components/Card";
import { ShoeMark } from "@/components/ShoeMark";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import type { Product } from "@/data/products";
import type { Location } from "@/data/locations";
import type { MissedSaleWithDiagnosis } from "@/data/series";

type Status = "pending" | "recovered" | "logged";

type Props = {
  items: MissedSaleWithDiagnosis[];
  productsById: Record<string, Product>;
  locationsById: Record<string, Location>;
};

export function MissedOpportunitiesClient({ items, productsById, locationsById }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [expanded, setExpanded] = useState<string | null>(items[0] ? key(items[0]) : null);

  function key(m: MissedSaleWithDiagnosis) {
    return `${m.productId}-${m.locationId}`;
  }

  const totals = useMemo(() => {
    let totalLost = 0;
    let recoverable = 0;
    let recovered = 0;
    let logged = 0;
    for (const m of items) {
      totalLost += m.missedRevenue;
      const k = key(m);
      const s = statuses[k] ?? "pending";
      if (s === "pending") recoverable += m.missedRevenue;
      if (s === "recovered") recovered++;
      if (s === "logged") logged++;
    }
    return { totalLost, recoverable, recovered, logged };
  }, [items, statuses]);

  function setStatus(id: string, s: Status) {
    setStatuses((prev) => {
      const next = { ...prev };
      if (next[id] === s) delete next[id];
      else next[id] = s;
      return next;
    });
  }

  return (
    <Card title={t("missed.title")} subtitle={t("missed.subtitle")} info={t("missed.framework")}>
      <div className="-mt-2 mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Mini label={t("missed.summary.totalLost")} value={formatCurrency(totals.totalLost, locale)} tone="danger" />
        <Mini label={t("missed.summary.recoverable")} value={formatCurrency(totals.recoverable, locale)} tone="warning" />
        <Mini
          label={t("missed.summary.actionsLogged")}
          value={`${totals.recovered + totals.logged}`}
          tone={totals.recovered + totals.logged > 0 ? "success" : "muted"}
        />
      </div>

      <ul className="divide-y divide-border">
        {items.map((m) => {
          const k = key(m);
          const product = productsById[m.productId];
          const loc = locationsById[m.locationId];
          if (!product || !loc) return null;
          const status = statuses[k] ?? "pending";
          const isExpanded = expanded === k;

          return (
            <li
              key={k}
              className={cn(
                "transition-colors",
                status === "recovered" && "bg-emerald-50/40",
                status === "logged" && "bg-sky-50/40",
              )}
            >
              <div className="flex flex-wrap items-center gap-3 py-3">
                <button
                  onClick={() => setExpanded(isExpanded ? null : k)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <div className="h-9 w-14 shrink-0 rounded bg-muted p-1">
                    <ShoeMark color={product.color} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">{product.name}</span>
                      {m.reason === "fullStockout" ? (
                        <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-800">
                          {t("missed.labels.stockOut")}
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                          {t("missed.labels.sizeGap")}
                        </span>
                      )}
                      {status === "recovered" && (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                          {t("missed.labels.recovered")}
                        </span>
                      )}
                      {status === "logged" && (
                        <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-sky-800">
                          {t("missed.labels.logged")}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {loc.city}
                      {loc.partner ? ` · ${loc.partner}` : ""} · {loc.countryCode}
                      {m.sizeGaps && m.sizeGaps.length > 0
                        ? ` · ${m.sizeGaps.slice(0, 4).join(", ")}${m.sizeGaps.length > 4 ? "…" : ""}`
                        : ""}
                    </div>
                  </div>
                </button>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums text-rose-600">
                    {formatCurrency(m.missedRevenue, locale)}
                  </div>
                  <div className="text-[11px] text-muted-foreground tabular-nums">
                    ~{formatNumber(m.missedUnits, locale)} {t("common.units")}
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(isExpanded ? null : k)}
                  className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Toggle details"
                >
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")}
                  />
                </button>
              </div>

              {isExpanded && (
                <div className="mb-3 grid grid-cols-1 gap-3 rounded-md bg-muted/40 p-4 text-xs md:grid-cols-3">
                  <Step
                    icon={AlertOctagon}
                    tone="rose"
                    label={t("missed.rootCause")}
                    body={m.diagnosis.rootCause}
                  />
                  <Step
                    icon={Truck}
                    tone="emerald"
                    label={t("missed.recoverNow")}
                    body={m.diagnosis.recoverAction}
                    cta={
                      <button
                        onClick={() => setStatus(k, "recovered")}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          status === "recovered"
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-emerald-500 text-emerald-700 hover:bg-emerald-500 hover:text-white",
                        )}
                      >
                        <Check className="h-3 w-3" />
                        {t("missed.actions.recover")}
                      </button>
                    }
                  />
                  <Step
                    icon={Lightbulb}
                    tone="sky"
                    label={t("missed.preventNext")}
                    body={m.diagnosis.preventAction}
                    extra={
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {t("missed.owner")}: {t(`missed.fixOwners.${m.diagnosis.preventOwner}`)}
                      </span>
                    }
                    cta={
                      <button
                        onClick={() => setStatus(k, "logged")}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          status === "logged"
                            ? "border-sky-500 bg-sky-500 text-white"
                            : "border-sky-500 text-sky-700 hover:bg-sky-500 hover:text-white",
                        )}
                      >
                        <ClipboardCheck className="h-3 w-3" />
                        {t("missed.actions.prevent")}
                      </button>
                    }
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "danger" | "warning" | "success" | "muted";
}) {
  const cls =
    tone === "danger"
      ? "text-rose-600"
      : tone === "warning"
        ? "text-amber-600"
        : tone === "success"
          ? "text-emerald-700"
          : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1 text-lg font-semibold tabular-nums", cls)}>{value}</div>
    </div>
  );
}

function Step({
  icon: Icon,
  tone,
  label,
  body,
  cta,
  extra,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "rose" | "emerald" | "sky";
  label: string;
  body: string;
  cta?: React.ReactNode;
  extra?: React.ReactNode;
}) {
  const dotCls =
    tone === "rose"
      ? "bg-rose-100 text-rose-600"
      : tone === "emerald"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-sky-100 text-sky-700";
  return (
    <div className="flex flex-col gap-2 rounded-md bg-background p-3">
      <div className="flex items-center gap-2">
        <span className={cn("inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full", dotCls)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="leading-relaxed text-foreground/90">{body}</p>
      {(extra || cta) && (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {extra}
          {cta}
        </div>
      )}
    </div>
  );
}
