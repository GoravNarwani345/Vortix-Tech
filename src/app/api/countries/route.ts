import { NextResponse } from "next/server";

export type CountryItem = {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
};

// Server-side in-memory cache
let cachedCountries: CountryItem[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// High-priority popular countries to display at top
const POPULAR_CODES = ["US", "PK", "GB", "AE", "SA", "CA", "AU", "DE", "FR", "IN", "SG", "QA"];

// Reliable fallback in case external network has issues
const FALLBACK_COUNTRIES: CountryItem[] = [
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦" },
];

export async function GET() {
  const now = Date.now();

  if (cachedCountries && now - lastFetchTime < CACHE_TTL_MS) {
    return NextResponse.json(
      { success: true, source: "cache", countries: cachedCountries },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  }

  try {
    // 100% Free Public REST API - Zero API Key required
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag",
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) throw new Error(`REST Countries API responded with ${res.status}`);

    type RawCountry = {
      name?: { common?: string };
      cca2?: string;
      flag?: string;
      idd?: { root?: string; suffixes?: string[] };
    };

    const rawList: RawCountry[] = await res.json();

    const parsed: CountryItem[] = [];

    for (const c of rawList) {
      const name = c.name?.common;
      const code = c.cca2;
      const flag = c.flag || "🌐";
      const root = c.idd?.root;
      const suffixes = c.idd?.suffixes;

      if (!name || !code || !root) continue;

      // Extract dial code (root + suffix)
      // Some countries like USA have root="+1" and suffixes=["201", "202", ...]
      // In that case, root is the international dial code "+1"
      let dialCode = root;
      if (suffixes && suffixes.length === 1) {
        dialCode = root + suffixes[0];
      }

      parsed.push({ name, code, dialCode, flag });
    }

    // Sort: popular countries first, then alphabetically
    const popular: CountryItem[] = [];
    const others: CountryItem[] = [];

    for (const item of parsed) {
      if (POPULAR_CODES.includes(item.code)) {
        popular.push(item);
      } else {
        others.push(item);
      }
    }

    popular.sort(
      (a, b) => POPULAR_CODES.indexOf(a.code) - POPULAR_CODES.indexOf(b.code)
    );
    others.sort((a, b) => a.name.localeCompare(b.name));

    const finalCountries = [...popular, ...others];

    cachedCountries = finalCountries;
    lastFetchTime = now;

    return NextResponse.json(
      { success: true, source: "live-api", countries: finalCountries },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch (error) {
    console.warn("REST Countries API fetch failed, using reliable fallback:", error);
    return NextResponse.json({
      success: true,
      source: "fallback",
      countries: cachedCountries || FALLBACK_COUNTRIES,
    });
  }
}
