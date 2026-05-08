"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";
import { LayoutGrid, Package, Store, Boxes, LineChart, Cpu } from "lucide-react";

const items = [
  { href: "/", key: "dashboard", Icon: LayoutGrid, alsoActiveOn: [] as string[] },
  { href: "/products", key: "products", Icon: Package, alsoActiveOn: ["/categories", "/sizes"] },
  { href: "/stores", key: "stores", Icon: Store, alsoActiveOn: [] as string[] },
  { href: "/allocation", key: "allocation", Icon: Boxes, alsoActiveOn: ["/risks"] },
  { href: "/forecast", key: "forecast", Icon: LineChart, alsoActiveOn: ["/simulator"] },
  { href: "/lab", key: "lab", Icon: Cpu, alsoActiveOn: [] as string[] },
] as const;

function isActive(pathname: string, href: string, alsoActiveOn: readonly string[]): boolean {
  if (href === "/") return pathname === "/";
  if (pathname.startsWith(href)) return true;
  return alsoActiveOn.some((p) => pathname.startsWith(p));
}

export function Nav() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-background">
            <span className="text-base font-bold leading-none">O</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">{t("brand.title")}</div>
            <div className="text-[11px] text-muted-foreground">{t("brand.demo")}</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {items.map(({ href, key, Icon, alsoActiveOn }) => {
            const active = isActive(pathname, href, alsoActiveOn);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {t(`nav.${key}`)}
              </Link>
            );
          })}
        </nav>

        <LanguageSwitcher />
      </div>

      <nav className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {items.map(({ href, key, Icon, alsoActiveOn }) => {
          const active = isActive(pathname, href, alsoActiveOn);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(`nav.${key}`)}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
