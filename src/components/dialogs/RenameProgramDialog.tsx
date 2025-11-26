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
      toast.error('Il nome non può essere vuoto');
      return;
    }

    if (trimmedName.length > 100) {
      toast.error('Nome troppo lungo (max 100 caratteri)');
      return;
    }

    if (trimmedName === currentName) {
      toast.info('Il nome non è cambiato');
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
          <DialogTitle>Rinomina Programma</DialogTitle>
          <DialogDescription>
            Modifica il nome del programma
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nuovo Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Calcolo Fattoriale v2"
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
            Annulla
          </Button>
          <Button onClick={handleRename} disabled={!name.trim() || loading}>
            {loading ? 'Rinomina...' : 'Rinomina'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
