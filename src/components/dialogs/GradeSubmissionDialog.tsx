import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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
      const { error } = await supabase
        .from('submissions')
        .update({
          grade: parseFloat(grade),
          feedback,
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
