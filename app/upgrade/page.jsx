import SiteHeader from '@/components/SiteHeader';
import UpgradeContent from '@/components/UpgradeContent';

export const metadata = {
  title: 'Mettre à niveau',
  robots: { index: false, follow: false },
};

export default function UpgradePage({ searchParams }) {
  return (
    <main className="public-page">
      <SiteHeader />
      <UpgradeContent feature={searchParams?.feature || 'premium'} />
    </main>
  );
}
