import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Inter for UI text; falls back to the OS stack in globals.css if unavailable.
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

// Absolute origin used to resolve relative Open Graph / Twitter image URLs.
// Set NEXT_PUBLIC_SITE_URL to the deployed origin in production; Vercel's
// system env vars are used as a fallback so preview/production deploys on
// Vercel resolve correctly without extra configuration.
function resolveMetadataBase(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  const candidate = configured || (vercelHost ? `https://${vercelHost}` : 'http://localhost:3000');

  try {
    return new URL(candidate.includes('://') ? candidate : `https://${candidate}`);
  } catch {
    return new URL('http://localhost:3000');
  }
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: 'Cloom Copilot — Property Operations Dashboard',
  description: 'Property operations copilot for hotels, powered by Meta Muse models.',
  icons: { icon: '/icon.png', apple: '/icon.png' },
  openGraph: {
    title: 'Cloom Copilot — Property Operations Dashboard',
    description: 'Property operations copilot for hotels, powered by Meta Muse models.',
    url: '/',
    siteName: 'Cloom Copilot',
    type: 'website',
    images: [{ url: '/logo.png', width: 838, height: 298, alt: 'Cloom Copilot' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cloom Copilot — Property Operations Dashboard',
    description: 'Property operations copilot for hotels, powered by Meta Muse models.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div id="next-app-container">{children}</div>
      </body>
    </html>
  );
}
