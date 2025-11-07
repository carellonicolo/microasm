import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, XCircle, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface SubmissionCardProps {
  submission: any;
  onGrade?: () => void;
  onView?: () => void;
}

export const SubmissionCard = ({ submission, onGrade, onView }: SubmissionCardProps) => {
  const getStatusBadge = () => {
    switch (submission.status) {
      case 'graded':
        return (
          <Badge className="bg-green-500/10 text-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Corretta
          </Badge>
        );
      case 'submitted':
        return (
          <Badge className="bg-blue-500/10 text-blue-500">
            <Clock className="w-3 h-3 mr-1" />
            In attesa
          </Badge>
        );
      case 'returned':
        return (
          <Badge className="bg-orange-500/10 text-orange-500">
            <XCircle className="w-3 h-3 mr-1" />
            Da rivedere
          </Badge>
        );
      default:
        return <Badge variant="outline">Sconosciuto</Badge>;
    }
  };

  const studentName = submission.profiles 
    ? `${submission.profiles.first_name} ${submission.profiles.last_name}`
    : 'Studente';

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{studentName}</h3>
            <p className="text-xs text-muted-foreground">
              Consegnata {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true, locale: it })}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {submission.grade !== null && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              {submission.grade}/{submission.max_grade}
            </span>
          </div>
        )}
        
        {submission.feedback && (
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm">{submission.feedback}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onView} className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            Visualizza
          </Button>
          {submission.status === 'submitted' && onGrade && (
            <Button size="sm" onClick={onGrade} className="flex-1">
              Correggi
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
