import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassCreated: () => void;
}

export const CreateClassDialog = ({ open, onOpenChange, onClassCreated }: CreateClassDialogProps) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [academicYear, setAcademicYear] = useState(() => {
    const currentYear = new Date().getFullYear();
    const month = new Date().getMonth();
    // Se siamo dopo settembre, usa anno corrente/successivo
    // Altrimenti usa anno precedente/corrente
    const startYear = month >= 8 ? currentYear : currentYear - 1; // 8 = settembre
    return `${startYear}/${startYear + 1}`;
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
        .insert({
          name: validationResult.data.name,
          description: validationResult.data.description || null,
          academic_year: validationResult.data.academicYear,
          teacher_id: user.id,
        });

      if (error) throw error;

      toast.success('Classe creata con successo');
      setName('');
      setDescription('');
      const currentYear = new Date().getFullYear();
      const month = new Date().getMonth();
      const startYear = month >= 8 ? currentYear : currentYear - 1;
      setAcademicYear(`${startYear}/${startYear + 1}`);
      onOpenChange(false);
      onClassCreated();
    } catch (error: any) {
      toast.error('Errore nella creazione della classe: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crea Nuova Classe</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli della nuova classe
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Classe *</Label>
            <Input
              id="name"
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
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
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
              {loading ? 'Creazione...' : 'Crea Classe'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
