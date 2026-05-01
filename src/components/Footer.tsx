"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { resetSetup } from "@/app/[locale]/start/actions";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path d="M12 .5C5.648.5.5 5.648.5 12a11.5 11.5 0 0 0 7.86 10.94c.576.108.785-.25.785-.555 0-.274-.01-1.003-.015-1.969-3.2.696-3.874-1.543-3.874-1.543-.523-1.327-1.277-1.68-1.277-1.68-1.044-.714.08-.699.08-.699 1.154.082 1.76 1.186 1.76 1.186 1.026 1.757 2.693 1.249 3.35.955.104-.743.401-1.25.73-1.538-2.553-.29-5.238-1.277-5.238-5.686 0-1.255.448-2.282 1.183-3.087-.118-.291-.513-1.463.113-3.05 0 0 .964-.309 3.16 1.179a10.97 10.97 0 0 1 2.876-.386c.976.004 1.96.132 2.876.386 2.195-1.488 3.158-1.179 3.158-1.179.627 1.587.232 2.759.114 3.05.737.805 1.182 1.832 1.182 3.087 0 4.42-2.69 5.393-5.252 5.676.413.356.78 1.06.78 2.14 0 1.545-.014 2.791-.014 3.17 0 .308.207.669.79.555A11.5 11.5 0 0 0 23.5 12C23.5 5.648 18.352.5 12 .5Z" />
    </svg>
  );
}

export function Footer() {
  const t = useTranslations();
  const [pending, startTransition] = useTransition();

  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl space-y-1 leading-relaxed">
          <p>{t("footer.disclaimer")}</p>
          <p>{t("footer.stack")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => resetSetup())}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("footer.reset")}
          </button>
          <a
            href="https://github.com/Gemmagf/retail"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
