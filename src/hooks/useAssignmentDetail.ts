import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { toast } from 'sonner';

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

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_code: string;
  submitted_at: string;
  last_updated_at: string;
  status: 'not_submitted' | 'submitted' | 'graded';
  grade: number | null;
  max_grade: number | null;
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
}

export const useAssignmentDetail = (assignmentId: string | undefined) => {
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading } = useUserRole();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
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
          classes(name, academic_year),
          exercise_repository(*)
        `)
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;
      setAssignment(assignmentData);

      if (isTeacher) {
        // Teacher: carica tutte le submissions
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select(`
            *,
            profiles!submissions_student_id_fkey(first_name, last_name, email)
          `)
          .eq('assignment_id', assignmentId)
          .order('submitted_at', { ascending: false });

        if (submissionsError) throw submissionsError;
        setSubmissions(submissionsData || []);
      } else {
        // Student: carica solo le proprie submissions
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select('*')
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

  const createSubmission = useCallback(async (code: string) => {
    if (!user || !assignmentId) return false;

    try {
      const { error } = await supabase
        .from('submissions')
        .insert({
          assignment_id: assignmentId,
          student_id: user.id,
          submitted_code: code,
          status: 'submitted',
        });

      if (error) throw error;
      toast.success('Consegna inviata con successo');
      await fetchAssignment();
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  }, [user, assignmentId, fetchAssignment]);

  const updateSubmission = useCallback(async (submissionId: string, code: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          submitted_code: code,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) throw error;
      toast.success('Consegna aggiornata con successo');
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
    submissions,
    mySubmissions,
    loading,
    error,
    isTeacher,
    createSubmission,
    updateSubmission,
    markAsFinal,
    refetch: fetchAssignment,
  };
};
