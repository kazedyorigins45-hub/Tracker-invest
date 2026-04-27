import { redirect } from 'next/navigation';

export const metadata = { title: 'Investissement', robots: { index: false, follow: false } };

export default function InvestissementPage() {
  redirect('/invest');
}
