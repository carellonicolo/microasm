import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type UserRole = 'student' | 'teacher' | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role, is_super_admin')
        .eq('user_id', user.id)
        .order('role', { ascending: true })
        .limit(1)
        .single();

      if (data) {
        setRole(data.role as UserRole);
        setIsSuperAdmin(data.is_super_admin || false);
      }
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  return { 
    role, 
    loading, 
    isTeacher: role === 'teacher', 
    isStudent: role === 'student',
    isSuperAdmin,
  };
};
