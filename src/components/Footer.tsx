import { useTranslations } from "next-intl";
import { Github, Linkedin } from "lucide-react";

export function Footer() {
  const t = useTranslations();
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl space-y-1 leading-relaxed">
          <p>{t("footer.disclaimer")}</p>
          <p>{t("footer.stack")}</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Gemmagf/retail"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/feed/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Linkedin className="h-3.5 w-3.5" />
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
