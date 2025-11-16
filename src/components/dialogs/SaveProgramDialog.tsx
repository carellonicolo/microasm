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
import { z } from 'zod';
import { toast } from 'sonner';

const saveProgramSchema = z.object({
  name: z.string().trim().min(1, 'Nome richiesto').max(100, 'Nome troppo lungo (max 100 caratteri)'),
  description: z.string().trim().max(500, 'Descrizione troppo lunga (max 500 caratteri)').optional(),
  code: z.string().trim().min(1, 'Codice richiesto').max(50000, 'Codice troppo lungo (max 50000 caratteri)')
});

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
    // Validate input
    const validation = saveProgramSchema.safeParse({
      name: name.trim(),
      description: description.trim() || undefined,
      code
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);
    const result = await saveProgram(
      validation.data.name,
      validation.data.code,
      validation.data.description
    );
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
