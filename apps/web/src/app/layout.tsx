import type { Metadata } from 'next';
import '@/styles/global.scss';
import { Providers } from '@/components/providers/Providers';
import { MeshBackground } from '@/components/layout/MeshBackground';

export const metadata: Metadata = {
  title: 'SENTINEL — AI-Powered Liquidation Defense',
  description:
    'Detect cascading liquidations before they hit. Track whales. Protect your positions automatically.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MeshBackground />
        <div className="noise-overlay" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
