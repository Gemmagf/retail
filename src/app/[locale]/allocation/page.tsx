import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { products } from "@/data/products";
import { locations } from "@/data/locations";
import { getAllocationRecommendations } from "@/data/series";
import { AllocationClient } from "./allocation-client";

export default async function AllocationPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const recommendations = getAllocationRecommendations().slice(0, 60);
  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
  const locationsById = Object.fromEntries(locations.map((l) => [l.id, l]));

  return (
    <>
      <PageHeader title={t("allocation.title")} subtitle={t("allocation.subtitle")} />
      <AllocationClient
        recommendations={recommendations}
        productsById={productsById}
        locationsById={locationsById}
      />
    </>
  );
}
