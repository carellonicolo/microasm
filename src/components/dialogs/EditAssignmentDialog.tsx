import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BookOpen, Search, Plus, X, Check, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditAssignmentDialogProps {
  assignmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface SelectedExercise {
  id: number;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  points: number;
  required: boolean;
  assignmentExerciseId?: string; // ID esistente in assignment_exercises
}

export const EditAssignmentDialog = ({ assignmentId, open, onOpenChange, onSuccess }: EditAssignmentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_id: '',
    due_date: '',
    allow_late_submission: true,
    show_solution_after_deadline: false,
  });

  // Carica dati esistenti
  useEffect(() => {
    if (open && assignmentId) {
      loadAssignmentData();
      loadClasses();
      loadExercises();
    }
  }, [open, assignmentId]);

  const loadAssignmentData = async () => {
    setLoadingData(true);
    try {
      // Carica assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;

      // Carica esercizi associati
      const { data: assignmentExercises, error: exercisesError } = await supabase
        .from('assignment_exercises')
        .select(`
          *,
          exercise_repository(id, title, difficulty, category, description)
        `)
        .eq('assignment_id', assignmentId)
        .order('display_order');

      if (exercisesError) throw exercisesError;

      // Conta submissions
      const { count } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('assignment_id', assignmentId);

      setSubmissionsCount(count || 0);

      // Popola form
      setFormData({
        title: assignment.title,
        description: assignment.description || '',
        class_id: assignment.class_id,
        due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : '',
        allow_late_submission: assignment.allow_late_submission,
        show_solution_after_deadline: assignment.show_solution_after_deadline,
      });

      // Popola esercizi selezionati
      const selected = assignmentExercises?.map((ae: any, index: number) => ({
        id: ae.exercise_repository.id,
        title: ae.exercise_repository.title,
        difficulty: ae.exercise_repository.difficulty,
        category: ae.exercise_repository.category,
        description: ae.exercise_repository.description,
        points: ae.max_points,
        required: ae.is_required,
        assignmentExerciseId: ae.id,
      })) || [];

      setSelectedExercises(selected);
    } catch (error: any) {
      toast.error('Errore nel caricamento dei dati');
      if (import.meta.env.DEV) console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadClasses = async () => {
    const { data } = await supabase
      .from('classes')
      .select('*')
      .eq('is_archived', false)
      .order('name');
    setClasses(data || []);
  };

  const loadExercises = async () => {
    const { data } = await supabase
      .from('exercise_repository')
      .select('*')
      .order('title');
    setExercises(data || []);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'principiante': return 'bg-green-500/10 text-green-500';
      case 'intermedio': return 'bg-yellow-500/10 text-yellow-500';
      case 'avanzato': return 'bg-orange-500/10 text-orange-500';
      case 'esperto': return 'bg-red-500/10 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const addExercise = (exercise: any) => {
    setSelectedExercises(prev => [...prev, {
      id: exercise.id,
      title: exercise.title,
      difficulty: exercise.difficulty,
      category: exercise.category,
      description: exercise.description,
      points: 10,
      required: true,
    }]);
  };

  const removeExercise = (exerciseId: number) => {
    setSelectedExercises(prev => prev.filter(e => e.id !== exerciseId));
  };

  const updateExercisePoints = (exerciseId: number, points: number) => {
    setSelectedExercises(prev => prev.map(e => 
      e.id === exerciseId ? { ...e, points } : e
    ));
  };

  const updateExerciseRequired = (exerciseId: number, required: boolean) => {
    setSelectedExercises(prev => prev.map(e => 
      e.id === exerciseId ? { ...e, required } : e
    ));
  };

  const filteredExercises = exercises.filter(ex =>
    ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    // Validazione
    if (!formData.title.trim()) {
      toast.error('Inserisci un titolo per l\'esercitazione');
      return;
    }
    if (!formData.class_id) {
      toast.error('Seleziona una classe');
      return;
    }
    if (selectedExercises.length === 0) {
      toast.error('Aggiungi almeno un esercizio');
      return;
    }

    setLoading(true);
    try {
      // Update assignment
      const { error: updateError } = await supabase
        .from('assignments')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          class_id: formData.class_id,
          due_date: formData.due_date || null,
          allow_late_submission: formData.allow_late_submission,
          show_solution_after_deadline: formData.show_solution_after_deadline,
          exercise_type: 'multiple',
        })
        .eq('id', assignmentId);

      if (updateError) throw updateError;

      // Gestione esercizi: trova quelli da aggiungere, aggiornare, rimuovere
      const existingIds = selectedExercises
        .filter(e => e.assignmentExerciseId)
        .map(e => e.assignmentExerciseId!);

      // Carica tutti gli assignment_exercises esistenti
      const { data: currentExercises } = await supabase
        .from('assignment_exercises')
        .select('id')
        .eq('assignment_id', assignmentId);

      const currentIds = currentExercises?.map(e => e.id) || [];
      const toDelete = currentIds.filter(id => !existingIds.includes(id));

      // Delete rimossi
      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('assignment_exercises')
          .delete()
          .in('id', toDelete);

        if (deleteError) throw deleteError;
      }

      // Update/Insert esercizi
      for (let i = 0; i < selectedExercises.length; i++) {
        const exercise = selectedExercises[i];
        
        if (exercise.assignmentExerciseId) {
          // Update esistente
          const { error: updateExError } = await supabase
            .from('assignment_exercises')
            .update({
              display_order: i + 1,
              max_points: exercise.points,
              is_required: exercise.required,
            })
            .eq('id', exercise.assignmentExerciseId);

          if (updateExError) throw updateExError;
        } else {
          // Insert nuovo
          const { error: insertExError } = await supabase
            .from('assignment_exercises')
            .insert({
              assignment_id: assignmentId,
              repository_exercise_id: exercise.id,
              display_order: i + 1,
              max_points: exercise.points,
              is_required: exercise.required,
            });

          if (insertExError) throw insertExError;
        }
      }

      toast.success('Esercitazione aggiornata con successo!');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error('Errore nell\'aggiornamento dell\'esercitazione');
      if (import.meta.env.DEV) console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <DialogTitle>Modifica Esercitazione</DialogTitle>
          <DialogDescription>
            Aggiorna gli esercizi e le impostazioni dell'esercitazione
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {submissionsCount > 0 && (
              <Alert className="mx-6 mt-4 shrink-0">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Questa esercitazione ha {submissionsCount} consegne. Modificandola potresti invalidare le risposte esistenti.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
              <div className="space-y-6 max-w-full">
                {/* Titolo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titolo Esercitazione *</label>
                  <Input
                    placeholder="Es: Verifica sulle Strutture di Controllo"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                {/* Descrizione */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrizione</label>
                  <Textarea
                    placeholder="Descrizione dettagliata dell'esercitazione..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Classe e Scadenza */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Classe *</label>
                    <Select
                      value={formData.class_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: value }))}
                      disabled={submissionsCount > 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} - {cls.academic_year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {submissionsCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Non puoi cambiare classe perché ci sono già consegne
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Scadenza</label>
                    <Input
                      type="datetime-local"
                      value={formData.due_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Opzioni aggiuntive */}
                <div className="space-y-3 p-4 glass-card rounded-lg">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Permetti consegne in ritardo</label>
                    <Switch
                      checked={formData.allow_late_submission}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, allow_late_submission: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Mostra soluzione dopo scadenza</label>
                    <Switch
                      checked={formData.show_solution_after_deadline}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, show_solution_after_deadline: checked }))
                      }
                    />
                  </div>
                </div>

                {/* Esercizi Assegnati */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide">Esercizi Assegnati</h3>
                    <Badge variant="outline">{selectedExercises.length} esercizi</Badge>
                  </div>

                  {selectedExercises.length === 0 ? (
                    <div className="p-8 text-center glass-card rounded-lg">
                      <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nessun esercizio selezionato. Cerca e aggiungi esercizi qui sotto.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedExercises.map((exercise, index) => (
                        <div key={exercise.id} className="p-3 glass-card rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{exercise.title}</h4>
                                  <Badge className={getDifficultyColor(exercise.difficulty)} variant="outline">
                                    {exercise.difficulty}
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExercise(exercise.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <label className="text-xs text-muted-foreground">Punti:</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={exercise.points}
                                    onChange={(e) => updateExercisePoints(exercise.id, parseInt(e.target.value) || 0)}
                                    className="w-20 h-8 text-sm"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`required-${exercise.id}`}
                                    checked={exercise.required}
                                    onCheckedChange={(checked) => updateExerciseRequired(exercise.id, checked as boolean)}
                                  />
                                  <label htmlFor={`required-${exercise.id}`} className="text-xs text-muted-foreground cursor-pointer">
                                    Obbligatorio
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cerca ed Aggiungi Esercizi */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide">Cerca ed Aggiungi Esercizi</h3>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca esercizi per titolo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <ScrollArea className="h-[300px] glass-card rounded-lg p-3">
                    {filteredExercises.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          Nessun esercizio trovato
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredExercises.map((exercise) => {
                          const isSelected = selectedExercises.some(e => e.id === exercise.id);
                          return (
                            <div key={exercise.id} className="p-3 bg-background/50 rounded-lg hover:bg-background/80 transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm mb-1">{exercise.title}</h4>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={getDifficultyColor(exercise.difficulty)} variant="outline">
                                      {exercise.difficulty}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{exercise.category}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {exercise.description}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant={isSelected ? "secondary" : "default"}
                                  onClick={() => isSelected ? removeExercise(exercise.id) : addExercise(exercise)}
                                  disabled={isSelected}
                                >
                                  {isSelected ? (
                                    <>
                                      <Check className="w-3 h-3 mr-1" />
                                      Aggiunto
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3 mr-1" />
                                      Aggiungi
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t bg-background">
              <div className="text-sm font-semibold">
                TOTALE PUNTI: {selectedExercises.reduce((sum, ex) => sum + ex.points, 0)}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Annulla
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Salvataggio...' : 'Salva Modifiche'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
