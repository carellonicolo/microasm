import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface AssignmentCardProps {
  assignment: any;
  onClick?: () => void;
  submissionStatus?: 'submitted' | 'graded' | 'pending' | null;
}

export const AssignmentCard = ({ assignment, onClick, submissionStatus }: AssignmentCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'principiante': return 'bg-green-500/10 text-green-500';
      case 'intermedio': return 'bg-yellow-500/10 text-yellow-500';
      case 'avanzato': return 'bg-orange-500/10 text-orange-500';
      case 'esperto': return 'bg-red-500/10 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadge = () => {
    if (submissionStatus === 'graded') {
      return <Badge className="bg-green-500/10 text-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Corretta</Badge>;
    }
    if (submissionStatus === 'submitted') {
      return <Badge className="bg-blue-500/10 text-blue-500"><Clock className="w-3 h-3 mr-1" />In attesa</Badge>;
    }
    if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
      return <Badge variant="destructive">Scaduta</Badge>;
    }
    return <Badge variant="outline">Da consegnare</Badge>;
  };

  return (
    <Card 
      className="glass-card hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {assignment.title}
          </CardTitle>
          {submissionStatus && getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {assignment.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {assignment.description}
          </p>
        )}
        
        {assignment.exercise_repository && (
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(assignment.exercise_repository.difficulty)}>
              {assignment.exercise_repository.difficulty}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {assignment.exercise_repository.category}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          {assignment.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDistanceToNow(new Date(assignment.due_date), { addSuffix: true, locale: it })}
            </div>
          )}
          {assignment.submission_count !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {assignment.submission_count} consegne
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
