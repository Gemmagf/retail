import type { Product } from "./products";

export const SECTOR_IDS = ["footwear", "grocery", "bookstore", "fashion"] as const;
export type SectorId = (typeof SECTOR_IDS)[number];

export type SectorConfig = {
  id: SectorId;
  defaultUnit: "units" | "items";
  categories: string[];
  products: Product[];
};

const FOOTWEAR_PRODUCTS: Product[] = [
  { id: "cloudmonster-2", name: "Cloudmonster 2", category: "road", gender: "unisex", price: 230, cogs: 92, color: "#0a2540", basePopularity: 1.4, regionBias: { EMEA: 1.0, AMER: 1.3, APAC: 0.9 }, leadTimeWeeks: 8, seasonalProfile: { amplitude: 0.25, phaseShift: -Math.PI / 2 } },
  { id: "cloudmonster-2-w", name: "Cloudmonster 2 W", category: "road", gender: "women", price: 230, cogs: 92, color: "#1f3b6b", basePopularity: 1.1, regionBias: { EMEA: 1.1, AMER: 1.3, APAC: 1.0 }, leadTimeWeeks: 8, seasonalProfile: { amplitude: 0.25, phaseShift: -Math.PI / 2 } },
  { id: "cloudsurfer", name: "Cloudsurfer", category: "road", gender: "unisex", price: 180, cogs: 70, color: "#1f6feb", basePopularity: 1.3, regionBias: { EMEA: 1.1, AMER: 1.1, APAC: 1.0 }, leadTimeWeeks: 6, seasonalProfile: { amplitude: 0.25, phaseShift: -Math.PI / 2 } },
  { id: "cloudsurfer-trail", name: "Cloudsurfer Trail", category: "trail", gender: "unisex", price: 200, cogs: 80, color: "#0288d1", basePopularity: 0.8, regionBias: { EMEA: 1.3, AMER: 1.1, APAC: 0.7 }, leadTimeWeeks: 9, launchWeek: 38, isNewIn: true, seasonalProfile: { amplitude: 0.35, phaseShift: -Math.PI / 4 } },
  { id: "cloudrunner-2", name: "Cloudrunner 2", category: "road", gender: "unisex", price: 170, cogs: 65, color: "#2e7d32", basePopularity: 1.0, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 0.8 }, leadTimeWeeks: 6, seasonalProfile: { amplitude: 0.25, phaseShift: -Math.PI / 2 } },
  { id: "cloudrunner-2-w", name: "Cloudrunner 2 W", category: "road", gender: "women", price: 170, cogs: 65, color: "#43a047", basePopularity: 0.9, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 0.9 }, leadTimeWeeks: 6, seasonalProfile: { amplitude: 0.25, phaseShift: -Math.PI / 2 } },
  { id: "cloudswift-3", name: "Cloudswift 3", category: "road", gender: "unisex", price: 180, cogs: 70, color: "#ef6c00", basePopularity: 0.9, regionBias: { EMEA: 1.2, AMER: 0.9, APAC: 1.1 }, leadTimeWeeks: 7, seasonalProfile: { amplitude: 0.25, phaseShift: -Math.PI / 2 } },
  { id: "cloudboom-strike", name: "Cloudboom Strike", category: "road", gender: "unisex", price: 280, cogs: 95, color: "#d81b60", basePopularity: 0.6, regionBias: { EMEA: 1.0, AMER: 1.1, APAC: 1.2 }, leadTimeWeeks: 10, seasonalProfile: { amplitude: 0.25, phaseShift: -Math.PI / 2 } },
  { id: "cloudboom-echo-3", name: "Cloudboom Echo 3", category: "road", gender: "unisex", price: 290, cogs: 100, color: "#f06292", basePopularity: 0.55, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 1.0 }, leadTimeWeeks: 10, launchWeek: 30, isNewIn: true, seasonalProfile: { amplitude: 0.25, phaseShift: -Math.PI / 2 } },
  { id: "cloudflyer-4", name: "Cloudflyer 4", category: "road", gender: "unisex", price: 200, cogs: 80, color: "#5e35b1", basePopularity: 0.8, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 0.7 }, leadTimeWeeks: 7, seasonalProfile: { amplitude: 0.25, phaseShift: -Math.PI / 2 } },
  { id: "cloudgo", name: "Cloudgo", category: "road", gender: "unisex", price: 150, cogs: 55, color: "#00838f", basePopularity: 1.1, regionBias: { EMEA: 1.0, AMER: 1.0, APAC: 1.3 }, leadTimeWeeks: 5, seasonalProfile: { amplitude: 0.25, phaseShift: -Math.PI / 2 } },
  { id: "cloudgo-w", name: "Cloudgo W", category: "road", gender: "women", price: 150, cogs: 55, color: "#26a69a", basePopularity: 1.0, regionBias: { EMEA: 1.0, AMER: 1.0, APAC: 1.3 }, leadTimeWeeks: 5, seasonalProfile: { amplitude: 0.25, phaseShift: -Math.PI / 2 } },
  { id: "cloudtilt", name: "Cloudtilt", category: "lifestyle", gender: "unisex", price: 200, cogs: 75, color: "#7b1fa2", basePopularity: 1.2, regionBias: { EMEA: 1.2, AMER: 1.0, APAC: 1.4 }, leadTimeWeeks: 8, launchWeek: 18, isNewIn: true, seasonalProfile: { amplitude: 0.18, phaseShift: Math.PI / 4 } },
  { id: "cloudaway", name: "Cloudaway", category: "lifestyle", gender: "unisex", price: 180, cogs: 65, color: "#90a4ae", basePopularity: 0.95, regionBias: { EMEA: 1.1, AMER: 0.9, APAC: 1.2 }, leadTimeWeeks: 7, seasonalProfile: { amplitude: 0.18, phaseShift: Math.PI / 4 } },
  { id: "cloudrock-2", name: "Cloudrock 2 Waterproof", category: "hike", gender: "unisex", price: 250, cogs: 95, color: "#4e342e", basePopularity: 0.7, regionBias: { EMEA: 1.4, AMER: 1.0, APAC: 0.6 }, leadTimeWeeks: 9, seasonalProfile: { amplitude: 0.4, phaseShift: -Math.PI / 3 } },
  { id: "cloudtrax", name: "Cloudtrax", category: "hike", gender: "unisex", price: 270, cogs: 100, color: "#6d4c41", basePopularity: 0.5, regionBias: { EMEA: 1.5, AMER: 1.0, APAC: 0.5 }, leadTimeWeeks: 10, seasonalProfile: { amplitude: 0.4, phaseShift: -Math.PI / 3 } },
  { id: "cloudultra-2", name: "Cloudultra 2", category: "trail", gender: "unisex", price: 250, cogs: 90, color: "#bf360c", basePopularity: 0.6, regionBias: { EMEA: 1.2, AMER: 1.1, APAC: 0.7 }, leadTimeWeeks: 9, seasonalProfile: { amplitude: 0.35, phaseShift: -Math.PI / 4 } },
  { id: "cloudvista-2", name: "Cloudvista 2", category: "trail", gender: "unisex", price: 180, cogs: 70, color: "#558b2f", basePopularity: 0.7, regionBias: { EMEA: 1.2, AMER: 1.1, APAC: 0.8 }, leadTimeWeeks: 7, seasonalProfile: { amplitude: 0.35, phaseShift: -Math.PI / 4 } },
  { id: "cloudventure-peak", name: "Cloudventure Peak", category: "trail", gender: "unisex", price: 220, cogs: 85, color: "#827717", basePopularity: 0.5, regionBias: { EMEA: 1.3, AMER: 1.2, APAC: 0.6 }, leadTimeWeeks: 9, seasonalProfile: { amplitude: 0.35, phaseShift: -Math.PI / 4 } },
  { id: "cloud-5", name: "Cloud 5", category: "lifestyle", gender: "unisex", price: 150, cogs: 55, color: "#37474f", basePopularity: 1.5, regionBias: { EMEA: 1.1, AMER: 1.0, APAC: 1.3 }, leadTimeWeeks: 5, seasonalProfile: { amplitude: 0.18, phaseShift: Math.PI / 4 } },
  { id: "cloud-5-w", name: "Cloud 5 W", category: "lifestyle", gender: "women", price: 150, cogs: 55, color: "#607d8b", basePopularity: 1.4, regionBias: { EMEA: 1.2, AMER: 1.0, APAC: 1.4 }, leadTimeWeeks: 5, seasonalProfile: { amplitude: 0.18, phaseShift: Math.PI / 4 } },
  { id: "cloudnova", name: "Cloudnova", category: "lifestyle", gender: "unisex", price: 170, cogs: 60, color: "#ab47bc", basePopularity: 1.3, regionBias: { EMEA: 1.0, AMER: 1.1, APAC: 1.4 }, leadTimeWeeks: 6, seasonalProfile: { amplitude: 0.18, phaseShift: Math.PI / 4 } },
  { id: "cloudhorizon", name: "Cloudhorizon", category: "hike", gender: "unisex", price: 230, cogs: 90, color: "#5d4037", basePopularity: 0.6, regionBias: { EMEA: 1.3, AMER: 1.1, APAC: 0.7 }, leadTimeWeeks: 8, seasonalProfile: { amplitude: 0.4, phaseShift: -Math.PI / 3 } },
  { id: "cloud-x-4", name: "Cloud X 4", category: "training", gender: "unisex", price: 170, cogs: 65, color: "#1565c0", basePopularity: 1.0, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 1.0 }, leadTimeWeeks: 6, seasonalProfile: { amplitude: 0.18, phaseShift: 0 } },
  { id: "cloud-x-4-w", name: "Cloud X 4 W", category: "training", gender: "women", price: 170, cogs: 65, color: "#42a5f5", basePopularity: 1.1, regionBias: { EMEA: 1.0, AMER: 1.3, APAC: 1.0 }, leadTimeWeeks: 6, seasonalProfile: { amplitude: 0.18, phaseShift: 0 } },
];

const GROCERY_PRODUCTS: Product[] = [
  { id: "milk-1l", name: "Organic Milk 1L", category: "dairy", gender: "unisex", price: 1.95, cogs: 0.85, color: "#0288d1", basePopularity: 2.0, regionBias: { EMEA: 1.1, AMER: 1.0, APAC: 0.8 }, leadTimeWeeks: 1, seasonalProfile: { amplitude: 0.05, phaseShift: 0 } },
  { id: "yogurt-greek", name: "Greek Yogurt 500g", category: "dairy", gender: "unisex", price: 4.5, cogs: 1.8, color: "#4fc3f7", basePopularity: 1.5, regionBias: { EMEA: 1.2, AMER: 1.0, APAC: 0.9 }, leadTimeWeeks: 1, seasonalProfile: { amplitude: 0.05, phaseShift: 0 } },
  { id: "cheese-cheddar", name: "Cheddar 200g", category: "dairy", gender: "unisex", price: 5.9, cogs: 2.6, color: "#f9a825", basePopularity: 1.2, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 0.7 }, leadTimeWeeks: 2, seasonalProfile: { amplitude: 0.08, phaseShift: -Math.PI / 2 } },
  { id: "bread-wholewheat", name: "Whole-wheat Bread", category: "bakery", gender: "unisex", price: 3.5, cogs: 1.4, color: "#a1887f", basePopularity: 1.8, regionBias: { EMEA: 1.1, AMER: 1.0, APAC: 1.0 }, leadTimeWeeks: 1, seasonalProfile: { amplitude: 0.05, phaseShift: 0 } },
  { id: "croissant-butter", name: "Butter Croissant 4-pack", category: "bakery", gender: "unisex", price: 5.2, cogs: 2.1, color: "#ffb74d", basePopularity: 1.0, regionBias: { EMEA: 1.4, AMER: 0.9, APAC: 0.8 }, leadTimeWeeks: 1, seasonalProfile: { amplitude: 0.1, phaseShift: 0 } },
  { id: "apples-gala-1kg", name: "Apples Gala 1kg", category: "produce", gender: "unisex", price: 3.8, cogs: 1.6, color: "#e57373", basePopularity: 1.7, regionBias: { EMEA: 1.0, AMER: 1.1, APAC: 1.0 }, leadTimeWeeks: 1, seasonalProfile: { amplitude: 0.25, phaseShift: -Math.PI / 4 } },
  { id: "bananas-1kg", name: "Bananas 1kg", category: "produce", gender: "unisex", price: 2.4, cogs: 1.0, color: "#fff176", basePopularity: 2.1, regionBias: { EMEA: 1.0, AMER: 1.1, APAC: 1.1 }, leadTimeWeeks: 1, seasonalProfile: { amplitude: 0.05, phaseShift: 0 } },
  { id: "tomatoes-cherry", name: "Cherry Tomatoes 500g", category: "produce", gender: "unisex", price: 3.6, cogs: 1.5, color: "#e53935", basePopularity: 1.3, regionBias: { EMEA: 1.2, AMER: 1.0, APAC: 0.9 }, leadTimeWeeks: 1, seasonalProfile: { amplitude: 0.35, phaseShift: -Math.PI / 2 } },
  { id: "salmon-fillet", name: "Salmon Fillet 250g", category: "meatfish", gender: "unisex", price: 12.9, cogs: 6.4, color: "#f48fb1", basePopularity: 0.9, regionBias: { EMEA: 1.3, AMER: 1.1, APAC: 1.2 }, leadTimeWeeks: 1, seasonalProfile: { amplitude: 0.1, phaseShift: 0 } },
  { id: "chicken-breast", name: "Chicken Breast 500g", category: "meatfish", gender: "unisex", price: 8.5, cogs: 3.5, color: "#ffcc80", basePopularity: 1.4, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 0.9 }, leadTimeWeeks: 1, seasonalProfile: { amplitude: 0.05, phaseShift: 0 } },
  { id: "pasta-spaghetti", name: "Spaghetti 500g", category: "pantry", gender: "unisex", price: 1.6, cogs: 0.65, color: "#fdd835", basePopularity: 1.5, regionBias: { EMEA: 1.2, AMER: 1.0, APAC: 0.9 }, leadTimeWeeks: 3, seasonalProfile: { amplitude: 0.05, phaseShift: 0 } },
  { id: "olive-oil-extra", name: "Olive Oil 750ml", category: "pantry", gender: "unisex", price: 12.0, cogs: 6.0, color: "#9ccc65", basePopularity: 1.0, regionBias: { EMEA: 1.4, AMER: 0.9, APAC: 0.7 }, leadTimeWeeks: 4, seasonalProfile: { amplitude: 0.05, phaseShift: 0 } },
  { id: "rice-basmati", name: "Basmati Rice 1kg", category: "pantry", gender: "unisex", price: 4.2, cogs: 1.7, color: "#fffde7", basePopularity: 1.1, regionBias: { EMEA: 0.9, AMER: 1.0, APAC: 1.4 }, leadTimeWeeks: 4, seasonalProfile: { amplitude: 0.05, phaseShift: 0 } },
  { id: "coffee-beans", name: "Coffee Beans 250g", category: "beverages", gender: "unisex", price: 9.5, cogs: 3.8, color: "#5d4037", basePopularity: 1.6, regionBias: { EMEA: 1.2, AMER: 1.1, APAC: 1.0 }, leadTimeWeeks: 3, seasonalProfile: { amplitude: 0.08, phaseShift: Math.PI / 2 } },
  { id: "sparkling-water", name: "Sparkling Water 6×1.5L", category: "beverages", gender: "unisex", price: 5.4, cogs: 2.2, color: "#4dd0e1", basePopularity: 1.7, regionBias: { EMEA: 1.1, AMER: 1.1, APAC: 0.9 }, leadTimeWeeks: 2, seasonalProfile: { amplitude: 0.25, phaseShift: -Math.PI / 2 } },
  { id: "frozen-peas", name: "Frozen Peas 1kg", category: "frozen", gender: "unisex", price: 3.2, cogs: 1.3, color: "#66bb6a", basePopularity: 0.9, regionBias: { EMEA: 1.0, AMER: 1.1, APAC: 0.8 }, leadTimeWeeks: 3, seasonalProfile: { amplitude: 0.05, phaseShift: 0 } },
  { id: "frozen-pizza", name: "Frozen Pizza Margherita", category: "frozen", gender: "unisex", price: 4.9, cogs: 2.0, color: "#ef5350", basePopularity: 1.2, regionBias: { EMEA: 1.0, AMER: 1.3, APAC: 0.8 }, leadTimeWeeks: 2, seasonalProfile: { amplitude: 0.1, phaseShift: 0 } },
  { id: "detergent-2l", name: "Detergent 2L", category: "household", gender: "unisex", price: 11.9, cogs: 4.8, color: "#7986cb", basePopularity: 1.0, regionBias: { EMEA: 1.0, AMER: 1.0, APAC: 1.0 }, leadTimeWeeks: 4, seasonalProfile: { amplitude: 0.05, phaseShift: 0 } },
  { id: "toilet-paper", name: "Toilet Paper 12-pack", category: "household", gender: "unisex", price: 9.5, cogs: 4.0, color: "#90caf9", basePopularity: 1.5, regionBias: { EMEA: 1.0, AMER: 1.0, APAC: 1.0 }, leadTimeWeeks: 4, seasonalProfile: { amplitude: 0.03, phaseShift: 0 } },
];

const BOOKSTORE_PRODUCTS: Product[] = [
  { id: "atlas-of-the-sea", name: "Atlas of the Sea", category: "nonfiction", gender: "unisex", price: 38.0, cogs: 15.2, color: "#1e88e5", basePopularity: 0.7, regionBias: { EMEA: 1.2, AMER: 1.0, APAC: 0.9 }, leadTimeWeeks: 4, seasonalProfile: { amplitude: 0.2, phaseShift: Math.PI / 2 } },
  { id: "brief-history-time", name: "A Brief History of Forever", category: "nonfiction", gender: "unisex", price: 24.0, cogs: 9.6, color: "#3949ab", basePopularity: 1.0, regionBias: { EMEA: 1.1, AMER: 1.1, APAC: 1.0 }, leadTimeWeeks: 4, seasonalProfile: { amplitude: 0.15, phaseShift: Math.PI / 2 } },
  { id: "midnight-library", name: "The Midnight Library", category: "fiction", gender: "unisex", price: 22.5, cogs: 9.0, color: "#5e35b1", basePopularity: 1.6, regionBias: { EMEA: 1.1, AMER: 1.2, APAC: 1.0 }, leadTimeWeeks: 4, seasonalProfile: { amplitude: 0.25, phaseShift: Math.PI / 2 } },
  { id: "name-of-wind", name: "The Name of the Wind", category: "fiction", gender: "unisex", price: 28.0, cogs: 11.0, color: "#8e24aa", basePopularity: 1.2, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 0.9 }, leadTimeWeeks: 5, seasonalProfile: { amplitude: 0.2, phaseShift: Math.PI / 2 } },
  { id: "klara-and-the-sun", name: "Klara and the Sun", category: "fiction", gender: "unisex", price: 26.0, cogs: 10.4, color: "#d81b60", basePopularity: 1.0, regionBias: { EMEA: 1.2, AMER: 1.0, APAC: 1.1 }, leadTimeWeeks: 4, seasonalProfile: { amplitude: 0.2, phaseShift: Math.PI / 2 } },
  { id: "all-the-light", name: "All the Light We Cannot See", category: "fiction", gender: "unisex", price: 24.0, cogs: 9.6, color: "#fb8c00", basePopularity: 1.1, regionBias: { EMEA: 1.1, AMER: 1.2, APAC: 0.9 }, leadTimeWeeks: 4, seasonalProfile: { amplitude: 0.18, phaseShift: Math.PI / 2 } },
  { id: "where-crawdads", name: "Where the Crawdads Sing", category: "fiction", gender: "unisex", price: 22.0, cogs: 8.8, color: "#388e3c", basePopularity: 1.4, regionBias: { EMEA: 1.0, AMER: 1.3, APAC: 0.9 }, leadTimeWeeks: 4, seasonalProfile: { amplitude: 0.18, phaseShift: Math.PI / 2 } },
  { id: "moonlight-bear", name: "The Moonlight Bear", category: "children", gender: "unisex", price: 14.0, cogs: 5.6, color: "#ffb300", basePopularity: 1.3, regionBias: { EMEA: 1.1, AMER: 1.1, APAC: 1.1 }, leadTimeWeeks: 5, seasonalProfile: { amplitude: 0.4, phaseShift: Math.PI }, launchWeek: 30, isNewIn: true },
  { id: "lost-island", name: "The Lost Island Adventure", category: "children", gender: "unisex", price: 12.5, cogs: 5.0, color: "#26a69a", basePopularity: 1.2, regionBias: { EMEA: 1.1, AMER: 1.1, APAC: 1.0 }, leadTimeWeeks: 5, seasonalProfile: { amplitude: 0.3, phaseShift: Math.PI } },
  { id: "garden-stories", name: "Stories from the Garden", category: "children", gender: "unisex", price: 16.0, cogs: 6.4, color: "#7cb342", basePopularity: 1.0, regionBias: { EMEA: 1.2, AMER: 1.0, APAC: 1.0 }, leadTimeWeeks: 5, seasonalProfile: { amplitude: 0.25, phaseShift: 0 } },
  { id: "alps-in-pictures", name: "The Alps in Pictures", category: "art", gender: "unisex", price: 65.0, cogs: 26.0, color: "#0277bd", basePopularity: 0.4, regionBias: { EMEA: 1.5, AMER: 0.8, APAC: 0.9 }, leadTimeWeeks: 8, seasonalProfile: { amplitude: 0.4, phaseShift: Math.PI } },
  { id: "modern-japanese-art", name: "Modern Japanese Art", category: "art", gender: "unisex", price: 58.0, cogs: 23.2, color: "#c62828", basePopularity: 0.5, regionBias: { EMEA: 0.9, AMER: 1.1, APAC: 1.4 }, leadTimeWeeks: 8, seasonalProfile: { amplitude: 0.3, phaseShift: Math.PI } },
  { id: "swiss-architecture", name: "Swiss Architecture 1970–2020", category: "art", gender: "unisex", price: 72.0, cogs: 28.8, color: "#37474f", basePopularity: 0.3, regionBias: { EMEA: 1.6, AMER: 0.8, APAC: 0.7 }, leadTimeWeeks: 8, seasonalProfile: { amplitude: 0.2, phaseShift: 0 }, launchWeek: 40, isNewIn: true },
  { id: "mediterranean-table", name: "The Mediterranean Table", category: "cookbooks", gender: "unisex", price: 36.0, cogs: 14.4, color: "#ef6c00", basePopularity: 0.9, regionBias: { EMEA: 1.3, AMER: 1.0, APAC: 0.8 }, leadTimeWeeks: 5, seasonalProfile: { amplitude: 0.4, phaseShift: Math.PI } },
  { id: "alpine-baking", name: "Alpine Baking", category: "cookbooks", gender: "unisex", price: 32.0, cogs: 12.8, color: "#a1887f", basePopularity: 0.6, regionBias: { EMEA: 1.4, AMER: 0.9, APAC: 0.7 }, leadTimeWeeks: 5, seasonalProfile: { amplitude: 0.45, phaseShift: Math.PI } },
  { id: "ramen-deep-dive", name: "Ramen — A Deep Dive", category: "cookbooks", gender: "unisex", price: 28.0, cogs: 11.2, color: "#fdd835", basePopularity: 0.7, regionBias: { EMEA: 0.9, AMER: 1.1, APAC: 1.4 }, leadTimeWeeks: 5, seasonalProfile: { amplitude: 0.25, phaseShift: 0 } },
  { id: "design-of-everyday", name: "The Design of Everyday Things", category: "nonfiction", gender: "unisex", price: 30.0, cogs: 12.0, color: "#455a64", basePopularity: 0.8, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 1.0 }, leadTimeWeeks: 4, seasonalProfile: { amplitude: 0.15, phaseShift: 0 } },
  { id: "thinking-fast-slow", name: "Thinking, Fast and Slow", category: "nonfiction", gender: "unisex", price: 28.0, cogs: 11.2, color: "#6a1b9a", basePopularity: 1.0, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 1.0 }, leadTimeWeeks: 4, seasonalProfile: { amplitude: 0.15, phaseShift: 0 } },
];

const FASHION_PRODUCTS: Product[] = [
  { id: "tee-cotton-w", name: "Cotton T-shirt", category: "tops", gender: "women", price: 35.0, cogs: 11.0, color: "#90a4ae", basePopularity: 1.7, regionBias: { EMEA: 1.0, AMER: 1.1, APAC: 1.0 }, leadTimeWeeks: 6, seasonalProfile: { amplitude: 0.3, phaseShift: -Math.PI / 2 } },
  { id: "tee-cotton-m", name: "Cotton T-shirt", category: "tops", gender: "men", price: 35.0, cogs: 11.0, color: "#546e7a", basePopularity: 1.5, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 1.0 }, leadTimeWeeks: 6, seasonalProfile: { amplitude: 0.3, phaseShift: -Math.PI / 2 } },
  { id: "linen-shirt-w", name: "Linen Shirt", category: "tops", gender: "women", price: 89.0, cogs: 28.0, color: "#fff8e1", basePopularity: 0.9, regionBias: { EMEA: 1.2, AMER: 1.0, APAC: 0.9 }, leadTimeWeeks: 8, seasonalProfile: { amplitude: 0.45, phaseShift: -Math.PI / 2 } },
  { id: "merino-sweater", name: "Merino Sweater", category: "tops", gender: "unisex", price: 145.0, cogs: 48.0, color: "#5d4037", basePopularity: 1.1, regionBias: { EMEA: 1.3, AMER: 1.0, APAC: 0.8 }, leadTimeWeeks: 8, seasonalProfile: { amplitude: 0.5, phaseShift: Math.PI } },
  { id: "denim-straight-w", name: "Straight-leg Jeans", category: "bottoms", gender: "women", price: 110.0, cogs: 36.0, color: "#1a237e", basePopularity: 1.4, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 1.0 }, leadTimeWeeks: 8, seasonalProfile: { amplitude: 0.18, phaseShift: 0 } },
  { id: "denim-slim-m", name: "Slim Jeans", category: "bottoms", gender: "men", price: 110.0, cogs: 36.0, color: "#283593", basePopularity: 1.3, regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 1.0 }, leadTimeWeeks: 8, seasonalProfile: { amplitude: 0.18, phaseShift: 0 } },
  { id: "linen-trousers", name: "Linen Trousers", category: "bottoms", gender: "unisex", price: 95.0, cogs: 30.0, color: "#bcaaa4", basePopularity: 0.8, regionBias: { EMEA: 1.2, AMER: 1.0, APAC: 1.0 }, leadTimeWeeks: 7, seasonalProfile: { amplitude: 0.4, phaseShift: -Math.PI / 2 } },
  { id: "wool-trousers", name: "Wool Trousers", category: "bottoms", gender: "unisex", price: 165.0, cogs: 55.0, color: "#37474f", basePopularity: 0.6, regionBias: { EMEA: 1.3, AMER: 1.0, APAC: 0.8 }, leadTimeWeeks: 9, seasonalProfile: { amplitude: 0.45, phaseShift: Math.PI } },
  { id: "summer-dress", name: "Summer Dress", category: "dresses", gender: "women", price: 120.0, cogs: 38.0, color: "#f06292", basePopularity: 1.0, regionBias: { EMEA: 1.1, AMER: 1.1, APAC: 1.0 }, leadTimeWeeks: 8, seasonalProfile: { amplitude: 0.55, phaseShift: -Math.PI / 2 } },
  { id: "midi-knit-dress", name: "Midi Knit Dress", category: "dresses", gender: "women", price: 165.0, cogs: 55.0, color: "#7e57c2", basePopularity: 0.7, regionBias: { EMEA: 1.3, AMER: 1.0, APAC: 0.9 }, leadTimeWeeks: 9, seasonalProfile: { amplitude: 0.4, phaseShift: Math.PI }, launchWeek: 36, isNewIn: true },
  { id: "rain-jacket", name: "Lightweight Rain Jacket", category: "outerwear", gender: "unisex", price: 220.0, cogs: 75.0, color: "#0277bd", basePopularity: 0.9, regionBias: { EMEA: 1.4, AMER: 1.0, APAC: 0.9 }, leadTimeWeeks: 10, seasonalProfile: { amplitude: 0.4, phaseShift: -Math.PI / 4 } },
  { id: "wool-coat", name: "Wool Overcoat", category: "outerwear", gender: "unisex", price: 380.0, cogs: 130.0, color: "#3e2723", basePopularity: 0.5, regionBias: { EMEA: 1.4, AMER: 1.1, APAC: 0.7 }, leadTimeWeeks: 12, seasonalProfile: { amplitude: 0.6, phaseShift: Math.PI } },
  { id: "puffer-jacket", name: "Down Puffer Jacket", category: "outerwear", gender: "unisex", price: 280.0, cogs: 95.0, color: "#212121", basePopularity: 0.7, regionBias: { EMEA: 1.3, AMER: 1.2, APAC: 0.9 }, leadTimeWeeks: 11, seasonalProfile: { amplitude: 0.65, phaseShift: Math.PI } },
  { id: "leather-belt", name: "Leather Belt", category: "accessories", gender: "unisex", price: 75.0, cogs: 22.0, color: "#5d4037", basePopularity: 0.9, regionBias: { EMEA: 1.0, AMER: 1.1, APAC: 1.0 }, leadTimeWeeks: 6, seasonalProfile: { amplitude: 0.1, phaseShift: 0 } },
  { id: "silk-scarf", name: "Silk Scarf", category: "accessories", gender: "women", price: 95.0, cogs: 30.0, color: "#ec407a", basePopularity: 0.7, regionBias: { EMEA: 1.2, AMER: 1.0, APAC: 1.1 }, leadTimeWeeks: 7, seasonalProfile: { amplitude: 0.3, phaseShift: Math.PI / 2 } },
  { id: "knit-beanie", name: "Knit Beanie", category: "accessories", gender: "unisex", price: 45.0, cogs: 14.0, color: "#1565c0", basePopularity: 1.0, regionBias: { EMEA: 1.2, AMER: 1.0, APAC: 0.9 }, leadTimeWeeks: 6, seasonalProfile: { amplitude: 0.6, phaseShift: Math.PI } },
  { id: "canvas-tote", name: "Canvas Tote", category: "accessories", gender: "unisex", price: 55.0, cogs: 17.0, color: "#8d6e63", basePopularity: 1.2, regionBias: { EMEA: 1.0, AMER: 1.1, APAC: 1.1 }, leadTimeWeeks: 6, seasonalProfile: { amplitude: 0.15, phaseShift: 0 } },
  { id: "leather-loafers", name: "Leather Loafers", category: "accessories", gender: "unisex", price: 195.0, cogs: 65.0, color: "#3e2723", basePopularity: 0.6, regionBias: { EMEA: 1.2, AMER: 1.1, APAC: 0.9 }, leadTimeWeeks: 9, seasonalProfile: { amplitude: 0.2, phaseShift: 0 } },
];

export const SECTORS: Record<SectorId, SectorConfig> = {
  footwear: {
    id: "footwear",
    defaultUnit: "units",
    categories: ["road", "trail", "training", "lifestyle", "hike"],
    products: FOOTWEAR_PRODUCTS,
  },
  grocery: {
    id: "grocery",
    defaultUnit: "units",
    categories: ["produce", "dairy", "bakery", "meatfish", "beverages", "pantry", "frozen", "household"],
    products: GROCERY_PRODUCTS,
  },
  bookstore: {
    id: "bookstore",
    defaultUnit: "items",
    categories: ["fiction", "nonfiction", "children", "art", "cookbooks"],
    products: BOOKSTORE_PRODUCTS,
  },
  fashion: {
    id: "fashion",
    defaultUnit: "items",
    categories: ["tops", "bottoms", "dresses", "outerwear", "accessories"],
    products: FASHION_PRODUCTS,
  },
};

export const DEFAULT_SECTOR: SectorId = "footwear";
export const SECTOR_COOKIE = "as_sector";

export function isSectorId(s: string | undefined | null): s is SectorId {
  return !!s && (SECTOR_IDS as readonly string[]).includes(s);
}
