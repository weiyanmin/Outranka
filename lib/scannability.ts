export interface StructuralAssetsMetrics {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  headingsList: { level: 'h1' | 'h2' | 'h3'; text: string }[];
  imageCount: number;
  videoCount: number;
  hasTableOfContents: boolean;
  bulletListCount: number;
  boldEmphasisCount: number;
  tableCount: number;
  wordCount: number;
  estimatedReadingTimeMin: number;
}

export interface DeterministicAuditSummary {
  userMetrics: StructuralAssetsMetrics;
  topCompetitorAverages: {
    avgH2Count: number;
    avgH3Count: number;
    avgImageCount: number;
    avgVideoCount: number;
    avgWordCount: number;
    tocAdoptionRate: number;
    tableAdoptionRate: number;
  };
  checks: {
    id: string;
    label: string;
    status: 'pass' | 'warning' | 'alert';
    userValue: string;
    competitorBenchmark: string;
    guidance: string;
  }[];
  scannabilityScore: number;
}

/**
 * Deterministically analyzes HTML content using Cheerio or Regex/DOM.
 */
export function analyzeHtmlStructureAndAssets(
  html: string,
  cheerioInstance?: any
): StructuralAssetsMetrics {
  let $: any;
  if (cheerioInstance) {
    $ = cheerioInstance;
  } else {
    try {
      const cheerio = require('cheerio');
      $ = cheerio.load(html);
    } catch {
      $ = null;
    }
  }

  if ($) {
    const headingsList: { level: 'h1' | 'h2' | 'h3'; text: string }[] = [];
    $('h1, h2, h3').each((_: any, el: any) => {
      const tag = (el.tagName || el.name || '').toLowerCase() as 'h1' | 'h2' | 'h3';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 1 && text.length < 200) {
        headingsList.push({ level: tag, text });
      }
    });

    const h1Count = $('h1').length;
    const h2Count = $('h2').length;
    const h3Count = $('h3').length;

    // Assets: Images & Videos
    const imageCount = $('img').filter((_: any, el: any) => {
      const src = $(el).attr('src') || '';
      return !src.startsWith('data:image/svg') && !src.includes('tracker');
    }).length || $('img').length;

    // Videos: <video> tags, youtube/vimeo/loom/wistia iframes
    const directVideoCount = $('video').length;
    const videoIframeCouunt = $('iframe').filter((_: any, el: any) => {
      const src = ($(el).attr('src') || '').toLowerCase();
      return (
        src.includes('youtube') ||
        src.includes('youtu.be') ||
        src.includes('vimeo') ||
        src.includes('loom.com') ||
        src.includes('wistia') ||
        src.includes('dailymotion')
      );
    }).length;
    const videoCount = directVideoCount + videoIframeCouunt;

    // Table of contents detection
    const hasTocClassOrId =
      $('[id*="toc"], [class*="toc"], [id*="table-of-contents"], [class*="table-of-contents"]').length > 0;
    const hasTocAnchorLinks =
      $('a[href^="#"]').filter((_: any, el: any) => {
        const text = $(el).text().trim();
        return text.length > 5 && !['#top', '#main', '#content', '#'].includes($(el).attr('href') || '');
      }).length >= 3;
    const hasTableOfContents = hasTocClassOrId || hasTocAnchorLinks;

    // Scannability elements: lists, strong/b, tables
    const bulletListCount = $('ul, ol').length;
    const boldEmphasisCount = $('strong, b').length;
    const tableCount = $('table').length;

    // Text & word count
    const bodyClone = $('body').clone();
    bodyClone.find('script, style, noscript, svg, nav, footer, header').remove();
    const rawText = bodyClone.text().replace(/\s+/g, ' ').trim();
    const words = rawText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const estimatedReadingTimeMin = Math.max(1, Math.ceil(wordCount / 220));

    return {
      h1Count,
      h2Count,
      h3Count,
      headingsList: headingsList.slice(0, 30),
      imageCount,
      videoCount,
      hasTableOfContents,
      bulletListCount,
      boldEmphasisCount,
      tableCount,
      wordCount,
      estimatedReadingTimeMin,
    };
  }

  return analyzeMarkdownOrText(html);
}

/**
 * Deterministically analyzes Markdown or plain text content drafts
 */
export function analyzeMarkdownOrText(text: string): StructuralAssetsMetrics {
  const lines = text.split('\n');
  const headingsList: { level: 'h1' | 'h2' | 'h3'; text: string }[] = [];

  let h1Count = 0;
  let h2Count = 0;
  let h3Count = 0;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      h1Count++;
      headingsList.push({ level: 'h1', text: trimmed.replace(/^#\s+/, '') });
    } else if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      h2Count++;
      headingsList.push({ level: 'h2', text: trimmed.replace(/^##\s+/, '') });
    } else if (trimmed.startsWith('### ')) {
      h3Count++;
      headingsList.push({ level: 'h3', text: trimmed.replace(/^###\s+/, '') });
    }
  });

  // Markdown image syntax: ![alt](url) or <img> tag
  const mdImgMatches = text.match(/!\[.*?\]\(.*?\)/g) || [];
  const htmlImgMatches = text.match(/<img\s+[^>]*>/gi) || [];
  const imageCount = mdImgMatches.length + htmlImgMatches.length;

  // Video embeds: youtube links, video tags
  const videoMatches =
    text.match(/(https?:\/\/(?:www\.)?(?:youtube\.com\/watch|youtu\.be\/|vimeo\.com\/)[\w-?&=]+)/gi) || [];
  const videoTagMatches = text.match(/<(?:video|iframe)[^>]*>/gi) || [];
  const videoCount = videoMatches.length + videoTagMatches.length;

  // Table of contents: contains "table of contents", "[toc]", or jump anchors
  const lowerText = text.toLowerCase();
  const hasTableOfContents =
    lowerText.includes('table of contents') ||
    lowerText.includes('[toc]') ||
    (text.match(/\[.*?\]\(#[^)]+\)/g) || []).length >= 3;

  // Bullet and numbered lists
  const bulletMatches = text.match(/^(\s*[-*+]|\s*\d+\.)\s+.+$/gm) || [];
  const bulletListCount = Math.max(0, Math.ceil(bulletMatches.length / 3));

  // Bold words
  const boldMatches = text.match(/\*\*[^*]+\*\*|__[^_]+__|<\/?(b|strong)>/g) || [];
  const boldEmphasisCount = boldMatches.length;

  // Markdown tables
  const tableRowMatches = text.match(/\|.+\|/g) || [];
  const tableCount = tableRowMatches.length >= 3 ? 1 : 0;

  const words = text.replace(/[#*`_~>\-+|[\]()]/g, ' ').split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const estimatedReadingTimeMin = Math.max(1, Math.ceil(wordCount / 220));

  return {
    h1Count,
    h2Count,
    h3Count,
    headingsList: headingsList.slice(0, 30),
    imageCount,
    videoCount,
    hasTableOfContents,
    bulletListCount,
    boldEmphasisCount,
    tableCount,
    wordCount,
    estimatedReadingTimeMin,
  };
}

/**
 * Compare user metrics against top competitors to evaluate UI, UX, and Scannability deterministically.
 */
export function evaluateScannabilityAndStructure(
  userMetrics: StructuralAssetsMetrics,
  competitorMetrics: StructuralAssetsMetrics[]
): DeterministicAuditSummary {
  const topCount = competitorMetrics.length || 1;

  // Calculate competitor benchmarks
  const totalH2 = competitorMetrics.reduce((acc, c) => acc + c.h2Count, 0);
  const totalH3 = competitorMetrics.reduce((acc, c) => acc + c.h3Count, 0);
  const totalImages = competitorMetrics.reduce((acc, c) => acc + c.imageCount, 0);
  const totalVideos = competitorMetrics.reduce((acc, c) => acc + c.videoCount, 0);
  const totalWords = competitorMetrics.reduce((acc, c) => acc + c.wordCount, 0);
  const withToc = competitorMetrics.filter((c) => c.hasTableOfContents).length;
  const withTable = competitorMetrics.filter((c) => c.tableCount > 0).length;

  const avgH2 = Math.round((totalH2 / topCount) * 10) / 10;
  const avgH3 = Math.round((totalH3 / topCount) * 10) / 10;
  const avgImages = Math.round((totalImages / topCount) * 10) / 10;
  const avgVideos = Math.round((totalVideos / topCount) * 10) / 10;
  const avgWords = Math.round(totalWords / topCount);
  const tocRate = Math.round((withToc / topCount) * 100);
  const tableRate = Math.round((withTable / topCount) * 100);

  const checks: DeterministicAuditSummary['checks'] = [];
  let score = 100;

  // 1. H1 Structure Check
  if (userMetrics.h1Count === 1) {
    checks.push({
      id: 'h1_check',
      label: 'H1 Main Title Hierarchy',
      status: 'pass',
      userValue: 'Exactly 1 H1 Tag',
      competitorBenchmark: 'Standard Best Practice (1 H1)',
      guidance: 'Perfect page title hierarchy for screen readers and search crawlers.',
    });
  } else if (userMetrics.h1Count === 0) {
    score -= 15;
    checks.push({
      id: 'h1_check',
      label: 'H1 Main Title Hierarchy',
      status: 'alert',
      userValue: '0 H1 Tags Detected',
      competitorBenchmark: '1 Primary H1',
      guidance: 'Missing a primary H1 heading. Add one clear H1 tag containing your primary target keyword.',
    });
  } else {
    score -= 8;
    checks.push({
      id: 'h1_check',
      label: 'H1 Main Title Hierarchy',
      status: 'warning',
      userValue: `${userMetrics.h1Count} H1 Tags Found`,
      competitorBenchmark: '1 Primary H1',
      guidance: 'Multiple H1 tags dilute topic clarity. Convert secondary titles to H2 headings.',
    });
  }

  // 2. H2 / H3 Subheadings & Scanning Breadth
  const minExpectedH2 = Math.max(2, Math.floor(avgH2 * 0.6));
  if (userMetrics.h2Count >= minExpectedH2) {
    checks.push({
      id: 'h2_structure',
      label: 'H2 Section Breakdown',
      status: 'pass',
      userValue: `${userMetrics.h2Count} H2 Subheadings`,
      competitorBenchmark: `Avg ${avgH2} H2s in Top 10`,
      guidance: 'Healthy structural division allowing readers to scan distinct subtopics effortlessly.',
    });
  } else if (userMetrics.h2Count > 0) {
    score -= 10;
    checks.push({
      id: 'h2_structure',
      label: 'H2 Section Breakdown',
      status: 'warning',
      userValue: `${userMetrics.h2Count} H2 Subheadings`,
      competitorBenchmark: `Avg ${avgH2} H2s in Top 10`,
      guidance: `Add at least ${minExpectedH2 - userMetrics.h2Count} more H2 sections to match competitor scannability depth.`,
    });
  } else {
    score -= 20;
    checks.push({
      id: 'h2_structure',
      label: 'H2 Section Breakdown',
      status: 'alert',
      userValue: '0 H2 Headings',
      competitorBenchmark: `Avg ${avgH2} H2s in Top 10`,
      guidance: 'Wall of text detected. Break content into structured H2 sections with descriptive subheadings.',
    });
  }

  // 3. Visual Assets (Images)
  if (userMetrics.imageCount >= Math.max(1, Math.floor(avgImages * 0.5))) {
    checks.push({
      id: 'image_assets',
      label: 'Visual Assets & Images',
      status: 'pass',
      userValue: `${userMetrics.imageCount} Images`,
      competitorBenchmark: `Avg ${avgImages} Images`,
      guidance: 'Great visual variety supporting scannability, engagement, and image search rankings.',
    });
  } else if (userMetrics.imageCount > 0) {
    score -= 8;
    checks.push({
      id: 'image_assets',
      label: 'Visual Assets & Images',
      status: 'warning',
      userValue: `${userMetrics.imageCount} Image${userMetrics.imageCount === 1 ? '' : 's'}`,
      competitorBenchmark: `Avg ${avgImages} Images`,
      guidance: `Top ranking competitors average ${avgImages} images. Consider adding diagrams, screenshots, or original photos.`,
    });
  } else {
    score -= 12;
    checks.push({
      id: 'image_assets',
      label: 'Visual Assets & Images',
      status: 'alert',
      userValue: 'No Images Detected',
      competitorBenchmark: `Avg ${avgImages} Images`,
      guidance: 'Zero visual assets. Modern searchers and mobile users bounce quickly without visual aids.',
    });
  }

  // 4. Video Embeds Check
  if (avgVideos >= 1 || userMetrics.videoCount > 0) {
    if (userMetrics.videoCount > 0) {
      checks.push({
        id: 'video_assets',
        label: 'Video Asset Variety',
        status: 'pass',
        userValue: `${userMetrics.videoCount} Video Embed${userMetrics.videoCount > 1 ? 's' : ''}`,
        competitorBenchmark: `Avg ${avgVideos} Videos`,
        guidance: 'Video assets significantly boost dwell time and engagement signals on both desktop & mobile.',
      });
    } else {
      score -= 5;
      checks.push({
        id: 'video_assets',
        label: 'Video Asset Variety',
        status: 'warning',
        userValue: '0 Videos Found',
        competitorBenchmark: `Avg ${avgVideos} Videos in Top 10`,
        guidance: 'Top competitors utilize video walkthroughs. Embedding an explanatory video will increase engagement.',
      });
    }
  } else {
    checks.push({
      id: 'video_assets',
      label: 'Video Asset Variety',
      status: 'pass',
      userValue: `${userMetrics.videoCount} Videos`,
      competitorBenchmark: `Competitors Rarely Embed Videos (${avgVideos})`,
      guidance: 'Video is optional for this SERP landscape, though adding one provides an edge over text-only pages.',
    });
  }

  // 5. Table of Contents (TOC) for Longform Scanning
  if (userMetrics.hasTableOfContents) {
    checks.push({
      id: 'toc_check',
      label: 'Table of Contents (Jump Navigation)',
      status: 'pass',
      userValue: 'Present',
      competitorBenchmark: `${tocRate}% of Competitors Use TOC`,
      guidance: 'Jump-link navigation allows quick mobile skimming and can win Google SERP site-links.',
    });
  } else if (userMetrics.wordCount > 900 || tocRate >= 40) {
    score -= 8;
    checks.push({
      id: 'toc_check',
      label: 'Table of Contents (Jump Navigation)',
      status: tocRate >= 50 ? 'alert' : 'warning',
      userValue: 'Missing',
      competitorBenchmark: `${tocRate}% of Competitors Use TOC`,
      guidance: `For long-form reading (${userMetrics.wordCount} words), adding an interactive Table of Contents improves mobile UX and reduces bounce rate.`,
    });
  } else {
    checks.push({
      id: 'toc_check',
      label: 'Table of Contents (Jump Navigation)',
      status: 'pass',
      userValue: 'Not Required',
      competitorBenchmark: `${tocRate}% Adoption`,
      guidance: 'Content length is concise enough that an upfront Table of Contents is optional.',
    });
  }

  // 6. Skimmable Formatting: Bullet Lists, Bold Highlights & Tables
  const hasFormattingScannability =
    userMetrics.bulletListCount >= 2 || userMetrics.boldEmphasisCount >= 4 || userMetrics.tableCount >= 1;
  if (hasFormattingScannability) {
    checks.push({
      id: 'skimmability_formatting',
      label: 'Scannable Text Accents (Lists, Bold, Tables)',
      status: 'pass',
      userValue: `${userMetrics.bulletListCount} Lists, ${userMetrics.boldEmphasisCount} Bold Accents, ${userMetrics.tableCount} Tables`,
      competitorBenchmark: 'High Formatting Contrast',
      guidance: 'Bullet points and bold typographic anchors make it easy for users to find the answer in under 5 seconds.',
    });
  } else {
    score -= 10;
    checks.push({
      id: 'skimmability_formatting',
      label: 'Scannable Text Accents (Lists, Bold, Tables)',
      status: 'warning',
      userValue: 'Low Formatting Variety',
      competitorBenchmark: 'Bullet Lists & Key Takeaway Callouts',
      guidance: 'Add bullet lists, bold key takeaways, or comparison tables to help mobile readers scan key facts instantly.',
    });
  }

  return {
    userMetrics,
    topCompetitorAverages: {
      avgH2Count: avgH2,
      avgH3Count: avgH3,
      avgImageCount: avgImages,
      avgVideoCount: avgVideos,
      avgWordCount: avgWords,
      tocAdoptionRate: tocRate,
      tableAdoptionRate: tableRate,
    },
    checks,
    scannabilityScore: Math.max(10, Math.min(100, score)),
  };
}
