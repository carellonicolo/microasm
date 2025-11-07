import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from '../ThemeToggle';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const Header = () => {
  const { user, loading } = useAuth();

  return (
    <header className="relative py-4">
      <div className="flex items-center justify-between">
        {/* Logo/Title (sinistra) */}
        <Link to="/">
          <h1 className="text-4xl md:text-5xl font-bold font-heading bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            MicroASM
          </h1>
        </Link>

        {/* Auth Controls (destra) */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {loading ? (
            <div className="w-20 h-9 animate-pulse bg-muted rounded-md" />
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
};
