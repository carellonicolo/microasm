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
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useSavedPrograms = () => {
  const { user, session, loading: authLoading } = useAuth();
  const [programs, setPrograms] = useState<SavedProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const fetchControllerRef = useRef<AbortController | null>(null);

  const fetchPrograms = async () => {
    // GUARDIA: Non procedere se auth sta ancora caricando
    if (authLoading) {
      if (import.meta.env.DEV) {
        console.log('⏳ fetchPrograms: Auth ancora in caricamento, attendo...');
      }
      return;
    }

    // GUARDIA: Nessuna sessione valida
    if (!session || !user) {
      if (import.meta.env.DEV) {
        console.log('🔓 fetchPrograms: Nessuna sessione valida, reset programmi');
      }
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
    
    if (import.meta.env.DEV) {
      console.log('📦 fetchPrograms avviato:', { 
        hasUser: !!user, 
        hasSession: !!session,
        userId: user.id,
        retryCount
      });
    }
    
    const { data, error } = await supabase
      .from('saved_programs')
      .select('*')
      .order('updated_at', { ascending: false })
      .abortSignal(fetchControllerRef.current.signal);

    if (error && error.name !== 'AbortError') {
      if (import.meta.env.DEV) {
        console.error('❌ Errore fetchPrograms:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          hasSession: !!session,
          userId: user?.id,
          retryCount
        });
      }

      // PGRST301: Permission denied - potrebbe essere session non ancora propagata
      // Retry automatico fino a 2 tentativi
      if (error.code === 'PGRST301' && retryCount < 2) {
        if (import.meta.env.DEV) {
          console.log(`🔄 Retry ${retryCount + 1}/2 per PGRST301 (session non ancora propagata)`);
        }
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchPrograms();
        }, 500);
        return;
      }

      // Reset retry count
      setRetryCount(0);

      // PGRST116: Nessuna riga trovata (normale per nuovi utenti)
      if (error.code === 'PGRST116') {
        if (import.meta.env.DEV) {
          console.log('ℹ️ Nessun programma salvato trovato (normale per nuovi utenti)');
        }
        setPrograms([]);
        setLoading(false);
        return;
      }

      // PGRST301: Permission denied anche dopo retry
      if (error.code === 'PGRST301') {
        if (import.meta.env.DEV) {
          console.error('🚫 Permesso negato dopo retry - possibile problema RLS');
        }
        toast.error('Errore di autenticazione. Prova a effettuare nuovamente il login.');
        setPrograms([]);
        setLoading(false);
        return;
      }

      // Altri errori: mostra toast generico
      toast.error('Errore nel caricamento dei programmi');
      setPrograms([]);
    } else {
      // Success: reset retry count e salva dati
      setRetryCount(0);
      setPrograms(data || []);
      if (import.meta.env.DEV) {
        console.log('✅ Programmi caricati con successo:', data?.length || 0);
      }
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
    // FASE 1: Controllo sessione utente
    if (!user) {
      toast.error('Sessione scaduta. Effettua nuovamente il login.');
      return false;
    }

    if (import.meta.env.DEV) {
      console.log('🗑️ Tentativo eliminazione programma:', { programId: id, userId: user.id });
    }

    // FASE 2: Verifica pre-delete - controllo esistenza e ownership
    const { data: existingProgram, error: fetchError } = await supabase
      .from('saved_programs')
      .select('id, name, user_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      if (import.meta.env.DEV) {
        console.error('❌ Errore verifica programma:', fetchError);
      }
      toast.error('Errore nella verifica del programma');
      return false;
    }

    if (!existingProgram) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Programma non trovato:', id);
      }
      toast.error('Programma non trovato o già eliminato');
      return false;
    }

    if (existingProgram.user_id !== user.id) {
      if (import.meta.env.DEV) {
        console.error('🚫 Tentativo eliminazione programma di altro utente:', {
          programUserId: existingProgram.user_id,
          currentUserId: user.id
        });
      }
      toast.error('Non sei autorizzato a eliminare questo programma');
      return false;
    }

    // Procedi con l'eliminazione
    const { data, error } = await supabase
      .from('saved_programs')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Errore eliminazione:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
      }

      // FASE 1: Gestione errori specifici
      if (error.code === 'PGRST301') {
        toast.error('Permesso negato. Verifica di essere autenticato.');
        return false;
      }
      
      if (error.message?.includes('JWT') || error.message?.includes('token')) {
        toast.error('Sessione scaduta. Effettua nuovamente il login.');
        return false;
      }

      toast.error(`Errore nell'eliminazione: ${error.message}`);
      return false;
    }

    if (!data || data.length === 0) {
      if (import.meta.env.DEV) {
        console.error('⚠️ Nessuna riga eliminata per id:', id);
        console.log('Programmi correnti:', programs.map(p => ({ id: p.id, name: p.name })));
      }
      toast.error('Programma non trovato o già eliminato');
      return false;
    }

    if (import.meta.env.DEV) {
      console.log('✅ Programma eliminato con successo:', data[0]);
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
  }, [session, authLoading]); // Reagisce a cambi di sessione, non solo user

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
