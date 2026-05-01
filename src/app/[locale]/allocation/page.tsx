import { getTranslations, setRequestLocale } from "next-intl/server";
import { Zap } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SectionTabs } from "@/components/SectionTabs";
import { InfoTooltip } from "@/components/InfoTooltip";
import { getProducts } from "@/data/products";
import { locations } from "@/data/locations";
import { getAllocationRecommendations } from "@/data/series";
import { AllocationClient } from "./allocation-client";

export default async function AllocationPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const products = await getProducts();
  const recommendations = (await getAllocationRecommendations()).slice(0, 60);
  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
  const locationsById = Object.fromEntries(locations.map((l) => [l.id, l]));

  return (
    <>
      <PageHeader title={t("allocation.title")} subtitle={t("allocation.subtitle")} />
      <SectionTabs
        tabs={[
          { href: "/allocation", label: t("nav.allocation") },
          { href: "/risks", label: t("nav.risks") },
        ]}
      />

      <div className="mb-4 flex items-start gap-3 rounded-lg border border-border bg-foreground/[0.03] p-4 text-sm">
        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
        <p className="flex-1 leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">{t("allocation.methodology")}</span>
        </p>
        <InfoTooltip text={t("info.allocation")} side="bottom" />
      </div>

      <AllocationClient
        recommendations={recommendations}
        productsById={productsById}
        locationsById={locationsById}
      />
    </>
  );
}
