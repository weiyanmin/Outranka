export type EeatDimensionKey = 'experience' | 'expertise' | 'authoritativeness' | 'trustworthiness';

export interface EeatDimensionResult {
  key: EeatDimensionKey;
  label: string;
  detected: number;
  total: number;
  signals: { label: string; detected: boolean }[];
}

export interface EeatAuditResult {
  dimensions: EeatDimensionResult[];
  detectedSignals: number;
  totalSignals: number;
  scopeNotice: string;
}

const has = (text: string, pattern: RegExp) => pattern.test(text);

/**
 * Reviews only E-E-A-T clues visible in the submitted text. This is a heuristic
 * checklist, not Google's ranking algorithm and not verification of credibility.
 */
export function evaluateEeatSignals(content: string): EeatAuditResult {
  const text = content.replace(/\s+/g, ' ').trim();
  const criteria: Omit<EeatDimensionResult, 'detected' | 'total'>[] = [
    {
      key: 'experience',
      label: 'Experience',
      signals: [
        { label: 'First-hand perspective (for example, “I tested” or “we used”)', detected: has(text, /\b(i|we)\s+(personally\s+)?(tested|used|tried|built|visited|measured|reviewed)\b|\b(firsthand|first-hand|hands-on|in our experience)\b/i) },
        { label: 'Specific real-world example, case study, or measured result', detected: has(text, /\b(case study|real[- ]world|in practice|experiment|trial|our results|we found|results showed|measured|field test)\b/i) },
      ],
    },
    {
      key: 'expertise',
      label: 'Expertise',
      signals: [
        { label: 'Author, reviewer, or relevant qualifications identified', detected: has(text, /\b(written by|author|reviewed by|editor|\bPh\.?D\b|\bM\.?D\b|certified|certification|years of experience|subject[- ]matter expert|specialist)\b/i) },
        { label: 'Practical process or explanation included', detected: has(text, /\b(step[- ]by[- ]step|how to|methodology|our process|we recommend|instructions|implementation|diagnos(e|is))\b/i) },
      ],
    },
    {
      key: 'authoritativeness',
      label: 'Authoritativeness',
      signals: [
        { label: 'Sources, citations, or references are provided', detected: has(text, /https?:\/\/|\b(sources|references|cited|according to|study by|research from)\b/i) },
        { label: 'Named research, standards, institutions, or data sources are cited', detected: has(text, /\b(research|survey|study|report|dataset|standard|guideline|according to|data from)\b/i) },
      ],
    },
    {
      key: 'trustworthiness',
      label: 'Trustworthiness',
      signals: [
        { label: 'Publication or update date is stated', detected: has(text, /\b(published|updated|last reviewed|last modified)\b.{0,50}\b(19|20)\d{2}\b|\b(19|20)\d{2}\b.{0,40}\b(updated|reviewed|published)\b/i) },
        { label: 'Methodology, limitations, or disclosure is explained', detected: has(text, /\b(methodology|limitations|disclaimer|disclosure|sponsored|affiliate|conflict of interest|how we tested|what we don't know)\b/i) },
      ],
    },
  ];
  const dimensions: EeatDimensionResult[] = criteria.map((dimension) => ({
    ...dimension,
    detected: dimension.signals.filter((signal) => signal.detected).length,
    total: dimension.signals.length,
  }));

  return {
    dimensions,
    detectedSignals: dimensions.reduce((sum, dimension) => sum + dimension.detected, 0),
    totalSignals: dimensions.reduce((sum, dimension) => sum + dimension.total, 0),
    scopeNotice: 'Checks for E-E-A-T-related clues in the submitted text only. It does not verify authors, sources, factual accuracy, site reputation, or Google rankings. Missing clues may exist elsewhere on your site.',
  };
}
