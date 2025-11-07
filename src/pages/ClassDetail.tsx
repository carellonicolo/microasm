import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AddStudentDialog } from '@/components/dialogs/AddStudentDialog';
import { ArrowLeft, UserPlus, Trash2 } from 'lucide-react';
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

interface ClassData {
  id: string;
  name: string;
  description: string | null;
  academic_year: string;
  teacher_id: string;
}

interface Student {
  id: string;
  student_id: string;
  enrolled_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isTeacher } = useUserRole();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);

  const fetchClassData = async () => {
    if (!classId || !user) return;

    try {
      const { data: classInfo, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (classError) throw classError;
      setClassData(classInfo);

      const { data: studentData, error: studentError } = await supabase
        .from('class_students')
        .select(`
          id,
          student_id,
          enrolled_at,
          profiles:student_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('class_id', classId)
        .order('enrolled_at', { ascending: false });

      if (studentError) throw studentError;
      setStudents(studentData || []);
    } catch (error: any) {
      toast.error('Errore nel caricamento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;

    try {
      const { error } = await supabase
        .from('class_students')
        .delete()
        .eq('id', studentToRemove);

      if (error) throw error;

      toast.success('Studente rimosso dalla classe');
      fetchClassData();
    } catch (error: any) {
      toast.error('Errore: ' + error.message);
    } finally {
      setStudentToRemove(null);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, [classId, user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!classData) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <p>Classe non trovata</p>
        </div>
      </DashboardLayout>
    );
  }

  const isOwner = isTeacher && classData.teacher_id === user?.id;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/dashboard/classes')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna alle Classi
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">{classData.name}</h1>
          <p className="text-muted-foreground mt-1">{classData.academic_year}</p>
          {classData.description && (
            <p className="mt-2 text-muted-foreground">{classData.description}</p>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Studenti ({students.length})</CardTitle>
              {isOwner && (
                <Button onClick={() => setAddDialogOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Aggiungi Studente
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nessuno studente nella classe
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Data Iscrizione</TableHead>
                    {isOwner && <TableHead className="text-right">Azioni</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.profiles.first_name} {student.profiles.last_name}
                      </TableCell>
                      <TableCell>{student.profiles.email}</TableCell>
                      <TableCell>
                        {new Date(student.enrolled_at).toLocaleDateString('it-IT')}
                      </TableCell>
                      {isOwner && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStudentToRemove(student.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {isOwner && (
          <>
            <AddStudentDialog
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
              classId={classId!}
              onStudentAdded={fetchClassData}
            />

            <AlertDialog open={!!studentToRemove} onOpenChange={() => setStudentToRemove(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Rimuovere studente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Lo studente verrà rimosso dalla classe. Questa azione non può essere annullata.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemoveStudent}>
                    Rimuovi
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClassDetail;
