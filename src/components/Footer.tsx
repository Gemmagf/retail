import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations();
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-8 text-xs text-muted-foreground">
        <p className="max-w-3xl leading-relaxed">{t("footer.disclaimer")}</p>
        <p className="mt-2">{t("footer.stack")}</p>
      </div>
    </footer>
  );
}
