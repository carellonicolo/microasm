import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, X, GripVertical, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import { AutoGradeToggle } from '@/components/assignments/AutoGradeToggle';

const assignmentSchema = z.object({
  title: z.string().trim().min(3, 'Il titolo deve contenere almeno 3 caratteri').max(200, 'Il titolo non può superare 200 caratteri'),
  description: z.string().trim().max(2000, 'La descrizione non può superare 2000 caratteri').optional(),
  class_id: z.string().uuid('Seleziona una classe valida'),
  exercises: z.array(z.object({
    repository_exercise_id: z.number(),
    max_points: z.number().min(1, 'Minimo 1 punto').max(1000, 'Massimo 1000 punti'),
    is_required: z.boolean()
  })).min(1, 'Aggiungi almeno un esercizio'),
  due_date: z.string().optional(),
});

interface SelectedExercise {
  id: number;
  title: string;
  difficulty: string;
  category: string;
  max_points: number;
  is_required: boolean;
}

interface CreateAssignmentDialogProps {
  onSuccess?: () => void;
}

export const CreateAssignmentDialog = ({ onSuccess }: CreateAssignmentDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_id: '',
    due_date: '',
    allow_late_submission: true,
    show_solution_after_deadline: false,
    auto_grade_enabled: false,
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

  const addExercise = (exercise: any) => {
    if (selectedExercises.some(e => e.id === exercise.id)) {
      toast.error('Esercizio già aggiunto');
      return;
    }

    setSelectedExercises([...selectedExercises, {
      id: exercise.id,
      title: exercise.title,
      difficulty: exercise.difficulty,
      category: exercise.category,
      max_points: 10,
      is_required: true
    }]);
    setSearchTerm('');
  };

  const removeExercise = (id: number) => {
    setSelectedExercises(selectedExercises.filter(e => e.id !== id));
  };

  const updateExercisePoints = (id: number, points: number) => {
    setSelectedExercises(selectedExercises.map(e => 
      e.id === id ? { ...e, max_points: points } : e
    ));
  };

  const updateExerciseRequired = (id: number, required: boolean) => {
    setSelectedExercises(selectedExercises.map(e => 
      e.id === id ? { ...e, is_required: required } : e
    ));
  };

  const totalPoints = selectedExercises.reduce((sum, e) => sum + e.max_points, 0);

  // Count exercises without expected output
  const exercisesWithoutOutput = selectedExercises.filter(ex => {
    const exercise = exercises.find(e => e.id === ex.id);
    return !exercise?.expected_output;
  }).length;

  const filteredExercises = exercises.filter(ex => 
    ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        exercises: selectedExercises.map((ex, index) => ({
          repository_exercise_id: ex.id,
          max_points: ex.max_points,
          is_required: ex.is_required
        })),
        due_date: formData.due_date,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        toast.error(errors);
        setLoading(false);
        return;
      }

      // Create assignment first
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .insert({
          title: validationResult.data.title,
          description: validationResult.data.description || null,
          exercise_type: 'repository',
          class_id: validationResult.data.class_id,
          teacher_id: user.id,
          due_date: validationResult.data.due_date || null,
          allow_late_submission: formData.allow_late_submission,
          show_solution_after_deadline: formData.show_solution_after_deadline,
          auto_grade_enabled: formData.auto_grade_enabled && exercisesWithoutOutput === 0,
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Insert assignment exercises
      const { error: exercisesError } = await supabase
        .from('assignment_exercises')
        .insert(
          validationResult.data.exercises.map((ex, index) => ({
            assignment_id: assignmentData.id,
            repository_exercise_id: ex.repository_exercise_id,
            display_order: index + 1,
            max_points: ex.max_points,
            is_required: ex.is_required
          }))
        );

      if (exercisesError) throw exercisesError;

      toast.success('Esercitazione assegnata con successo');
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        class_id: '',
        due_date: '',
        allow_late_submission: true,
        show_solution_after_deadline: false,
        auto_grade_enabled: false,
      });
      setSelectedExercises([]);
      setSearchTerm('');
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <DialogTitle>Crea Nuova Esercitazione Multi-Esercizio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
            <div className="space-y-4 max-w-full">
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
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="due_date">Scadenza (opzionale)</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow_late">Consegne in ritardo</Label>
                  <Switch
                    id="allow_late"
                    checked={formData.allow_late_submission}
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_late_submission: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show_solution">Soluzione dopo scadenza</Label>
                  <Switch
                    id="show_solution"
                    checked={formData.show_solution_after_deadline}
                    onCheckedChange={(checked) => setFormData({ ...formData, show_solution_after_deadline: checked })}
                  />
                </div>
              </div>

              {/* Auto-Grade Toggle */}
              <AutoGradeToggle
                enabled={formData.auto_grade_enabled}
                onToggle={(enabled) => setFormData({ ...formData, auto_grade_enabled: enabled })}
                exerciseCount={selectedExercises.length}
                exercisesWithoutOutput={exercisesWithoutOutput}
              />

              {/* Esercizi Selezionati */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-lg font-semibold">Esercizi Assegnati</Label>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    Totale: {totalPoints} punti
                  </Badge>
                </div>

                {selectedExercises.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>Nessun esercizio selezionato</p>
                    <p className="text-sm mt-1">Cerca e aggiungi esercizi dalla lista sotto</p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    {selectedExercises.map((exercise, index) => (
                      <div key={exercise.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{index + 1}. {exercise.title}</span>
                            <Badge variant="outline" className="text-xs">{exercise.difficulty}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{exercise.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max="1000"
                            value={exercise.max_points}
                            onChange={(e) => updateExercisePoints(exercise.id, parseInt(e.target.value) || 1)}
                            className="w-20 h-8 text-sm"
                          />
                          <span className="text-sm text-muted-foreground">pt</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExercise(exercise.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ricerca e Aggiunta Esercizi */}
                <div className="mt-4">
                  <Label className="mb-2">Cerca ed Aggiungi Esercizi</Label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca per titolo, categoria o difficoltà..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <ScrollArea className="h-[200px] border rounded-lg">
                    <div className="p-2 space-y-1">
                      {filteredExercises.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          Nessun esercizio trovato
                        </div>
                      ) : (
                        filteredExercises.map((ex) => {
                          const isSelected = selectedExercises.some(e => e.id === ex.id);
                          return (
                            <button
                              key={ex.id}
                              type="button"
                              onClick={() => addExercise(ex)}
                              disabled={isSelected}
                              className={`w-full text-left p-2 rounded-lg hover:bg-muted transition-colors ${
                                isSelected ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">#{ex.id} {ex.title}</span>
                                    <Badge variant="outline" className="text-xs">{ex.difficulty}</Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{ex.category}</span>
                                </div>
                                {!isSelected && (
                                  <Plus className="w-4 h-4 text-primary" />
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t bg-background">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading || selectedExercises.length === 0}>
              {loading ? 'Creazione...' : `Crea Esercitazione (${selectedExercises.length} esercizi)`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
