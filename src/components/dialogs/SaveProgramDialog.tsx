import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useSavedPrograms } from '@/hooks/useSavedPrograms';

interface SaveProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
}

export const SaveProgramDialog = ({ open, onOpenChange, code }: SaveProgramDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveProgram } = useSavedPrograms();

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setLoading(true);
    const result = await saveProgram(name, code, description || undefined);
    setLoading(false);

    if (result) {
      setName('');
      setDescription('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salva Programma</DialogTitle>
          <DialogDescription>
            Salva il tuo programma assembly per riutilizzarlo in futuro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Programma *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Calcolo Fattoriale"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione (opzionale)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrizione di cosa fa il programma..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            {code.split('\n').length} righe di codice
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || loading}>
            {loading ? 'Salvataggio...' : 'Salva'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
