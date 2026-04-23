import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { SectionTabs } from "@/components/SectionTabs";
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
      <SectionTabs
        tabs={[
          { href: "/products", label: t("nav.products") },
          { href: "/categories", label: t("nav.categories") },
          { href: "/sizes", label: t("nav.sizes") },
        ]}
      />
      <SizesClient
        products={products}
        sizes={[...SIZE_GRID]}
        locations={sellingLocations}
        matricesByProduct={matricesByProduct}
      />
    </>
  );
}
