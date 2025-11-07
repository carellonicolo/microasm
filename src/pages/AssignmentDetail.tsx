import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Send, Eye } from 'lucide-react';
import { SubmissionCard } from '@/components/dashboard/SubmissionCard';
import { GradeSubmissionDialog } from '@/components/dialogs/GradeSubmissionDialog';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const AssignmentDetail = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isTeacher } = useUserRole();
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [mySubmission, setMySubmission] = useState<any>(null);
  const [submittedCode, setSubmittedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const fetchAssignment = async () => {
    if (!assignmentId) return;

    try {
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .select(`
          *,
          classes(name, academic_year),
          exercise_repository(*)
        `)
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;
      setAssignment(assignmentData);

      if (isTeacher) {
        // Teacher: carica tutte le submissions
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select(`
            *,
            profiles(first_name, last_name, email)
          `)
          .eq('assignment_id', assignmentId)
          .order('submitted_at', { ascending: false });

        if (submissionsError) throw submissionsError;
        setSubmissions(submissionsData || []);
      } else {
        // Student: carica solo la propria submission
        const { data: submissionData } = await supabase
          .from('submissions')
          .select('*')
          .eq('assignment_id', assignmentId)
          .eq('student_id', user?.id)
          .maybeSingle();

        if (submissionData) {
          setMySubmission(submissionData);
          setSubmittedCode(submissionData.submitted_code);
        }
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error('Errore nel caricamento dell\'esercitazione');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId, isTeacher, user]);

  const handleSubmit = async () => {
    if (!user || !assignmentId || !submittedCode.trim()) {
      toast.error('Inserisci del codice prima di consegnare');
      return;
    }

    setSubmitting(true);
    try {
      if (mySubmission) {
        // Update existing submission
        const { error } = await supabase
          .from('submissions')
          .update({
            submitted_code: submittedCode,
            last_updated_at: new Date().toISOString(),
            status: 'submitted',
          })
          .eq('id', mySubmission.id);

        if (error) throw error;
        toast.success('Consegna aggiornata con successo');
      } else {
        // Create new submission
        const { error } = await supabase
          .from('submissions')
          .insert({
            assignment_id: assignmentId,
            student_id: user.id,
            submitted_code: submittedCode,
            status: 'submitted',
          });

        if (error) throw error;
        toast.success('Consegna inviata con successo');
      }

      fetchAssignment();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrade = (submission: any) => {
    setSelectedSubmission(submission);
    setGradeDialogOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <p>Esercitazione non trovata</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/dashboard/assignments')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna alle esercitazioni
        </Button>

        <Card className="glass-card mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  {assignment.classes?.name} - {assignment.classes?.academic_year}
                </p>
              </div>
              {assignment.exercise_repository && (
                <Badge>{assignment.exercise_repository.difficulty}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignment.description && <p>{assignment.description}</p>}
            
            {assignment.due_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Scadenza: {formatDistanceToNow(new Date(assignment.due_date), { addSuffix: true, locale: it })}
              </div>
            )}

            {assignment.exercise_repository && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">Esercizio: {assignment.exercise_repository.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{assignment.exercise_repository.description}</p>
                {assignment.exercise_repository.requirements && (
                  <div className="text-sm">
                    <strong>Requisiti:</strong>
                    <pre className="mt-1 text-xs">{JSON.stringify(assignment.exercise_repository.requirements, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {isTeacher ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Consegne ({submissions.length})</h2>
            {submissions.length === 0 ? (
              <Card className="glass-card p-6 text-center">
                <p className="text-muted-foreground">Nessuna consegna ancora</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {submissions.map((submission) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    onGrade={() => handleGrade(submission)}
                    onView={() => toast.info('Visualizzazione codice in arrivo')}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>La Tua Consegna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mySubmission && mySubmission.status === 'graded' && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Voto</span>
                    <span className="text-2xl font-bold text-primary">
                      {mySubmission.grade}/{mySubmission.max_grade}
                    </span>
                  </div>
                  {mySubmission.feedback && (
                    <div>
                      <span className="font-semibold">Feedback:</span>
                      <p className="text-sm mt-1">{mySubmission.feedback}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Codice Assembly</label>
                <Textarea
                  value={submittedCode}
                  onChange={(e) => setSubmittedCode(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                  placeholder="; Scrivi qui il tuo codice MicroASM..."
                  disabled={mySubmission?.status === 'graded'}
                />
              </div>

              {mySubmission?.status !== 'graded' && (
                <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Invio...' : mySubmission ? 'Aggiorna Consegna' : 'Invia Consegna'}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {selectedSubmission && (
          <GradeSubmissionDialog
            submission={selectedSubmission}
            open={gradeDialogOpen}
            onOpenChange={setGradeDialogOpen}
            onSuccess={fetchAssignment}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignmentDetail;
