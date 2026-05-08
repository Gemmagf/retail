import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "de", "fr", "it", "es", "ja", "pt"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Always serve English by default — don't follow Accept-Language to
  // auto-redirect German/French/etc browsers. Users can still pick their
  // language explicitly via the language switcher or the /start form.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
