import { ReactNode } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const t = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:block space-y-6">
          <h1 className="text-5xl font-bold font-heading bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            MicroASM
          </h1>
          <p className="text-xl text-muted-foreground">
            {t.auth.simulatorSubtitle}
          </p>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>{t.auth.features.simulate}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span>{t.auth.features.visualize}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>{t.auth.features.exercises}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span>{t.auth.features.saveShare}</span>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};