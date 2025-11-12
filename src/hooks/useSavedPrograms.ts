import { useState, useEffect, useRef } from 'react';
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
  const fetchControllerRef = useRef<AbortController | null>(null);

  const fetchPrograms = async () => {
    if (!user) {
      setPrograms([]);
      setLoading(false);
      return;
    }

    // Cancella fetch precedente se ancora in corso
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }

    fetchControllerRef.current = new AbortController();
    setLoading(true);
    
    const { data, error } = await supabase
      .from('saved_programs')
      .select('*')
      .order('updated_at', { ascending: false })
      .abortSignal(fetchControllerRef.current.signal);

    if (error && error.name !== 'AbortError') {
      if (import.meta.env.DEV) {
        console.error(error);
      }
      toast.error('Errore nel caricamento dei programmi');
    } else if (data) {
      setPrograms(data);
    }
    setLoading(false);
    fetchControllerRef.current = null;
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
    const { data, error } = await supabase
      .from('saved_programs')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Delete error:', error);
      }
      toast.error('Errore nell\'eliminazione del programma');
      return false;
    }

    // Verificare se effettivamente è stato eliminato qualcosa
    if (!data || data.length === 0) {
      if (import.meta.env.DEV) {
        console.error('No rows deleted for id:', id);
      }
      toast.error('Programma non trovato o già eliminato');
      return false;
    }

    toast.success('Programma eliminato con successo');
    await fetchPrograms();
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

    const link = `${window.location.origin}/p/${token}`;
    toast.success('Link pubblico generato!');
    await fetchPrograms();
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
