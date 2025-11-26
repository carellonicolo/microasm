import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon, LayoutDashboard, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { RoleBadge } from './RoleBadge';
import { useUserRole } from '@/hooks/useUserRole';

interface UserMenuProps {
  user: User;
}

export const UserMenu = ({ user }: UserMenuProps) => {
  const navigate = useNavigate();
  const { role } = useUserRole();
  const [profile, setProfile] = useState<{ first_name: string; last_name: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
      
      if (data) setProfile(data);
    };

    fetchProfile();
  }, [user.id]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Errore durante il logout');
    } else {
      toast.success('Logout effettuato');
      navigate('/');
    }
  };

  const displayName = profile 
    ? `${profile.first_name} ${profile.last_name}`
    : user.email?.split('@')[0] || 'Utente';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserIcon className="w-4 h-4" />
          <span className="hidden md:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{displayName}</p>
              {role && <RoleBadge role={role} />}
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/dashboard/profile')} className="cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Il Mio Profilo
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
