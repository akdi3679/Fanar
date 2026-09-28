import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// EDIT THIS MAP: ISO country code -> locale.
// Tunisia (TN) is set to Arabic. To prefer French instead, change TN: "ar" to TN: "fr".
const countryToLocale: Record<string, string> = {
  TN: "ar", DZ: "ar", MA: "ar", EG: "ar", SA: "ar", AE: "ar", QA: "ar", KW: "ar",
  OM: "ar", BH: "ar", JO: "ar", LB: "ar", SY: "ar", IQ: "ar", YE: "ar", LY: "ar", PS: "ar",
  FR: "fr", BE: "fr", LU: "fr", MC: "fr", CI: "fr", SN: "fr", ML: "fr", BF: "fr",
  NE: "fr", TG: "fr", BJ: "fr", GA: "fr", CG: "fr",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es", UY: "es",
  PY: "es", BO: "es", EC: "es", GT: "es", CU: "es", DO: "es", HN: "es", NI: "es",
  CR: "es", PA: "es", SV: "es",
  DE: "de", AT: "de", LI: "de",
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocaleCookie = request.cookies.has("NEXT_LOCALE");
  const country = request.headers.get("x-vercel-ip-country");
  const geoLocale = country ? countryToLocale[country] : undefined;

  const locales = routing.locales as readonly string[];
  const pathHasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  // First visit (no saved choice) + known country + path has no locale yet -> redirect
  if (!hasLocaleCookie && geoLocale && locales.includes(geoLocale) && !pathHasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${geoLocale}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set("NEXT_LOCALE", geoLocale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  // excludes api, _next, _vercel, admin, and files (so /admin stays clean)
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};