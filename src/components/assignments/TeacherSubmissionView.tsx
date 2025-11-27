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
import { Eye, Download, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { GradeSubmissionDialog } from '@/components/dialogs/GradeSubmissionDialog';
import { ViewCodeDialog } from '@/components/dialogs/ViewCodeDialog';

interface Submission {
  id: string;
  student_id: string;
  submitted_code: string;
  submitted_at: string;
  last_updated_at: string;
  status: 'not_submitted' | 'submitted' | 'graded';
  grade: number | null;
  max_grade: number | null;
  feedback: string | null;
  submission_number: number;
  is_final: boolean;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface TeacherSubmissionViewProps {
  submissions: Submission[];
  onRefetch: () => void;
}

export const TeacherSubmissionView = ({ submissions, onRefetch }: TeacherSubmissionViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [viewCodeDialog, setViewCodeDialog] = useState<{
    open: boolean;
    code: string;
    studentName: string;
    submissionNumber: number;
    submittedAt: string;
  } | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Group submissions by student and keep only final or latest
  const studentSubmissions = useMemo(() => {
    const grouped = new Map<string, Submission>();

    submissions.forEach((sub) => {
      const existing = grouped.get(sub.student_id);
      
      // Keep final submission or latest if no final exists
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
          .filter(s => s.grade !== null)
          .reduce((sum, s) => sum + (s.grade || 0), 0) / graded
      : 0;

    return { total, graded, pending, avgGrade };
  }, [filteredSubmissions]);

  const handleGrade = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeDialogOpen(true);
  };

  const handleViewCode = (submission: Submission) => {
    const studentName = submission.profiles
      ? `${submission.profiles.first_name} ${submission.profiles.last_name}`
      : 'Studente';

    setViewCodeDialog({
      open: true,
      code: submission.submitted_code,
      studentName,
      submissionNumber: submission.submission_number,
      submittedAt: submission.submitted_at,
    });
  };

  const handleExportCSV = () => {
    const csv = [
      ['Studente', 'Email', 'Consegna', 'Stato', 'Voto', 'Data Consegna'].join(','),
      ...filteredSubmissions.map(sub => [
        `"${sub.profiles?.first_name} ${sub.profiles?.last_name}"`,
        sub.profiles?.email || '',
        `#${sub.submission_number}${sub.is_final ? ' (Finale)' : ''}`,
        sub.status === 'graded' ? 'Corretta' : 'In attesa',
        sub.grade !== null ? `${sub.grade}/${sub.max_grade}` : '',
        new Date(sub.submitted_at).toLocaleDateString('it-IT')
      ].join(','))
    ].join('\n');

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
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totale Consegne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Da Correggere
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Corrette
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{stats.graded}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Media Voti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold flex items-center gap-2">
              {stats.avgGrade.toFixed(1)}
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
                    <TableHead>Consegna</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Voto</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">#{submission.submission_number}</span>
                          {submission.is_final && (
                            <Badge variant="outline" className="text-xs">
                              Finale
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(submission.submitted_at), {
                          addSuffix: true,
                          locale: it
                        })}
                      </TableCell>
                      <TableCell>
                        {submission.status === 'graded' ? (
                          <Badge className="bg-green-500/10 text-green-500">Corretta</Badge>
                        ) : (
                          <Badge className="bg-orange-500/10 text-orange-500">In attesa</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.grade !== null ? (
                          <span className="font-semibold text-primary">
                            {submission.grade}/{submission.max_grade}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCode(submission)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={submission.status === 'submitted' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleGrade(submission)}
                          >
                            {submission.status === 'graded' ? 'Modifica Voto' : 'Correggi'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedSubmission && (
        <GradeSubmissionDialog
          submission={selectedSubmission}
          open={gradeDialogOpen}
          onOpenChange={setGradeDialogOpen}
          onSuccess={onRefetch}
        />
      )}

      {viewCodeDialog && (
        <ViewCodeDialog
          open={viewCodeDialog.open}
          onOpenChange={(open) => !open && setViewCodeDialog(null)}
          code={viewCodeDialog.code}
          studentName={viewCodeDialog.studentName}
          submissionNumber={viewCodeDialog.submissionNumber}
          submittedAt={viewCodeDialog.submittedAt}
        />
      )}
    </div>
  );
};
