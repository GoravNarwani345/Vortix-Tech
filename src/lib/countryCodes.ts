export type Country = {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  format?: string;
};

export const COUNTRIES: Country[] = [
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸", format: "(###) ###-####" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰", format: "### #######" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧", format: "#### ######" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪", format: "## ### ####" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦", format: "## ### ####" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦", format: "(###) ###-####" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺", format: "### ### ###" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪", format: "#### #######" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷", format: "# ## ## ## ##" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳", format: "##### #####" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬", format: "#### ####" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦", format: "#### ####" },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼", format: "#### ####" },
  { name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲", format: "#### ####" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱", format: "## ########" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭", format: "## ### ## ##" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪", format: "## ### ## ##" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴", format: "### ## ###" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪", format: "## ### ####" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿", format: "## ### ####" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷", format: "### ### ## ##" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾", format: "## ### ####" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦", format: "## ### ####" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸", format: "### ## ## ##" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹", format: "### ### ####" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷", format: "## #####-####" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵", format: "## #### ####" },
  { name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭", format: "#### ####" },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬", format: "## #### ####" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳", format: "### #### ####" },
];

export function validatePhoneNumber(phone: string): {
  isValid: boolean;
  error?: string;
  cleanedNumber: string;
} {
  if (!phone || phone.trim().length === 0) {
    return { isValid: true, cleanedNumber: "" }; // Optional field unless required
  }

  // Remove whitespace, dashes, parentheses
  const digitsOnly = phone.replace(/\D/g, "");

  if (digitsOnly.length < 7) {
    return {
      isValid: false,
      error: "Phone number is too short (minimum 7 digits).",
      cleanedNumber: digitsOnly,
    };
  }

  if (digitsOnly.length > 15) {
    return {
      isValid: false,
      error: "Phone number is too long (maximum 15 digits).",
      cleanedNumber: digitsOnly,
    };
  }

  return {
    isValid: true,
    cleanedNumber: digitsOnly,
  };
}
