import { cache } from "react";
import { cookies } from "next/headers";
import { DEFAULT_SECTOR, SECTOR_COOKIE, SECTORS, type SectorId, isSectorId } from "./sectors";

export type Gender = "unisex" | "women" | "men";

export type SeasonalProfile = {
  amplitude: number;
  phaseShift: number;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  gender: Gender;
  price: number;
  cogs: number;
  color: string;
  basePopularity: number;
  regionBias: { EMEA: number; AMER: number; APAC: number };
  leadTimeWeeks: number;
  seasonalProfile?: SeasonalProfile;
  launchWeek?: number;
  isNewIn?: boolean;
};

export const getActiveSectorId = cache(async (): Promise<SectorId> => {
  const c = await cookies();
  const v = c.get(SECTOR_COOKIE)?.value;
  return isSectorId(v) ? v : DEFAULT_SECTOR;
});

export const getProducts = cache(async (): Promise<Product[]> => {
  const id = await getActiveSectorId();
  return SECTORS[id].products;
});

export const getCategories = cache(async (): Promise<string[]> => {
  const id = await getActiveSectorId();
  return SECTORS[id].categories;
});

export const getProductMap = cache(async (): Promise<Map<string, Product>> => {
  const ps = await getProducts();
  return new Map(ps.map((p) => [p.id, p]));
});

// TEMP: while series.ts is being refactored to be sector-aware,
// re-export the default sector's products synchronously so the
// existing data layer keeps building.
export const products: Product[] = SECTORS[DEFAULT_SECTOR].products;
export const productById: Map<string, Product> = new Map(products.map((p) => [p.id, p]));

export const SIZE_GRID = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"] as const;
export type Size = (typeof SIZE_GRID)[number];

export const sizeCurves: Record<Gender, Record<Size, number>> = {
  unisex: { "36": 0.04, "37": 0.06, "38": 0.09, "39": 0.12, "40": 0.14, "41": 0.15, "42": 0.14, "43": 0.11, "44": 0.08, "45": 0.07 },
  women: { "36": 0.10, "37": 0.14, "38": 0.18, "39": 0.18, "40": 0.15, "41": 0.10, "42": 0.07, "43": 0.04, "44": 0.02, "45": 0.02 },
  men: { "36": 0.01, "37": 0.02, "38": 0.05, "39": 0.09, "40": 0.13, "41": 0.16, "42": 0.18, "43": 0.15, "44": 0.12, "45": 0.09 },
};
