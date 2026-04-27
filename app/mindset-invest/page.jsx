import { redirect } from 'next/navigation';

export const metadata = { title: 'Mindset Invest', robots: { index: false, follow: false } };

export default function MindsetInvestPage() {
  redirect('/mindset');
}
