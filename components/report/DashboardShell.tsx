'use client';

import React from 'react';
import GoogleIcon, { GoogleIconName } from '../GoogleIcon';

export interface DashboardTab {
  id: string;
  label: string;
  icon: GoogleIconName;
  /** Small count shown on the right of the tab */
  count?: number;
  /** Shows an amber dot to flag an issue inside this tab */
  alert?: boolean;
}

interface DashboardShellProps {
  tabs: DashboardTab[];
  active: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
}

/** Left tab rail on desktop, scrollable pill bar on mobile. Panel content goes in children. */
export default function DashboardShell({ tabs, active, onChange, children }: DashboardShellProps) {
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(index + dir + tabs.length) % tabs.length];
    onChange(next.id);
    document.getElementById(`dash-tab-${next.id}`)?.focus();
  };

  return (
    <div className="dash">
      <nav className="dash-rail" role="tablist" aria-orientation="vertical" aria-label="Report sections">
        {tabs.map((tab, i) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              id={`dash-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`dash-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`dash-tab${isActive ? ' is-active' : ''}`}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <GoogleIcon name={tab.icon} size={19} color="currentColor" />
              <span className="dash-tab-label">{tab.label}</span>
              {tab.alert && <span className="dash-tab-alert" title="Needs attention" />}
              {typeof tab.count === 'number' && <span className="dash-tab-count">{tab.count}</span>}
            </button>
          );
        })}
      </nav>

      <div className="dash-panel" role="tabpanel" id={`dash-panel-${active}`} aria-labelledby={`dash-tab-${active}`}>
        {children}
      </div>
    </div>
  );
}
