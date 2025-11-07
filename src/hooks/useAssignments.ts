import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  class_id: string;
  teacher_id: string;
  due_date: string | null;
  exercise_type: string;
  created_at: string;
  class_name?: string;
}

export const useAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user) {
        setAssignments([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          classes!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching assignments:', error);
      } else {
        const formattedData = data?.map(a => ({
          ...a,
          class_name: (a.classes as any)?.name
        })) || [];
        setAssignments(formattedData);
      }
      setLoading(false);
    };

    fetchAssignments();
  }, [user]);

  return { assignments, loading };
};
