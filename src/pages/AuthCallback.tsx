import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Ottieni la sessione corrente (gestisce sia email confirm che OAuth)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast.error('Errore di autenticazione');
          navigate('/auth');
          return;
        }

        if (!session) {
          toast.error('Sessione non valida');
          navigate('/auth');
          return;
        }

        // Verifica se è un nuovo utente OAuth (Google)
        const isOAuthUser = session.user.app_metadata.provider === 'google';
        
        // Verifica se il profilo esiste già
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        // Determina il messaggio appropriato
        if (!profile && isOAuthUser) {
          // Nuovo utente Google - il trigger handle_new_user() creerà il profilo
          toast.success('Benvenuto! Registrazione completata con Google.');
        } else if (profile && isOAuthUser) {
          // Utente Google esistente
          toast.success('Bentornato!');
        } else {
          // Conferma email tradizionale
          toast.success('Email confermata! Benvenuto.');
        }

        // Piccolo delay per permettere al toast di essere visibile
        setTimeout(() => {
          navigate('/');
        }, 500);

      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        toast.error('Errore imprevisto durante l\'autenticazione');
        navigate('/auth');
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">
          {isProcessing ? 'Verifica in corso...' : 'Reindirizzamento...'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
