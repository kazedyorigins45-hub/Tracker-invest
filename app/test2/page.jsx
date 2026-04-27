import { redirect } from 'next/navigation';

export const metadata = { title: 'Test2', robots: { index: false, follow: false } };

export default function Test2Page() {
  redirect('/tracker');
}
