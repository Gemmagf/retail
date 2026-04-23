import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { products } from "@/data/products";
import { getForecastWithLY, getMarketingSpend } from "@/data/series";
import type { Region } from "@/data/locations";
import { ForecastClient } from "./forecast-client";

const REGION_KEYS: ("ALL" | Region)[] = ["ALL", "EMEA", "AMER", "APAC"];

export default async function ForecastPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const forecastByKey: Record<string, ReturnType<typeof getForecastWithLY>> = {};
  for (const p of products) {
    for (const r of REGION_KEYS) {
      forecastByKey[`${p.id}|${r}`] = getForecastWithLY(p.id, r);
    }
  }

  const spendRows = getMarketingSpend();
  const spendByRegion: Record<string, { week: number; spend: number }[]> = {};
  for (const r of ["EMEA", "AMER", "APAC"] as Region[]) {
    spendByRegion[r] = spendRows
      .filter((s) => s.region === r)
      .map(({ week, spend }) => ({ week, spend }));
  }

  return (
    <>
      <PageHeader title={t("forecast.title")} subtitle={t("forecast.subtitle")} />
      <ForecastClient
        products={products}
        forecastByKey={forecastByKey}
        spendByRegion={spendByRegion}
      />
    </>
  );
}
