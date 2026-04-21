export default function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mindset-invest.com';
  const paths = ['/', '/pricing', '/features', '/faq', '/terms', '/privacy'];

  return paths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));
}
