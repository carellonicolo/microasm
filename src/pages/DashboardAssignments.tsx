import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CreateAssignmentDialog } from '@/components/dialogs/CreateAssignmentDialog';
import { EditAssignmentDialog } from '@/components/dialogs/EditAssignmentDialog';
import { AssignmentCard } from '@/components/dashboard/AssignmentCard';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

const DashboardAssignments = () => {
  const t = useTranslation();
  const { isTeacher, loading: roleLoading } = useUserRole();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<{ id: string; title: string; submissionsCount: number } | null>(null);

  const fetchAssignments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (isTeacher) {
        // Teacher: carica le proprie assegnazioni
        const { data, error } = await supabase
          .from('assignments')
          .select(`
            *,
            classes(name, academic_year),
            exercise_repository(title, difficulty, category),
            submissions(count)
          `)
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Conta le submissions per ogni assignment
        const assignmentsWithCounts = await Promise.all(
          (data || []).map(async (assignment) => {
            const { count } = await supabase
              .from('submissions')
              .select('*', { count: 'exact', head: true })
              .eq('assignment_id', assignment.id);
            
            return { ...assignment, submission_count: count || 0 };
          })
        );
        
        setAssignments(assignmentsWithCounts);
      } else {
        // Student: carica le assegnazioni delle proprie classi
        const { data: studentClasses } = await supabase
          .from('class_students')
          .select('class_id')
          .eq('student_id', user.id);

        if (!studentClasses) return;

        const classIds = studentClasses.map(sc => sc.class_id);
        
        const { data, error } = await supabase
          .from('assignments')
          .select(`
            *,
            classes(name, academic_year),
            exercise_repository(title, difficulty, category),
            submissions!left(status, grade, submitted_at)
          `)
          .in('class_id', classIds)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Aggiungi stato submission per ogni assignment
        const assignmentsWithStatus = (data || []).map(assignment => {
          const studentSubmission = assignment.submissions?.find(
            (s: any) => s.student_id === user.id
          );
          return {
            ...assignment,
            submissionStatus: studentSubmission?.status || null
          };
        });

        setAssignments(assignmentsWithStatus);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching assignments:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading && user) {
      fetchAssignments();
    }
  }, [user, isTeacher, roleLoading]);

  const handleDelete = async () => {
    if (!deletingAssignment) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', deletingAssignment.id);

      if (error) throw error;

      toast.success(t.dialogs.assignmentUpdated);
      setDeletingAssignment(null);
      fetchAssignments();
    } catch (error: any) {
      toast.error(t.toasts.error);
      if (import.meta.env.DEV) console.error(error);
    }
  };

  if (roleLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {isTeacher ? t.dashboard.createdAssignments : t.dashboard.assignments}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher 
                ? t.dashboard.manageClasses
                : t.dashboard.assignmentsToComplete}
            </p>
          </div>
          {isTeacher && <CreateAssignmentDialog onSuccess={fetchAssignments} />}
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isTeacher ? t.assignments.noSubmissions : t.assignments.noSubmissions}
            </h3>
            <p className="text-muted-foreground">
              {isTeacher 
                ? t.dialogs.createAssignment
                : t.dashboard.assignmentsToComplete}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                submissionStatus={assignment.submissionStatus}
                isTeacher={isTeacher}
                onClick={() => navigate(`/dashboard/assignments/${assignment.id}`)}
                onEdit={() => setEditingAssignment(assignment.id)}
                onDelete={async () => {
                  // Conta submissions prima di eliminare
                  const { count } = await supabase
                    .from('submissions')
                    .select('*', { count: 'exact', head: true })
                    .eq('assignment_id', assignment.id);
                  
                  setDeletingAssignment({
                    id: assignment.id,
                    title: assignment.title,
                    submissionsCount: count || 0
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingAssignment && (
        <EditAssignmentDialog
          assignmentId={editingAssignment}
          open={!!editingAssignment}
          onOpenChange={(open) => !open && setEditingAssignment(null)}
          onSuccess={fetchAssignments}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAssignment} onOpenChange={(open) => !open && setDeletingAssignment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.confirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.programs.confirmDelete} "{deletingAssignment?.title}"?
              {deletingAssignment && deletingAssignment.submissionsCount > 0 && (
                <>
                  <br /><br />
                  <strong className="text-destructive">
                    {t.toasts.warning}: {deletingAssignment.submissionsCount} {t.assignments.noSubmissions}
                  </strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default DashboardAssignments;