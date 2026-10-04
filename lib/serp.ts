export interface SerpResultItem {
  position: number;
  title: string;
  link: string;
  snippet: string;
  schemaTypes?: string[];
}

export async function fetchTop10Results(keyword: string, location: string): Promise<SerpResultItem[]> {
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

  return organicResults.slice(0, 10).map((item, index) => ({
    position: item.position || index + 1,
    title: item.title || 'Untitled',
    link: item.link || '',
    snippet: item.snippet || '',
  }));
}
