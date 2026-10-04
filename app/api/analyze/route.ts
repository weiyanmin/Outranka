import { NextRequest, NextResponse } from 'next/server';
import { fetchTop10Results } from '../../../lib/serp';
import { readWebPage } from '../../../lib/readPage';
import { analyzeContentWithGemini } from '../../../lib/analyze';
import {
  StructuralAssetsMetrics,
  analyzeMarkdownOrText,
  evaluateScannabilityAndStructure,
} from '../../../lib/scannability';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyword, location, inputType, content, url } = body;

    if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
      return NextResponse.json(
        { success: false, error: 'Target keyword is required.' },
        { status: 400 }
      );
    }

    // Determine user content and extract deterministic metrics
    let userTextContent = '';
    let userMetrics: StructuralAssetsMetrics;

    if (inputType === 'url') {
      if (!url || typeof url !== 'string' || !url.trim()) {
        return NextResponse.json(
          { success: false, error: 'Target URL is required when URL input type is selected.' },
          { status: 400 }
        );
      }
      try {
        const userPage = await readWebPage(url.trim(), true);
        userTextContent = `${userPage.title}\n\n${userPage.headings.join('\n')}\n\n${userPage.textExcerpt}`;
        userMetrics = userPage.metrics;
      } catch (crawlErr: any) {
        return NextResponse.json(
          { success: false, error: crawlErr.message || 'your url is not crawlable' },
          { status: 422 }
        );
      }
    } else {
      if (!content || typeof content !== 'string' || !content.trim()) {
        return NextResponse.json(
          { success: false, error: 'Content draft cannot be empty.' },
          { status: 400 }
        );
      }
      userTextContent = content.trim();
      userMetrics = analyzeMarkdownOrText(userTextContent);
    }

    // Step 1: Fetch top 10 search results and Google AI Overview
    const serpData = await fetchTop10Results(keyword.trim(), location || 'global');
    const { competitors, aiOverview } = serpData;

    if (!competitors || competitors.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No search results found for this keyword and location.' },
        { status: 404 }
      );
    }

    // Step 2: Read competitor web pages in parallel
    const competitorFetches = competitors.map(async (c) => {
      try {
        const pageData = await readWebPage(c.link, false);
        return { serp: c, content: pageData };
      } catch {
        return {
          serp: c,
          content: {
            url: c.link,
            title: c.title,
            headings: [],
            textExcerpt: c.snippet,
            schemaTypes: [],
            metrics: {
              h1Count: 1,
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
            },
            success: false,
          },
        };
      }
    });

    const competitorPages = await Promise.all(competitorFetches);

    // Step 3: Run AI analysis via Gemini
    const analysis = await analyzeContentWithGemini(
      keyword.trim(),
      location || 'global',
      userTextContent,
      competitorPages
    );

    // Step 4: Perform deterministic UI, UX, Scannability and Assets check
    const competitorMetricsList = competitorPages.map((cp) => cp.content.metrics);
    const scannabilityAudit = evaluateScannabilityAndStructure(userMetrics, competitorMetricsList);
    analysis.scannabilityAudit = scannabilityAudit;
    analysis.aiOverview = aiOverview;

    // Merge extracted schema types & structural metrics back into the competitor items
    const enrichedCompetitors = competitorPages.map((cp) => ({
      ...cp.serp,
      schemaTypes: cp.content.schemaTypes || [],
      metrics: cp.content.metrics,
    }));

    return NextResponse.json({
      success: true,
      competitors: enrichedCompetitors,
      analysis,
      aiOverview,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred during analysis.' },
      { status: 500 }
    );
  }
}
