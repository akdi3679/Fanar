export function detectGeo(headers: Headers): { country: string; language: string } {
  // Cloudflare provides this header automatically
  const country = headers.get('cf-ipcountry') || 'unknown';
  
  // Parse accept-language: "fr-FR,fr;q=0.9,en-US;q=0.8"
  const acceptLang = headers.get('accept-language') || '';
  const primary = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase() || 'en';
  
  // Map to our supported locales
  const supported = ['en', 'fr', 'ar', 'es', 'de'];
  const language = supported.includes(primary) ? primary : 'en';
  
  return { country, language };
}

export const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
  es: 'Español',
  de: 'Deutsch',
};

export const COUNTRY_NAMES: Record<string, string> = {
  FR: 'France', MA: 'Morocco', US: 'United States', GB: 'United Kingdom',
  DE: 'Germany', ES: 'Spain', SA: 'Saudi Arabia', AE: 'UAE',
  CA: 'Canada', BE: 'Belgium', CH: 'Switzerland',
};
