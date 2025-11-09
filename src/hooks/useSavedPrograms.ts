import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

interface SavedProgram {
  id: string;
  name: string;
  description: string | null;
  code: string;
  folder_path: string;
  is_public: boolean;
  public_link_token: string | null;
  created_at: string;
  updated_at: string;
}

export const useSavedPrograms = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<SavedProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    if (!user) {
      setPrograms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('saved_programs')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      if (import.meta.env.DEV) {
        console.error(error);
      }
      toast.error('Errore nel caricamento dei programmi');
    } else {
      setPrograms(data || []);
    }
    setLoading(false);
  };

  const saveProgram = async (
    name: string,
    code: string,
    description?: string,
    folderPath: string = '/'
  ) => {
    if (!user) {
      toast.error('Devi essere autenticato');
      return null;
    }

    const { data, error } = await supabase
      .from('saved_programs')
      .insert({
        user_id: user.id,
        name,
        code,
        description,
        folder_path: folderPath
      })
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) {
        console.error(error);
      }
      toast.error('Errore nel salvataggio');
      return null;
    }

    toast.success(`Programma "${name}" salvato!`);
    fetchPrograms();
    return data;
  };

  const updateProgram = async (
    id: string,
    updates: Partial<Pick<SavedProgram, 'name' | 'description' | 'code' | 'folder_path'>>
  ) => {
    const { error } = await supabase
      .from('saved_programs')
      .update(updates)
      .eq('id', id);

    if (error) {
      if (import.meta.env.DEV) {
        console.error(error);
      }
      toast.error('Errore nell\'aggiornamento');
      return false;
    }

    toast.success('Programma aggiornato!');
    fetchPrograms();
    return true;
  };

  const deleteProgram = async (id: string) => {
    const { error } = await supabase
      .from('saved_programs')
      .delete()
      .eq('id', id);

    if (error) {
      if (import.meta.env.DEV) {
        console.error(error);
      }
      toast.error('Errore nell\'eliminazione');
      return false;
    }

    toast.success('Programma eliminato');
    fetchPrograms();
    return true;
  };

  const generatePublicLink = async (id: string) => {
    const token = crypto.randomUUID();
    
    const { error } = await supabase
      .from('saved_programs')
      .update({
        is_public: true,
        public_link_token: token
      })
      .eq('id', id);

    if (error) {
      toast.error('Errore nella generazione del link');
      return null;
    }

    const link = `${window.location.origin}/program/${token}`;
    toast.success('Link pubblico generato!');
    fetchPrograms();
    return link;
  };

  useEffect(() => {
    fetchPrograms();
  }, [user]);

  return {
    programs,
    loading,
    fetchPrograms,
    saveProgram,
    updateProgram,
    deleteProgram,
    generatePublicLink
  };
};
