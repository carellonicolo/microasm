import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen } from 'lucide-react';

interface RoleBadgeProps {
  role: 'student' | 'teacher';
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  if (role === 'teacher') {
    return (
      <Badge variant="default" className="gap-1.5">
        <BookOpen className="w-3 h-3" />
        Insegnante
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1.5">
      <GraduationCap className="w-3 h-3" />
      Studente
    </Badge>
  );
};
