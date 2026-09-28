"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

export type CountryItem = {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
};

const DEFAULT_COUNTRY: CountryItem = {
  name: "United States",
  code: "US",
  dialCode: "+1",
  flag: "🇺🇸",
};

type PhoneInputProps = {
  value: string;
  onChange: (fullNumber: string, isValid: boolean) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

export default function PhoneInputWithCountry({
  value,
  onChange,
  required = false,
  placeholder = "(555) 000-0000",
  className = "",
}: PhoneInputProps) {
  const [countries, setCountries] = useState<CountryItem[]>([DEFAULT_COUNTRY]);
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(DEFAULT_COUNTRY);
  const [localNumber, setLocalNumber] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch full countries list from our free public API route (no API key required)
  useEffect(() => {
    let active = true;

    async function loadCountries() {
      try {
        const res = await fetch("/api/countries");
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data.countries) && data.countries.length > 0) {
            setCountries(data.countries);

            // Attempt to detect visitor country via free open IP lookup (zero API key)
            try {
              const geoRes = await fetch("https://ipapi.co/json/");
              if (geoRes.ok) {
                const geo = await geoRes.json();
                const matched = data.countries.find(
                  (c: CountryItem) => c.code.toUpperCase() === geo.country_code?.toUpperCase()
                );
                if (matched && active) {
                  setSelectedCountry(matched);
                }
              }
            } catch {
              // Geolocation detection optional
            }
          }
        }
      } catch (err) {
        console.warn("Countries load warning:", err);
      }
    }

    void loadCountries();
    return () => {
      active = false;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Parse initial value if passed from parent
  useEffect(() => {
    if (value && !localNumber) {
      // Check if value already has dial code
      const found = countries.find((c) => value.startsWith(c.dialCode));
      if (found) {
        setSelectedCountry(found);
        setLocalNumber(value.replace(found.dialCode, "").trim());
      } else {
        setLocalNumber(value);
      }
    }
  }, [value, countries, localNumber]);

  // Dynamic placeholder focused on US standard number format
  const activePlaceholder =
    selectedCountry.dialCode === "+1"
      ? "(555) 234-5678"
      : placeholder || "(555) 234-5678";

  const handleNumberChange = (raw: string) => {
    const isUs = selectedCountry.dialCode === "+1";
    let formatted = raw;

    if (isUs) {
      // Clean digits (max 10 for local US number)
      const digits = raw.replace(/\D/g, "").slice(0, 10);
      if (digits.length === 0) {
        formatted = "";
      } else if (digits.length <= 3) {
        formatted = `(${digits}`;
      } else if (digits.length <= 6) {
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
    } else {
      formatted = raw.replace(/[^\d\s()-]/g, "");
    }

    setLocalNumber(formatted);

    const digits = formatted.replace(/\D/g, "");
    const isValid = isUs ? digits.length === 10 : digits.length >= 7 && digits.length <= 15;
    const fullNumber = formatted ? `${selectedCountry.dialCode} ${formatted}` : "";

    onChange(fullNumber, isValid);
  };

  const handleCountrySelect = (c: CountryItem) => {
    setSelectedCountry(c);
    setIsOpen(false);
    setSearchQuery("");

    const isUs = c.dialCode === "+1";
    let formatted = localNumber;

    if (isUs && localNumber) {
      const digits = localNumber.replace(/\D/g, "").slice(0, 10);
      if (digits.length <= 3) {
        formatted = digits.length > 0 ? `(${digits}` : "";
      } else if (digits.length <= 6) {
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      setLocalNumber(formatted);
    }

    const digits = formatted.replace(/\D/g, "");
    const isValid = isUs ? digits.length === 10 : digits.length >= 7 && digits.length <= 15;
    const fullNumber = formatted ? `${c.dialCode} ${formatted}` : "";

    onChange(fullNumber, isValid);
  };

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex rounded-xl bg-gray-50 border border-gray-200 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all overflow-hidden">
        {/* Country Selector Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-3 bg-gray-100/70 hover:bg-gray-100 border-r border-gray-200 text-sm font-medium text-gray-800 transition-colors shrink-0"
          title="Select country code"
        >
          <span className="text-base">{selectedCountry.flag}</span>
          <span className="text-xs font-semibold">{selectedCountry.dialCode}</span>
          <ChevronDown size={14} className="text-gray-500" />
        </button>

        {/* Local Number Input */}
        <input
          type="tel"
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={activePlaceholder}
          required={required}
          className="w-full px-4 py-3 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
        />
      </div>

      {/* Country Selection Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Bar */}
          <div className="p-2.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or dial code..."
              className="w-full bg-transparent text-xs text-gray-800 placeholder:text-gray-400 outline-none"
            />
          </div>

          {/* Countries List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs transition-colors hover:bg-accent/5 ${
                      isSelected ? "bg-accent/10 font-semibold text-accent" : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate mr-2">
                      <span className="text-base shrink-0">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-gray-500">
                      <span className="font-mono">{c.dialCode}</span>
                      {isSelected && <Check size={14} className="text-accent" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-gray-400">
                No countries found for &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
