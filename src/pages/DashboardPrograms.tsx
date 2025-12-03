import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useSavedPrograms } from '@/hooks/useSavedPrograms';
import { useAuth } from '@/hooks/useAuth';
import { useEditor } from '@/contexts/EditorContext';
import { Button } from '@/components/ui/button';
import { Plus, FileCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FileExplorer } from '@/components/file-explorer/FileExplorer';
import { toast } from 'sonner';

const DashboardPrograms = () => {
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();
  const { userPrograms, loading: programsLoading, deleteProgram, generatePublicLink } = useSavedPrograms();
  const { openProgram } = useEditor();

  const isInitializing = authLoading || (programsLoading && userPrograms.length === 0);

  const handleOpenProgram = (code: string, programId: string) => {
    const program = userPrograms.find(p => p.id === programId);
    if (program) {
      openProgram(program);
    }
    localStorage.setItem('microasm_loaded_code', code);
    navigate('/');
    toast.success('Programma aperto nell\'editor');
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
          <FileExplorer 
            programs={userPrograms} 
            onOpenProgram={handleOpenProgram}
            onDeleteProgram={deleteProgram}
            onGeneratePublicLink={generatePublicLink}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPrograms;
