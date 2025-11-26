import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

export const useProfile = () => {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Errore nel caricamento del profilo');
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (firstName: string, lastName: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Utente non autenticato');
      return false;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Errore durante il salvataggio: ' + error.message);
        return false;
      }

      // Aggiorna lo stato locale
      setProfile(prev => prev ? {
        ...prev,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      } : null);

      toast.success('Profilo aggiornato con successo');
      return true;
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Errore imprevisto durante il salvataggio');
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  return { profile, loading, saving, updateProfile, refetch: fetchProfile };
};
