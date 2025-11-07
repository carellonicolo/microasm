import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Calendar, Trash2, Edit, Share2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface ProgramCardProps {
  program: {
    id: string;
    name: string;
    description: string | null;
    code: string;
    updated_at: string;
    is_public: boolean;
  };
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
}

export const ProgramCard = ({
  program,
  onOpen,
  onEdit,
  onDelete,
  onShare
}: ProgramCardProps) => {
  const lineCount = program.code.split('\n').length;
  const lastUpdated = formatDistanceToNow(new Date(program.updated_at), {
    addSuffix: true,
    locale: it
  });

  return (
    <Card className="p-5 glass-card hover:border-primary/50 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-primary flex-shrink-0" />
          <h3 className="font-semibold text-lg line-clamp-1">{program.name}</h3>
        </div>
        {program.is_public && (
          <Badge variant="secondary" className="text-xs gap-1">
            <Eye className="w-3 h-3" />
            Pubblico
          </Badge>
        )}
      </div>

      {program.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {program.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {lastUpdated}
        </span>
        <span>{lineCount} righe</span>
      </div>

      <div className="flex gap-2">
        <Button onClick={onOpen} size="sm" className="flex-1">
          Apri
        </Button>
        <Button onClick={onEdit} size="sm" variant="outline">
          <Edit className="w-4 h-4" />
        </Button>
        <Button onClick={onShare} size="sm" variant="outline">
          <Share2 className="w-4 h-4" />
        </Button>
        <Button onClick={onDelete} size="sm" variant="destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
