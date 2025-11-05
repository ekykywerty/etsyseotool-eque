import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Etsy SEO Assistant - AI-Powered Listing Optimization',
  description: 'Optimize your Etsy listings with AI-powered SEO recommendations. Get better titles, tags, and descriptions to boost your shop\'s visibility.',
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
