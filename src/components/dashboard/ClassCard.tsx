import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, BookOpen, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClassCardProps {
  classData: {
    id: string;
    name: string;
    description: string | null;
    academic_year: string;
    student_count?: number;
    assignment_count?: number;
    is_archived: boolean;
  };
  isTeacher: boolean;
  onDelete?: (id: string) => void;
}

export const ClassCard = ({ classData, isTeacher, onDelete }: ClassCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader onClick={() => navigate(`/dashboard/classes/${classData.id}`)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="group-hover:text-primary transition-colors">
              {classData.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {classData.description || 'Nessuna descrizione'}
            </CardDescription>
          </div>
          {classData.is_archived && (
            <Badge variant="secondary">Archiviata</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent onClick={() => navigate(`/dashboard/classes/${classData.id}`)}>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{classData.academic_year}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{classData.student_count || 0} studenti</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>{classData.assignment_count || 0} esercitazioni</span>
          </div>
        </div>
        {isTeacher && onDelete && (
          <div className="mt-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(classData.id)}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Elimina Classe
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
