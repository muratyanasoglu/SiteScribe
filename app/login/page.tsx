import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { LoginForm } from './login-form';
import { AuthLinksLogin } from './auth-links';

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/org');
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="fixed top-4 right-4 z-50 flex gap-2 items-center">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[400px] min-w-0 space-y-8 rounded-2xl border border-border/80 bg-card/95 p-6 sm:p-8 shadow-soft-lg backdrop-blur-sm">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">SiteScribe</h1>
          <p className="text-muted-foreground text-sm font-medium">Change Order Copilot</p>
        </div>
        <LoginForm />
        <AuthLinksLogin />
      </div>
    </div>
  );
}
