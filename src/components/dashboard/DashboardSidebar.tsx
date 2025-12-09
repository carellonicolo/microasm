import { Link, useLocation } from 'react-router-dom';
import { Home, Code, Users, BookOpen, FileText, UserCog, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { useTranslation } from '@/hooks/useTranslation';

interface DashboardSidebarProps {
  userRole: 'student' | 'teacher' | null;
}

export const DashboardSidebar = ({ userRole }: DashboardSidebarProps) => {
  const location = useLocation();
  const t = useTranslation();

  const NAV_ITEMS: { label: string; href: string; icon: React.ElementType; roles: ('student' | 'teacher')[] }[] = [
    { label: t.sidebar.simulator, href: '/', icon: Home, roles: ['student', 'teacher'] },
    { label: t.sidebar.myPrograms, href: '/dashboard/programs', icon: Code, roles: ['student', 'teacher'] },
    { label: t.sidebar.myClasses, href: '/dashboard/classes', icon: Users, roles: ['student', 'teacher'] },
    { label: t.dashboard.assignments, href: '/dashboard/assignments', icon: FileText, roles: ['student', 'teacher'] },
    { label: t.profile.myProfile, href: '/dashboard/profile', icon: User, roles: ['student', 'teacher'] },
    { label: t.sidebar.exerciseRepository, href: '/dashboard/exercises', icon: BookOpen, roles: ['teacher'] },
    { label: t.sidebar.userManagement, href: '/dashboard/users', icon: UserCog, roles: ['teacher'] },
  ];

  const visibleItems = NAV_ITEMS.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 glass-card border-r border-border min-h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MicroASM
          </h2>
        </Link>
        {userRole && (
          <div className="mt-3">
            <RoleBadge role={userRole} />
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {t.common.poweredBy}{' '}
          <a 
            href="https://apps.nicolocarello.it" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline"
          >
            Prof. Nicolò Carello
          </a>
        </p>
      </div>
    </aside>
  );
};
