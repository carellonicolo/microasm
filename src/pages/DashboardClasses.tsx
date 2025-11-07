import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CreateClassDialog } from '@/components/dialogs/CreateClassDialog';
import { ClassCard } from '@/components/dashboard/ClassCard';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
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

interface ClassWithStats {
  id: string;
  name: string;
  description: string | null;
  academic_year: string;
  is_archived: boolean;
  student_count?: number;
  assignment_count?: number;
}

const DashboardClasses = () => {
  const { isTeacher } = useUserRole();
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  const fetchClasses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch student counts and assignment counts
      const classesWithStats = await Promise.all(
        (data || []).map(async (cls) => {
          const [studentsResult, assignmentsResult] = await Promise.all([
            supabase
              .from('class_students')
              .select('id', { count: 'exact', head: true })
              .eq('class_id', cls.id),
            supabase
              .from('assignments')
              .select('id', { count: 'exact', head: true })
              .eq('class_id', cls.id),
          ]);

          return {
            ...cls,
            student_count: studentsResult.count || 0,
            assignment_count: assignmentsResult.count || 0,
          };
        })
      );

      setClasses(classesWithStats);
    } catch (error: any) {
      toast.error('Errore nel caricamento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classToDelete);

      if (error) throw error;

      toast.success('Classe eliminata');
      fetchClasses();
    } catch (error: any) {
      toast.error('Errore: ' + error.message);
    } finally {
      setClassToDelete(null);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Le Mie Classi</h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher ? 'Gestisci le tue classi e studenti' : 'Visualizza le classi a cui appartieni'}
            </p>
          </div>
          {isTeacher && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuova Classe
            </Button>
          )}
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isTeacher ? 'Nessuna classe creata' : 'Non appartieni a nessuna classe'}
            </h3>
            <p className="text-muted-foreground">
              {isTeacher ? 'Crea la tua prima classe per iniziare' : 'Contatta il tuo insegnante per essere aggiunto'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <ClassCard
                key={cls.id}
                classData={cls}
                isTeacher={isTeacher}
                onDelete={isTeacher ? setClassToDelete : undefined}
              />
            ))}
          </div>
        )}

        {isTeacher && (
          <>
            <CreateClassDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              onClassCreated={fetchClasses}
            />

            <AlertDialog open={!!classToDelete} onOpenChange={() => setClassToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminare questa classe?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione eliminerà la classe e tutti i dati associati (studenti, esercitazioni).
                    Non può essere annullata.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteClass}>
                    Elimina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default DashboardClasses;
