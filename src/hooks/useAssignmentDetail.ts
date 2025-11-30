import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { toast } from 'sonner';

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
    solution_code: string;
  };
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  class_id: string;
  teacher_id: string;
  due_date: string | null;
  exercise_type: string;
  allow_late_submission: boolean;
  show_solution_after_deadline: boolean;
  created_at: string;
  classes?: {
    name: string;
    academic_year: string;
  };
  assignment_exercises?: AssignmentExercise[];
}

interface SubmissionAnswer {
  id: string;
  assignment_exercise_id: string;
  submitted_code: string;
  grade: number | null;
  feedback: string | null;
  graded_at: string | null;
  graded_by: string | null;
  created_at: string;
  updated_at: string;
  is_auto_graded: boolean;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_code: string | null;
  submitted_at: string;
  last_updated_at: string;
  status: 'not_submitted' | 'submitted' | 'graded';
  grade: number | null;
  max_grade: number | null;
  total_grade: number | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
  submission_number: number;
  is_final: boolean;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  submission_answers?: SubmissionAnswer[];
}

export const useAssignmentDetail = (assignmentId: string | undefined) => {
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading } = useUserRole();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [assignmentExercises, setAssignmentExercises] = useState<AssignmentExercise[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignment = useCallback(async () => {
    if (!assignmentId || !user || authLoading || roleLoading) return;

    try {
      setLoading(true);
      setError(null);

      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .select(`
          *,
          classes(name, academic_year)
        `)
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;
      setAssignment(assignmentData);

      // Fetch assignment exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('assignment_exercises')
        .select(`
          *,
          exercise_repository(*)
        `)
        .eq('assignment_id', assignmentId)
        .order('display_order', { ascending: true });

      if (exercisesError) throw exercisesError;
      setAssignmentExercises(exercisesData || []);

      if (isTeacher) {
        // Teacher: carica tutte le submissions con submission_answers
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select(`
            *,
            profiles!submissions_student_id_fkey(first_name, last_name, email),
            submission_answers(*)
          `)
          .eq('assignment_id', assignmentId)
          .order('submitted_at', { ascending: false });

        if (submissionsError) throw submissionsError;
        setSubmissions(submissionsData || []);
      } else {
        // Student: carica solo le proprie submissions con submission_answers
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select(`
            *,
            submission_answers(*)
          `)
          .eq('assignment_id', assignmentId)
          .eq('student_id', user.id)
          .order('submission_number', { ascending: false });

        if (submissionsError) throw submissionsError;
        setMySubmissions(submissionsData || []);
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error fetching assignment:', error);
      }
      setError(error.message);
      toast.error('Errore nel caricamento dell\'esercitazione');
    } finally {
      setLoading(false);
    }
  }, [assignmentId, user, isTeacher, authLoading, roleLoading]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  const createSubmission = useCallback(async (exerciseAnswers: { assignment_exercise_id: string; code: string }[]) => {
    if (!user || !assignmentId) return false;

    try {
      // Create submission first
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          assignment_id: assignmentId,
          student_id: user.id,
          status: 'submitted',
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Insert submission answers
      const { error: answersError } = await supabase
        .from('submission_answers')
        .insert(
          exerciseAnswers.map(answer => ({
            submission_id: submissionData.id,
            assignment_exercise_id: answer.assignment_exercise_id,
            submitted_code: answer.code
          }))
        );

      if (answersError) throw answersError;

      toast.success('Consegna inviata con successo');
      await fetchAssignment();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  }, [user, assignmentId, fetchAssignment]);

  const updateSubmissionAnswer = useCallback(async (answerId: string, code: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('submission_answers')
        .update({
          submitted_code: code,
          updated_at: new Date().toISOString(),
        })
        .eq('id', answerId);

      if (error) throw error;
      toast.success('Risposta aggiornata con successo');
      await fetchAssignment();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  }, [user, fetchAssignment]);

  const markAsFinal = useCallback(async (submissionId: string) => {
    if (!user) return false;

    try {
      // Prima rimuovi il flag is_final da tutte le altre submissions
      await supabase
        .from('submissions')
        .update({ is_final: false })
        .eq('assignment_id', assignmentId)
        .eq('student_id', user.id);

      // Poi imposta is_final sulla submission selezionata
      const { error } = await supabase
        .from('submissions')
        .update({ is_final: true })
        .eq('id', submissionId);

      if (error) throw error;
      toast.success('Consegna marcata come finale');
      await fetchAssignment();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  }, [user, assignmentId, fetchAssignment]);

  return {
    assignment,
    assignmentExercises,
    submissions,
    mySubmissions,
    loading,
    error,
    isTeacher,
    createSubmission,
    updateSubmissionAnswer,
    markAsFinal,
    refetch: fetchAssignment,
  };
};
