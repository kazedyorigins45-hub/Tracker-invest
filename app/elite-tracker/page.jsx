import { redirect } from 'next/navigation';

export const metadata = { title: 'Elite Tracker', robots: { index: false, follow: false } };

export default function EliteTrackerPage() {
  redirect('/tracker');
}
