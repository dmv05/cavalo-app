import './globals.css';
import RegisterSW from './register-sw';

export const metadata = {
  title: 'Cavalo — Marketplace de chevaux en Europe',
  description: 'Achat et vente de chevaux entre particuliers et professionnels. 100% gratuit.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cavalo',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6B4226',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
