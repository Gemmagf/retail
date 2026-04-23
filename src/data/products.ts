export type Category = "road" | "trail" | "training" | "lifestyle" | "hike";

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  color: string;
  basePopularity: number;
  regionBias: { EMEA: number; AMER: number; APAC: number };
};

export const products: Product[] = [
  {
    id: "cloudmonster-2",
    name: "Cloudmonster 2",
    category: "road",
    price: 230,
    color: "#0a2540",
    basePopularity: 1.4,
    regionBias: { EMEA: 1.0, AMER: 1.3, APAC: 0.9 },
  },
  {
    id: "cloudsurfer",
    name: "Cloudsurfer",
    category: "road",
    price: 180,
    color: "#1f6feb",
    basePopularity: 1.3,
    regionBias: { EMEA: 1.1, AMER: 1.1, APAC: 1.0 },
  },
  {
    id: "cloudrunner-2",
    name: "Cloudrunner 2",
    category: "road",
    price: 170,
    color: "#2e7d32",
    basePopularity: 1.0,
    regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 0.8 },
  },
  {
    id: "cloudswift-3",
    name: "Cloudswift 3",
    category: "road",
    price: 180,
    color: "#ef6c00",
    basePopularity: 0.9,
    regionBias: { EMEA: 1.2, AMER: 0.9, APAC: 1.1 },
  },
  {
    id: "cloudboom-strike",
    name: "Cloudboom Strike",
    category: "road",
    price: 280,
    color: "#d81b60",
    basePopularity: 0.6,
    regionBias: { EMEA: 1.0, AMER: 1.1, APAC: 1.2 },
  },
  {
    id: "cloudflyer-4",
    name: "Cloudflyer 4",
    category: "road",
    price: 200,
    color: "#5e35b1",
    basePopularity: 0.8,
    regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 0.7 },
  },
  {
    id: "cloudgo",
    name: "Cloudgo",
    category: "road",
    price: 150,
    color: "#00838f",
    basePopularity: 1.1,
    regionBias: { EMEA: 1.0, AMER: 1.0, APAC: 1.3 },
  },
  {
    id: "cloudrock-2",
    name: "Cloudrock 2 Waterproof",
    category: "hike",
    price: 250,
    color: "#4e342e",
    basePopularity: 0.7,
    regionBias: { EMEA: 1.4, AMER: 1.0, APAC: 0.6 },
  },
  {
    id: "cloudultra-2",
    name: "Cloudultra 2",
    category: "trail",
    price: 250,
    color: "#bf360c",
    basePopularity: 0.6,
    regionBias: { EMEA: 1.2, AMER: 1.1, APAC: 0.7 },
  },
  {
    id: "cloud-5",
    name: "Cloud 5",
    category: "lifestyle",
    price: 150,
    color: "#37474f",
    basePopularity: 1.5,
    regionBias: { EMEA: 1.1, AMER: 1.0, APAC: 1.3 },
  },
  {
    id: "cloudvista-2",
    name: "Cloudvista 2",
    category: "trail",
    price: 180,
    color: "#558b2f",
    basePopularity: 0.7,
    regionBias: { EMEA: 1.2, AMER: 1.1, APAC: 0.8 },
  },
  {
    id: "cloud-x-4",
    name: "Cloud X 4",
    category: "training",
    price: 170,
    color: "#1565c0",
    basePopularity: 1.0,
    regionBias: { EMEA: 1.0, AMER: 1.2, APAC: 1.0 },
  },
];

export const productById = new Map(products.map((p) => [p.id, p]));
