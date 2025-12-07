import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from '../ThemeToggle';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEditor } from '@/contexts/EditorContext';
import { ExamplesDialog } from '@/components/ExamplesDialog';
import { SaveAsDialog } from '@/components/dialogs/SaveAsDialog';
import { Save, ChevronDown, FileText, FilePlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onLoadExample?: (code: string) => void;
}

export const Header = ({ onLoadExample }: HeaderProps) => {
  const { user, loading } = useAuth();
  const { currentProgram, isModified, code, saveCurrentProgram, closeProgram } = useEditor();
  const [saveAsOpen, setSaveAsOpen] = useState(false);

  const handleSave = async () => {
    if (currentProgram) {
      await saveCurrentProgram();
    } else {
      setSaveAsOpen(true);
    }
  };

  const handleNewProgram = () => {
    if (isModified) {
      const confirm = window.confirm(
        'Ci sono modifiche non salvate. Vuoi continuare senza salvare?'
      );
      if (!confirm) return;
    }
    closeProgram();
  };

  return (
    <>
      <header className="relative py-2">
        <div className="flex items-center justify-between">
          {/* Logo/Title (sinistra) */}
          <Link to="/">
            <div className="flex flex-col">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                MicroASM
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Powered by Prof. Carello</p>
            </div>
          </Link>

          {/* Auth Controls (destra) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Pulsante Esempi */}
            {onLoadExample && <ExamplesDialog onLoadExample={onLoadExample} />}

            {/* Menu Salvataggio (solo per utenti autenticati) */}
            {user && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1 sm:gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {currentProgram ? currentProgram.name : 'Salva'}
                        {isModified && ' *'}
                      </span>
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      {currentProgram ? 'Salva' : 'Salva...'}
                      {isModified && <span className="ml-1 text-xs text-muted-foreground">⌘S</span>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSaveAsOpen(true)}>
                      <FilePlus className="w-4 h-4 mr-2" />
                      Salva come...
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleNewProgram}>
                      <FileText className="w-4 h-4 mr-2" />
                      Nuovo programma
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            
            {/* Separatore visivo */}
            <div className="h-6 w-px bg-border hidden sm:block" />
            
            {/* Controlli tema e autenticazione */}
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

      <SaveAsDialog
        open={saveAsOpen}
        onOpenChange={setSaveAsOpen}
        code={code}
        defaultName={currentProgram ? `${currentProgram.name} (copia)` : ''}
        defaultDescription={currentProgram?.description || ''}
        onSaved={() => setSaveAsOpen(false)}
      />
    </>
  );
};