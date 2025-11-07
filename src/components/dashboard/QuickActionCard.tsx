import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  buttonText: string;
  variant?: 'default' | 'secondary';
}

export const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  onClick,
  buttonText,
  variant = 'default'
}: QuickActionCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
            variant === 'secondary' ? 'bg-secondary/10' : 'bg-primary/10'
          }`}>
            <Icon className={`h-6 w-6 ${variant === 'secondary' ? 'text-secondary-foreground' : 'text-primary'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClick}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
