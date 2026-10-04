import React from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Bento column span on desktop (out of 12). Defaults to 12. */
  span?: 3 | 4 | 5 | 6 | 7 | 8 | 12;
  children: React.ReactNode;
}

/** Uniform bento card: title row, optional subtitle, generous body spacing. */
export default function SectionCard({ title, subtitle, action, span = 12, children }: SectionCardProps) {
  return (
    <section className={`card bento-card span-${span}`}>
      <header className="bento-card-header">
        <div>
          <h3 className="bento-card-title">{title}</h3>
          {subtitle && <p className="bento-card-subtitle">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="bento-card-body">{children}</div>
    </section>
  );
}
