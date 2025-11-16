import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from '../ThemeToggle';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ExamplesDialog } from '@/components/ExamplesDialog';
import { ExercisesDialog } from '@/components/ExercisesDialog';
import { Save } from 'lucide-react';

interface HeaderProps {
  onLoadExample?: (code: string) => void;
  onLoadExercise?: (code: string) => void;
  onSaveProgram?: () => void;
}

export const Header = ({ onLoadExample, onLoadExercise, onSaveProgram }: HeaderProps) => {
  const {
    user,
    loading
  } = useAuth();
  return <header className="relative py-4">
      <div className="flex items-center justify-between">
        {/* Logo/Title (sinistra) */}
        <Link to="/">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            MicroASM
          </h1>
        </Link>

        {/* Auth Controls (destra) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Pulsanti Esempi ed Esercizi */}
          <div className="flex items-center gap-1 sm:gap-2">
            {onLoadExample && <ExamplesDialog onLoadExample={onLoadExample} />}
            {onLoadExercise && <ExercisesDialog onLoadExercise={onLoadExercise} />}
          </div>

          {/* Pulsante Salva (solo per utenti autenticati) */}
          {user && onSaveProgram && (
            <Button 
              onClick={onSaveProgram} 
              variant="outline" 
              size="sm"
              className="gap-1 sm:gap-2"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Salva</span>
            </Button>
          )}
          
          {/* Separatore visivo */}
          <div className="h-6 w-px bg-border hidden sm:block" />
          
          {/* Controlli tema e autenticazione */}
          <ThemeToggle />
          
          {loading ? <div className="w-20 h-9 animate-pulse bg-muted rounded-md" /> : user ? <UserMenu user={user} /> : <>
              <Link to="/auth?mode=login">
                <Button variant="outline" size="sm">
                  Accedi
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm">
                  Registrati
                </Button>
              </Link>
            </>}
        </div>
      </div>
    </header>;
};