import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { SectionTabs } from "@/components/SectionTabs";
import { getProducts } from "@/data/products";
import { getForecastsByMethod, getHierarchicalForecast } from "@/data/series";
import type { Region } from "@/data/locations";
import { ForecastLabClient } from "./forecast-lab-client";

const REGION_KEYS: ("ALL" | Region)[] = ["ALL", "EMEA", "AMER", "APAC"];

export default async function ForecastPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const products = await getProducts();
  const subset = products.slice(0, 8);

  const methodsByKey: Record<string, Awaited<ReturnType<typeof getForecastsByMethod>>> = {};
  for (const p of subset) {
    for (const r of REGION_KEYS) {
      methodsByKey[`${p.id}|${r}`] = await getForecastsByMethod(p.id, r);
    }
  }

  const hierarchical = await getHierarchicalForecast();

  return (
    <>
      <PageHeader
        title={t("forecastLab.pageTitle")}
        subtitle={t("forecastLab.pageSubtitle")}
        info={t("info.forecastChart")}
      />
      <SectionTabs
        tabs={[
          { href: "/forecast", label: t("nav.forecast") },
          { href: "/lab", label: t("nav.lab") },
          { href: "/simulator", label: t("nav.simulator") },
        ]}
      />
      <ForecastLabClient
        products={subset}
        methodsByKey={methodsByKey}
        hierarchical={hierarchical}
      />
    </>
  );
}
