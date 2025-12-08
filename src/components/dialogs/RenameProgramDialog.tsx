import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSavedPrograms } from '@/hooks/useSavedPrograms';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

interface RenameProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  currentName: string;
}

export const RenameProgramDialog = ({ 
  open, 
  onOpenChange, 
  programId, 
  currentName 
}: RenameProgramDialogProps) => {
  const t = useTranslation();
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const { updateProgram } = useSavedPrograms();

  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  const handleRename = async () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      toast.error(t.auth.validation.firstNameMin);
      return;
    }

    if (trimmedName.length > 100) {
      toast.error('Max 100 characters');
      return;
    }

    if (trimmedName === currentName) {
      toast.info(t.common.noResults);
      onOpenChange(false);
      return;
    }

    setLoading(true);
    const success = await updateProgram(programId, { name: trimmedName });
    setLoading(false);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.programs.rename}</DialogTitle>
          <DialogDescription>
            {t.dialogs.renameTo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.dialogs.programName} *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.dialogs.programName}
              maxLength={100}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleRename} disabled={!name.trim() || loading}>
            {loading ? t.common.loading : t.programs.rename}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};