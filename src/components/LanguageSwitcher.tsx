"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";
import { Globe } from "lucide-react";

const labels: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  es: "Español",
  ja: "日本語",
  pt: "Português",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <Globe className="h-4 w-4 text-muted-foreground" aria-hidden />
      <span className="sr-only">Language</span>
      <select
        value={locale}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(() => {
            router.replace(pathname, { locale: next as (typeof routing.locales)[number] });
          });
        }}
        className="rounded-md border border-border bg-background px-2 py-1 text-sm font-medium hover:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {labels[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
