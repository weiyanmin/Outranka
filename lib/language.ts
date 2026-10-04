/**
 * Fast, deterministic language detector for web content & SERP analysis.
 * Analyzes Unicode script ranges, HTML lang attributes, and high-frequency stop words.
 */

export interface DetectedLanguage {
  code: string; // 'en', 'th', 'es', 'fr', 'de', 'ja', 'zh', 'ru', 'ar', 'id', 'vi', 'ko', 'pt', 'it', 'other'
  name: string; // 'English', 'Thai', 'Spanish', etc.
  confidence: number; // 0 - 100
}

export interface LanguageAuditResult {
  userLanguage: DetectedLanguage;
  favoredSerpLanguage: DetectedLanguage;
  isMismatch: boolean;
  mismatchSeverity: 'high' | 'medium' | 'none';
  competitorLanguagesBreakdown: {
    language: string;
    code: string;
    count: number;
    percentage: number;
  }[];
  warningMessage?: string;
  recommendation?: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  th: 'Thai',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
  zh: 'Chinese',
  ru: 'Russian',
  ar: 'Arabic',
  id: 'Indonesian',
  vi: 'Vietnamese',
  ko: 'Korean',
  pt: 'Portuguese',
  it: 'Italian',
  nl: 'Dutch',
  tr: 'Turkish',
  other: 'Other / Mixed',
};

// Common characteristic stopwords for latin languages
const STOPWORDS: Record<string, string[]> = {
  en: ['the', 'and', 'is', 'in', 'to', 'for', 'of', 'with', 'on', 'this', 'that', 'from', 'at', 'by', 'best', 'guide', 'how'],
  es: ['de', 'la', 'el', 'en', 'y', 'los', 'del', 'las', 'por', 'un', 'para', 'con', 'una', 'mejor', 'guia'],
  fr: ['de', 'la', 'le', 'et', 'les', 'des', 'en', 'un', 'du', 'une', 'pour', 'dans', 'qui', 'sur', 'meilleur'],
  de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'beste'],
  id: ['yang', 'dan', 'di', 'dari', 'untuk', 'ini', 'dengan', 'dalam', 'bisa', 'terbaik', 'adalah', 'pada', 'ke'],
  pt: ['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'não', 'uma', 'os', 'no', 'melhor'],
  it: ['di', 'e', 'il', 'la', 'in', 'che', 'per', 'un', 'del', 'non', 'da', 'con', 'le', 'i', 'migliore'],
};

/**
 * Detect language of a text sample or HTML page.
 * Uses html lang tag if provided, plus unicode ranges and lexical token checks.
 */
export function detectLanguage(text: string, declaredHtmlLang?: string): DetectedLanguage {
  if (declaredHtmlLang) {
    const cleanLang = declaredHtmlLang.trim().toLowerCase().split(/[-_]/)[0];
    if (LANGUAGE_NAMES[cleanLang]) {
      return {
        code: cleanLang,
        name: LANGUAGE_NAMES[cleanLang],
        confidence: 90,
      };
    }
  }

  if (!text || text.trim().length === 0) {
    return { code: 'en', name: 'English', confidence: 50 };
  }

  const sample = text.slice(0, 3000);

  // 1. Script checks via Unicode ranges
  // Thai: \u0E00-\u0E7F
  const thaiMatches = sample.match(/[\u0E00-\u0E7F]/g) || [];
  if (thaiMatches.length > 25 || thaiMatches.length / sample.length > 0.15) {
    return { code: 'th', name: 'Thai', confidence: 95 };
  }

  // Japanese: Hiragana \u3040-\u309F or Katakana \u30A0-\u30FF
  const japaneseMatches = sample.match(/[\u3040-\u309F\u30A0-\u30FF]/g) || [];
  if (japaneseMatches.length > 15) {
    return { code: 'ja', name: 'Japanese', confidence: 95 };
  }

  // Korean: Hangul \uAC00-\uD7AF, \u1100-\u11FF
  const koreanMatches = sample.match(/[\uAC00-\uD7AF\u1100-\u11FF]/g) || [];
  if (koreanMatches.length > 15) {
    return { code: 'ko', name: 'Korean', confidence: 95 };
  }

  // Chinese: CJK Unified Ideographs \u4E00-\u9FFF (without Japanese kana)
  const cjkMatches = sample.match(/[\u4E00-\u9FFF]/g) || [];
  if (cjkMatches.length > 20 && japaneseMatches.length === 0) {
    return { code: 'zh', name: 'Chinese', confidence: 92 };
  }

  // Russian / Cyrillic: \u0400-\u04FF
  const cyrillicMatches = sample.match(/[\u0400-\u04FF]/g) || [];
  if (cyrillicMatches.length > 25) {
    return { code: 'ru', name: 'Russian', confidence: 92 };
  }

  // Arabic: \u0600-\u06FF
  const arabicMatches = sample.match(/[\u0600-\u06FF]/g) || [];
  if (arabicMatches.length > 25) {
    return { code: 'ar', name: 'Arabic', confidence: 92 };
  }

  // Vietnamese: Latin with specific diacritics
  const vietnameseMatches = sample.match(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi) || [];
  if (vietnameseMatches.length > 15) {
    return { code: 'vi', name: 'Vietnamese', confidence: 90 };
  }

  // 2. Stopword analysis for Latin languages
  const words = sample.toLowerCase().replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(Boolean);
  const scores: Record<string, number> = {};

  Object.entries(STOPWORDS).forEach(([lang, swList]) => {
    let hits = 0;
    swList.forEach((sw) => {
      hits += words.filter((w) => w === sw).length;
    });
    scores[lang] = hits;
  });

  let topLang = 'en';
  let maxScore = 0;
  Object.entries(scores).forEach(([lang, count]) => {
    if (count > maxScore) {
      maxScore = count;
      topLang = lang;
    }
  });

  if (maxScore >= 3) {
    return {
      code: topLang,
      name: LANGUAGE_NAMES[topLang] || topLang.toUpperCase(),
      confidence: Math.min(95, 60 + maxScore * 4),
    };
  }

  return { code: 'en', name: 'English', confidence: 70 };
}

/**
 * Compare user page language against top 10 competitors to detect language favoritism or mismatches.
 */
export function evaluateLanguageAlignment(
  userText: string,
  userHtmlLang: string | undefined,
  competitors: { title: string; snippet: string; htmlLang?: string }[],
  location: string
): LanguageAuditResult {
  const userLanguage = detectLanguage(userText, userHtmlLang);

  const competitorLanguages: DetectedLanguage[] = competitors.map((c) => {
    const combinedText = `${c.title} ${c.snippet}`;
    return detectLanguage(combinedText, c.htmlLang);
  });

  const langCountMap: Record<string, number> = {};
  competitorLanguages.forEach((l) => {
    langCountMap[l.code] = (langCountMap[l.code] || 0) + 1;
  });

  const total = competitorLanguages.length || 1;
  const breakdown = Object.entries(langCountMap)
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => ({
      code,
      language: LANGUAGE_NAMES[code] || code.toUpperCase(),
      count,
      percentage: Math.round((count / total) * 100),
    }));

  const favoredLangCode = breakdown[0]?.code || 'en';
  const favoredPercentage = breakdown[0]?.percentage || 100;
  const favoredSerpLanguage: DetectedLanguage = {
    code: favoredLangCode,
    name: LANGUAGE_NAMES[favoredLangCode] || favoredLangCode.toUpperCase(),
    confidence: favoredPercentage,
  };

  const isMismatch = userLanguage.code !== favoredSerpLanguage.code && favoredPercentage >= 50;
  const mismatchSeverity = isMismatch
    ? favoredPercentage >= 70
      ? 'high'
      : 'medium'
    : 'none';

  let warningMessage: string | undefined;
  let recommendation: string | undefined;

  if (isMismatch) {
    warningMessage = `Google heavily favors ${favoredSerpLanguage.name} pages (${favoredPercentage}% of top results) for this query and "${location}" location, while your content is in ${userLanguage.name}.`;
    recommendation = `Searchers in this region overwhelmingly click ${favoredSerpLanguage.name} results. To compete for Top 3 positions, translate or localize your content into ${favoredSerpLanguage.name}, or add a hreflang alternate version.`;
  }

  return {
    userLanguage,
    favoredSerpLanguage,
    isMismatch,
    mismatchSeverity,
    competitorLanguagesBreakdown: breakdown,
    warningMessage,
    recommendation,
  };
}
