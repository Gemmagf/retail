"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SECTOR_COOKIE, DEFAULT_SECTOR, isSectorId } from "@/data/sectors";
import { routing } from "@/i18n/routing";

export async function resetSetup() {
  const c = await cookies();
  c.delete(SECTOR_COOKIE);
  redirect("/start");
}

export async function startDemo(formData: FormData) {
  const sector = String(formData.get("sector") ?? "");
  const locale = String(formData.get("locale") ?? "");
  const finalSector = isSectorId(sector) ? sector : DEFAULT_SECTOR;
  const finalLocale = (routing.locales as readonly string[]).includes(locale)
    ? locale
    : routing.defaultLocale;

  const c = await cookies();
  c.set(SECTOR_COOKIE, finalSector, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const target = finalLocale === routing.defaultLocale ? "/" : `/${finalLocale}`;
  redirect(target);
}
