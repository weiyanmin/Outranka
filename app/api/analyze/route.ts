import { NextRequest, NextResponse } from 'next/server';
import { fetchTop10Results } from '../../../lib/serp';
import { readWebPage } from '../../../lib/readPage';
import { analyzeContentWithGemini } from '../../../lib/analyze';
import {
  StructuralAssetsMetrics,
  analyzeMarkdownOrText,
  evaluateScannabilityAndStructure,
} from '../../../lib/scannability';
import { calculateRankingChance } from '../../../lib/rankingChance';
import { evaluateLanguageAlignment } from '../../../lib/language';
import { calculateOverallPerformance } from '../../../lib/performanceScore';
import { createClient } from '../../../lib/supabase/server';
import { evaluateEeatSignals } from '../../../lib/eeat';
import type { AnalysisProgressStep } from '../../../lib/analysisProgress';

type ProgressReporter = (step: AnalysisProgressStep) => void;

async function analyzeRequest(req: NextRequest, reportProgress: ProgressReporter) {
  try {
    // Route Handlers must enforce authorization themselves; Proxy is only an
    // optimistic gate and should not be the sole protection for costly work.
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { keyword, location, inputType, content, url } = body;

    if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
      return NextResponse.json(
        { success: false, error: 'Target keyword is required.' },
        { status: 400 }
      );
    }

    reportProgress('source');

    // Determine user content and extract deterministic metrics
    let userTextContent = '';
    let userMetrics: StructuralAssetsMetrics;
    let userHtmlLang: string | undefined;

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
        userHtmlLang = userPage.htmlLang;
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
    reportProgress('serp');
    const serpData = await fetchTop10Results(keyword.trim(), location || 'global');
    const { competitors, aiOverview } = serpData;

    if (!competitors || competitors.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No search results found for this keyword and location.' },
        { status: 404 }
      );
    }

    // Step 2: Read competitor web pages in parallel
    reportProgress('competitors');
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
    reportProgress('gemini');
    const analysis = await analyzeContentWithGemini(
      keyword.trim(),
      location || 'global',
      userTextContent,
      competitorPages
    );

    // Step 4: Perform deterministic UI, UX, Scannability and Assets check
    const competitorMetricsList = competitorPages.map((cp) => cp.content.metrics);
    reportProgress('scoring');
    const scannabilityAudit = evaluateScannabilityAndStructure(userMetrics, competitorMetricsList);
    analysis.scannabilityAudit = scannabilityAudit;
    analysis.eeatAudit = evaluateEeatSignals(userTextContent);
    analysis.aiOverview = aiOverview;
    analysis.relatedSearches = serpData.relatedSearches || [];
    analysis.peopleAlsoAsk = serpData.peopleAlsoAsk || [];

    // Step 5: Calculate deterministic "Chance of Ranking in Google" score for Top 5 queries
    const rankingChanceReport = calculateRankingChance(
      keyword.trim(),
      userTextContent,
      analysis,
      scannabilityAudit,
      aiOverview,
      serpData.relatedSearches || [],
      serpData.peopleAlsoAsk || []
    );
    analysis.rankingChanceReport = rankingChanceReport;

    // Step 6: Detect language of top 10 results vs user content
    const competitorLangInputs = competitorPages.map((cp) => ({
      title: cp.serp.title,
      snippet: cp.serp.snippet,
      htmlLang: cp.content.htmlLang,
    }));
    const languageAudit = evaluateLanguageAlignment(
      userTextContent,
      userHtmlLang,
      competitorLangInputs,
      location || 'global'
    );
    analysis.languageAudit = languageAudit;

    // Step 7: Calculate algorithmic Overall Performance Score combining all audits
    const overallPerformance = calculateOverallPerformance(
      analysis,
      scannabilityAudit,
      languageAudit,
      aiOverview
    );
    analysis.overallPerformance = overallPerformance;

    // Merge extracted schema types, structural metrics & language back into the competitor items
    const enrichedCompetitors = competitorPages.map((cp) => ({
      ...cp.serp,
      schemaTypes: cp.content.schemaTypes || [],
      metrics: cp.content.metrics,
      language: cp.content.language,
    }));

    let auditId: string | null = null;
    let persistenceWarning: string | null = null;
    reportProgress('saving');
    try {
      const { data: savedAudit, error: saveError } = await supabase
        .from('audits')
        .insert({
          user_id: user.id,
          keyword: keyword.trim(),
          location: typeof location === 'string' && location ? location : 'global',
          input_type: inputType === 'url' ? 'url' : 'text',
          source_url: inputType === 'url' && typeof url === 'string' ? url.trim() : null,
          analysis,
          competitors: enrichedCompetitors,
        })
        .select('id')
        .single();

      if (saveError) throw saveError;
      auditId = savedAudit.id;
    } catch (saveError) {
      console.error('Failed to save completed audit to Supabase.', saveError);
      persistenceWarning = 'This report is available now, but could not be saved to Past Audits. Check that the Supabase audits migration has been applied.';
    }

    return NextResponse.json({
      success: true,
      auditId,
      savedToSupabase: Boolean(auditId),
      persistenceWarning,
      competitors: enrichedCompetitors,
      analysis,
      aiOverview,
      relatedSearches: serpData.relatedSearches || [],
      peopleAlsoAsk: serpData.peopleAlsoAsk || [],
      rankingChanceReport,
      languageAudit,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred during analysis.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      const send = (event: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          closed = true;
        }
      };
      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // The client may have navigated away while the audit was running.
        }
      };

      void analyzeRequest(req, (step) => send({ type: 'progress', step }))
        .then(async (response) => {
          send({ type: 'result', payload: await response.json() });
          close();
        })
        .catch(() => {
          send({
            type: 'result',
            payload: { success: false, error: 'An unexpected error occurred during analysis.' },
          });
          close();
        });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
