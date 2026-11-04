import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cloom Copilot — Chat-First Hotel Operations',
  description: 'AI Operations Copilot for Hotels, powered by Meta Muse models.',
  icons: { icon: '/icon.png', apple: '/icon.png' },
  openGraph: { images: ['/logo.png'] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="next-app-container">{children}</div>
      </body>
    </html>
  );
}
