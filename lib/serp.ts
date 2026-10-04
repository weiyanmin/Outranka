import { StructuralAssetsMetrics } from './scannability';

export interface SerpResultItem {
  position: number;
  title: string;
  link: string;
  snippet: string;
  schemaTypes?: string[];
  metrics?: StructuralAssetsMetrics;
}

export interface GoogleAiOverviewReference {
  title: string;
  link: string;
  source: string;
  index?: number;
  domain?: string;
  matchesCompetitorRank?: number; // 1-10 if matches an organic competitor
}

export interface GoogleAiOverviewData {
  triggered: boolean;
  snippet?: string;
  references: GoogleAiOverviewReference[];
  topDomainsDistribution: { domain: string; count: number; percentage: number }[];
  organicCompetitorOverlapCount: number; // How many top 10 competitors are cited
}

export interface SerpFetchResult {
  competitors: SerpResultItem[];
  aiOverview: GoogleAiOverviewData;
}

export async function fetchTop10Results(keyword: string, location: string): Promise<SerpFetchResult> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    throw new Error('SERPAPI_API_KEY is missing. Please configure it in your .env.local file.');
  }

  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google');
  url.searchParams.set('q', keyword);
  url.searchParams.set('num', '10');
  url.searchParams.set('api_key', apiKey);

  if (location && location.toLowerCase() !== 'global') {
    url.searchParams.set('gl', location.toLowerCase());
  }

  const response = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`SerpAPI search failed (${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();
  const organicResults: any[] = data.organic_results || [];

  const competitors: SerpResultItem[] = organicResults.slice(0, 10).map((item, index) => ({
    position: item.position || index + 1,
    title: item.title || 'Untitled',
    link: item.link || '',
    snippet: item.snippet || '',
  }));

  // Check for Google AI Overview / AI Mode
  let rawAiOverview = data.ai_overview;

  // If SerpApi provided a page_token or serpapi_link for lazy-loaded AI Overview, attempt follow-up fetch
  if (!rawAiOverview && data.ai_overview_page_token) {
    try {
      const followUpUrl = new URL('https://serpapi.com/search.json');
      followUpUrl.searchParams.set('engine', 'google_ai_overview');
      followUpUrl.searchParams.set('page_token', data.ai_overview_page_token);
      followUpUrl.searchParams.set('api_key', apiKey);
      const followUpRes = await fetch(followUpUrl.toString(), { cache: 'no-store' });
      if (followUpRes.ok) {
        const followUpData = await followUpRes.json();
        rawAiOverview = followUpData.ai_overview;
      }
    } catch {
      // Ignore follow-up failure
    }
  }

  const aiOverviewTriggered = Boolean(
    rawAiOverview && (rawAiOverview.references?.length > 0 || rawAiOverview.text_blocks?.length > 0 || rawAiOverview.snippet)
  );

  const references: GoogleAiOverviewReference[] = [];
  const domainCounts: Record<string, number> = {};

  if (aiOverviewTriggered && rawAiOverview) {
    const rawRefs: any[] = rawAiOverview.references || [];
    
    rawRefs.forEach((r, idx) => {
      const link = r.link || '';
      let domain = r.source || '';
      try {
        if (link) {
          const parsedUrl = new URL(link);
          domain = parsedUrl.hostname.replace(/^www\./, '');
        }
      } catch {
        domain = r.source || 'web';
      }

      // Check if reference URL or domain matches any top 10 competitor
      let matchedRank: number | undefined;
      const matchedComp = competitors.find((c) => {
        try {
          if (!c.link || !link) return false;
          if (c.link === link) return true;
          const cDomain = new URL(c.link).hostname.replace(/^www\./, '');
          return cDomain === domain;
        } catch {
          return false;
        }
      });
      if (matchedComp) {
        matchedRank = matchedComp.position;
      }

      references.push({
        title: r.title || domain,
        link,
        source: r.source || domain,
        index: r.index ?? idx,
        domain,
        matchesCompetitorRank: matchedRank,
      });

      if (domain) {
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      }
    });
  }

  // Calculate domain distribution for pie chart
  const totalRefs = references.length || 1;
  const topDomainsDistribution = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([domain, count]) => ({
      domain,
      count,
      percentage: Math.round((count / totalRefs) * 100),
    }));

  const organicCompetitorOverlapCount = references.filter((r) => r.matchesCompetitorRank !== undefined).length;

  // Extract snippet summary
  let aiSnippet = '';
  if (rawAiOverview?.text_blocks && Array.isArray(rawAiOverview.text_blocks)) {
    const snippets = rawAiOverview.text_blocks
      .map((b: any) => b.snippet || (b.list ? b.list.map((li: any) => li.snippet || li.title).join(' ') : ''))
      .filter(Boolean);
    aiSnippet = snippets.slice(0, 2).join(' ');
  } else if (rawAiOverview?.snippet) {
    aiSnippet = rawAiOverview.snippet;
  }

  const aiOverview: GoogleAiOverviewData = {
    triggered: aiOverviewTriggered,
    snippet: aiSnippet || undefined,
    references,
    topDomainsDistribution,
    organicCompetitorOverlapCount,
  };

  return {
    competitors,
    aiOverview,
  };
}

