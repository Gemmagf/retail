import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { products, SIZE_GRID } from "@/data/products";
import { locations } from "@/data/locations";
import { getProductSizeMatrix } from "@/data/series";
import { SizesClient } from "./sizes-client";

export default async function SizesPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const sellingLocations = locations.filter((l) => l.channel !== "warehouse");
  const matricesByProduct: Record<string, ReturnType<typeof getProductSizeMatrix>> = {};
  for (const p of products) {
    matricesByProduct[p.id] = getProductSizeMatrix(p.id);
  }

  return (
    <>
      <PageHeader title={t("sizes.title")} subtitle={t("sizes.subtitle")} />
      <SizesClient
        products={products}
        sizes={[...SIZE_GRID]}
        locations={sellingLocations}
        matricesByProduct={matricesByProduct}
      />
    </>
  );
}
