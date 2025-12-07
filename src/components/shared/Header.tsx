import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from '../ThemeToggle';
import { LanguageToggle } from '../LanguageToggle';
import { GitHubLink } from '../GitHubLink';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEditor } from '@/contexts/EditorContext';
import { useTranslation } from '@/hooks/useTranslation';
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
  showSaveMenu?: boolean;
}

export const Header = ({ showSaveMenu = true }: HeaderProps) => {
  const { user, loading } = useAuth();
  const { currentProgram, isModified, code, saveCurrentProgram, closeProgram } = useEditor();
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const t = useTranslation();

  const handleSave = async () => {
    if (currentProgram) {
      await saveCurrentProgram();
    } else {
      setSaveAsOpen(true);
    }
  };

  const handleNewProgram = () => {
    if (isModified) {
      const confirm = window.confirm(t.header.unsavedChanges);
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
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t.common.poweredBy} Prof. Carello</p>
            </div>
          </Link>

          {/* Controls (destra) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Separatore visivo */}
            <div className="h-6 w-px bg-border hidden sm:block" />
            
            {/* Toggle Controls */}
            <div className="flex items-center gap-1">
              <LanguageToggle />
              <GitHubLink />
              <ThemeToggle />
            </div>
            
            {/* Separatore visivo */}
            <div className="h-6 w-px bg-border hidden sm:block" />
            
            {/* Auth Controls */}
            {loading ? (
              <div className="w-20 h-9 animate-pulse bg-muted rounded-md" />
            ) : user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link to="/auth?mode=login">
                  <Button variant="outline" size="sm">
                    {t.header.login}
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button size="sm">
                    {t.header.signup}
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
