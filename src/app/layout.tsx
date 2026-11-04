import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Inter for UI text; falls back to the OS stack in globals.css if unavailable.
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Cloom Copilot — Hotel Operations Dashboard',
  description: 'AI Operations Copilot for Hotels, powered by Meta Muse models.',
  icons: { icon: '/icon.png', apple: '/icon.png' },
  openGraph: { images: ['/logo.png'] },
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
