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

interface SignupFormProps {
  onSuccess: () => void;
}

export const SignupForm = ({ onSuccess }: SignupFormProps) => {
  const t = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const signupSchema = z.object({
    firstName: z.string().min(2, t.auth.validation.firstNameMin).max(50),
    lastName: z.string().min(2, t.auth.validation.lastNameMin).max(50),
    email: z.string().email(t.auth.validation.emailInvalid),
    password: z.string()
      .min(8, t.auth.validation.passwordMin)
      .regex(/[A-Z]/, t.auth.validation.passwordsMatch)
      .regex(/[0-9]/, t.auth.validation.passwordsMatch),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: t.auth.validation.passwordsMatch,
    path: ['confirmPassword']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error(t.auth.validation.emailInvalid);
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success(t.auth.signupSuccess);
      onSuccess();
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <GoogleAuthButton mode="signup" />
      
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">{t.auth.firstName}</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            placeholder="Mario"
            required
            autoComplete="given-name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">{t.auth.lastName}</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            placeholder="Rossi"
            required
            autoComplete="family-name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">{t.auth.email}</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="mario.rossi@example.com"
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
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="••••••••"
            required
            autoComplete="new-password"
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
        <p className="text-xs text-muted-foreground mt-1">
          {t.auth.validation.passwordMin}
        </p>
      </div>

      <div>
        <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
        <Input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
      </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t.auth.signingUp : t.auth.signup}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {t.classes.student}
        </p>
      </form>
    </div>
  );
};