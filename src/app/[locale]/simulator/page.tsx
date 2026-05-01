import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { SectionTabs } from "@/components/SectionTabs";
import { getProducts } from "@/data/products";
import { getSales, getMarketingSpend, CURRENT_WEEK_INDEX } from "@/data/series";
import type { Region } from "@/data/locations";
import { SimulatorClient } from "./simulator-client";

export default async function SimulatorPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const products = await getProducts();
  const sales = await getSales();
  const baseDemand: Record<string, Record<Region, number>> = {};
  for (const p of products) {
    baseDemand[p.id] = { EMEA: 0, AMER: 0, APAC: 0 };
  }
  for (const s of sales) {
    if (s.week >= CURRENT_WEEK_INDEX - 3 && s.week <= CURRENT_WEEK_INDEX) {
      baseDemand[s.productId][s.region] += s.units / 4;
    }
  }

  const spend = await getMarketingSpend();
  const baseSpend: Record<Region, number> = { EMEA: 0, AMER: 0, APAC: 0 };
  for (const r of ["EMEA", "AMER", "APAC"] as Region[]) {
    const recent = spend.filter(
      (s) => s.region === r && s.week >= CURRENT_WEEK_INDEX - 3 && s.week <= CURRENT_WEEK_INDEX,
    );
    baseSpend[r] = recent.reduce((a, b) => a + b.spend, 0) / Math.max(1, recent.length);
  }

  return (
    <>
      <PageHeader
        title={t("simulator.title")}
        subtitle={t("simulator.subtitle")}
        info={t("info.simulator")}
      />
      <SectionTabs
        tabs={[
          { href: "/forecast", label: t("nav.forecast") },
          { href: "/simulator", label: t("nav.simulator") },
        ]}
      />
      <SimulatorClient products={products} baseDemand={baseDemand} baseSpend={baseSpend} />
    </>
  );
}
