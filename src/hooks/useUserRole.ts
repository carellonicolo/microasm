import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type UserRole = 'student' | 'teacher' | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<('student' | 'teacher')[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role, is_super_admin')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
        setIsSuperAdmin(false);
      } else if (data && data.length > 0) {
        const userRoles = data.map(r => r.role as 'student' | 'teacher');
        const isSuper = data.some(r => r.is_super_admin);
        
        setRoles(userRoles);
        setIsSuperAdmin(isSuper);
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  return { 
    roles,
    primaryRole: roles.includes('teacher') ? 'teacher' as UserRole : roles.includes('student') ? 'student' as UserRole : null,
    role: roles.includes('teacher') ? 'teacher' as UserRole : roles.includes('student') ? 'student' as UserRole : null,
    loading, 
    isTeacher: roles.includes('teacher'), 
    isStudent: roles.includes('student'),
    isSuperAdmin,
  };
};
