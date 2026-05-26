export default function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tracker-invest.com';
  const now = new Date();
  const staticDate = new Date('2026-05-01');

  return [
    { url: `${siteUrl}/`, lastModified: now },
    { url: `${siteUrl}/pricing`, lastModified: now },
    { url: `${siteUrl}/features`, lastModified: now },
    { url: `${siteUrl}/faq`, lastModified: now },
    { url: `${siteUrl}/terms`, lastModified: staticDate },
    { url: `${siteUrl}/privacy`, lastModified: staticDate },
    { url: `${siteUrl}/mentions-legales`, lastModified: staticDate },
  ];
}
