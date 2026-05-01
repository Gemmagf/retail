import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { SECTOR_COOKIE, isSectorId } from "./data/sectors";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always run intl middleware first to handle locale routing
  const intlResponse = intlMiddleware(request);

  // If the user already has a valid sector cookie, just return intl result
  const sector = request.cookies.get(SECTOR_COOKIE)?.value;
  if (isSectorId(sector)) return intlResponse;

  // Skip onboarding redirect for the /start page itself
  // pathname can be like "/start" or "/de/start"
  if (/^\/(?:[a-z]{2}\/)?start(?:\/|$)/.test(pathname)) return intlResponse;

  // First-time visit without sector cookie → redirect to /start (preserving locale)
  const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/);
  const locale = localeMatch?.[1];
  const target =
    locale && (routing.locales as readonly string[]).includes(locale)
      ? `/${locale}/start`
      : `/start`;
  const url = request.nextUrl.clone();
  url.pathname = target;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
