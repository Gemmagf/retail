import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { SectionTabs } from "@/components/SectionTabs";
import { getProducts } from "@/data/products";
import { getForecastWithLY, getMarketingSpend } from "@/data/series";
import type { Region } from "@/data/locations";
import { ForecastClient } from "./forecast-client";

const REGION_KEYS: ("ALL" | Region)[] = ["ALL", "EMEA", "AMER", "APAC"];

export default async function ForecastPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const products = await getProducts();

  const forecastByKey: Record<string, Awaited<ReturnType<typeof getForecastWithLY>>> = {};
  for (const p of products) {
    for (const r of REGION_KEYS) {
      forecastByKey[`${p.id}|${r}`] = await getForecastWithLY(p.id, r);
    }
  }

  const spendRows = await getMarketingSpend();
  const spendByRegion: Record<string, { week: number; spend: number }[]> = {};
  for (const r of ["EMEA", "AMER", "APAC"] as Region[]) {
    spendByRegion[r] = spendRows
      .filter((s) => s.region === r)
      .map(({ week, spend }) => ({ week, spend }));
  }

  return (
    <>
      <PageHeader
        title={t("forecast.title")}
        subtitle={t("forecast.subtitle")}
        info={t("info.forecastChart")}
      />
      <SectionTabs
        tabs={[
          { href: "/forecast", label: t("nav.forecast") },
          { href: "/simulator", label: t("nav.simulator") },
        ]}
      />
      <ForecastClient
        products={products}
        forecastByKey={forecastByKey}
        spendByRegion={spendByRegion}
      />
    </>
  );
}
