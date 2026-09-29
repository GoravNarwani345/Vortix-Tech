import { NextResponse } from "next/server";
import { COUNTRIES as BASE_COUNTRIES } from "@/lib/countryCodes";

export type CountryItem = {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
};

// Reliable base country dataset with 30+ top countries
const FALLBACK_COUNTRIES: CountryItem[] = BASE_COUNTRIES.map((c) => ({
  name: c.name,
  code: c.code,
  dialCode: c.dialCode,
  flag: c.flag,
}));

// Server-side in-memory cache initialized with fallback
let cachedCountries: CountryItem[] = FALLBACK_COUNTRIES;
let lastFetchTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// High-priority popular countries to display at top
const POPULAR_CODES = ["US", "PK", "GB", "AE", "SA", "CA", "AU", "DE", "FR", "IN", "SG", "QA"];

export async function GET() {
  const now = Date.now();

  // Return cached result if fresh and populated
  if (cachedCountries.length > FALLBACK_COUNTRIES.length && now - lastFetchTime < CACHE_TTL_MS) {
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout prevents server hang

    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag",
      {
        signal: controller.signal,
        next: { revalidate: 86400 },
      }
    ).finally(() => clearTimeout(timeoutId));

    if (!res.ok) throw new Error(`REST Countries API responded with status ${res.status}`);

    const rawList = await res.json();

    // Guard against non-array responses (e.g. rate limit JSON objects or error objects)
    if (!Array.isArray(rawList)) {
      throw new Error("REST Countries API did not return an array list");
    }

    const parsed: CountryItem[] = [];

    for (const c of rawList) {
      const name = c?.name?.common;
      const code = c?.cca2;
      const flag = c?.flag || "🌐";
      const root = c?.idd?.root;
      const suffixes = c?.idd?.suffixes;

      if (!name || !code || !root) continue;

      let dialCode = root;
      if (suffixes && suffixes.length === 1) {
        dialCode = root + suffixes[0];
      }

      parsed.push({ name, code, dialCode, flag });
    }

    if (parsed.length > 0) {
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

      cachedCountries = [...popular, ...others];
      lastFetchTime = now;
    }

    return NextResponse.json(
      { success: true, source: "live-api", countries: cachedCountries },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch (error) {
    // Graceful fallback: return verified country list without crashing
    return NextResponse.json({
      success: true,
      source: "fallback",
      countries: cachedCountries.length > 0 ? cachedCountries : FALLBACK_COUNTRIES,
    });
  }
}
