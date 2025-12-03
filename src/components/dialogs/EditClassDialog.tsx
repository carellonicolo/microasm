import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const classSchema = z.object({
  name: z.string()
    .trim()
    .min(3, 'Il nome deve contenere almeno 3 caratteri')
    .max(100, 'Il nome non può superare 100 caratteri'),
  description: z.string()
    .trim()
    .max(1000, 'La descrizione non può superare 1000 caratteri')
    .optional(),
  academicYear: z.string()
    .trim()
    .regex(
      /^\d{4}\/\d{4}$/,
      'L\'anno accademico deve essere nel formato YYYY/YYYY (es. 2024/2025)'
    )
    .refine(
      (val) => {
        const [start, end] = val.split('/').map(Number);
        return end === start + 1;
      },
      'L\'anno accademico deve essere consecutivo (es. 2024/2025)'
    ),
});

interface AcademicYearInputProps {
  value: string;
  onChange: (value: string) => void;
}

const AcademicYearInput = ({ value, onChange }: AcademicYearInputProps) => {
  const [startYear, endYear] = value.split('/').map(y => y || '');

  const handleStartYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = e.target.value;
    if (/^\d{0,4}$/.test(start)) {
      const end = start.length === 4 ? String(Number(start) + 1) : '';
      onChange(end ? `${start}/${end}` : start);
    }
  };

  const handleEndYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const end = e.target.value;
    if (/^\d{0,4}$/.test(end)) {
      onChange(`${startYear}/${end}`);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Anno Accademico *</Label>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          inputMode="numeric"
          value={startYear}
          onChange={handleStartYearChange}
          placeholder="2024"
          maxLength={4}
          className="w-24"
          required
        />
        <span className="text-muted-foreground">/</span>
        <Input
          type="text"
          inputMode="numeric"
          value={endYear}
          onChange={handleEndYearChange}
          placeholder="2025"
          maxLength={4}
          className="w-24"
          required
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Gli anni devono essere consecutivi
      </p>
    </div>
  );
};

interface ClassData {
  id: string;
  name: string;
  description: string | null;
  academic_year: string;
}

interface EditClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: ClassData;
  onClassUpdated: () => void;
}

export const EditClassDialog = ({ open, onOpenChange, classData, onClassUpdated }: EditClassDialogProps) => {
  const [name, setName] = useState(classData.name);
  const [description, setDescription] = useState(classData.description || '');
  const [academicYear, setAcademicYear] = useState(classData.academic_year);
  const [loading, setLoading] = useState(false);

  // Reset form when classData changes
  useEffect(() => {
    setName(classData.name);
    setDescription(classData.description || '');
    setAcademicYear(classData.academic_year);
  }, [classData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Validate input data
      const validationResult = classSchema.safeParse({
        name,
        description: description || '',
        academicYear,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        toast.error(errors);
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('classes')
        .update({
          name: validationResult.data.name,
          description: validationResult.data.description || null,
          academic_year: validationResult.data.academicYear,
        })
        .eq('id', classData.id);

      if (error) throw error;

      toast.success('Classe aggiornata con successo');
      onOpenChange(false);
      onClassUpdated();
    } catch (error: any) {
      toast.error('Errore nell\'aggiornamento della classe: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica Classe</DialogTitle>
          <DialogDescription>
            Modifica i dettagli della classe
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nome Classe *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. 3A Informatica"
              required
            />
          </div>
          <AcademicYearInput
            value={academicYear}
            onChange={setAcademicYear}
          />
          <div>
            <Label htmlFor="edit-description">Descrizione</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrizione opzionale della classe"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvataggio...' : 'Salva Modifiche'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
