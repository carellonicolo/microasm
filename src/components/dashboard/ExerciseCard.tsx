import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Exercise } from '@/hooks/useExercises';
import { BookOpen, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExerciseCardProps {
  exercise: Exercise;
  onLoadExercise: (exercise: Exercise) => void;
  showAssignButton?: boolean;
}

const getDifficultyVariant = (difficulty: string) => {
  switch (difficulty) {
    case 'principiante': return 'default';
    case 'intermedio': return 'secondary';
    case 'avanzato': return 'outline';
    case 'esperto': return 'destructive';
    case 'impossibile': return 'destructive';
    default: return 'default';
  }
};

const getDifficultyLabel = (difficulty: string) => {
  const labels: Record<string, string> = {
    'principiante': 'Principiante',
    'intermedio': 'Intermedio',
    'avanzato': 'Avanzato',
    'esperto': 'Esperto',
    'impossibile': 'Impossibile'
  };
  return labels[difficulty] || difficulty;
};

export const ExerciseCard = ({ exercise, onLoadExercise, showAssignButton = false }: ExerciseCardProps) => {
  const navigate = useNavigate();

  const handleLoadInEditor = () => {
    onLoadExercise(exercise);
    navigate('/');
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              {exercise.title}
            </CardTitle>
            <CardDescription className="mt-1">
              #{exercise.id} • {exercise.category}
            </CardDescription>
          </div>
          <Badge variant={getDifficultyVariant(exercise.difficulty)}>
            {getDifficultyLabel(exercise.difficulty)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {exercise.description}
        </p>
        
        {exercise.tags && exercise.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {exercise.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {exercise.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{exercise.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button 
          onClick={handleLoadInEditor} 
          size="sm" 
          className="flex-1 gap-2"
        >
          <Play className="w-4 h-4" />
          Carica nell'editor
        </Button>
        {showAssignButton && (
          <Button variant="outline" size="sm">
            Assegna
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};