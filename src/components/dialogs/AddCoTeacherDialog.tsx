import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, UserPlus } from 'lucide-react';
import { RoleBadge } from '@/components/shared/RoleBadge';

interface AddCoTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onCoTeacherAdded: () => void;
}

interface TeacherProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export const AddCoTeacherDialog = ({ open, onOpenChange, classId, onCoTeacherAdded }: AddCoTeacherDialogProps) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    setLoading(true);
    try {
      // Cerca utenti per email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .ilike('email', `%${searchEmail}%`)
        .limit(10);

      if (profileError) throw profileError;

      if (!profiles || profiles.length === 0) {
        toast.info('Nessun utente trovato');
        setSearchResults([]);
        return;
      }

      // Filtra solo i teacher
      const userIds = profiles.map(p => p.id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('user_id', userIds)
        .eq('role', 'teacher');

      const teacherIds = new Set(roles?.map(r => r.user_id) || []);
      const teachers = profiles.filter(p => teacherIds.has(p.id));

      // Escludi teacher già nella classe
      const { data: existingTeachers } = await supabase
        .from('class_teachers')
        .select('teacher_id')
        .eq('class_id', classId);

      const existingIds = new Set(existingTeachers?.map(t => t.teacher_id) || []);
      const availableTeachers = teachers.filter(t => !existingIds.has(t.id));

      setSearchResults(availableTeachers);
      
      if (availableTeachers.length === 0) {
        toast.info('Tutti gli insegnanti trovati sono già co-insegnanti di questa classe');
      }
    } catch (error: any) {
      toast.error('Errore nella ricerca: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoTeacher = async (teacherId: string) => {
    setAdding(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('class_teachers')
        .insert({
          class_id: classId,
          teacher_id: teacherId,
          added_by: currentUser.user?.id,
        });

      if (error) throw error;

      toast.success('Co-insegnante aggiunto alla classe');
      setSearchResults(prev => prev.filter(t => t.id !== teacherId));
      onCoTeacherAdded();
    } catch (error: any) {
      toast.error('Errore: ' + error.message);
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSearchEmail('');
      setSearchResults([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Aggiungi Co-Insegnante</DialogTitle>
          <DialogDescription>
            Cerca insegnanti per email e aggiungili come co-insegnanti della classe
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search">Email Insegnante</Label>
              <Input
                id="search"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Cerca per email..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} className="mt-6">
              <Search className="w-4 h-4 mr-2" />
              Cerca
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label>Insegnanti Disponibili</Label>
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {searchResults.map((teacher) => (
                  <div key={teacher.id} className="p-3 flex items-center justify-between hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{teacher.first_name} {teacher.last_name}</p>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      </div>
                      <RoleBadge role="teacher" />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddCoTeacher(teacher.id)}
                      disabled={adding}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Aggiungi
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
