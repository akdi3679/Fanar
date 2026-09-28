import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  // Widen to readonly string[] so .includes() accepts a plain string,
  // and `requested &&` narrows out undefined → locale is always a string.
  const locales: readonly string[] = routing.locales;
  const locale =
    requested && locales.includes(requested)
      ? requested
      : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});