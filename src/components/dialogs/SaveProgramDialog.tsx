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
import { useTranslation } from '@/hooks/useTranslation';

interface SaveProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
}

export const SaveProgramDialog = ({ open, onOpenChange, code }: SaveProgramDialogProps) => {
  const t = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveProgram } = useSavedPrograms();

  const saveProgramSchema = z.object({
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(500).optional(),
    code: z.string().trim().min(1).max(50000)
  });

  const handleSave = async () => {
    const validation = saveProgramSchema.safeParse({
      name: name.trim(),
      description: description.trim() || undefined,
      code
    });

    if (!validation.success) {
      toast.error(t.toasts.error);
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
          <DialogTitle>{t.dialogs.saveProgram}</DialogTitle>
          <DialogDescription>
            {t.dialogs.programDescription}
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t.dialogs.programDescription}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            {code.split('\n').length} {t.dialogs.linesOfCode}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || loading}>
            {loading ? t.dialogs.saving : t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};