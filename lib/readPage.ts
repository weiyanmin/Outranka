import * as cheerio from 'cheerio';

export interface PageContent {
  url: string;
  title: string;
  headings: string[];
  textExcerpt: string;
  schemaTypes: string[];
  success: boolean;
  error?: string;
}

export async function readWebPage(url: string, isUserUrl: boolean = false): Promise<PageContent> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (isUserUrl) {
        throw new Error('your url is not crawlable');
      }
      return {
        url,
        title: '',
        headings: [],
        textExcerpt: '',
        schemaTypes: [],
        success: false,
        error: `HTTP ${response.status}`,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, svgs, and nav elements to clean up text
    $('script, style, noscript, svg, nav, footer, header').remove();

    const title = $('title').text().trim() || '';

    // Extract headings
    const headings: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const hText = $(el).text().trim().replace(/\s+/g, ' ');
      if (hText && hText.length > 2 && hText.length < 150) {
        headings.push(hText);
      }
    });

    // Extract JSON-LD schema types
    const schemaTypes: string[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const raw = $(el).html();
        if (raw) {
          const parsed = JSON.parse(raw);
          const extractType = (obj: any) => {
            if (!obj) return;
            if (Array.isArray(obj)) {
              obj.forEach(extractType);
            } else if (typeof obj === 'object') {
              if (obj['@type']) {
                const t = Array.isArray(obj['@type']) ? obj['@type'] : [obj['@type']];
                t.forEach((typeStr: any) => {
                  if (typeof typeStr === 'string' && !schemaTypes.includes(typeStr)) {
                    schemaTypes.push(typeStr);
                  }
                });
              }
              if (obj['@graph']) {
                extractType(obj['@graph']);
              }
            }
          };
          extractType(parsed);
        }
      } catch {
        // Ignore JSON-LD parse errors
      }
    });

    // Extract clean body text (limit to 3000 chars for prompt efficiency)
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const textExcerpt = bodyText.slice(0, 3000);

    return {
      url,
      title,
      headings: headings.slice(0, 15),
      textExcerpt,
      schemaTypes,
      success: true,
    };
  } catch (err: any) {
    if (isUserUrl) {
      throw new Error('your url is not crawlable');
    }
    return {
      url,
      title: '',
      headings: [],
      textExcerpt: '',
      schemaTypes: [],
      success: false,
      error: err.name === 'AbortError' ? 'Timeout' : err.message,
    };
  }
}
