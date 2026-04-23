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
  partner?: string;
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

  { id: "antwerp-dc", city: "Antwerp", country: "Belgium", countryCode: "BE", region: "EMEA", channel: "warehouse", scale: 4.5 },
  { id: "atlanta-dc", city: "Atlanta", country: "United States", countryCode: "US", region: "AMER", channel: "warehouse", scale: 5.0 },
  { id: "yokohama-dc", city: "Yokohama", country: "Japan", countryCode: "JP", region: "APAC", channel: "warehouse", scale: 3.5 },

  { id: "footlocker-de", city: "Berlin", country: "Germany", countryCode: "DE", region: "EMEA", channel: "retail", scale: 1.1, partner: "Foot Locker" },
  { id: "jdsports-uk", city: "London", country: "United Kingdom", countryCode: "GB", region: "EMEA", channel: "retail", scale: 1.3, partner: "JD Sports" },
  { id: "intersport-fr", city: "Lyon", country: "France", countryCode: "FR", region: "EMEA", channel: "retail", scale: 0.9, partner: "Intersport" },
  { id: "dicks-us", city: "Pittsburgh", country: "United States", countryCode: "US", region: "AMER", channel: "retail", scale: 1.4, partner: "Dick's Sporting Goods" },
  { id: "rei-us", city: "Seattle", country: "United States", countryCode: "US", region: "AMER", channel: "retail", scale: 1.0, partner: "REI" },
  { id: "abc-mart-jp", city: "Osaka", country: "Japan", countryCode: "JP", region: "APAC", channel: "retail", scale: 1.0, partner: "ABC-Mart" },

  { id: "ecom-emea", city: "—", country: "Online EMEA", countryCode: "EU", region: "EMEA", channel: "ecom", scale: 2.6 },
  { id: "ecom-amer", city: "—", country: "Online Americas", countryCode: "US", region: "AMER", channel: "ecom", scale: 3.0 },
  { id: "ecom-apac", city: "—", country: "Online APAC", countryCode: "AP", region: "APAC", channel: "ecom", scale: 2.0 },
];

export const locationById = new Map(locations.map((l) => [l.id, l]));

export const regionMeta: Record<Region, { color: string }> = {
  EMEA: { color: "#0a2540" },
  AMER: { color: "#1f6feb" },
  APAC: { color: "#ef6c00" },
};

export const channelMeta: Record<Channel, { color: string }> = {
  flagship: { color: "#0a2540" },
  retail: { color: "#7e57c2" },
  warehouse: { color: "#9e9d24" },
  ecom: { color: "#00897b" },
};
