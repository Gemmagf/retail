import { getTranslations, setRequestLocale } from "next-intl/server";
import { Sparkles, ShoppingBasket, BookOpen, Shirt, Footprints } from "lucide-react";
import { SECTOR_IDS, type SectorId } from "@/data/sectors";
import { routing } from "@/i18n/routing";
import { startDemo } from "./actions";

const SECTOR_ICON: Record<SectorId, React.ComponentType<{ className?: string }>> = {
  footwear: Footprints,
  grocery: ShoppingBasket,
  bookstore: BookOpen,
  fashion: Shirt,
};

const LOCALE_LABEL: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  es: "Español",
  ja: "日本語",
  pt: "Português",
};

export default async function StartPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center py-12">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-3 w-3 text-accent" />
          {t("start.tag")}
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
          {t("start.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("start.subtitle")}
        </p>
      </div>

      <form action={startDemo} className="space-y-8 rounded-xl border border-border bg-background p-6 shadow-sm md:p-8">
        <div>
          <label className="text-sm font-semibold text-foreground">{t("start.sectorLabel")}</label>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("start.sectorHelp")}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {SECTOR_IDS.map((id, idx) => {
              const Icon = SECTOR_ICON[id];
              return (
                <label
                  key={id}
                  className="group flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-border bg-background p-4 text-center transition-colors hover:border-foreground has-[:checked]:border-foreground has-[:checked]:bg-foreground/[0.04]"
                >
                  <input
                    type="radio"
                    name="sector"
                    value={id}
                    defaultChecked={idx === 0}
                    className="sr-only"
                  />
                  <Icon className="h-6 w-6 text-muted-foreground group-has-[:checked]:text-foreground" />
                  <span className="text-sm font-medium">{t(`start.sectors.${id}`)}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {t(`start.sectorDescriptions.${id}`)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="locale" className="text-sm font-semibold text-foreground">
            {t("start.localeLabel")}
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("start.localeHelp")}</p>
          <select
            id="locale"
            name="locale"
            defaultValue={locale}
            className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
          >
            {routing.locales.map((l) => (
              <option key={l} value={l}>
                {LOCALE_LABEL[l] ?? l}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">{t("start.note")}</p>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            {t("start.cta")}
            <span aria-hidden>→</span>
          </button>
        </div>
      </form>
    </div>
  );
}
