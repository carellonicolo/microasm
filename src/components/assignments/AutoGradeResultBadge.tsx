import { Badge } from '@/components/ui/badge';
import { Bot, User } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AutoGradeResultBadgeProps {
  isAutoGraded: boolean;
  grade: number;
  maxPoints: number;
  className?: string;
}

export const AutoGradeResultBadge = ({
  isAutoGraded,
  grade,
  maxPoints,
  className = ''
}: AutoGradeResultBadgeProps) => {
  const percentage = (grade / maxPoints) * 100;
  
  // Color based on percentage
  const getColorClass = () => {
    if (percentage >= 90) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (percentage >= 70) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (percentage >= 50) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    return 'bg-red-500/10 text-red-500 border-red-500/20';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${getColorClass()} flex items-center gap-1 border ${className}`}>
            {isAutoGraded ? (
              <Bot className="w-3 h-3" />
            ) : (
              <User className="w-3 h-3" />
            )}
            <span className="font-semibold">
              {grade}/{maxPoints}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {isAutoGraded 
              ? '🤖 Corretto automaticamente dal sistema' 
              : '👤 Corretto manualmente dall\'insegnante'
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
