export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tracker-invest.com';

  return {
    rules: [
      { userAgent: '*', allow: ['/', '/pricing', '/features', '/faq', '/terms', '/privacy'], disallow: ['/dashboard', '/mindset', '/tracker', '/invest', '/portfolio', '/login', '/upgrade', '/billing', '/confirmed'] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
