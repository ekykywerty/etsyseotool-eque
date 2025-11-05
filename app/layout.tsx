import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Etsy SEO Assistant - Optimize Your Listings',
  description: 'AI-powered SEO optimization tool for Etsy sellers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}