"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Tab = {
  href: "/products" | "/categories" | "/sizes" | "/allocation" | "/risks" | "/forecast" | "/simulator" | "/lab";
  label: string;
};

type Props = {
  tabs: Tab[];
};

export function SectionTabs({ tabs }: Props) {
  const pathname = usePathname();
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto rounded-md border border-border bg-muted/30 p-1">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
