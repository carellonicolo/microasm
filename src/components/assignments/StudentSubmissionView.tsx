import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Plus, Edit, CheckCircle2, Eye, FileCode } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useSavedPrograms } from '@/hooks/useSavedPrograms';
import { ViewCodeDialog } from '@/components/dialogs/ViewCodeDialog';

interface Submission {
  id: string;
  submitted_code: string;
  submitted_at: string;
  last_updated_at: string;
  status: 'not_submitted' | 'submitted' | 'graded';
  grade: number | null;
  max_grade: number | null;
  feedback: string | null;
  submission_number: number;
  is_final: boolean;
}

interface StudentSubmissionViewProps {
  mySubmissions: Submission[];
  isGraded: boolean;
  onCreateSubmission: (code: string) => Promise<boolean>;
  onUpdateSubmission: (submissionId: string, code: string) => Promise<boolean>;
  onMarkAsFinal: (submissionId: string) => Promise<boolean>;
}

export const StudentSubmissionView = ({
  mySubmissions,
  isGraded,
  onCreateSubmission,
  onUpdateSubmission,
  onMarkAsFinal
}: StudentSubmissionViewProps) => {
  const { programs } = useSavedPrograms();
  const [submittedCode, setSubmittedCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [viewCodeDialog, setViewCodeDialog] = useState<{ open: boolean; code: string; submissionNumber: number } | null>(null);

  const latestSubmission = mySubmissions[0];
  const finalSubmission = mySubmissions.find(s => s.is_final);

  const handleLoadFromSaved = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (program) {
      setSubmittedCode(program.code);
    }
  };

  const handleSubmit = async () => {
    if (!submittedCode.trim()) {
      return;
    }

    setSubmitting(true);
    let success = false;

    if (editingSubmissionId) {
      success = await onUpdateSubmission(editingSubmissionId, submittedCode);
    } else {
      success = await onCreateSubmission(submittedCode);
    }

    if (success) {
      setSubmittedCode('');
      setEditingSubmissionId(null);
    }
    setSubmitting(false);
  };

  const handleEdit = (submission: Submission) => {
    setEditingSubmissionId(submission.id);
    setSubmittedCode(submission.submitted_code);
  };

  const handleCancelEdit = () => {
    setEditingSubmissionId(null);
    setSubmittedCode('');
  };

  return (
    <div className="space-y-6">
      {/* Graded Submission Display */}
      {finalSubmission && finalSubmission.status === 'graded' && (
        <Card className="glass-card border-green-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Consegna Finale Corretta
              </CardTitle>
              <Badge className="bg-green-500/10 text-green-500">
                Consegna #{finalSubmission.submission_number}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Voto</span>
                <p className="text-3xl font-bold text-green-500">
                  {finalSubmission.grade}/{finalSubmission.max_grade}
                </p>
              </div>
            </div>
            {finalSubmission.feedback && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <span className="font-semibold block mb-2">Feedback del Docente:</span>
                <p className="text-sm">{finalSubmission.feedback}</p>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewCodeDialog({
                open: true,
                code: finalSubmission.submitted_code,
                submissionNumber: finalSubmission.submission_number
              })}
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizza Codice
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Submission History */}
      {mySubmissions.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Cronologia Consegne ({mySubmissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mySubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className={`p-4 rounded-lg border ${
                    submission.is_final
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Consegna #{submission.submission_number}</Badge>
                        {submission.is_final && (
                          <Badge className="bg-primary/10 text-primary">Finale</Badge>
                        )}
                        {submission.status === 'graded' && (
                          <Badge className="bg-green-500/10 text-green-500">
                            {submission.grade}/{submission.max_grade}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Consegnata {formatDistanceToNow(new Date(submission.submitted_at), {
                          addSuffix: true,
                          locale: it
                        })}
                        {submission.last_updated_at !== submission.submitted_at && (
                          <> • Modificata {formatDistanceToNow(new Date(submission.last_updated_at), {
                            addSuffix: true,
                            locale: it
                          })}</>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewCodeDialog({
                          open: true,
                          code: submission.submitted_code,
                          submissionNumber: submission.submission_number
                        })}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {submission.status !== 'graded' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(submission)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!submission.is_final && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onMarkAsFinal(submission.id)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Segna Finale
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New/Edit Submission Form */}
      {!isGraded && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingSubmissionId ? (
                <>
                  <Edit className="w-5 h-5" />
                  Modifica Consegna
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Nuova Consegna
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {programs.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Carica da Programmi Salvati
                </label>
                <Select onValueChange={handleLoadFromSaved}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un programma..." />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4" />
                          {program.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              />
            </div>

            <div className="flex gap-2">
              {editingSubmissionId && (
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                >
                  Annulla
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={submitting || !submittedCode.trim()}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting
                  ? 'Invio...'
                  : editingSubmissionId
                  ? 'Aggiorna Consegna'
                  : 'Invia Consegna'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {viewCodeDialog && (
        <ViewCodeDialog
          open={viewCodeDialog.open}
          onOpenChange={(open) => !open && setViewCodeDialog(null)}
          code={viewCodeDialog.code}
          submissionNumber={viewCodeDialog.submissionNumber}
        />
      )}
    </div>
  );
};
