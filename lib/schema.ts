/**
 * Resolves a schema type name into its official schema.org specification URL.
 * Handles inputs like:
 * - "Organization" -> "https://schema.org/Organization"
 * - "ProfessionalService" -> "https://schema.org/ProfessionalService"
 * - "FAQPage" -> "https://schema.org/FAQPage"
 * - "FAQ Page" -> "https://schema.org/FAQPage"
 * - "schema.org/Article" -> "https://schema.org/Article"
 * - "https://schema.org/Product" -> "https://schema.org/Product"
 */
export function getSchemaOrgUrl(type: string): string {
  if (!type) return "https://schema.org";
  const trimmed = type.trim();

  // If already a full URL, return it
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // If starts with "schema.org/", prepend https://
  if (trimmed.toLowerCase().startsWith("schema.org/")) {
    return "https://" + trimmed;
  }

  // Strip anything in parentheses: "Organization (Corporation)" -> "Organization"
  const clean = trimmed.replace(/\(.*?\)/g, "").trim();

  // Strip trailing words like "schema", "markup", "data"
  const withoutSuffix = clean.replace(/\s+(schema|markup|data)$/i, "").trim();

  // Split into words by spaces, hyphens, or underscores
  const parts = withoutSuffix.split(/[\s_-]+/).filter(Boolean);
  if (parts.length === 0) return "https://schema.org";

  if (parts.length === 1) {
    const single = parts[0];
    // Capitalize first character if lowercase, preserve existing CamelCase
    const formatted = single.charAt(0).toUpperCase() + single.slice(1);
    return "https://schema.org/" + formatted;
  }

  // PascalCase multiple words: "faq page" -> "FAQPage" or "local business" -> "LocalBusiness"
  const pascal = parts
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  return "https://schema.org/" + pascal;
}
