import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, CheckCircle2, Edit, XCircle, Clock, Bot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { AutoGradeResultBadge } from '@/components/assignments/AutoGradeResultBadge';

interface AssignmentExercise {
  id: string;
  display_order: number;
  max_points: number;
  is_required: boolean;
  exercise_repository?: {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    category: string;
    requirements: any;
    expected_output: string | null;
  };
}

interface SubmissionAnswer {
  id: string;
  assignment_exercise_id: string;
  submitted_code: string;
  grade: number | null;
  feedback: string | null;
  graded_at: string | null;
  is_auto_graded: boolean;
}

interface Submission {
  id: string;
  submission_number: number;
  is_final: boolean;
  status: 'not_submitted' | 'submitted' | 'graded';
  total_grade: number | null;
  submitted_at: string;
  submission_answers?: SubmissionAnswer[];
}

interface StudentSubmissionViewMultiProps {
  assignmentExercises: AssignmentExercise[];
  mySubmissions: Submission[];
  totalMaxPoints: number;
  onCreateSubmission: (exerciseAnswers: { assignment_exercise_id: string; code: string }[]) => Promise<boolean>;
  onUpdateAnswer: (answerId: string, code: string) => Promise<boolean>;
  onMarkAsFinal: (submissionId: string) => Promise<boolean>;
}

export const StudentSubmissionViewMulti = ({
  assignmentExercises,
  mySubmissions,
  totalMaxPoints,
  onCreateSubmission,
  onUpdateAnswer,
  onMarkAsFinal
}: StudentSubmissionViewMultiProps) => {
  const [exerciseCodes, setExerciseCodes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);

  const latestSubmission = mySubmissions[0];
  const finalSubmission = mySubmissions.find(s => s.is_final);
  const isGraded = finalSubmission?.status === 'graded';

  // Calculate progress
  const submittedExercises = latestSubmission?.submission_answers?.filter(a => a.submitted_code.trim() !== '').length || 0;
  const progressPercentage = (submittedExercises / assignmentExercises.length) * 100;
  const totalEarnedPoints = latestSubmission?.total_grade || 0;

  const handleUpdateCode = (exerciseId: string, code: string) => {
    setExerciseCodes(prev => ({ ...prev, [exerciseId]: code }));
  };

  const handleSubmitNew = async () => {
    const answers = assignmentExercises.map(ex => ({
      assignment_exercise_id: ex.id,
      code: exerciseCodes[ex.id] || ''
    }));

    setSubmitting(true);
    const success = await onCreateSubmission(answers);
    if (success) {
      setExerciseCodes({});
    }
    setSubmitting(false);
  };

  const handleUpdateAnswer = async (answerId: string) => {
    const answer = latestSubmission?.submission_answers?.find(a => a.id === answerId);
    if (!answer) return;

    setSubmitting(true);
    const success = await onUpdateAnswer(answerId, exerciseCodes[answer.assignment_exercise_id] || answer.submitted_code);
    if (success) {
      setEditingAnswerId(null);
      setExerciseCodes(prev => {
        const newCodes = { ...prev };
        delete newCodes[answer.assignment_exercise_id];
        return newCodes;
      });
    }
    setSubmitting(false);
  };

  const startEditAnswer = (answer: SubmissionAnswer) => {
    setEditingAnswerId(answer.id);
    setExerciseCodes(prev => ({ ...prev, [answer.assignment_exercise_id]: answer.submitted_code }));
  };

  const cancelEdit = () => {
    setEditingAnswerId(null);
    setExerciseCodes({});
  };

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Progresso Esercitazione</span>
            {finalSubmission && (
              <Badge className="bg-green-500/10 text-green-500">Consegna Finale</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Esercizi completati</span>
              <span className="font-semibold">{submittedExercises}/{assignmentExercises.length}</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {isGraded && (
            <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Punteggio Totale</span>
                <p className="text-3xl font-bold text-green-500">
                  {totalEarnedPoints}/{totalMaxPoints}
                </p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          )}

          {latestSubmission && !isGraded && (
            <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-orange-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Consegna in attesa di correzione</p>
                <p className="text-xs text-muted-foreground">
                  Consegnata {formatDistanceToNow(new Date(latestSubmission.submitted_at), { addSuffix: true, locale: it })}
                </p>
              </div>
              {!latestSubmission.is_final && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkAsFinal(latestSubmission.id)}
                >
                  Segna Finale
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercises Tabs */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Esercizi ({assignmentExercises.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={`ex-${assignmentExercises[0]?.id}`} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${assignmentExercises.length}, minmax(0, 1fr))` }}>
              {assignmentExercises.map((ex, idx) => {
                const answer = latestSubmission?.submission_answers?.find(a => a.assignment_exercise_id === ex.id);
                const isCompleted = answer && answer.submitted_code.trim() !== '';
                const isGradedEx = answer?.grade !== null;

                return (
                  <TabsTrigger key={ex.id} value={`ex-${ex.id}`} className="flex items-center gap-2">
                    <span>Es. {idx + 1}</span>
                    {isGradedEx && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {!isGradedEx && isCompleted && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                    {!isCompleted && <XCircle className="w-4 h-4 text-muted-foreground" />}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {assignmentExercises.map((ex, idx) => {
              const answer = latestSubmission?.submission_answers?.find(a => a.assignment_exercise_id === ex.id);
              const isEditing = editingAnswerId === answer?.id;
              const currentCode = isEditing ? (exerciseCodes[ex.id] || answer?.submitted_code || '') : (exerciseCodes[ex.id] || '');

              return (
                <TabsContent key={ex.id} value={`ex-${ex.id}`} className="space-y-4 mt-4">
                  {/* Exercise Info */}
                  <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          Esercizio {idx + 1}: {ex.exercise_repository?.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{ex.exercise_repository?.difficulty}</Badge>
                          <Badge variant="outline">{ex.exercise_repository?.category}</Badge>
                          <Badge className="bg-primary/10 text-primary">{ex.max_points} punti</Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {ex.exercise_repository?.description}
                    </p>

                    {ex.exercise_repository?.requirements && (
                      <div className="mb-3">
                        <strong className="text-sm">Requisiti:</strong>
                        <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                          {Array.isArray(ex.exercise_repository.requirements)
                            ? ex.exercise_repository.requirements.map((req: string, i: number) => (
                                <li key={i}>{req}</li>
                              ))
                            : typeof ex.exercise_repository.requirements === 'object'
                            ? Object.entries(ex.exercise_repository.requirements).map(([key, value]) => (
                                <li key={key}>{String(value)}</li>
                              ))
                            : null}
                        </ul>
                      </div>
                    )}

                    {ex.exercise_repository?.expected_output && (
                      <div className="p-2 bg-muted/50 rounded font-mono text-xs">
                        <strong className="block mb-1">Output atteso:</strong>
                        {ex.exercise_repository.expected_output}
                      </div>
                    )}
                  </div>

                  {/* Graded Answer Display */}
                  {answer && answer.grade !== null && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-600 dark:text-green-400">Esercizio Corretto</span>
                          {answer.is_auto_graded && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              <Bot className="w-3 h-3 mr-1" />
                              Auto
                            </Badge>
                          )}
                        </div>
                        <AutoGradeResultBadge
                          isAutoGraded={answer.is_auto_graded}
                          grade={answer.grade}
                          maxPoints={ex.max_points}
                          className="text-base"
                        />
                      </div>
                      {answer.feedback && (
                        <div className="p-3 bg-muted/50 rounded-lg mb-3">
                          <strong className="text-sm block mb-1">
                            {answer.is_auto_graded ? '🤖 Feedback Automatico:' : '👤 Feedback Insegnante:'}
                          </strong>
                          <p className="text-sm whitespace-pre-wrap">{answer.feedback}</p>
                        </div>
                      )}
                      <details className="cursor-pointer">
                        <summary className="text-sm font-medium mb-2">Il Tuo Codice</summary>
                        <pre className="text-xs bg-code-bg p-3 rounded overflow-x-auto">
                          {answer.submitted_code}
                        </pre>
                      </details>
                    </div>
                  )}

                  {/* Answer Editor (for ungraded or new) */}
                  {(!answer || answer.grade === null) && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        {answer ? 'Modifica Risposta' : 'Scrivi la tua soluzione'}
                      </label>
                      <Textarea
                        value={currentCode}
                        onChange={(e) => handleUpdateCode(ex.id, e.target.value)}
                        rows={15}
                        className="font-mono text-sm"
                        placeholder="; Scrivi qui il tuo codice MicroASM..."
                        disabled={isGraded}
                      />

                      {answer && isEditing && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={cancelEdit}
                            disabled={submitting}
                          >
                            Annulla
                          </Button>
                          <Button
                            onClick={() => handleUpdateAnswer(answer.id)}
                            disabled={submitting || !currentCode.trim()}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {submitting ? 'Aggiornamento...' : 'Aggiorna Risposta'}
                          </Button>
                        </div>
                      )}

                      {answer && !isEditing && answer.grade === null && (
                        <Button
                          variant="outline"
                          onClick={() => startEditAnswer(answer)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifica
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>

          {/* Submit All Button */}
          {!latestSubmission && (
            <div className="mt-6 pt-6 border-t">
              <Button
                onClick={handleSubmitNew}
                disabled={submitting || Object.keys(exerciseCodes).length === 0}
                className="w-full"
                size="lg"
              >
                <Send className="w-5 h-5 mr-2" />
                {submitting ? 'Invio...' : 'Invia Tutte le Risposte'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};