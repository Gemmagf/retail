export type Region = "EMEA" | "AMER" | "APAC";
export type Channel = "flagship" | "retail" | "warehouse" | "ecom";

export type Location = {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  region: Region;
  channel: Channel;
  scale: number;
};

export const locations: Location[] = [
  { id: "zurich-flagship", city: "Zurich", country: "Switzerland", countryCode: "CH", region: "EMEA", channel: "flagship", scale: 1.4 },
  { id: "berlin-flagship", city: "Berlin", country: "Germany", countryCode: "DE", region: "EMEA", channel: "flagship", scale: 1.3 },
  { id: "london-flagship", city: "London", country: "United Kingdom", countryCode: "GB", region: "EMEA", channel: "flagship", scale: 1.5 },
  { id: "paris-flagship", city: "Paris", country: "France", countryCode: "FR", region: "EMEA", channel: "flagship", scale: 1.2 },
  { id: "milan-flagship", city: "Milan", country: "Italy", countryCode: "IT", region: "EMEA", channel: "flagship", scale: 1.0 },
  { id: "barcelona-flagship", city: "Barcelona", country: "Spain", countryCode: "ES", region: "EMEA", channel: "flagship", scale: 0.9 },
  { id: "newyork-flagship", city: "New York", country: "United States", countryCode: "US", region: "AMER", channel: "flagship", scale: 1.6 },
  { id: "portland-flagship", city: "Portland", country: "United States", countryCode: "US", region: "AMER", channel: "flagship", scale: 0.9 },
  { id: "saopaulo-flagship", city: "São Paulo", country: "Brazil", countryCode: "BR", region: "AMER", channel: "flagship", scale: 0.8 },
  { id: "tokyo-flagship", city: "Tokyo", country: "Japan", countryCode: "JP", region: "APAC", channel: "flagship", scale: 1.3 },
  { id: "melbourne-flagship", city: "Melbourne", country: "Australia", countryCode: "AU", region: "APAC", channel: "flagship", scale: 0.9 },
];

export const locationById = new Map(locations.map((l) => [l.id, l]));

export const regionMeta: Record<Region, { color: string }> = {
  EMEA: { color: "#0a2540" },
  AMER: { color: "#1f6feb" },
  APAC: { color: "#ef6c00" },
};
