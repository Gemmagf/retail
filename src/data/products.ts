export type Category = "road" | "trail" | "training" | "lifestyle" | "hike";
export type Gender = "unisex" | "women" | "men";

export type Product = {
  id: string;
  name: string;
  category: Category;
  gender: Gender;
  price: number;
  cogs: number;
  color: string;
  basePopularity: number;
  regionBias: { EMEA: number; AMER: number; APAC: number };
  leadTimeWeeks: number;
  launchWeek?: number;
  isNewIn?: boolean;
};

export const products: Product[] = [
  { id: "cloudmonster-2", name: "Cloudmonster 2", category: "road", gender: "unisex", price: 230, cogs: 92, color: "#0a2540", basePopularity: 1.4, regionBias: { EMEA: 1.0, AMER: 1.3, APAC: 0.9 }, leadTimeWeeks: 8 },
  { id: "cloudmonster-2-w", name: "Cloudmonster 2 W", category: "road", gender: "women", price: 230, cogs: 92, color: "#1f3b6b", basePopularity: 1.1, regionBias: { EMEA: 1.1, AMER: 1.3, APAC: 1.0 }, leadTimeWeeks: 8 },
  { id: "cloudsurfer", name: "Cloudsurfer", category: "road", gender: "unisex", price: 180, cogs: 70, color: "#1f6feb", basePopularity: 1.3, regionBias: { EMEA: 1.1, AMER: 1.1, APAC: 1.0 }, leadTimeWeeks: 6 },
  { id: "cloudsurfer-trail", name: "Cloudsurfer Trail", category: "trail", gender: "unisex", price: 200, cogs: 80, color: "#0288d1", basePopularity: 0.8, regionBias: { EMEA: 1.3, AMER: 1.1, APAC: 0.7 }, leadTimeWeeks: 9, launchWeek: 38, isNewIn: true },
  { id: "cloudrunner-2", name: "Cloudrunner 2", category: "road", gender: "unisex", price: 170, cogs: 65, color: "#2e7d32", basePopularity: 1.0, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 0.8 }, leadTimeWeeks: 6 },
  { id: "cloudrunner-2-w", name: "Cloudrunner 2 W", category: "road", gender: "women", price: 170, cogs: 65, color: "#43a047", basePopularity: 0.9, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 0.9 }, leadTimeWeeks: 6 },
  { id: "cloudswift-3", name: "Cloudswift 3", category: "road", gender: "unisex", price: 180, cogs: 70, color: "#ef6c00", basePopularity: 0.9, regionBias: { EMEA: 1.2, AMER: 0.9, APAC: 1.1 }, leadTimeWeeks: 7 },
  { id: "cloudboom-strike", name: "Cloudboom Strike", category: "road", gender: "unisex", price: 280, cogs: 95, color: "#d81b60", basePopularity: 0.6, regionBias: { EMEA: 1.0, AMER: 1.1, APAC: 1.2 }, leadTimeWeeks: 10 },
  { id: "cloudboom-echo-3", name: "Cloudboom Echo 3", category: "road", gender: "unisex", price: 290, cogs: 100, color: "#f06292", basePopularity: 0.55, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 1.0 }, leadTimeWeeks: 10, launchWeek: 30, isNewIn: true },
  { id: "cloudflyer-4", name: "Cloudflyer 4", category: "road", gender: "unisex", price: 200, cogs: 80, color: "#5e35b1", basePopularity: 0.8, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 0.7 }, leadTimeWeeks: 7 },
  { id: "cloudgo", name: "Cloudgo", category: "road", gender: "unisex", price: 150, cogs: 55, color: "#00838f", basePopularity: 1.1, regionBias: { EMEA: 1.0, AMER: 1.0, APAC: 1.3 }, leadTimeWeeks: 5 },
  { id: "cloudgo-w", name: "Cloudgo W", category: "road", gender: "women", price: 150, cogs: 55, color: "#26a69a", basePopularity: 1.0, regionBias: { EMEA: 1.0, AMER: 1.0, APAC: 1.3 }, leadTimeWeeks: 5 },
  { id: "cloudtilt", name: "Cloudtilt", category: "lifestyle", gender: "unisex", price: 200, cogs: 75, color: "#7b1fa2", basePopularity: 1.2, regionBias: { EMEA: 1.2, AMER: 1.0, APAC: 1.4 }, leadTimeWeeks: 8, launchWeek: 18, isNewIn: true },
  { id: "cloudaway", name: "Cloudaway", category: "lifestyle", gender: "unisex", price: 180, cogs: 65, color: "#90a4ae", basePopularity: 0.95, regionBias: { EMEA: 1.1, AMER: 0.9, APAC: 1.2 }, leadTimeWeeks: 7 },
  { id: "cloudrock-2", name: "Cloudrock 2 Waterproof", category: "hike", gender: "unisex", price: 250, cogs: 95, color: "#4e342e", basePopularity: 0.7, regionBias: { EMEA: 1.4, AMER: 1.0, APAC: 0.6 }, leadTimeWeeks: 9 },
  { id: "cloudtrax", name: "Cloudtrax", category: "hike", gender: "unisex", price: 270, cogs: 100, color: "#6d4c41", basePopularity: 0.5, regionBias: { EMEA: 1.5, AMER: 1.0, APAC: 0.5 }, leadTimeWeeks: 10 },
  { id: "cloudultra-2", name: "Cloudultra 2", category: "trail", gender: "unisex", price: 250, cogs: 90, color: "#bf360c", basePopularity: 0.6, regionBias: { EMEA: 1.2, AMER: 1.1, APAC: 0.7 }, leadTimeWeeks: 9 },
  { id: "cloudvista-2", name: "Cloudvista 2", category: "trail", gender: "unisex", price: 180, cogs: 70, color: "#558b2f", basePopularity: 0.7, regionBias: { EMEA: 1.2, AMER: 1.1, APAC: 0.8 }, leadTimeWeeks: 7 },
  { id: "cloudventure-peak", name: "Cloudventure Peak", category: "trail", gender: "unisex", price: 220, cogs: 85, color: "#827717", basePopularity: 0.5, regionBias: { EMEA: 1.3, AMER: 1.2, APAC: 0.6 }, leadTimeWeeks: 9 },
  { id: "cloud-5", name: "Cloud 5", category: "lifestyle", gender: "unisex", price: 150, cogs: 55, color: "#37474f", basePopularity: 1.5, regionBias: { EMEA: 1.1, AMER: 1.0, APAC: 1.3 }, leadTimeWeeks: 5 },
  { id: "cloud-5-w", name: "Cloud 5 W", category: "lifestyle", gender: "women", price: 150, cogs: 55, color: "#607d8b", basePopularity: 1.4, regionBias: { EMEA: 1.2, AMER: 1.0, APAC: 1.4 }, leadTimeWeeks: 5 },
  { id: "cloudnova", name: "Cloudnova", category: "lifestyle", gender: "unisex", price: 170, cogs: 60, color: "#ab47bc", basePopularity: 1.3, regionBias: { EMEA: 1.0, AMER: 1.1, APAC: 1.4 }, leadTimeWeeks: 6 },
  { id: "cloudhorizon", name: "Cloudhorizon", category: "hike", gender: "unisex", price: 230, cogs: 90, color: "#5d4037", basePopularity: 0.6, regionBias: { EMEA: 1.3, AMER: 1.1, APAC: 0.7 }, leadTimeWeeks: 8 },
  { id: "cloud-x-4", name: "Cloud X 4", category: "training", gender: "unisex", price: 170, cogs: 65, color: "#1565c0", basePopularity: 1.0, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 1.0 }, leadTimeWeeks: 6 },
  { id: "cloud-x-4-w", name: "Cloud X 4 W", category: "training", gender: "women", price: 170, cogs: 65, color: "#42a5f5", basePopularity: 1.1, regionBias: { EMEA: 1.0, AMER: 1.3, APAC: 1.0 }, leadTimeWeeks: 6 },
];

export const productById = new Map(products.map((p) => [p.id, p]));

export const SIZE_GRID = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"] as const;
export type Size = (typeof SIZE_GRID)[number];

export const sizeCurves: Record<Gender, Record<Size, number>> = {
  unisex: { "36": 0.04, "37": 0.06, "38": 0.09, "39": 0.12, "40": 0.14, "41": 0.15, "42": 0.14, "43": 0.11, "44": 0.08, "45": 0.07 },
  women: { "36": 0.10, "37": 0.14, "38": 0.18, "39": 0.18, "40": 0.15, "41": 0.10, "42": 0.07, "43": 0.04, "44": 0.02, "45": 0.02 },
  men: { "36": 0.01, "37": 0.02, "38": 0.05, "39": 0.09, "40": 0.13, "41": 0.16, "42": 0.18, "43": 0.15, "44": 0.12, "45": 0.09 },
};
