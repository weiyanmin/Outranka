import React from 'react';

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  valueColor?: string;
}

/** Plain KPI: small label, big number, muted sub-line. No box, meant to sit in a StatStrip. */
export default function StatTile({ label, value, sub, valueColor }: StatTileProps) {
  return (
    <div className="stat-tile">
      <span className="stat-tile-label">{label}</span>
      <span className="stat-tile-value" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </span>
      {sub && <span className="stat-tile-sub">{sub}</span>}
    </div>
  );
}
