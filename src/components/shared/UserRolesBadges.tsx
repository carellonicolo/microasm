import { RoleBadge } from './RoleBadge';

interface UserRolesBadgesProps {
  roles: ('student' | 'teacher')[];
}

export const UserRolesBadges = ({ roles }: UserRolesBadgesProps) => {
  if (!roles || roles.length === 0) {
    return <span className="text-muted-foreground text-sm">Nessun ruolo</span>;
  }

  // Ordina: teacher prima di student
  const sortedRoles = [...roles].sort((a, b) => {
    if (a === 'teacher' && b === 'student') return -1;
    if (a === 'student' && b === 'teacher') return 1;
    return 0;
  });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {sortedRoles.map((role) => (
        <RoleBadge key={role} role={role} />
      ))}
    </div>
  );
};
