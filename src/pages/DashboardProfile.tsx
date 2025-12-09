import { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { useUserRole } from '@/hooks/useUserRole';
import { UserRolesBadges } from '@/components/shared/UserRolesBadges';
import { Loader2, Lock, Save, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '@/schemas/profile';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

const DashboardProfile = () => {
  const t = useTranslation();
  const { language } = useLanguage();
  const dateLocale = language === 'it' ? it : enUS;
  const { profile, loading, saving, updateProfile } = useProfile();
  const { roles } = useUserRole();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
    },
  });

  // Aggiorna i valori del form quando il profilo viene caricato
  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.first_name,
        lastName: profile.last_name,
      });
    }
  }, [profile?.id, form]);

  const onSubmit = async (data: ProfileFormData) => {
    const success = await updateProfile(data.firstName, data.lastName);
    if (success) {
      form.reset(data); // Reset dirty state dopo salvataggio
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {t.toasts.error}
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="w-8 h-8" />
            {t.profile.myProfile}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.profile.personalInfo}
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t.profile.personalInfo}</CardTitle>
            <CardDescription>
              {t.profile.emailNotEditable}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* First Name */}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.auth.firstName}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Mario"
                          disabled={saving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Last Name */}
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.auth.lastName}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Rossi"
                          disabled={saving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    {t.auth.email}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Lock className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t.profile.emailNotEditable}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </div>

                {/* Roles */}
                <div className="space-y-2">
                  <Label>{t.users.roles}</Label>
                  <div className="flex items-center gap-2">
                    <UserRolesBadges roles={roles} />
                  </div>
                </div>

                {/* Registration Date */}
                <div className="space-y-2">
                  <Label>{t.users.registeredOn}</Label>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(profile.created_at), "d MMMM yyyy 'alle' HH:mm", { locale: dateLocale })}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={saving || !form.formState.isDirty}
                    className="gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t.dialogs.saving}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {t.profile.updateProfile}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardProfile;