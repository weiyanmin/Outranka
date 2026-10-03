import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Outranka — Search Intent & Competitor Content Analysis',
  description: 'Score how well your content satisfies search intent against Google top 10 competitors.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="site-container">{children}</main>
      </body>
    </html>
  );
}
