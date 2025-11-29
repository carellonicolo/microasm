import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Target, BookOpen, Pencil } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAssignmentDetail } from '@/hooks/useAssignmentDetail';
import { StudentSubmissionViewMulti } from '@/components/assignments/StudentSubmissionViewMulti';
import { TeacherSubmissionViewMulti } from '@/components/assignments/TeacherSubmissionViewMulti';
import { EditAssignmentDialog } from '@/components/dialogs/EditAssignmentDialog';
import { useState } from 'react';

const AssignmentDetail = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const {
    assignment,
    assignmentExercises,
    submissions,
    mySubmissions,
    loading,
    isTeacher,
    createSubmission,
    updateSubmissionAnswer,
    markAsFinal,
    refetch
  } = useAssignmentDetail(assignmentId);

  const totalMaxPoints = assignmentExercises.reduce((sum, ex) => sum + ex.max_points, 0);

  const isDueDatePassed = assignment?.due_date 
    ? new Date(assignment.due_date) < new Date() 
    : false;

  const canShowSolution = assignment?.show_solution_after_deadline && isDueDatePassed;

  const finalSubmission = mySubmissions.find(s => s.is_final);
  const isGraded = finalSubmission?.status === 'graded';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Caricamento esercitazione...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/dashboard/assignments')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alle esercitazioni
          </Button>
          <Card className="glass-card p-6 text-center">
            <p className="text-muted-foreground">Esercitazione non trovata</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard/assignments')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna alle esercitazioni
        </Button>

        {/* Assignment Info Card */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
                <p className="text-muted-foreground">
                  {assignment.classes?.name} - {assignment.classes?.academic_year}
                </p>
              </div>
              <div className="flex gap-2">
                {isTeacher && (
                  <Button onClick={() => setEditDialogOpen(true)} variant="outline" size="sm">
                    <Pencil className="w-4 h-4 mr-2" />
                    Modifica
                  </Button>
                )}
                <Badge variant="outline" className="text-base px-3 py-1">
                  {assignmentExercises.length} Esercizi - {totalMaxPoints} punti
                </Badge>
                {isDueDatePassed && (
                  <Badge variant="destructive">Scaduta</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignment.description && (
              <p className="text-sm leading-relaxed">{assignment.description}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignment.due_date && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Scadenza</p>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(assignment.due_date), { 
                        addSuffix: true, 
                        locale: it 
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(assignment.due_date).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Esercizi</p>
                  <p className="font-medium">{assignmentExercises.length} Esercizi</p>
                  <p className="text-xs text-muted-foreground">{totalMaxPoints} punti totali</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Section */}
        {isTeacher ? (
          <TeacherSubmissionViewMulti 
            assignmentExercises={assignmentExercises}
            submissions={submissions}
            totalMaxPoints={totalMaxPoints}
            onRefetch={refetch}
          />
        ) : (
          <StudentSubmissionViewMulti
            assignmentExercises={assignmentExercises}
            mySubmissions={mySubmissions}
            totalMaxPoints={totalMaxPoints}
            onCreateSubmission={createSubmission}
            onUpdateAnswer={updateSubmissionAnswer}
            onMarkAsFinal={markAsFinal}
          />
        )}
      </div>

      {/* Edit Dialog */}
      {editDialogOpen && (
        <EditAssignmentDialog
          assignmentId={assignmentId!}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            refetch();
            setEditDialogOpen(false);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default AssignmentDetail;
