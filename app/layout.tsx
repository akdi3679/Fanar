import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fanar — studio web',
  description: 'Fanar studio web — sites, applications, e-commerce, identité visuelle.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}