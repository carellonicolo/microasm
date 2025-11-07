import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CreateAssignmentDialog } from '@/components/dialogs/CreateAssignmentDialog';
import { AssignmentCard } from '@/components/dashboard/AssignmentCard';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const DashboardAssignments = () => {
  const { isTeacher, loading: roleLoading } = useUserRole();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading && user) {
      fetchAssignments();
    }
  }, [user, isTeacher, roleLoading]);

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
              {isTeacher ? 'Le Mie Esercitazioni' : 'Esercitazioni Assegnate'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher 
                ? 'Gestisci e monitora le esercitazioni assegnate alle tue classi' 
                : 'Visualizza e completa le esercitazioni assegnate'}
            </p>
          </div>
          {isTeacher && <CreateAssignmentDialog onSuccess={fetchAssignments} />}
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isTeacher ? 'Nessuna esercitazione creata' : 'Nessuna esercitazione assegnata'}
            </h3>
            <p className="text-muted-foreground">
              {isTeacher 
                ? 'Crea la tua prima esercitazione per assegnarla agli studenti' 
                : 'Al momento non ci sono esercitazioni da completare'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                submissionStatus={assignment.submissionStatus}
                onClick={() => navigate(`/dashboard/assignments/${assignment.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardAssignments;
