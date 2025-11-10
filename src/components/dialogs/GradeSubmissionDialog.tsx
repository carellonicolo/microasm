import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const gradeSchema = z.object({
  grade: z.number()
    .min(0, 'Il voto non può essere negativo')
    .max(100, 'Il voto non può superare 100'),
  feedback: z.string().trim().max(2000, 'Il feedback non può superare 2000 caratteri').optional(),
});

interface GradeSubmissionDialogProps {
  submission: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const GradeSubmissionDialog = ({ submission, open, onOpenChange, onSuccess }: GradeSubmissionDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState(submission.grade?.toString() || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Validate input data
      const gradeNum = parseFloat(grade);
      const maxGrade = submission.max_grade || 100;
      
      const validationResult = gradeSchema.safeParse({
        grade: gradeNum,
        feedback: feedback || '',
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        toast.error(errors);
        setLoading(false);
        return;
      }

      if (gradeNum > maxGrade) {
        toast.error(`Il voto non può superare ${maxGrade}`);
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('submissions')
        .update({
          grade: validationResult.data.grade,
          feedback: validationResult.data.feedback || null,
          status: 'graded',
          graded_by: user.id,
          graded_at: new Date().toISOString(),
        })
        .eq('id', submission.id);

      if (error) throw error;

      toast.success('Consegna corretta con successo');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Correggi Consegna</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Studente</Label>
            <p className="text-sm font-medium">
              {submission.profiles?.first_name} {submission.profiles?.last_name}
            </p>
          </div>

          <div>
            <Label htmlFor="grade">Voto (su {submission.max_grade})</Label>
            <Input
              id="grade"
              type="number"
              min="0"
              max={submission.max_grade}
              step="0.5"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Inserisci un feedback per lo studente..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvataggio...' : 'Salva Valutazione'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
