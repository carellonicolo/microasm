import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Exercise {
  id: number;
  title: string;
  difficulty: 'principiante' | 'intermedio' | 'avanzato' | 'esperto' | 'impossibile';
  category: string;
  description: string;
  requirements: string[];
  expectedOutput?: string;
  tags?: string[];
}

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercise_repository')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      const mappedExercises: Exercise[] = data.map(ex => ({
        id: ex.id,
        title: ex.title,
        difficulty: ex.difficulty as Exercise['difficulty'],
        category: ex.category,
        description: ex.description,
        requirements: Array.isArray(ex.requirements) 
          ? (ex.requirements as any[]).map(r => typeof r === 'string' ? r : String(r))
          : [],
        expectedOutput: ex.expected_output || undefined,
        tags: ex.tags || []
      }));

      setExercises(mappedExercises);
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error fetching exercises:', error);
      }
      toast.error('Errore nel caricamento degli esercizi');
    } finally {
      setLoading(false);
    }
  };

  return { exercises, loading, refetch: fetchExercises };
};

export const generateExerciseTemplate = (exercise: Exercise): string => {
  return `; ========================================
; ESERCIZIO ${exercise.id}: ${exercise.title.toUpperCase()}
; Difficoltà: ${exercise.difficulty.toUpperCase()}
; ========================================
;
; CONSEGNA:
; ${exercise.description}
;
; REQUISITI:
${exercise.requirements.map(req => `; - ${req}`).join('\n')}
;
; OUTPUT ATTESO:
; ${exercise.expectedOutput || 'Vedi descrizione'}
;
; ========================================
; SCRIVI IL TUO CODICE QUI SOTTO:
; ========================================

; Il tuo codice qui...

HLT  ; Non dimenticare di terminare il programma!
`;
};