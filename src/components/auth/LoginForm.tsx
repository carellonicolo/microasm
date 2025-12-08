import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleAuthButton } from './GoogleAuthButton';
import { useTranslation } from '@/hooks/useTranslation';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const t = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginSchema = z.object({
    email: z.string().email(t.auth.validation.emailInvalid),
    password: z.string().min(6, t.auth.validation.passwordMin)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error(t.auth.invalidCredentials);
      } else if (error.message.includes('Email not confirmed')) {
        toast.error(t.auth.confirmEmail);
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success(t.auth.loginSuccess);
      onSuccess();
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <GoogleAuthButton mode="login" />
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t.auth.orContinueWith}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">{t.auth.email}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@example.com"
          required
          autoComplete="email"
        />
      </div>
      
      <div>
        <Label htmlFor="password">{t.auth.password}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t.auth.loggingIn : t.auth.login}
        </Button>
      </form>
    </div>
  );
};