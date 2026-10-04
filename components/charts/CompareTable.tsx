import React from 'react';

export interface CompareRow {
  label: string;
  you: number;
  benchmark: number;
}

interface CompareTableProps {
  rows: CompareRow[];
  youLabel?: string;
  benchmarkLabel?: string;
}

function formatValue(value: number) {
  return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1);
}

/** Explicitly labeled values make each comparison readable without relying on a legend. */
export default function CompareTable({ rows, youLabel = 'Your page', benchmarkLabel = 'Top 10 avg' }: CompareTableProps) {
  return (
    <div className="compare-table-scroll">
      <table className="compare-table">
        <thead>
          <tr>
            <th scope="col">Measure</th>
            <th scope="col">{youLabel}</th>
            <th scope="col">{benchmarkLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{formatValue(row.you)}</td>
              <td>{formatValue(row.benchmark)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
