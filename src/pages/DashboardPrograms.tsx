import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProgramCard } from '@/components/dashboard/ProgramCard';
import { useSavedPrograms } from '@/hooks/useSavedPrograms';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Plus, FileCode, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const DashboardPrograms = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { programs, loading: programsLoading, deleteProgram, generatePublicLink } = useSavedPrograms();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // FASE 4: Filtra solo programmi dell'utente corrente
  const userPrograms = useMemo(() => 
    programs.filter(p => p.user_id === user?.id),
    [programs, user]
  );

  const isInitializing = authLoading || (programsLoading && programs.length === 0);

  const handleOpen = (code: string) => {
    localStorage.setItem('microasm_loaded_code', code);
    navigate('/');
    toast.success('Programma caricato nell\'editor');
  };

  const handleEdit = (program: any) => {
    localStorage.setItem('microasm_loaded_code', program.code);
    navigate('/');
    toast.info('Programma caricato nell\'editor per la modifica');
  };

  const handleShare = async (id: string) => {
    const program = programs.find(p => p.id === id);
    
    if (program?.public_link_token) {
      const link = `${window.location.origin}/p/${program.public_link_token}`;
      navigator.clipboard.writeText(link);
      toast.success('Link pubblico copiato negli appunti!');
    } else {
      const link = await generatePublicLink(id);
      if (link) {
        navigator.clipboard.writeText(link);
        toast.success('Link pubblico generato e copiato!');
      }
    }
  };

  // FASE 1: Prevenzione click multipli durante eliminazione
  const confirmDelete = async () => {
    if (deleteId && !isDeleting) {
      setIsDeleting(true);
      const success = await deleteProgram(deleteId);
      setIsDeleting(false);
      if (success) {
        setDeleteId(null);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">I Miei Programmi</h1>
            <p className="text-muted-foreground mt-1">
              Gestisci i tuoi programmi assembly salvati
            </p>
          </div>
          <Button onClick={() => navigate('/')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Programma
          </Button>
        </div>

        {isInitializing ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-sm text-muted-foreground">Caricamento in corso...</p>
            </div>
          </div>
        ) : programsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : userPrograms.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <FileCode className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessun programma salvato</h3>
            <p className="text-muted-foreground mb-4">
              Inizia a scrivere codice assembly e salvalo per riutilizzarlo
            </p>
            <Button onClick={() => navigate('/')}>
              Vai al Simulatore
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPrograms.map(program => (
              <ProgramCard
                key={program.id}
                program={program}
                onOpen={() => handleOpen(program.code)}
                onEdit={() => handleEdit(program)}
                onDelete={() => setDeleteId(program.id)}
                onShare={() => handleShare(program.id)}
              />
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare questo programma? Questa azione non può essere annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Annulla</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete} 
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? 'Eliminazione...' : 'Elimina'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPrograms;
