import { SerpResultItem } from './serp';

export interface SiteRankingMatches {
  exactPosition: number | null;
  otherPages: SerpResultItem[];
}

/** Normalize harmless URL differences while preserving the actual page path. */
export function normalizeRankingUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    const params = [...url.searchParams.entries()]
      .filter(([key]) => !/^utm_/i.test(key) && !/^(gclid|dclid|fbclid|msclkid|yclid|_ga)$/i.test(key))
      .sort(([keyA, valueA], [keyB, valueB]) => keyA.localeCompare(keyB) || valueA.localeCompare(valueB));
    const query = new URLSearchParams(params).toString();

    return `${hostname}${pathname}${query ? `?${query}` : ''}`;
  } catch {
    return null;
  }
}

function normalizeRankingHost(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** Find both an exact-page match and other top-ten pages on the same host. */
export function findSiteRankings(sourceUrl: string, results: SerpResultItem[]): SiteRankingMatches {
  const normalizedSource = normalizeRankingUrl(sourceUrl);
  const sourceHost = normalizeRankingHost(sourceUrl);
  if (!normalizedSource || !sourceHost) return { exactPosition: null, otherPages: [] };

  const topTen = results
    .filter((result) => result.position >= 1 && result.position <= 10)
    .map((result) => ({ result, normalizedUrl: normalizeRankingUrl(result.link) }))
    .filter(({ result, normalizedUrl }) => normalizedUrl && normalizeRankingHost(result.link) === sourceHost);

  const exactMatches = topTen
    .filter(({ normalizedUrl }) => normalizedUrl === normalizedSource)
    .map(({ result }) => result.position);
  const otherPages = topTen
    .filter(({ normalizedUrl }) => normalizedUrl !== normalizedSource)
    .map(({ result }) => result)
    .sort((a, b) => a.position - b.position);

  return {
    exactPosition: exactMatches.length ? Math.min(...exactMatches) : null,
    otherPages,
  };
}
