import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@/styles/site.css';
import { Providers } from '@/views/layout/Providers';

const SITE = '{{SITE_URL}}';   // remplacé au démarrage du serveur par l'adresse réelle (SITE_URL)
export const metadata: Metadata = {
  title: 'Spora, le réseau des talents du football africain',
  description: 'Spora connecte les footballeurs africains aux agents, aux clubs et aux opportunités. Une meilleure visibilité à ton talent.',
  icons: { icon: [{ url: '/assets/favicon-32.png', sizes: '32x32', type: 'image/png' }, { url: '/assets/logo-icon.svg', type: 'image/svg+xml' }], apple: '/assets/apple-touch-icon.png' },
  manifest: '/manifest.webmanifest',
  openGraph: { type: 'website', siteName: 'Spora', title: 'Spora, le réseau des talents du football africain', description: 'Une meilleure visibilité à ton talent. Joueurs, agents et clubs réunis au même endroit.' },
  twitter: { card: 'summary_large_image' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#1a2748' };

// Applique le thème enregistré avant l'affichage (évite un flash blanc).
const THEME = `try{var t=localStorage.getItem('spora-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta property="og:image" content={`${SITE}/assets/og-image.png`} />
        <meta property="og:url" content={`${SITE}/`} />
        <link rel="canonical" href={`${SITE}/`} />
        <script dangerouslySetInnerHTML={{ __html: THEME }} />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
