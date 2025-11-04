import SignIn from '@/components/auth/SignIn';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - AI Job Portal',
  description: 'Sign in to access your AI-powered job portal account',
};

export default function SignInPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <SignIn />
    </main>
  );
}
