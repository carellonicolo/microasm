import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Download, TrendingUp, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface AssignmentExercise {
  id: string;
  display_order: number;
  max_points: number;
  exercise_repository?: {
    title: string;
  };
}

interface SubmissionAnswer {
  id: string;
  assignment_exercise_id: string;
  submitted_code: string;
  grade: number | null;
  feedback: string | null;
}

interface Submission {
  id: string;
  student_id: string;
  submitted_at: string;
  status: 'not_submitted' | 'submitted' | 'graded';
  total_grade: number | null;
  submission_number: number;
  is_final: boolean;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  submission_answers?: SubmissionAnswer[];
}

interface TeacherSubmissionViewMultiProps {
  assignmentExercises: AssignmentExercise[];
  submissions: Submission[];
  totalMaxPoints: number;
  onRefetch: () => void;
}

export const TeacherSubmissionViewMulti = ({
  assignmentExercises,
  submissions,
  totalMaxPoints,
  onRefetch
}: TeacherSubmissionViewMultiProps) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    answer: SubmissionAnswer;
    studentName: string;
    exerciseTitle: string;
  } | null>(null);
  const [gradeDialog, setGradeDialog] = useState<{
    open: boolean;
    answer: SubmissionAnswer;
    maxPoints: number;
    studentName: string;
    exerciseTitle: string;
  } | null>(null);
  const [grading, setGrading] = useState(false);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

  // Group submissions by student (keep final or latest)
  const studentSubmissions = useMemo(() => {
    const grouped = new Map<string, Submission>();
    submissions.forEach((sub) => {
      const existing = grouped.get(sub.student_id);
      if (!existing || sub.is_final || (!existing.is_final && sub.submission_number > existing.submission_number)) {
        grouped.set(sub.student_id, sub);
      }
    });
    return Array.from(grouped.values());
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return studentSubmissions.filter((submission) => {
      const studentName = submission.profiles
        ? `${submission.profiles.first_name} ${submission.profiles.last_name}`.toLowerCase()
        : '';
      const email = submission.profiles?.email?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      return studentName.includes(search) || email.includes(search);
    });
  }, [studentSubmissions, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredSubmissions.length;
    const graded = filteredSubmissions.filter(s => s.status === 'graded').length;
    const pending = total - graded;
    const avgGrade = graded > 0
      ? filteredSubmissions
          .filter(s => s.total_grade !== null)
          .reduce((sum, s) => sum + (s.total_grade || 0), 0) / graded
      : 0;
    return { total, graded, pending, avgGrade };
  }, [filteredSubmissions]);

  const handleViewCode = (answer: SubmissionAnswer, studentName: string, exerciseTitle: string) => {
    setViewDialog({ open: true, answer, studentName, exerciseTitle });
  };

  const handleOpenGrade = (answer: SubmissionAnswer, maxPoints: number, studentName: string, exerciseTitle: string) => {
    setGradeDialog({ open: true, answer, maxPoints, studentName, exerciseTitle });
    setGradeData({
      grade: answer.grade?.toString() || '',
      feedback: answer.feedback || ''
    });
  };

  const handleSubmitGrade = async () => {
    if (!gradeDialog || !user) return;

    const grade = parseFloat(gradeData.grade);
    if (isNaN(grade) || grade < 0 || grade > gradeDialog.maxPoints) {
      toast.error(`Il voto deve essere tra 0 e ${gradeDialog.maxPoints}`);
      return;
    }

    setGrading(true);
    try {
      const { error } = await supabase
        .from('submission_answers')
        .update({
          grade,
          feedback: gradeData.feedback.trim() || null,
          graded_at: new Date().toISOString(),
          graded_by: user.id
        })
        .eq('id', gradeDialog.answer.id);

      if (error) throw error;

      toast.success('Voto assegnato con successo');
      setGradeDialog(null);
      setGradeData({ grade: '', feedback: '' });
      onRefetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGrading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Studente', 'Email', ...assignmentExercises.map(ex => `Es. ${ex.display_order}`), 'Totale'];
    const rows = filteredSubmissions.map(sub => {
      const studentName = `"${sub.profiles?.first_name} ${sub.profiles?.last_name}"`;
      const email = sub.profiles?.email || '';
      const exerciseGrades = assignmentExercises.map(ex => {
        const answer = sub.submission_answers?.find(a => a.assignment_exercise_id === ex.id);
        return answer?.grade !== null ? `${answer.grade}/${ex.max_points}` : '-';
      });
      const total = sub.total_grade !== null ? `${sub.total_grade}/${totalMaxPoints}` : '-';
      return [studentName, email, ...exerciseGrades, total].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `consegne_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Totale Consegne</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Da Correggere</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Corrette</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{stats.graded}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Media Voti</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold flex items-center gap-2">
              {stats.avgGrade.toFixed(1)}/{totalMaxPoints}
              <TrendingUp className="w-5 h-5 text-primary" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Cerca studente per nome o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Esporta CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Consegne Studenti ({filteredSubmissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nessun risultato trovato' : 'Nessuna consegna ancora'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Studente</TableHead>
                    {assignmentExercises.map((ex) => (
                      <TableHead key={ex.id} className="text-center">
                        Es. {ex.display_order}
                        <br />
                        <span className="text-xs text-muted-foreground">({ex.max_points}pt)</span>
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Totale</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {submission.profiles?.first_name} {submission.profiles?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {submission.profiles?.email}
                          </p>
                        </div>
                      </TableCell>
                      {assignmentExercises.map((ex) => {
                        const answer = submission.submission_answers?.find(a => a.assignment_exercise_id === ex.id);
                        const hasCode = answer && answer.submitted_code.trim() !== '';
                        const isGraded = answer?.grade !== null;

                        return (
                          <TableCell key={ex.id} className="text-center">
                            {!hasCode ? (
                              <span className="text-muted-foreground">-</span>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                {isGraded ? (
                                  <Badge className="bg-green-500/10 text-green-500">
                                    {answer.grade}/{ex.max_points}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-orange-500/10 text-orange-500">
                                    Attesa
                                  </Badge>
                                )}
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewCode(answer, `${submission.profiles?.first_name} ${submission.profiles?.last_name}`, ex.exercise_repository?.title || `Esercizio ${ex.display_order}`)}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenGrade(answer, ex.max_points, `${submission.profiles?.first_name} ${submission.profiles?.last_name}`, ex.exercise_repository?.title || `Esercizio ${ex.display_order}`)}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        {submission.total_grade !== null ? (
                          <span className="font-semibold text-primary">
                            {submission.total_grade}/{totalMaxPoints}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(submission.submitted_at), {
                          addSuffix: true,
                          locale: it
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Code Dialog */}
      {viewDialog && (
        <Dialog open={viewDialog.open} onOpenChange={(open) => !open && setViewDialog(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Codice Consegnato</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {viewDialog.studentName} - {viewDialog.exerciseTitle}
              </p>
            </DialogHeader>
            <pre className="text-xs bg-code-bg p-4 rounded overflow-x-auto">
              {viewDialog.answer.submitted_code}
            </pre>
          </DialogContent>
        </Dialog>
      )}

      {/* Grade Dialog */}
      {gradeDialog && (
        <Dialog open={gradeDialog.open} onOpenChange={(open) => !open && setGradeDialog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Correggi Esercizio</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {gradeDialog.studentName} - {gradeDialog.exerciseTitle}
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Codice Consegnato</Label>
                <pre className="text-xs bg-code-bg p-3 rounded overflow-x-auto max-h-48">
                  {gradeDialog.answer.submitted_code}
                </pre>
              </div>

              <div>
                <Label htmlFor="grade">Voto (max {gradeDialog.maxPoints})</Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max={gradeDialog.maxPoints}
                  step="0.5"
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="feedback">Feedback (opzionale)</Label>
                <Textarea
                  id="feedback"
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  rows={4}
                  placeholder="Scrivi un feedback per lo studente..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setGradeDialog(null)} disabled={grading}>
                  Annulla
                </Button>
                <Button onClick={handleSubmitGrade} disabled={grading || !gradeData.grade}>
                  {grading ? 'Salvataggio...' : 'Salva Voto'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};