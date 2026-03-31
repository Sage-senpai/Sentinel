import type { Metadata } from 'next';
import '@/styles/global.scss';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { Header } from '@/components/layout/Header/Header';
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: 'SENTINEL — Liquidation Defense & Whale Intelligence',
  description:
    'AI-powered liquidation cascade detection, whale tracking, and automated position protection for Pacifica traders.',
  keywords: ['defi', 'liquidation', 'whale-tracking', 'pacifica', 'sentinel'],
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-layout">
            <Sidebar />
            <div className="app-main">
              <Header />
              <main className="app-content">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
