export default function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tracker-invest.com';

  return [
    { url: `${siteUrl}/`, lastModified: new Date('2026-05-26') },
    { url: `${siteUrl}/pricing`, lastModified: new Date('2026-05-26') },
    { url: `${siteUrl}/features`, lastModified: new Date('2026-05-26') },
    { url: `${siteUrl}/faq`, lastModified: new Date('2026-05-26') },
    { url: `${siteUrl}/terms`, lastModified: new Date('2026-05-01') },
    { url: `${siteUrl}/privacy`, lastModified: new Date('2026-05-01') },
    { url: `${siteUrl}/mentions-legales`, lastModified: new Date('2026-05-01') },
  ];
}
