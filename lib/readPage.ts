import * as cheerio from 'cheerio';
import { StructuralAssetsMetrics, analyzeHtmlStructureAndAssets } from './scannability';
import { DetectedLanguage, detectLanguage } from './language';

export interface PageContent {
  url: string;
  title: string;
  headings: string[];
  textExcerpt: string;
  schemaTypes: string[];
  metrics: StructuralAssetsMetrics;
  htmlLang?: string;
  language?: DetectedLanguage;
  success: boolean;
  error?: string;
}

const defaultMetrics: StructuralAssetsMetrics = {
  h1Count: 0,
  h2Count: 0,
  h3Count: 0,
  headingsList: [],
  imageCount: 0,
  videoCount: 0,
  hasTableOfContents: false,
  bulletListCount: 0,
  boldEmphasisCount: 0,
  tableCount: 0,
  wordCount: 0,
  estimatedReadingTimeMin: 1,
};

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
        metrics: defaultMetrics,
        success: false,
        error: `HTTP ${response.status}`,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Compute deterministic UI, UX, and asset metrics before stripping tags
    const metrics = analyzeHtmlStructureAndAssets(html, $);

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

    const title = $('title').text().trim() || '';
    const htmlLang = $('html').attr('lang') || $('html').attr('xml:lang') || undefined;

    // Remove scripts, styles, svgs, and nav elements to clean up text
    $('script, style, noscript, svg, nav, footer, header').remove();

    // Extract clean body text (limit to 3000 chars for prompt efficiency)
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const textExcerpt = bodyText.slice(0, 3000);

    // Detect language deterministically
    const language = detectLanguage(`${title} ${textExcerpt}`, htmlLang);

    return {
      url,
      title,
      headings: headings.slice(0, 15),
      textExcerpt,
      schemaTypes,
      metrics,
      htmlLang,
      language,
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
      metrics: defaultMetrics,
      success: false,
      error: err.name === 'AbortError' ? 'Timeout' : err.message,
    };
  }
}
