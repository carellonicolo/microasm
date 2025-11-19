import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserWithRoles {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  roles: ('student' | 'teacher')[];
}

export const useAllUsers = () => {
  const { session, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchUsers = async () => {
      // Guard: aspetta che l'auth sia completamente caricato
      if (authLoading) {
        if (import.meta.env.DEV) {
          console.log('🔄 useAllUsers: Auth still loading, waiting...');
        }
        return;
      }

      // Guard: se non c'è sessione, resetta
      if (!session?.user) {
        if (import.meta.env.DEV) {
          console.log('🚫 useAllUsers: No session, resetting users');
        }
        setUsers([]);
        setLoading(false);
        return;
      }

      // Abort fetch precedenti
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);

      try {
        if (import.meta.env.DEV) {
          console.log('📥 useAllUsers: Fetching all users and roles...');
        }

        // Fetch tutti i ruoli
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');

        if (rolesError) {
          // Gestione errori specifici
          if (rolesError.code === 'PGRST301') {
            const retryKey = 'roles';
            retryCountRef.current[retryKey] = (retryCountRef.current[retryKey] || 0) + 1;
            
            if (retryCountRef.current[retryKey] <= 2) {
              if (import.meta.env.DEV) {
                console.warn(`⚠️ PGRST301 on roles, retry ${retryCountRef.current[retryKey]}/2...`);
              }
              setTimeout(() => fetchUsers(), 1000);
              return;
            }
          }
          
          if (rolesError.code !== 'PGRST116') {
            console.error('❌ Error fetching user roles:', rolesError);
          }
          setUsers([]);
          setLoading(false);
          return;
        }

        // Fetch tutti i profili (filtrati da RLS)
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, created_at')
          .order('created_at', { ascending: false });

        if (profilesError) {
          // Gestione errori specifici
          if (profilesError.code === 'PGRST301') {
            const retryKey = 'profiles';
            retryCountRef.current[retryKey] = (retryCountRef.current[retryKey] || 0) + 1;
            
            if (retryCountRef.current[retryKey] <= 2) {
              if (import.meta.env.DEV) {
                console.warn(`⚠️ PGRST301 on profiles, retry ${retryCountRef.current[retryKey]}/2...`);
              }
              setTimeout(() => fetchUsers(), 1000);
              return;
            }
          }
          
          if (profilesError.code !== 'PGRST116') {
            console.error('❌ Error fetching profiles:', profilesError);
          }
          setUsers([]);
          setLoading(false);
          return;
        }

        // Raggruppa ruoli per user_id
        const rolesMap = new Map<string, ('student' | 'teacher')[]>();
        rolesData?.forEach(({ user_id, role }) => {
          if (!rolesMap.has(user_id)) {
            rolesMap.set(user_id, []);
          }
          rolesMap.get(user_id)!.push(role as 'student' | 'teacher');
        });

        // Combina profili + ruoli
        const usersWithRoles: UserWithRoles[] = (profilesData || []).map(profile => ({
          ...profile,
          roles: rolesMap.get(profile.id) || [],
        }));

        if (import.meta.env.DEV) {
          console.log(`✅ useAllUsers: Loaded ${usersWithRoles.length} users`);
        }

        setUsers(usersWithRoles);
        setLoading(false);

        // Reset retry counter su successo
        retryCountRef.current = {};
      } catch (error: any) {
        if (error.name === 'AbortError') {
          if (import.meta.env.DEV) {
            console.log('🚫 useAllUsers: Fetch aborted');
          }
          return;
        }
        console.error('❌ Unexpected error in useAllUsers:', error);
        setUsers([]);
        setLoading(false);
      }
    };

    fetchUsers();

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [session?.user?.id, authLoading]);

  return { users, loading };
};
