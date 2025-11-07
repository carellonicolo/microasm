import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProgramCard } from '@/components/dashboard/ProgramCard';
import { useSavedPrograms } from '@/hooks/useSavedPrograms';
import { Button } from '@/components/ui/button';
import { Plus, FileCode } from 'lucide-react';
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
  const { programs, loading, deleteProgram, generatePublicLink } = useSavedPrograms();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleOpen = (code: string) => {
    localStorage.setItem('microasm_loaded_code', code);
    navigate('/');
    toast.success('Programma caricato nell\'editor');
  };

  const handleEdit = (program: any) => {
    toast.info('Feature edit in arrivo');
  };

  const handleShare = async (id: string) => {
    const link = await generatePublicLink(id);
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success('Link copiato negli appunti!');
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteProgram(deleteId);
      setDeleteId(null);
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : programs.length === 0 ? (
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
            {programs.map(program => (
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
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPrograms;
