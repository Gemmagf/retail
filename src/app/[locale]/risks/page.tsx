import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { SectionTabs } from "@/components/SectionTabs";
import { products } from "@/data/products";
import { locations } from "@/data/locations";
import { getRisks, getOpportunities } from "@/data/series";
import { RisksClient } from "./risks-client";

export default async function RisksPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const risks = getRisks();
  const opportunities = getOpportunities();
  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
  const locationsById = Object.fromEntries(locations.map((l) => [l.id, l]));

  return (
    <>
      <PageHeader title={t("risks.title")} subtitle={t("risks.subtitle")} />
      <SectionTabs
        tabs={[
          { href: "/allocation", label: t("nav.allocation") },
          { href: "/risks", label: t("nav.risks") },
        ]}
      />
      <RisksClient
        risks={risks}
        opportunities={opportunities}
        productsById={productsById}
        locationsById={locationsById}
      />
    </>
  );
}
