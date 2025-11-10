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
  name: z.string().trim().min(3, 'Il nome deve contenere almeno 3 caratteri').max(100, 'Il nome non può superare 100 caratteri'),
  description: z.string().trim().max(1000, 'La descrizione non può superare 1000 caratteri').optional(),
  academicYear: z.string().trim().min(4, 'Anno accademico non valido').max(20, 'Anno accademico non valido'),
});

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassCreated: () => void;
}

export const CreateClassDialog = ({ open, onOpenChange, onClassCreated }: CreateClassDialogProps) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
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
      setAcademicYear(new Date().getFullYear().toString());
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
          <div>
            <Label htmlFor="academicYear">Anno Accademico *</Label>
            <Input
              id="academicYear"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="es. 2024/2025"
              required
            />
          </div>
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
