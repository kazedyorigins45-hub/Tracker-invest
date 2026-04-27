import { redirect } from 'next/navigation';

export const metadata = { title: 'Mes investissements', robots: { index: false, follow: false } };

export default function MesInvestissementsPage() {
  redirect('/portfolio');
}
