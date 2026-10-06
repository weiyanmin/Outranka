export const ANALYSIS_PROGRESS_STEPS = [
  { id: 'source', title: 'Preparing your content', description: 'Reading the selected page or preparing your pasted draft.' },
  { id: 'serp', title: 'Fetching Google results', description: 'Searching SerpApi and collecting up to 10 results from the first page.' },
  { id: 'competitors', title: 'Reading competitor pages', description: 'Fetching page text, headings, and structured data in parallel.' },
  { id: 'gemini', title: 'Analyzing content and intent', description: 'Comparing your content with the search results.' },
  { id: 'scoring', title: 'Building recommendations', description: 'Calculating content, language, and ranking opportunity scores.' },
  { id: 'saving', title: 'Saving your audit', description: 'Storing the completed report in your private audit history.' },
] as const;

export type AnalysisProgressStep = (typeof ANALYSIS_PROGRESS_STEPS)[number]['id'];
