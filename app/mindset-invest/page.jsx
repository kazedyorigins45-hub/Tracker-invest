import { redirect } from 'next/navigation';

export const metadata = { title: 'Tracker-invest', robots: { index: false, follow: false } };

export default function MindsetInvestPage() {
  redirect('/mindset');
}
