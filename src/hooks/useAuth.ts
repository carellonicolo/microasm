import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FASE 3: Set up auth state listener FIRST con logging eventi
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (import.meta.env.DEV) {
          console.log('🔐 Auth event:', event, session ? 'Session valida' : 'Session null');
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Log eventi specifici
        if (event === 'TOKEN_REFRESHED' && import.meta.env.DEV) {
          console.log('🔄 Token refreshed successfully');
        }
        if (event === 'SIGNED_OUT' && import.meta.env.DEV) {
          console.log('👋 User signed out');
        }
      }
    );

    // FASE 3: THEN check for existing session con gestione errore refresh token
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Errore getSession:', error);
        }
        
        // Gestione errore refresh token
        if (error.message?.includes('Refresh Token') || error.message?.includes('Invalid')) {
          if (import.meta.env.DEV) {
            console.warn('⚠️ Refresh token invalido, forzando logout');
          }
          supabase.auth.signOut();
          setSession(null);
          setUser(null);
        }
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
};
