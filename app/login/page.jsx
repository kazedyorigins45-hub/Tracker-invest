import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getSessionContext } from '@/lib/subscription';

export const metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const { user } = await getSessionContext();
  if (user) redirect('/dashboard');

  return (
    <main className="auth-wrap">
      <AuthForm />
    </main>
  );
}
