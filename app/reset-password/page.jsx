import ResetPasswordForm from '@/components/ResetPasswordForm';

export const metadata = {
  title: 'Nouveau mot de passe',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="auth-wrap">
      <ResetPasswordForm />
    </main>
  );
}
