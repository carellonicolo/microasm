import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '@/schemas/profile';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface EditUserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  onSuccess: () => void;
}

export const EditUserProfileDialog = ({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditUserProfileDialogProps) => {
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
    },
  });

  // Reset form quando cambia l'utente o si apre il dialog
  useEffect(() => {
    if (user && open) {
      form.reset({
        firstName: user.first_name,
        lastName: user.last_name,
      });
    }
  }, [user?.id, open, form]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) {
      toast.error('Utente non valido');
      return;
    }

    setSaving(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('Sessione non valida');
        return;
      }

      const response = await supabase.functions.invoke('admin-operations', {
        body: {
          operation: 'update_profile',
          target_user_id: user.id,
          profile_data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      if (response.error) {
        console.error('Edge function error:', response.error);
        toast.error('Errore durante l\'aggiornamento del profilo');
        return;
      }

      const result = response.data;
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Profilo aggiornato con successo');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Errore imprevisto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifica Profilo Utente</DialogTitle>
          <DialogDescription>
            Modifica il nome e cognome dell'utente {user?.email}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
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
                  <FormLabel>Cognome</FormLabel>
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
              <Label>Email</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                L'email non può essere modificata
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={saving || !form.formState.isDirty}
                className="gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salva Modifiche
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
