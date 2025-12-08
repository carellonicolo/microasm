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
import { useTranslation } from '@/hooks/useTranslation';

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassCreated: () => void;
}

interface AcademicYearInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  hint: string;
}

const AcademicYearInput = ({ value, onChange, label, hint }: AcademicYearInputProps) => {
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
      <Label>{label} *</Label>
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
        {hint}
      </p>
    </div>
  );
};

export const CreateClassDialog = ({ open, onOpenChange, onClassCreated }: CreateClassDialogProps) => {
  const t = useTranslation();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [academicYear, setAcademicYear] = useState(() => {
    const currentYear = new Date().getFullYear();
    const month = new Date().getMonth();
    const startYear = month >= 8 ? currentYear : currentYear - 1;
    return `${startYear}/${startYear + 1}`;
  });
  const [loading, setLoading] = useState(false);

  const classSchema = z.object({
    name: z.string()
      .trim()
      .min(3, t.auth.validation.firstNameMin)
      .max(100),
    description: z.string()
      .trim()
      .max(1000)
      .optional(),
    academicYear: z.string()
      .trim()
      .regex(/^\d{4}\/\d{4}$/)
      .refine(
        (val) => {
          const [start, end] = val.split('/').map(Number);
          return end === start + 1;
        }
      ),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
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

      toast.success(t.classes.classCreated);
      setName('');
      setDescription('');
      const currentYear = new Date().getFullYear();
      const month = new Date().getMonth();
      const startYear = month >= 8 ? currentYear : currentYear - 1;
      setAcademicYear(`${startYear}/${startYear + 1}`);
      onOpenChange(false);
      onClassCreated();
    } catch (error: any) {
      toast.error(t.toasts.error + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.dialogs.createClass}</DialogTitle>
          <DialogDescription>
            {t.dialogs.enterClassDetails}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t.classes.className} *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.dialogs.classNamePlaceholder}
              required
            />
          </div>
          <AcademicYearInput
            value={academicYear}
            onChange={setAcademicYear}
            label={t.classes.academicYear}
            hint={t.dialogs.consecutiveYears}
          />
          <div>
            <Label htmlFor="description">{t.classes.description}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.dialogs.descriptionPlaceholder}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t.dialogs.creating : t.common.create + ' ' + t.classes.student.charAt(0).toUpperCase() + 'lasse'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};