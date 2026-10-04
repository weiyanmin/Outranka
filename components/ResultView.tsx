'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnalysisResult } from '../lib/analyze';
import { SerpResultItem } from '../lib/serp';
import { calculateOverallPerformance } from '../lib/performanceScore';
import DashboardShell, { DashboardTab } from './report/DashboardShell';
import OverviewTab from './report/tabs/OverviewTab';
import SearchIntentTab from './report/tabs/SearchIntentTab';
import ContentUxTab from './report/tabs/ContentUxTab';
import OpportunitiesTab from './report/tabs/OpportunitiesTab';
import AiLanguageTab from './report/tabs/AiLanguageTab';
import CompetitorsTab from './report/tabs/CompetitorsTab';

interface ResultViewProps {
  analysis: AnalysisResult;
  competitors?: SerpResultItem[];
}

const TAB_IDS = ['overview', 'intent', 'content', 'opportunities', 'ai', 'competitors'] as const;
type TabId = (typeof TAB_IDS)[number];

function isTabId(value: string): value is TabId {
  return (TAB_IDS as readonly string[]).includes(value);
}

export default function ResultView({ analysis, competitors = [] }: ResultViewProps) {
  const [active, setActive] = useState<TabId>('overview');
  const topRef = useRef<HTMLDivElement>(null);

  // Restore the tab from the URL hash (e.g. /results#content) after mount
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (isTabId(hash)) setActive(hash);
  }, []);

  const changeTab = useCallback((id: string) => {
    if (!isTabId(id)) return;
    setActive(id);
    window.history.replaceState(null, '', `#${id}`);
    // If the user is scrolled past the top of the dashboard, bring it back into view
    const el = topRef.current;
    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const perf =
    analysis.overallPerformance ||
    calculateOverallPerformance(analysis, analysis.scannabilityAudit, analysis.languageAudit, analysis.aiOverview);

  const hasUxAlert = !!analysis.scannabilityAudit?.checks.some((c) => c.status === 'alert');

  const tabs: DashboardTab[] = [
    { id: 'overview', label: 'Overview', icon: 'bar_chart' },
    { id: 'intent', label: 'Search Intent', icon: 'fact_check', alert: analysis.intentMismatch },
    { id: 'content', label: 'Content & UX', icon: 'toc', alert: hasUxAlert },
    { id: 'opportunities', label: 'Opportunities', icon: 'lightbulb', count: analysis.missingTopics?.length || undefined },
    { id: 'ai', label: 'AI & Language', icon: 'auto_awesome', alert: !!analysis.languageAudit?.isMismatch },
    { id: 'competitors', label: 'Competitors', icon: 'groups', count: competitors.length || undefined },
  ];

  return (
    <div ref={topRef} style={{ scrollMarginTop: '16px' }}>
      <DashboardShell tabs={tabs} active={active} onChange={changeTab}>
        {active === 'overview' && <OverviewTab analysis={analysis} perf={perf} onNavigate={changeTab} />}
        {active === 'intent' && <SearchIntentTab analysis={analysis} />}
        {active === 'content' && <ContentUxTab analysis={analysis} />}
        {active === 'opportunities' && <OpportunitiesTab analysis={analysis} />}
        {active === 'ai' && <AiLanguageTab analysis={analysis} />}
        {active === 'competitors' && <CompetitorsTab analysis={analysis} competitors={competitors} />}
      </DashboardShell>
    </div>
  );
}
