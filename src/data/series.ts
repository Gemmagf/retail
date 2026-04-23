import { products, productById, type Product } from "./products";
import { locations, locationById, type Region, regionMeta } from "./locations";
import { hashSeed, mulberry32 } from "@/lib/utils";

export const HISTORY_WEEKS = 52;
export const FORECAST_WEEKS = 8;
export const TOTAL_WEEKS = HISTORY_WEEKS + FORECAST_WEEKS;
export const CURRENT_WEEK_INDEX = HISTORY_WEEKS - 1;

const CAMPAIGNS: { region: Region; centerWeek: number; lift: number; label: string }[] = [
  { region: "EMEA", centerWeek: 14, lift: 1.6, label: "Berlin Marathon" },
  { region: "AMER", centerWeek: 38, lift: 1.5, label: "NYC Marathon" },
  { region: "APAC", centerWeek: 6, lift: 1.4, label: "Tokyo Marathon" },
  { region: "EMEA", centerWeek: 46, lift: 1.3, label: "Holiday lifestyle push" },
  { region: "AMER", centerWeek: 22, lift: 1.25, label: "Summer trail launch" },
];

function seasonality(weekIdx: number): number {
  const phase = (weekIdx / 52) * Math.PI * 2;
  return 1 + 0.25 * Math.sin(phase - Math.PI / 2);
}

function campaignLift(region: Region, weekIdx: number): number {
  let mult = 1;
  for (const c of CAMPAIGNS) {
    if (c.region !== region) continue;
    const dist = Math.abs(weekIdx - c.centerWeek);
    if (dist <= 3) {
      mult *= 1 + (c.lift - 1) * Math.exp(-(dist * dist) / 2.5);
    }
  }
  return mult;
}

function trendLift(productId: string, weekIdx: number): number {
  if (productId === "cloudboom-strike") return 1 + weekIdx * 0.005;
  if (productId === "cloud-5") return 1 + weekIdx * 0.004;
  if (productId === "cloudgo") return 1 - weekIdx * 0.002;
  return 1;
}

export type SaleRow = {
  productId: string;
  locationId: string;
  region: Region;
  week: number;
  units: number;
};

let _sales: SaleRow[] | null = null;

export function getSales(): SaleRow[] {
  if (_sales) return _sales;
  const out: SaleRow[] = [];
  for (const product of products) {
    for (const location of locations) {
      const baseDemand =
        product.basePopularity *
        product.regionBias[location.region] *
        location.scale *
        12;
      const rand = mulberry32(hashSeed(product.id, location.id));
      for (let week = 0; week < HISTORY_WEEKS; week++) {
        const noise = 0.85 + rand() * 0.3;
        const units = Math.max(
          0,
          Math.round(
            baseDemand *
              seasonality(week) *
              campaignLift(location.region, week) *
              trendLift(product.id, week) *
              noise,
          ),
        );
        out.push({
          productId: product.id,
          locationId: location.id,
          region: location.region,
          week,
          units,
        });
      }
    }
  }
  _sales = out;
  return out;
}

export type InventoryRow = {
  productId: string;
  locationId: string;
  units: number;
  weeksCover: number;
};

function recentVelocity(productId: string, locationId: string, weeks = 4): number {
  const sales = getSales().filter(
    (s) =>
      s.productId === productId &&
      s.locationId === locationId &&
      s.week >= CURRENT_WEEK_INDEX - weeks + 1 &&
      s.week <= CURRENT_WEEK_INDEX,
  );
  return sales.reduce((a, b) => a + b.units, 0) / Math.max(1, sales.length);
}

let _inventory: InventoryRow[] | null = null;

export function getInventory(): InventoryRow[] {
  if (_inventory) return _inventory;
  const out: InventoryRow[] = [];
  for (const product of products) {
    for (const location of locations) {
      const v = recentVelocity(product.id, location.id);
      const rand = mulberry32(hashSeed("inv", product.id, location.id));
      const targetCover = 4 + rand() * 8;
      const noise = 0.6 + rand() * 0.9;
      const units = Math.max(0, Math.round(v * targetCover * noise));
      const weeksCover = v > 0 ? units / v : 99;
      out.push({
        productId: product.id,
        locationId: location.id,
        units,
        weeksCover,
      });
    }
  }
  _inventory = out;
  return out;
}

export type MarketingSpendRow = {
  region: Region;
  week: number;
  spend: number;
};

let _marketing: MarketingSpendRow[] | null = null;

export function getMarketingSpend(): MarketingSpendRow[] {
  if (_marketing) return _marketing;
  const out: MarketingSpendRow[] = [];
  const baseByRegion: Record<Region, number> = { EMEA: 80000, AMER: 110000, APAC: 60000 };
  for (const region of Object.keys(baseByRegion) as Region[]) {
    const rand = mulberry32(hashSeed("mkt", region));
    for (let week = 0; week < TOTAL_WEEKS; week++) {
      const noise = 0.85 + rand() * 0.3;
      const camp = campaignLift(region, week);
      const trend = 1 + week * 0.003;
      out.push({
        region,
        week,
        spend: Math.round(baseByRegion[region] * trend * noise * (0.8 + (camp - 1) * 1.2)),
      });
    }
  }
  _marketing = out;
  return out;
}

export type ForecastPoint = {
  week: number;
  actual?: number;
  forecast?: number;
  low?: number;
  high?: number;
};

export function getForecast(productId?: string, region?: Region | "ALL"): ForecastPoint[] {
  const sales = getSales().filter(
    (s) =>
      (!productId || s.productId === productId) &&
      (!region || region === "ALL" || s.region === region),
  );
  const byWeek = new Map<number, number>();
  for (const s of sales) byWeek.set(s.week, (byWeek.get(s.week) ?? 0) + s.units);

  const recentAvg =
    Array.from({ length: 8 }, (_, i) => byWeek.get(CURRENT_WEEK_INDEX - i) ?? 0).reduce(
      (a, b) => a + b,
      0,
    ) / 8;

  const out: ForecastPoint[] = [];
  for (let w = Math.max(0, CURRENT_WEEK_INDEX - 25); w <= CURRENT_WEEK_INDEX; w++) {
    out.push({ week: w, actual: byWeek.get(w) ?? 0 });
  }
  for (let i = 1; i <= FORECAST_WEEKS; i++) {
    const w = CURRENT_WEEK_INDEX + i;
    const seasonal = seasonality(w % 52);
    const campaign = region && region !== "ALL" ? campaignLift(region, w) : 1.05;
    const center = recentAvg * seasonal * campaign;
    const band = center * (0.12 + i * 0.02);
    out.push({
      week: w,
      forecast: Math.round(center),
      low: Math.max(0, Math.round(center - band)),
      high: Math.round(center + band),
    });
  }
  return out;
}

export type AllocationRecommendation = {
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  current: number;
  recommended: number;
  delta: number;
  reasonKey: "stockOut" | "overstock" | "campaign" | "seasonality";
  reasonWeeks: number;
  priority: number;
};

let _recs: AllocationRecommendation[] | null = null;

export function getAllocationRecommendations(): AllocationRecommendation[] {
  if (_recs) return _recs;
  const inv = getInventory();
  const out: AllocationRecommendation[] = [];

  const byProduct = new Map<string, InventoryRow[]>();
  for (const r of inv) {
    if (!byProduct.has(r.productId)) byProduct.set(r.productId, []);
    byProduct.get(r.productId)!.push(r);
  }

  for (const [productId, rows] of byProduct) {
    const lows = rows.filter((r) => r.weeksCover < 2.5).sort((a, b) => a.weeksCover - b.weeksCover);
    const highs = rows.filter((r) => r.weeksCover > 10).sort((a, b) => b.weeksCover - a.weeksCover);

    for (let i = 0; i < Math.min(lows.length, highs.length); i++) {
      const low = lows[i];
      const high = highs[i];
      const lowVel = recentVelocity(productId, low.locationId);
      const highVel = recentVelocity(productId, high.locationId);
      if (lowVel === 0) continue;
      const targetCover = 6;
      const need = Math.max(0, Math.round(lowVel * targetCover - low.units));
      const surplus = Math.max(0, Math.round(high.units - highVel * targetCover));
      const transfer = Math.min(need, surplus);
      if (transfer < 5) continue;

      const lowRegion = locationById.get(low.locationId)!.region;
      const highRegion = locationById.get(high.locationId)!.region;
      const isCampaign = CAMPAIGNS.some(
        (c) =>
          c.region === lowRegion &&
          Math.abs(c.centerWeek - ((CURRENT_WEEK_INDEX + 2) % 52)) <= 4,
      );

      out.push({
        productId,
        fromLocationId: high.locationId,
        toLocationId: low.locationId,
        current: low.units,
        recommended: low.units + transfer,
        delta: transfer,
        reasonKey: isCampaign ? "campaign" : low.weeksCover < 1.5 ? "stockOut" : "seasonality",
        reasonWeeks: Math.max(1, Math.round(low.weeksCover)),
        priority:
          (2.5 - low.weeksCover) * 100 +
          (highRegion === lowRegion ? 20 : 0) +
          (productById.get(productId)?.basePopularity ?? 1) * 10,
      });
    }
  }

  out.sort((a, b) => b.priority - a.priority);
  _recs = out;
  return out;
}

export type RegionWeekly = {
  region: Region;
  week: number;
  units: number;
  revenue: number;
};

export function getWeeklyByRegion(weeks = 26): RegionWeekly[] {
  const sales = getSales().filter((s) => s.week > CURRENT_WEEK_INDEX - weeks);
  const byKey = new Map<string, RegionWeekly>();
  for (const s of sales) {
    const product = productById.get(s.productId)!;
    const key = `${s.region}|${s.week}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.units += s.units;
      existing.revenue += s.units * product.price;
    } else {
      byKey.set(key, {
        region: s.region,
        week: s.week,
        units: s.units,
        revenue: s.units * product.price,
      });
    }
  }
  return Array.from(byKey.values()).sort((a, b) => a.week - b.week);
}

export type DashboardKPIs = {
  stockHealthPct: number;
  sellThroughPct: number;
  stockOutCount: number;
  overstockCount: number;
  weeklyRevenue: number;
  openOrders: number;
};

export function getKPIs(): DashboardKPIs {
  const inv = getInventory();
  const sales = getSales();
  const lastWeek = sales.filter((s) => s.week === CURRENT_WEEK_INDEX);
  const recent = sales.filter((s) => s.week >= CURRENT_WEEK_INDEX - 3);

  const recentByPair = new Map<string, number>();
  for (const s of recent) {
    const k = `${s.productId}|${s.locationId}`;
    recentByPair.set(k, (recentByPair.get(k) ?? 0) + s.units);
  }

  const healthy = inv.filter((r) => r.weeksCover >= 2 && r.weeksCover <= 8).length;
  const stockOuts = inv.filter(
    (r) => r.units === 0 && (recentByPair.get(`${r.productId}|${r.locationId}`) ?? 0) > 0,
  ).length;
  const overstock = inv.filter((r) => r.weeksCover > 12).length;

  const totalUnits = lastWeek.reduce((a, b) => a + b.units, 0);
  const totalStockBefore = inv.reduce((a, b) => a + b.units, 0) + totalUnits;
  const sellThrough = totalStockBefore > 0 ? (totalUnits / totalStockBefore) * 100 : 0;
  const weeklyRevenue = lastWeek.reduce(
    (a, b) => a + b.units * (productById.get(b.productId)?.price ?? 0),
    0,
  );

  return {
    stockHealthPct: (healthy / inv.length) * 100,
    sellThroughPct: sellThrough,
    stockOutCount: stockOuts,
    overstockCount: overstock,
    weeklyRevenue,
    openOrders: getAllocationRecommendations().length,
  };
}

export type TopMover = { productId: string; units: number; revenue: number };

export function getTopMovers(limit = 5): TopMover[] {
  const lastWeek = getSales().filter((s) => s.week === CURRENT_WEEK_INDEX);
  const byProduct = new Map<string, TopMover>();
  for (const s of lastWeek) {
    const p = productById.get(s.productId)!;
    const existing = byProduct.get(s.productId);
    if (existing) {
      existing.units += s.units;
      existing.revenue += s.units * p.price;
    } else {
      byProduct.set(s.productId, {
        productId: s.productId,
        units: s.units,
        revenue: s.units * p.price,
      });
    }
  }
  return Array.from(byProduct.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export type AtRisk = {
  productId: string;
  locationId: string;
  units: number;
  weeksCover: number;
};

export function getAtRisk(limit = 8): AtRisk[] {
  return getInventory()
    .filter((r) => r.weeksCover < 2 && r.units > 0)
    .sort((a, b) => a.weeksCover - b.weeksCover)
    .slice(0, limit)
    .map(({ productId, locationId, units, weeksCover }) => ({
      productId,
      locationId,
      units,
      weeksCover,
    }));
}

export function regionColor(region: Region): string {
  return regionMeta[region].color;
}

export function getProduct(id: string): Product | undefined {
  return productById.get(id);
}
