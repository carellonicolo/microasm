import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const assignmentSchema = z.object({
  title: z.string().trim().min(3, 'Il titolo deve contenere almeno 3 caratteri').max(200, 'Il titolo non può superare 200 caratteri'),
  description: z.string().trim().max(2000, 'La descrizione non può superare 2000 caratteri').optional(),
  class_id: z.string().uuid('Seleziona una classe valida'),
  repository_exercise_id: z.string().regex(/^\d+$/, 'Seleziona un esercizio valido'),
  due_date: z.string().optional(),
});

interface CreateAssignmentDialogProps {
  onSuccess?: () => void;
}

export const CreateAssignmentDialog = ({ onSuccess }: CreateAssignmentDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    exercise_type: 'repository',
    class_id: '',
    repository_exercise_id: '',
    due_date: '',
    allow_late_submission: true,
    show_solution_after_deadline: false,
  });

  const handleOpen = async () => {
    setOpen(true);
    // Carica classi dell'insegnante
    const { data: classesData } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', user?.id)
      .order('name');
    
    if (classesData) setClasses(classesData);

    // Carica esercizi dal repository
    const { data: exercisesData } = await supabase
      .from('exercise_repository')
      .select('*')
      .order('difficulty', { ascending: true });
    
    if (exercisesData) setExercises(exercisesData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Validate input data
      const validationResult = assignmentSchema.safeParse({
        title: formData.title,
        description: formData.description || '',
        class_id: formData.class_id,
        repository_exercise_id: formData.repository_exercise_id,
        due_date: formData.due_date,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        toast.error(errors);
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('assignments')
        .insert({
          title: validationResult.data.title,
          description: validationResult.data.description || null,
          exercise_type: formData.exercise_type,
          class_id: validationResult.data.class_id,
          teacher_id: user.id,
          repository_exercise_id: parseInt(validationResult.data.repository_exercise_id),
          due_date: validationResult.data.due_date || null,
          allow_late_submission: formData.allow_late_submission,
          show_solution_after_deadline: formData.show_solution_after_deadline,
        });

      if (error) throw error;

      toast.success('Esercitazione assegnata con successo');
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        exercise_type: 'repository',
        class_id: '',
        repository_exercise_id: '',
        due_date: '',
        allow_late_submission: true,
        show_solution_after_deadline: false,
      });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleOpen}>
          <Plus className="w-4 h-4 mr-2" />
          Nuova Esercitazione
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crea Nuova Esercitazione</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titolo</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="class">Classe</Label>
            <Select value={formData.class_id} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona classe" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} - {cls.academic_year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="exercise">Esercizio dal Repository</Label>
            <Select value={formData.repository_exercise_id} onValueChange={(value) => setFormData({ ...formData, repository_exercise_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona esercizio" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((ex) => (
                  <SelectItem key={ex.id} value={ex.id.toString()}>
                    #{ex.id} - {ex.title} ({ex.difficulty})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="due_date">Scadenza (opzionale)</Label>
            <Input
              id="due_date"
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="allow_late">Consenti consegne in ritardo</Label>
            <Switch
              id="allow_late"
              checked={formData.allow_late_submission}
              onCheckedChange={(checked) => setFormData({ ...formData, allow_late_submission: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show_solution">Mostra soluzione dopo scadenza</Label>
            <Switch
              id="show_solution"
              checked={formData.show_solution_after_deadline}
              onCheckedChange={(checked) => setFormData({ ...formData, show_solution_after_deadline: checked })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creazione...' : 'Crea Esercitazione'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
