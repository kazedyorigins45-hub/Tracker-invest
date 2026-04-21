export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mindset-invest.com';

  return {
    rules: [
      { userAgent: '*', allow: ['/', '/pricing', '/features', '/faq', '/terms', '/privacy'], disallow: ['/dashboard', '/mindset', '/tracker', '/invest', '/portfolio'] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
