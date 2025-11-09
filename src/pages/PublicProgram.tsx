import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Copy, User } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface PublicProgram {
  id: string;
  name: string;
  description: string | null;
  code: string;
  created_at: string;
  user_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

const PublicProgram = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [program, setProgram] = useState<PublicProgram | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchPublicProgram();
    }
  }, [token]);

  const fetchPublicProgram = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_programs')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .eq('public_link_token', token)
        .eq('is_public', true)
        .single();

      if (error) throw error;

      setProgram(data as PublicProgram);
    } catch (error: any) {
      console.error('Error fetching public program:', error);
      toast.error('Programma non trovato o non più pubblico');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToEditor = () => {
    if (program) {
      localStorage.setItem('microasm_loaded_code', program.code);
      navigate('/');
      toast.success('Programma copiato nell\'editor');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Programma non trovato</CardTitle>
            <CardDescription>
              Il link potrebbe essere scaduto o il programma non è più pubblico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Torna all'editor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna all'editor
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl">{program.name}</CardTitle>
                {program.description && (
                  <CardDescription className="mt-2 text-base">
                    {program.description}
                  </CardDescription>
                )}
                {program.profiles && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>
                      Creato da {program.profiles.first_name} {program.profiles.last_name}
                    </span>
                  </div>
                )}
              </div>
              <Button onClick={handleCopyToEditor} className="gap-2 shrink-0">
                <Copy className="w-4 h-4" />
                Copia nell'editor
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground whitespace-pre-wrap break-words">
                {program.code}
              </pre>
            </div>
            
            <div className="mt-4 text-xs text-muted-foreground">
              {program.code.split('\n').length} righe di codice
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicProgram;