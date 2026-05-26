import './globals.css';
import { Cinzel, DM_Sans, Playfair_Display } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cinzel',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-dm-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '600'],
  variable: '--font-playfair',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tracker-invest.com'),
  title: {
    default: 'Tracker-invest — Journal de trading & suivi d\'investissement',
    template: '%s | Tracker-invest',
  },
  description: "Centralisez vos trades, actions, ETF et immobilier dans un seul tableau de bord. Suivi de patrimoine en temps réel. Gratuit pour démarrer.",
  openGraph: {
    title: 'Tracker-invest — Journal de trading & suivi d\'investissement',
    description: "Centralisez vos trades, actions, ETF et immobilier dans un seul tableau de bord. Suivi de patrimoine en temps réel.",
    type: 'website',
    siteName: 'Tracker-invest',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tracker-invest — Journal de trading & suivi d\'investissement',
    description: "Centralisez vos trades, actions, ETF et immobilier dans un seul tableau de bord.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${cinzel.variable} ${dmSans.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var key = 'mindset-theme';
                  var theme = localStorage.getItem(key);
                  if (!theme) {
                    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.dataset.theme = theme;
                  var localeKey = 'mindset-locale';
                  var locale = localStorage.getItem(localeKey);
                  if (!locale) {
                    locale = (navigator.language || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';
                  }
                  document.documentElement.dataset.locale = locale;
                  document.documentElement.lang = locale;
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
