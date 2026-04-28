import { products, productById, SIZE_GRID, sizeCurves, type Size, type Product } from "./products";
import { locations, locationById, type Region, regionMeta } from "./locations";
import { hashSeed, mulberry32 } from "@/lib/utils";

export const HISTORY_WEEKS = 52;
export const FORECAST_WEEKS = 8;
export const TOTAL_WEEKS = HISTORY_WEEKS + FORECAST_WEEKS;
export const CURRENT_WEEK_INDEX = HISTORY_WEEKS - 1;

type Campaign = {
  region: Region | "ALL";
  centerWeek: number;
  lift: number;
  label: string;
  category?: "road" | "trail" | "training" | "lifestyle" | "hike";
  productId?: string;
};

const CAMPAIGNS: Campaign[] = [
  { region: "EMEA", centerWeek: 14, lift: 1.6, label: "Berlin Marathon", category: "road" },
  { region: "EMEA", centerWeek: 16, lift: 1.45, label: "London Marathon", category: "road" },
  { region: "AMER", centerWeek: 14, lift: 1.4, label: "Boston Marathon", category: "road" },
  { region: "AMER", centerWeek: 38, lift: 1.55, label: "NYC Marathon", category: "road" },
  { region: "APAC", centerWeek: 6, lift: 1.4, label: "Tokyo Marathon", category: "road" },
  { region: "APAC", centerWeek: 4, lift: 1.3, label: "Lunar New Year", category: "lifestyle" },
  { region: "EMEA", centerWeek: 46, lift: 1.3, label: "Holiday lifestyle push", category: "lifestyle" },
  { region: "AMER", centerWeek: 22, lift: 1.25, label: "Summer trail launch", category: "trail" },
  { region: "ALL", centerWeek: 47, lift: 1.5, label: "Black Friday" },
  { region: "EMEA", centerWeek: 51, lift: 1.35, label: "Boxing Day" },
  { region: "AMER", centerWeek: 35, lift: 1.2, label: "Back to school", category: "training" },
  { region: "EMEA", centerWeek: 18, lift: 1.5, label: "Cloudtilt launch", productId: "cloudtilt" },
  { region: "ALL", centerWeek: 30, lift: 1.4, label: "Cloudboom Echo 3 launch", productId: "cloudboom-echo-3" },
  { region: "EMEA", centerWeek: 38, lift: 1.35, label: "Cloudsurfer Trail launch", productId: "cloudsurfer-trail" },
  { region: "EMEA", centerWeek: 40, lift: 1.2, label: "Hike season EMEA", category: "hike" },
];

function seasonality(weekIdx: number, category: string): number {
  const phase = (weekIdx / 52) * Math.PI * 2;
  if (category === "lifestyle") return 1 + 0.18 * Math.sin(phase + Math.PI / 4);
  if (category === "hike") return 1 + 0.4 * Math.sin(phase - Math.PI / 3);
  if (category === "trail") return 1 + 0.35 * Math.sin(phase - Math.PI / 4);
  return 1 + 0.25 * Math.sin(phase - Math.PI / 2);
}

function campaignLift(region: Region, weekIdx: number, product: Product): number {
  let mult = 1;
  for (const c of CAMPAIGNS) {
    if (c.region !== "ALL" && c.region !== region) continue;
    if (c.category && c.category !== product.category) continue;
    if (c.productId && c.productId !== product.id) continue;
    const dist = Math.abs(weekIdx - c.centerWeek);
    if (dist <= 3) {
      mult *= 1 + (c.lift - 1) * Math.exp(-(dist * dist) / 2.5);
    }
  }
  return mult;
}

function regionMarketingLift(region: Region, weekIdx: number): number {
  let mult = 1;
  for (const c of CAMPAIGNS) {
    if (c.region !== "ALL" && c.region !== region) continue;
    const dist = Math.abs(weekIdx - c.centerWeek);
    if (dist <= 3) mult *= 1 + (c.lift - 1) * Math.exp(-(dist * dist) / 3);
  }
  return mult;
}

function trendLift(productId: string, weekIdx: number, isNewIn: boolean, launchWeek?: number): number {
  if (isNewIn && launchWeek !== undefined) {
    if (weekIdx < launchWeek) return 0;
    const sinceLaunch = weekIdx - launchWeek;
    return 0.3 + Math.min(0.7, sinceLaunch * 0.12);
  }
  if (productId === "cloudboom-strike") return 1 + weekIdx * 0.005;
  if (productId === "cloud-5") return 1 + weekIdx * 0.004;
  if (productId === "cloudgo") return 1 - weekIdx * 0.002;
  if (productId === "cloudvista-2") return 1 - weekIdx * 0.001;
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
      if (location.channel === "warehouse") continue;
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
              seasonality(week, product.category) *
              campaignLift(location.region, week, product) *
              trendLift(product.id, week, !!product.isNewIn, product.launchWeek) *
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
      const isWarehouse = location.channel === "warehouse";
      const v = isWarehouse
        ? aggregatedRegionVelocity(product.id, location.region)
        : recentVelocity(product.id, location.id);
      const rand = mulberry32(hashSeed("inv", product.id, location.id));
      const targetCover = isWarehouse ? 8 + rand() * 12 : 1.5 + rand() * 9;
      const noise = isWarehouse ? 0.8 + rand() * 0.5 : 0.4 + rand() * 1.4;
      const units = Math.max(0, Math.round(v * targetCover * noise));
      const refVel = isWarehouse ? Math.max(1, v / 3) : v;
      const weeksCover = refVel > 0 ? units / refVel : 99;
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

function aggregatedRegionVelocity(productId: string, region: Region): number {
  return locations
    .filter((l) => l.region === region && l.channel !== "warehouse")
    .reduce((a, l) => a + recentVelocity(productId, l.id), 0);
}

export type InventoryBySizeRow = InventoryRow & { size: Size };

let _inventoryBySize: InventoryBySizeRow[] | null = null;

export function getInventoryBySize(): InventoryBySizeRow[] {
  if (_inventoryBySize) return _inventoryBySize;
  const out: InventoryBySizeRow[] = [];
  const inv = getInventory();
  for (const row of inv) {
    const product = productById.get(row.productId)!;
    const curve = sizeCurves[product.gender];
    const rand = mulberry32(hashSeed("size", row.productId, row.locationId));
    for (const size of SIZE_GRID) {
      const sizeShare = curve[size];
      const noise = 0.7 + rand() * 0.6;
      const units = Math.max(0, Math.round(row.units * sizeShare * noise));
      const expected = row.weeksCover * sizeShare;
      out.push({
        productId: row.productId,
        locationId: row.locationId,
        size,
        units,
        weeksCover: expected > 0 && units > 0 ? row.weeksCover * (units / Math.max(1, row.units * sizeShare)) : units === 0 ? 0 : row.weeksCover,
      });
    }
  }
  _inventoryBySize = out;
  return out;
}

export type SizeBreakdown = {
  productId: string;
  size: Size;
  units: number;
  pctOfDemand: number;
  stockoutLocations: number;
};

export function getProductSizeBreakdown(productId: string): SizeBreakdown[] {
  const product = productById.get(productId)!;
  const curve = sizeCurves[product.gender];
  const rows = getInventoryBySize().filter(
    (r) => r.productId === productId && locationById.get(r.locationId)!.channel !== "warehouse",
  );
  const out: SizeBreakdown[] = [];
  for (const size of SIZE_GRID) {
    const sized = rows.filter((r) => r.size === size);
    const units = sized.reduce((a, b) => a + b.units, 0);
    const stockoutLocations = sized.filter((r) => r.units === 0).length;
    out.push({
      productId,
      size,
      units,
      pctOfDemand: curve[size],
      stockoutLocations,
    });
  }
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
      const camp = regionMarketingLift(region, week);
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
    const product = productId ? productById.get(productId) : null;
    const seasonal = product ? seasonality(w % 52, product.category) : seasonality(w % 52, "road");
    const campaign =
      region && region !== "ALL" && product ? campaignLift(region, w, product) : 1.05;
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

export type ForecastAccuracy = {
  week: number;
  actual: number;
  forecast: number;
  errorPct: number;
};

export function getForecastAccuracy(productId?: string, region?: Region | "ALL", weeks = 8): ForecastAccuracy[] {
  const sales = getSales().filter(
    (s) =>
      (!productId || s.productId === productId) &&
      (!region || region === "ALL" || s.region === region),
  );
  const byWeek = new Map<number, number>();
  for (const s of sales) byWeek.set(s.week, (byWeek.get(s.week) ?? 0) + s.units);

  const out: ForecastAccuracy[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const w = CURRENT_WEEK_INDEX - i;
    const actual = byWeek.get(w) ?? 0;
    const lookback = Array.from({ length: 4 }, (_, k) => byWeek.get(w - k - 1) ?? 0).reduce(
      (a, b) => a + b,
      0,
    ) / 4;
    const product = productId ? productById.get(productId) : null;
    const seasonal = product ? seasonality(w % 52, product.category) : seasonality(w % 52, "road");
    const forecast = Math.round(lookback * seasonal);
    const errorPct = actual > 0 ? Math.abs(forecast - actual) / actual : 0;
    out.push({ week: w, actual, forecast, errorPct });
  }
  return out;
}

export function getMAPE(productId?: string, region?: Region | "ALL"): number {
  const acc = getForecastAccuracy(productId, region, 8);
  const valid = acc.filter((a) => a.actual > 0);
  if (valid.length === 0) return 0;
  return (valid.reduce((a, b) => a + b.errorPct, 0) / valid.length) * 100;
}

export type AllocationRecommendation = {
  id: string;
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  current: number;
  recommended: number;
  delta: number;
  reasonKey: "stockOut" | "overstock" | "campaign" | "seasonality";
  reasonWeeks: number;
  priority: number;
  originUnits: number;
  originCover: number;
  destVelocity: number;
  destCoverNow: number;
  destCoverAfter: number;
  campaignLabel?: string;
  expectedRevenueImpact: number;
  expectedMarginImpact: number;
  recentSales: number[];
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
    const sellingRows = rows.filter((r) => locationById.get(r.locationId)!.channel !== "warehouse");
    const lows = sellingRows
      .filter((r) => r.weeksCover < 2.5)
      .sort((a, b) => a.weeksCover - b.weeksCover);
    const highs = rows
      .filter((r) => r.weeksCover > 8 && r.units > 30)
      .sort((a, b) => {
        const ach = locationById.get(a.locationId)!.channel === "warehouse" ? -1 : 0;
        const bch = locationById.get(b.locationId)!.channel === "warehouse" ? -1 : 0;
        if (ach !== bch) return ach - bch;
        return b.weeksCover - a.weeksCover;
      });

    for (let i = 0; i < Math.min(lows.length, highs.length); i++) {
      const low = lows[i];
      const high = highs[i];
      if (low.locationId === high.locationId) continue;
      const lowVel = recentVelocity(productId, low.locationId);
      const highChannel = locationById.get(high.locationId)!.channel;
      const highVel =
        highChannel === "warehouse"
          ? aggregatedRegionVelocity(productId, locationById.get(high.locationId)!.region)
          : recentVelocity(productId, high.locationId);
      if (lowVel === 0) continue;
      const targetCover = 6;
      const need = Math.max(0, Math.round(lowVel * targetCover - low.units));
      const surplus = Math.max(0, Math.round(high.units - highVel * targetCover * 0.8));
      const transfer = Math.min(need, surplus);
      if (transfer < 5) continue;

      const lowRegion = locationById.get(low.locationId)!.region;
      const highRegion = locationById.get(high.locationId)!.region;
      const product = productById.get(productId)!;
      const upcomingCampaign = CAMPAIGNS.find(
        (c) =>
          (c.region === "ALL" || c.region === lowRegion) &&
          (!c.category || c.category === product.category) &&
          (!c.productId || c.productId === productId) &&
          Math.abs(c.centerWeek - ((CURRENT_WEEK_INDEX + 2) % 52)) <= 4,
      );

      const recent = getSales().filter(
        (s) =>
          s.productId === productId &&
          s.locationId === low.locationId &&
          s.week >= CURRENT_WEEK_INDEX - 7 &&
          s.week <= CURRENT_WEEK_INDEX,
      );
      const recentSales = Array.from({ length: 8 }, (_, i) => {
        const w = CURRENT_WEEK_INDEX - 7 + i;
        return recent.find((s) => s.week === w)?.units ?? 0;
      });

      const sellThroughProb = upcomingCampaign ? 0.92 : low.weeksCover < 1.5 ? 0.95 : 0.78;
      const expectedRevenueImpact = transfer * product.price * sellThroughProb;
      const expectedMarginImpact = transfer * (product.price - product.cogs) * sellThroughProb;

      out.push({
        id: `R-${productId}-${low.locationId}`,
        productId,
        fromLocationId: high.locationId,
        toLocationId: low.locationId,
        current: low.units,
        recommended: low.units + transfer,
        delta: transfer,
        reasonKey: upcomingCampaign
          ? "campaign"
          : low.weeksCover < 1.5
            ? "stockOut"
            : "seasonality",
        reasonWeeks: Math.max(1, Math.round(low.weeksCover)),
        priority:
          (2.5 - low.weeksCover) * 100 +
          (highRegion === lowRegion ? 25 : 0) +
          (highChannel === "warehouse" ? 15 : 0) +
          (productById.get(productId)?.basePopularity ?? 1) * 10,
        originUnits: high.units,
        originCover: high.weeksCover,
        destVelocity: lowVel,
        destCoverNow: low.weeksCover,
        destCoverAfter: lowVel > 0 ? (low.units + transfer) / lowVel : 99,
        campaignLabel: upcomingCampaign?.label,
        expectedRevenueImpact,
        expectedMarginImpact,
        recentSales,
      });
    }
  }

  out.sort((a, b) => b.priority - a.priority);
  _recs = out;
  return out;
}

export type PurchaseOrder = {
  id: string;
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  units: number;
  etaWeeks: number;
  createdWeeksAgo: number;
};

let _pos: PurchaseOrder[] | null = null;

export function getPurchaseOrders(): PurchaseOrder[] {
  if (_pos) return _pos;
  const out: PurchaseOrder[] = [];
  const warehouses = locations.filter((l) => l.channel === "warehouse");
  const stores = locations.filter((l) => l.channel !== "warehouse");

  let counter = 1;
  for (const product of products) {
    const rand = mulberry32(hashSeed("po", product.id));
    for (const wh of warehouses) {
      if (rand() < 0.55) {
        const eta = 1 + Math.floor(rand() * Math.min(6, product.leadTimeWeeks));
        out.push({
          id: `PO-${String(counter++).padStart(5, "0")}`,
          productId: product.id,
          fromLocationId: "supplier-vn",
          toLocationId: wh.id,
          units: Math.round(200 + rand() * 800),
          etaWeeks: eta,
          createdWeeksAgo: product.leadTimeWeeks - eta,
        });
      }
    }
    for (const store of stores) {
      if (rand() < 0.18) {
        const wh = warehouses.find((w) => w.region === store.region) ?? warehouses[0];
        out.push({
          id: `PO-${String(counter++).padStart(5, "0")}`,
          productId: product.id,
          fromLocationId: wh.id,
          toLocationId: store.id,
          units: Math.round(20 + rand() * 80),
          etaWeeks: 1 + Math.floor(rand() * 3),
          createdWeeksAgo: Math.floor(rand() * 2),
        });
      }
    }
  }
  _pos = out;
  return out;
}

export type RegionWeekly = {
  region: Region;
  week: number;
  units: number;
  revenue: number;
  margin: number;
};

export function getWeeklyByRegion(weeks = 26): RegionWeekly[] {
  const sales = getSales().filter((s) => s.week > CURRENT_WEEK_INDEX - weeks);
  const byKey = new Map<string, RegionWeekly>();
  for (const s of sales) {
    const product = productById.get(s.productId)!;
    const key = `${s.region}|${s.week}`;
    const existing = byKey.get(key);
    const rev = s.units * product.price;
    const mgn = s.units * (product.price - product.cogs);
    if (existing) {
      existing.units += s.units;
      existing.revenue += rev;
      existing.margin += mgn;
    } else {
      byKey.set(key, { region: s.region, week: s.week, units: s.units, revenue: rev, margin: mgn });
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
  weeklyMargin: number;
  openOrders: number;
  inTransitUnits: number;
  forecastMape: number;
  newInProducts: number;
};

export function getKPIs(): DashboardKPIs {
  const inv = getInventory();
  const sellingInv = inv.filter((r) => locationById.get(r.locationId)!.channel !== "warehouse");
  const sales = getSales();
  const lastWeek = sales.filter((s) => s.week === CURRENT_WEEK_INDEX);
  const recent = sales.filter((s) => s.week >= CURRENT_WEEK_INDEX - 3);

  const recentByPair = new Map<string, number>();
  for (const s of recent) {
    const k = `${s.productId}|${s.locationId}`;
    recentByPair.set(k, (recentByPair.get(k) ?? 0) + s.units);
  }

  const healthy = sellingInv.filter((r) => r.weeksCover >= 2 && r.weeksCover <= 8).length;
  const stockOuts = sellingInv.filter(
    (r) => r.units === 0 && (recentByPair.get(`${r.productId}|${r.locationId}`) ?? 0) > 0,
  ).length;
  const overstock = sellingInv.filter((r) => r.weeksCover > 12).length;

  const totalUnits = lastWeek.reduce((a, b) => a + b.units, 0);
  const totalStockBefore = sellingInv.reduce((a, b) => a + b.units, 0) + totalUnits;
  const sellThrough = totalStockBefore > 0 ? (totalUnits / totalStockBefore) * 100 : 0;
  let weeklyRevenue = 0;
  let weeklyMargin = 0;
  for (const r of lastWeek) {
    const p = productById.get(r.productId)!;
    weeklyRevenue += r.units * p.price;
    weeklyMargin += r.units * (p.price - p.cogs);
  }

  const inTransitUnits = getPurchaseOrders().reduce((a, b) => a + b.units, 0);

  return {
    stockHealthPct: (healthy / Math.max(1, sellingInv.length)) * 100,
    sellThroughPct: sellThrough,
    stockOutCount: stockOuts,
    overstockCount: overstock,
    weeklyRevenue,
    weeklyMargin,
    openOrders: getAllocationRecommendations().length,
    inTransitUnits,
    forecastMape: getMAPE(),
    newInProducts: products.filter((p) => p.isNewIn).length,
  };
}

export type TopMover = { productId: string; units: number; revenue: number; margin: number };

export function getTopMovers(limit = 5): TopMover[] {
  const lastWeek = getSales().filter((s) => s.week === CURRENT_WEEK_INDEX);
  const byProduct = new Map<string, TopMover>();
  for (const s of lastWeek) {
    const p = productById.get(s.productId)!;
    const existing = byProduct.get(s.productId);
    const rev = s.units * p.price;
    const mgn = s.units * (p.price - p.cogs);
    if (existing) {
      existing.units += s.units;
      existing.revenue += rev;
      existing.margin += mgn;
    } else {
      byProduct.set(s.productId, { productId: s.productId, units: s.units, revenue: rev, margin: mgn });
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
    .filter((r) => locationById.get(r.locationId)!.channel !== "warehouse" && r.weeksCover < 2 && r.units > 0)
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

export type MissedSale = {
  productId: string;
  locationId: string;
  missedUnits: number;
  missedRevenue: number;
  missedMargin: number;
  reason: "fullStockout" | "sizeGap";
  sizeGaps?: Size[];
};

function stockoutWeeksCount(productId: string, locationId: string): number {
  const sales = getSales().filter(
    (s) =>
      s.productId === productId &&
      s.locationId === locationId &&
      s.week >= CURRENT_WEEK_INDEX - 3 &&
      s.week <= CURRENT_WEEK_INDEX,
  );
  const velocity = recentVelocity(productId, locationId, 8);
  if (velocity === 0) return 0;
  return sales.filter((s) => s.units === 0 && velocity > 0.5).length;
}

let _missed: MissedSale[] | null = null;

export function getMissedSales(): MissedSale[] {
  if (_missed) return _missed;
  const out: MissedSale[] = [];
  const sellingInv = getInventory().filter(
    (r) => locationById.get(r.locationId)!.channel !== "warehouse",
  );
  const sizeInv = getInventoryBySize();

  for (const row of sellingInv) {
    const product = productById.get(row.productId)!;
    const velocity = recentVelocity(row.productId, row.locationId, 4);
    if (velocity < 0.3) continue;

    if (row.units === 0) {
      const weeksOut = Math.max(1, stockoutWeeksCount(row.productId, row.locationId));
      const missedUnits = Math.round(velocity * weeksOut);
      out.push({
        productId: row.productId,
        locationId: row.locationId,
        missedUnits,
        missedRevenue: missedUnits * product.price,
        missedMargin: missedUnits * (product.price - product.cogs),
        reason: "fullStockout",
      });
    } else {
      const outSizes = sizeInv.filter(
        (s) => s.productId === row.productId && s.locationId === row.locationId && s.units === 0,
      );
      if (outSizes.length === 0) continue;
      const curve = sizeCurves[product.gender];
      const lostShare = outSizes.reduce((a, s) => a + curve[s.size], 0);
      if (lostShare < 0.05) continue;
      const missedUnits = Math.round(velocity * lostShare * 1);
      if (missedUnits === 0) continue;
      out.push({
        productId: row.productId,
        locationId: row.locationId,
        missedUnits,
        missedRevenue: missedUnits * product.price,
        missedMargin: missedUnits * (product.price - product.cogs),
        reason: "sizeGap",
        sizeGaps: outSizes.map((s) => s.size),
      });
    }
  }

  out.sort((a, b) => b.missedRevenue - a.missedRevenue);
  _missed = out;
  return out;
}

export type MissedDiagnosis = {
  rootCause: string;
  recoverAction: string;
  recoverUnits?: number;
  recoverEtaWeeks?: number;
  preventAction: string;
  preventOwner: "Forecasting" | "Allocation" | "Merchandising" | "Replenishment";
};

export type MissedSaleWithDiagnosis = MissedSale & {
  diagnosis: MissedDiagnosis;
};

function nearestRegionalWarehouse(region: Region) {
  const map: Record<Region, string> = {
    EMEA: "antwerp-dc",
    AMER: "atlanta-dc",
    APAC: "yokohama-dc",
  };
  return locationById.get(map[region])!;
}

function recentSpike(productId: string, locationId: string): boolean {
  const sales = getSales().filter(
    (s) => s.productId === productId && s.locationId === locationId,
  );
  const recent = sales
    .filter((s) => s.week >= CURRENT_WEEK_INDEX - 1 && s.week <= CURRENT_WEEK_INDEX)
    .reduce((a, b) => a + b.units, 0);
  const lookback = sales
    .filter((s) => s.week >= CURRENT_WEEK_INDEX - 9 && s.week <= CURRENT_WEEK_INDEX - 2)
    .reduce((a, b) => a + b.units, 0);
  const recentAvg = recent / 2;
  const lookbackAvg = lookback / 8;
  return lookbackAvg > 0 && recentAvg / lookbackAvg > 1.6;
}

function nearbyStoreWithSurplus(productId: string, region: Region): string | undefined {
  const candidates = getInventory()
    .filter(
      (r) =>
        r.productId === productId &&
        locationById.get(r.locationId)!.region === region &&
        locationById.get(r.locationId)!.channel !== "warehouse" &&
        r.weeksCover > 10 &&
        r.units > 30,
    )
    .sort((a, b) => b.weeksCover - a.weeksCover);
  return candidates[0]?.locationId;
}

let _missedDiag: MissedSaleWithDiagnosis[] | null = null;

export function getMissedSalesWithDiagnosis(): MissedSaleWithDiagnosis[] {
  if (_missedDiag) return _missedDiag;
  const out: MissedSaleWithDiagnosis[] = [];

  for (const m of getMissedSales()) {
    const product = productById.get(m.productId)!;
    const loc = locationById.get(m.locationId)!;
    const region = loc.region;

    const upcomingCampaign = CAMPAIGNS.find(
      (c) =>
        (c.region === "ALL" || c.region === region) &&
        (!c.category || c.category === product.category) &&
        (!c.productId || c.productId === m.productId) &&
        Math.abs(c.centerWeek - (CURRENT_WEEK_INDEX % 52)) <= 4,
    );

    const isSpike = recentSpike(m.productId, m.locationId);

    let rootCause: string;
    let preventAction: string;
    let preventOwner: MissedDiagnosis["preventOwner"];

    if (m.reason === "fullStockout") {
      if (upcomingCampaign) {
        rootCause = `Forecast under-anticipated ${upcomingCampaign.label}: in-store demand lifted ~${Math.round((upcomingCampaign.lift - 1) * 100)}% before stock cover was raised.`;
        preventAction = `Tag ${upcomingCampaign.label} as a "must-cover" event for ${product.category} in next season's forecast calendar; pre-position +2w of cover at ${loc.city}.`;
        preventOwner = "Forecasting";
      } else if (isSpike) {
        rootCause = `Local demand spiked ~60%+ vs the 8-week baseline before replenishment caught up. The buy plan didn't reserve safety cover for shock weeks.`;
        preventAction = `Raise safety stock for ${product.name} in top-quartile ${region} stores to 3w cover and tighten the velocity-trigger on the replenishment rule.`;
        preventOwner = "Replenishment";
      } else {
        rootCause = `Replenishment cadence (currently ${product.leadTimeWeeks}w supplier lead time + biweekly DC→store) is slower than the actual sell-through at ${loc.city}.`;
        preventAction = `Move ${loc.city} from the biweekly to the weekly replenishment cadence for ${product.name}; review every store with sell-through > 8 %.`;
        preventOwner = "Replenishment";
      }
    } else {
      const sizes = (m.sizeGaps ?? []).slice(0, 4).join(", ");
      rootCause = `Size curve mismatch: sizes ${sizes} ran to zero while neighbouring sizes are still healthy, suggesting the inbound size mix doesn't match the local demand curve for ${product.gender}.`;
      preventAction = `Recalibrate the ${product.gender} size curve for ${loc.country} on the next intake; lift sizes ${sizes} by ~${Math.round(15 + Math.random() * 10)} % and trim the long tail.`;
      preventOwner = "Merchandising";
    }

    let recoverAction: string;
    let recoverUnits: number | undefined;
    let recoverEtaWeeks: number | undefined;

    if (m.reason === "fullStockout") {
      const wh = nearestRegionalWarehouse(region);
      const whInv = getInventory().find((r) => r.productId === m.productId && r.locationId === wh.id);
      if (whInv && whInv.units > 30) {
        recoverUnits = Math.min(whInv.units, m.missedUnits + 20);
        recoverEtaWeeks = 1;
        recoverAction = `Expedite ${recoverUnits} units from ${wh.city} DC (ETA ${recoverEtaWeeks}w). DC has ${whInv.units} on hand for this SKU.`;
      } else {
        const sister = nearbyStoreWithSurplus(m.productId, region);
        if (sister) {
          const sisterLoc = locationById.get(sister)!;
          recoverUnits = Math.max(15, Math.round(m.missedUnits * 0.6));
          recoverEtaWeeks = 1;
          recoverAction = `Cross-ship ${recoverUnits} units from ${sisterLoc.city} (currently overstocked) within the same region.`;
        } else {
          recoverAction = `No regional cover available — escalate to inbound buy team and price-protect the SKU until next intake.`;
        }
      }
    } else {
      const wh = nearestRegionalWarehouse(region);
      const sizes = (m.sizeGaps ?? []).slice(0, 4).join(", ");
      recoverUnits = Math.max(8, m.missedUnits);
      recoverEtaWeeks = 1;
      recoverAction = `Pull sizes ${sizes} from ${wh.city} DC (~${recoverUnits} units, ETA ${recoverEtaWeeks}w). Confirm the size mix on the next outbound truck.`;
    }

    out.push({
      ...m,
      diagnosis: {
        rootCause,
        recoverAction,
        recoverUnits,
        recoverEtaWeeks,
        preventAction,
        preventOwner,
      },
    });
  }

  _missedDiag = out;
  return out;
}

export type MissedSalesTotals = {
  totalUnits: number;
  totalRevenue: number;
  totalMargin: number;
  stockoutCount: number;
  sizeGapCount: number;
};

export function getMissedSalesTotals(): MissedSalesTotals {
  const missed = getMissedSales();
  return {
    totalUnits: missed.reduce((a, b) => a + b.missedUnits, 0),
    totalRevenue: missed.reduce((a, b) => a + b.missedRevenue, 0),
    totalMargin: missed.reduce((a, b) => a + b.missedMargin, 0),
    stockoutCount: missed.filter((m) => m.reason === "fullStockout").length,
    sizeGapCount: missed.filter((m) => m.reason === "sizeGap").length,
  };
}

export type StoreSummary = {
  locationId: string;
  totalUnits: number;
  avgCover: number;
  stockOutSkus: number;
  atRiskSkus: number;
  skusInRange: number;
  weeklyRevenue: number;
  missedRevenue: number;
  incomingUnits: number;
};

export function getStoreSummaries(): StoreSummary[] {
  const inv = getInventory();
  const sales = getSales().filter((s) => s.week === CURRENT_WEEK_INDEX);
  const missed = getMissedSales();
  const pos = getPurchaseOrders();
  const sellingLocations = locations.filter((l) => l.channel !== "warehouse");

  return sellingLocations.map((loc) => {
    const rows = inv.filter((r) => r.locationId === loc.id);
    const totalUnits = rows.reduce((a, b) => a + b.units, 0);
    const withDemand = rows.filter((r) => recentVelocity(r.productId, loc.id) > 0.3);
    const avgCover =
      withDemand.length > 0
        ? withDemand.reduce((a, b) => a + Math.min(b.weeksCover, 20), 0) / withDemand.length
        : 0;
    const stockOutSkus = rows.filter(
      (r) => r.units === 0 && recentVelocity(r.productId, loc.id) > 0.3,
    ).length;
    const atRiskSkus = rows.filter((r) => r.units > 0 && r.weeksCover < 2).length;
    const skusInRange = rows.filter((r) => r.weeksCover >= 2 && r.weeksCover <= 8).length;

    const storeSales = sales.filter((s) => s.locationId === loc.id);
    const weeklyRevenue = storeSales.reduce(
      (a, b) => a + b.units * (productById.get(b.productId)?.price ?? 0),
      0,
    );
    const missedRevenue = missed
      .filter((m) => m.locationId === loc.id)
      .reduce((a, b) => a + b.missedRevenue, 0);
    const incomingUnits = pos
      .filter((p) => p.toLocationId === loc.id)
      .reduce((a, b) => a + b.units, 0);

    return {
      locationId: loc.id,
      totalUnits,
      avgCover,
      stockOutSkus,
      atRiskSkus,
      skusInRange,
      weeklyRevenue,
      missedRevenue,
      incomingUnits,
    };
  });
}

export type StoreDetail = {
  locationId: string;
  summary: StoreSummary;
  rows: Array<
    InventoryRow & {
      productName: string;
      productColor: string;
      price: number;
      velocity: number;
      incomingUnits: number;
      outSizes: Size[];
    }
  >;
};

export function getStoreDetail(locationId: string): StoreDetail | null {
  const loc = locationById.get(locationId);
  if (!loc || loc.channel === "warehouse") return null;
  const summary = getStoreSummaries().find((s) => s.locationId === locationId)!;
  const inv = getInventory().filter((r) => r.locationId === locationId);
  const sizeInv = getInventoryBySize();
  const pos = getPurchaseOrders();

  const rows = inv
    .map((r) => {
      const product = productById.get(r.productId)!;
      const outSizes = sizeInv
        .filter((s) => s.productId === r.productId && s.locationId === locationId && s.units === 0)
        .map((s) => s.size);
      const incomingUnits = pos
        .filter((p) => p.productId === r.productId && p.toLocationId === locationId)
        .reduce((a, b) => a + b.units, 0);
      return {
        ...r,
        productName: product.name,
        productColor: product.color,
        price: product.price,
        velocity: recentVelocity(r.productId, locationId, 4),
        incomingUnits,
        outSizes,
      };
    })
    .sort((a, b) => a.weeksCover - b.weeksCover);

  return { locationId, summary, rows };
}

export type StockImbalance = {
  productId: string;
  lowestLocationId: string;
  highestLocationId: string;
  minCover: number;
  maxCover: number;
  spread: number;
  overstockUnits: number;
  overstockValueCogs: number;
  weeklyCarryingCost: number;
  priority: number;
};

let _imbalances: StockImbalance[] | null = null;

export function getStockImbalances(): StockImbalance[] {
  if (_imbalances) return _imbalances;
  const inv = getInventory();
  const byProduct = new Map<string, InventoryRow[]>();
  for (const r of inv) {
    const loc = locationById.get(r.locationId)!;
    if (loc.channel === "warehouse") continue;
    if (!byProduct.has(r.productId)) byProduct.set(r.productId, []);
    byProduct.get(r.productId)!.push(r);
  }

  const out: StockImbalance[] = [];
  for (const [productId, rows] of byProduct) {
    const withDemand = rows.filter((r) => recentVelocity(productId, r.locationId, 4) > 0.3);
    if (withDemand.length < 3) continue;
    const sorted = [...withDemand].sort((a, b) => a.weeksCover - b.weeksCover);
    const low = sorted[0];
    const high = sorted[sorted.length - 1];
    if (high.weeksCover - low.weeksCover < 4) continue;

    const product = productById.get(productId)!;
    const overstock = rows.filter((r) => r.weeksCover > 10);
    const overstockUnits = overstock.reduce(
      (a, b) => a + Math.max(0, b.units - Math.round(recentVelocity(productId, b.locationId, 4) * 8)),
      0,
    );
    const overstockValueCogs = overstockUnits * product.cogs;
    const weeklyCarryingCost = overstockValueCogs * 0.015;

    out.push({
      productId,
      lowestLocationId: low.locationId,
      highestLocationId: high.locationId,
      minCover: low.weeksCover,
      maxCover: Math.min(high.weeksCover, 25),
      spread: Math.min(high.weeksCover, 25) - low.weeksCover,
      overstockUnits,
      overstockValueCogs,
      weeklyCarryingCost,
      priority:
        (high.weeksCover - low.weeksCover) * 10 +
        overstockValueCogs / 1000 +
        (low.weeksCover < 2 ? 100 : 0),
    });
  }
  out.sort((a, b) => b.priority - a.priority);
  _imbalances = out;
  return out;
}

export function getTotalImbalanceCost(): number {
  return getStockImbalances().reduce((a, b) => a + b.weeklyCarryingCost, 0);
}

export type Risk = {
  productId: string;
  locationId: string;
  units: number;
  velocity: number;
  weeksToStockout: number;
  revenueAtRisk: number;
  marginAtRisk: number;
  bucket: "2w" | "4w" | "6w";
  upcomingCampaign?: string;
};

export type Opportunity = {
  productId: string;
  locationId: string;
  units: number;
  weeksCover: number;
  excessUnits: number;
  redistributableRevenue: number;
  redistributableMargin: number;
  reason: "overstock" | "slowMoving" | "idleCapital";
};

export function getRisks(): Risk[] {
  const inv = getInventory();
  const out: Risk[] = [];
  for (const row of inv) {
    const loc = locationById.get(row.locationId)!;
    if (loc.channel === "warehouse") continue;
    const velocity = recentVelocity(row.productId, row.locationId, 4);
    if (velocity < 0.5) continue;
    const weeksToStockout = row.units / velocity;
    if (weeksToStockout > 6 || row.units === 0) continue;
    const product = productById.get(row.productId)!;
    const shortfallUnits = Math.max(0, velocity * 6 - row.units);
    const bucket = weeksToStockout <= 2 ? "2w" : weeksToStockout <= 4 ? "4w" : "6w";
    const upcomingCampaign = CAMPAIGNS.find(
      (c) =>
        (c.region === "ALL" || c.region === loc.region) &&
        (!c.category || c.category === product.category) &&
        (!c.productId || c.productId === row.productId) &&
        Math.abs(c.centerWeek - ((CURRENT_WEEK_INDEX + 2) % 52)) <= 4,
    );
    out.push({
      productId: row.productId,
      locationId: row.locationId,
      units: row.units,
      velocity,
      weeksToStockout,
      revenueAtRisk: shortfallUnits * product.price,
      marginAtRisk: shortfallUnits * (product.price - product.cogs),
      bucket,
      upcomingCampaign: upcomingCampaign?.label,
    });
  }
  out.sort((a, b) => a.weeksToStockout - b.weeksToStockout);
  return out;
}

export function getOpportunities(): Opportunity[] {
  const inv = getInventory();
  const out: Opportunity[] = [];
  for (const row of inv) {
    const loc = locationById.get(row.locationId)!;
    if (loc.channel === "warehouse") continue;
    if (row.weeksCover < 10 || row.units < 20) continue;
    const velocity = recentVelocity(row.productId, row.locationId, 4);
    const targetUnits = Math.round(velocity * 6);
    const excessUnits = Math.max(0, row.units - targetUnits);
    if (excessUnits < 5) continue;
    const product = productById.get(row.productId)!;
    const redistributableRevenue = excessUnits * product.price * 0.85;
    const redistributableMargin = excessUnits * (product.price - product.cogs) * 0.85;
    const reason: Opportunity["reason"] =
      velocity < 1 ? "slowMoving" : row.weeksCover > 15 ? "idleCapital" : "overstock";
    out.push({
      productId: row.productId,
      locationId: row.locationId,
      units: row.units,
      weeksCover: row.weeksCover,
      excessUnits,
      redistributableRevenue,
      redistributableMargin,
      reason,
    });
  }
  out.sort((a, b) => b.redistributableRevenue - a.redistributableRevenue);
  return out;
}

export type CategorySummary = {
  category: string;
  skuCount: number;
  totalUnits: number;
  weeklyRevenue: number;
  weeklyMargin: number;
  sellThroughPct: number;
  avgCover: number;
  stockoutCount: number;
  missedRevenue: number;
  weeklyHistory: number[];
};

export function getCategorySummaries(): CategorySummary[] {
  const allCategories = Array.from(new Set(products.map((p) => p.category)));
  const inv = getInventory();
  const sales = getSales();
  const missed = getMissedSales();

  return allCategories.map((cat) => {
    const catProducts = products.filter((p) => p.category === cat);
    const catProductIds = new Set(catProducts.map((p) => p.id));
    const catInv = inv.filter(
      (r) => catProductIds.has(r.productId) && locationById.get(r.locationId)!.channel !== "warehouse",
    );
    const catSales = sales.filter((s) => catProductIds.has(s.productId));
    const lastWeek = catSales.filter((s) => s.week === CURRENT_WEEK_INDEX);
    const recent = catSales.filter((s) => s.week >= CURRENT_WEEK_INDEX - 3);

    let weeklyRevenue = 0;
    let weeklyMargin = 0;
    for (const s of lastWeek) {
      const p = productById.get(s.productId)!;
      weeklyRevenue += s.units * p.price;
      weeklyMargin += s.units * (p.price - p.cogs);
    }

    const totalUnits = catInv.reduce((a, b) => a + b.units, 0);
    const soldLastWeek = lastWeek.reduce((a, b) => a + b.units, 0);
    const sellThroughPct =
      totalUnits + soldLastWeek > 0 ? (soldLastWeek / (totalUnits + soldLastWeek)) * 100 : 0;

    const withDemand = catInv.filter(
      (r) => recentVelocity(r.productId, r.locationId, 4) > 0.3,
    );
    const avgCover =
      withDemand.length > 0
        ? withDemand.reduce((a, b) => a + Math.min(b.weeksCover, 20), 0) / withDemand.length
        : 0;

    const recentByPair = new Map<string, number>();
    for (const s of recent) recentByPair.set(`${s.productId}|${s.locationId}`, (recentByPair.get(`${s.productId}|${s.locationId}`) ?? 0) + s.units);
    const stockoutCount = catInv.filter(
      (r) => r.units === 0 && (recentByPair.get(`${r.productId}|${r.locationId}`) ?? 0) > 0,
    ).length;

    const missedRevenue = missed
      .filter((m) => catProductIds.has(m.productId))
      .reduce((a, b) => a + b.missedRevenue, 0);

    const weeklyHistory: number[] = [];
    for (let w = CURRENT_WEEK_INDEX - 7; w <= CURRENT_WEEK_INDEX; w++) {
      const units = catSales.filter((s) => s.week === w).reduce((a, b) => a + b.units, 0);
      weeklyHistory.push(units);
    }

    return {
      category: cat,
      skuCount: catProducts.length,
      totalUnits,
      weeklyRevenue,
      weeklyMargin,
      sellThroughPct,
      avgCover,
      stockoutCount,
      missedRevenue,
      weeklyHistory,
    };
  });
}

const YOY_GROWTH_BY_CATEGORY: Record<string, number> = {
  road: 1.15,
  trail: 1.22,
  lifestyle: 1.28,
  training: 1.08,
  hike: 1.1,
};

export function getWeeklyByRegionLY(weeks = 26): RegionWeekly[] {
  const current = getWeeklyByRegion(weeks);
  return current.map((row) => {
    const rand = mulberry32(hashSeed("ly", row.region, row.week));
    const noise = 0.9 + rand() * 0.2;
    const growth = 1.18;
    return {
      region: row.region,
      week: row.week,
      units: Math.round((row.units / growth) * noise),
      revenue: Math.round((row.revenue / growth) * noise),
      margin: Math.round((row.margin / growth) * noise),
    };
  });
}

export type YoYComparison = {
  currentRevenue: number;
  lyRevenue: number;
  revenueGrowthPct: number;
  currentMargin: number;
  lyMargin: number;
  marginGrowthPct: number;
};

export function getYoYComparison(): YoYComparison {
  const kpis = getKPIs();
  const currentRevenue = kpis.weeklyRevenue;
  const currentMargin = kpis.weeklyMargin;
  const ly = getWeeklyByRegionLY(1);
  const lyRevenue = ly.reduce((a, b) => a + b.revenue, 0);
  const lyMargin = ly.reduce((a, b) => a + b.margin, 0);
  return {
    currentRevenue,
    lyRevenue,
    revenueGrowthPct: lyRevenue > 0 ? ((currentRevenue - lyRevenue) / lyRevenue) * 100 : 0,
    currentMargin,
    lyMargin,
    marginGrowthPct: lyMargin > 0 ? ((currentMargin - lyMargin) / lyMargin) * 100 : 0,
  };
}

export function getForecastWithLY(productId?: string, region?: Region | "ALL"): Array<ForecastPoint & { ly?: number }> {
  const base = getForecast(productId, region);
  return base.map((p) => {
    const cat = productId ? productById.get(productId)?.category : undefined;
    const growth = cat ? YOY_GROWTH_BY_CATEGORY[cat] ?? 1.18 : 1.18;
    const value = p.actual ?? p.forecast;
    if (value === undefined) return p;
    const rand = mulberry32(hashSeed("ly-fc", productId ?? "all", region ?? "all", p.week));
    const noise = 0.9 + rand() * 0.2;
    return { ...p, ly: Math.round((value / growth) * noise) };
  });
}

export type RegionBreakdown = {
  region: Region;
  kpis: DashboardKPIs;
  weekly: RegionWeekly[];
};

export function getKPIsForRegion(region: Region): DashboardKPIs {
  const inv = getInventory();
  const sellingInv = inv.filter((r) => {
    const loc = locationById.get(r.locationId)!;
    return loc.region === region && loc.channel !== "warehouse";
  });
  const sales = getSales().filter((s) => s.region === region);
  const lastWeek = sales.filter((s) => s.week === CURRENT_WEEK_INDEX);
  const recent = sales.filter((s) => s.week >= CURRENT_WEEK_INDEX - 3);
  const recentByPair = new Map<string, number>();
  for (const s of recent) recentByPair.set(`${s.productId}|${s.locationId}`, (recentByPair.get(`${s.productId}|${s.locationId}`) ?? 0) + s.units);

  const healthy = sellingInv.filter((r) => r.weeksCover >= 2 && r.weeksCover <= 8).length;
  const stockOuts = sellingInv.filter(
    (r) => r.units === 0 && (recentByPair.get(`${r.productId}|${r.locationId}`) ?? 0) > 0,
  ).length;
  const overstock = sellingInv.filter((r) => r.weeksCover > 12).length;

  const totalUnits = lastWeek.reduce((a, b) => a + b.units, 0);
  const totalStockBefore = sellingInv.reduce((a, b) => a + b.units, 0) + totalUnits;
  const sellThrough = totalStockBefore > 0 ? (totalUnits / totalStockBefore) * 100 : 0;

  let weeklyRevenue = 0;
  let weeklyMargin = 0;
  for (const r of lastWeek) {
    const p = productById.get(r.productId)!;
    weeklyRevenue += r.units * p.price;
    weeklyMargin += r.units * (p.price - p.cogs);
  }

  const inTransit = getPurchaseOrders()
    .filter((p) => locationById.get(p.toLocationId)?.region === region)
    .reduce((a, b) => a + b.units, 0);

  const missedRevenue = getMissedSales()
    .filter((m) => locationById.get(m.locationId)?.region === region)
    .reduce((a, b) => a + b.missedRevenue, 0);

  return {
    stockHealthPct: (healthy / Math.max(1, sellingInv.length)) * 100,
    sellThroughPct: sellThrough,
    stockOutCount: stockOuts,
    overstockCount: overstock,
    weeklyRevenue,
    weeklyMargin,
    openOrders: 0,
    inTransitUnits: inTransit,
    forecastMape: getMAPE(undefined, region),
    newInProducts: products.filter((p) => p.isNewIn).length,
    missedRevenueTotal: missedRevenue,
  } as DashboardKPIs & { missedRevenueTotal: number };
}

export type DecisionType =
  | "stockOut"
  | "campaign"
  | "missedSize"
  | "imbalance"
  | "overstock";

export type Decision = {
  id: string;
  type: DecisionType;
  productId: string;
  locationId: string;
  secondaryLocationId?: string;
  impact: number;
  margin: number;
  unitsHint?: number;
  weeksContext?: number;
  campaignLabel?: string;
  sizesContext?: Size[];
  href: string;
  ctaKey: "approveTransfer" | "redistribute" | "review";
};

let _decisions: Decision[] | null = null;

export function getTopDecisions(limit = 14): Decision[] {
  if (_decisions) return _decisions.slice(0, limit);

  const out: Decision[] = [];

  for (const r of getRisks().slice(0, 30)) {
    const t: DecisionType = r.upcomingCampaign ? "campaign" : "stockOut";
    out.push({
      id: `risk-${r.productId}-${r.locationId}`,
      type: t,
      productId: r.productId,
      locationId: r.locationId,
      impact: r.revenueAtRisk,
      margin: r.marginAtRisk,
      unitsHint: Math.max(1, Math.round(r.velocity * 6 - r.units)),
      weeksContext: Math.round(r.weeksToStockout * 10) / 10,
      campaignLabel: r.upcomingCampaign,
      href: `/allocation`,
      ctaKey: "approveTransfer",
    });
  }

  for (const m of getMissedSales().slice(0, 20)) {
    if (m.reason !== "sizeGap") continue;
    out.push({
      id: `size-${m.productId}-${m.locationId}`,
      type: "missedSize",
      productId: m.productId,
      locationId: m.locationId,
      impact: m.missedRevenue,
      margin: m.missedMargin,
      unitsHint: m.missedUnits,
      sizesContext: m.sizeGaps,
      href: `/sizes`,
      ctaKey: "approveTransfer",
    });
  }

  for (const im of getStockImbalances().slice(0, 15)) {
    out.push({
      id: `imb-${im.productId}`,
      type: "imbalance",
      productId: im.productId,
      locationId: im.lowestLocationId,
      secondaryLocationId: im.highestLocationId,
      impact: im.weeklyCarryingCost * 8,
      margin: im.weeklyCarryingCost * 8 * 0.4,
      unitsHint: im.overstockUnits,
      weeksContext: Math.round((im.maxCover - im.minCover) * 10) / 10,
      href: `/allocation`,
      ctaKey: "redistribute",
    });
  }

  for (const op of getOpportunities().slice(0, 15)) {
    out.push({
      id: `opp-${op.productId}-${op.locationId}`,
      type: "overstock",
      productId: op.productId,
      locationId: op.locationId,
      impact: op.redistributableRevenue,
      margin: op.redistributableMargin,
      unitsHint: op.excessUnits,
      weeksContext: op.weeksCover,
      href: `/risks`,
      ctaKey: "review",
    });
  }

  out.sort((a, b) => b.impact - a.impact);

  const seen = new Set<string>();
  const deduped: Decision[] = [];
  for (const d of out) {
    const key = `${d.type}-${d.productId}-${d.locationId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(d);
  }

  _decisions = deduped;
  return deduped.slice(0, limit);
}

export type DecisionTotals = {
  totalImpact: number;
  totalMargin: number;
  byType: Record<DecisionType, number>;
};

export function getDecisionTotals(): DecisionTotals {
  const decisions = getTopDecisions(50);
  const byType: Record<DecisionType, number> = {
    stockOut: 0,
    campaign: 0,
    missedSize: 0,
    imbalance: 0,
    overstock: 0,
  };
  let totalImpact = 0;
  let totalMargin = 0;
  for (const d of decisions) {
    byType[d.type]++;
    totalImpact += d.impact;
    totalMargin += d.margin;
  }
  return { totalImpact, totalMargin, byType };
}

export type SizeMatrixCell = {
  locationId: string;
  size: Size;
  units: number;
  velocityShare: number;
  isStockout: boolean;
  isLow: boolean;
};

export function getProductSizeMatrix(productId: string): SizeMatrixCell[] {
  const sizeInv = getInventoryBySize().filter(
    (r) => r.productId === productId && locationById.get(r.locationId)!.channel !== "warehouse",
  );
  const product = productById.get(productId)!;
  const curve = sizeCurves[product.gender];

  return sizeInv.map((r) => {
    const expectedShare = curve[r.size];
    const velAtLoc = recentVelocity(productId, r.locationId, 4);
    const expectedWeekly = velAtLoc * expectedShare;
    return {
      locationId: r.locationId,
      size: r.size,
      units: r.units,
      velocityShare: expectedShare,
      isStockout: r.units === 0 && expectedWeekly > 0.3,
      isLow: r.units > 0 && expectedWeekly > 0 && r.units / expectedWeekly < 2,
    };
  });
}
