import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Class {
  id: string;
  name: string;
  description: string | null;
  academic_year: string;
  teacher_id: string;
  is_archived: boolean;
  created_at: string;
  student_count?: number;
}

export const useClasses = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) {
        setClasses([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching classes:', error);
        }
      } else {
        setClasses(data || []);
      }
      setLoading(false);
    };

    fetchClasses();
  }, [user]);

  return { classes, loading };
};
