import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAssignmentDetail } from '@/hooks/useAssignmentDetail';
import { StudentSubmissionView } from '@/components/assignments/StudentSubmissionView';
import { TeacherSubmissionView } from '@/components/assignments/TeacherSubmissionView';

const AssignmentDetail = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  
  const {
    assignment,
    submissions,
    mySubmissions,
    loading,
    isTeacher,
    createSubmission,
    updateSubmission,
    markAsFinal,
    refetch
  } = useAssignmentDetail(assignmentId);

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
                {assignment.exercise_repository && (
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {assignment.exercise_repository.difficulty}
                  </Badge>
                )}
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

              {assignment.exercise_repository && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tipologia</p>
                    <p className="font-medium">{assignment.exercise_repository.category}</p>
                  </div>
                </div>
              )}
            </div>

            {assignment.exercise_repository && (
              <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {assignment.exercise_repository.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {assignment.exercise_repository.description}
                </p>
                
                {assignment.exercise_repository.requirements && (
                  <div>
                    <strong className="text-sm">Requisiti:</strong>
                    <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                      {Array.isArray(assignment.exercise_repository.requirements)
                        ? assignment.exercise_repository.requirements.map((req: string, i: number) => (
                            <li key={i}>{req}</li>
                          ))
                        : typeof assignment.exercise_repository.requirements === 'object'
                        ? Object.entries(assignment.exercise_repository.requirements).map(([key, value]) => (
                            <li key={key}>{String(value)}</li>
                          ))
                        : null}
                    </ul>
                  </div>
                )}

                {assignment.exercise_repository.expected_output && (
                  <div className="mt-3 p-2 bg-muted/50 rounded font-mono text-xs">
                    <strong className="block mb-1">Output atteso:</strong>
                    {assignment.exercise_repository.expected_output}
                  </div>
                )}

                {canShowSolution && assignment.exercise_repository.solution_code && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <strong className="text-sm text-green-600 dark:text-green-400 block mb-2">
                      Soluzione disponibile (scadenza superata)
                    </strong>
                    <pre className="text-xs bg-code-bg p-3 rounded overflow-x-auto">
                      {assignment.exercise_repository.solution_code}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submissions Section */}
        {isTeacher ? (
          <TeacherSubmissionView 
            submissions={submissions} 
            onRefetch={refetch}
          />
        ) : (
          <StudentSubmissionView
            mySubmissions={mySubmissions}
            isGraded={isGraded}
            onCreateSubmission={createSubmission}
            onUpdateSubmission={updateSubmission}
            onMarkAsFinal={markAsFinal}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignmentDetail;
