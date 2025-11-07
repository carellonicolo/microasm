import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, UserPlus } from 'lucide-react';

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onStudentAdded: () => void;
}

interface StudentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export const AddStudentDialog = ({ open, onOpenChange, classId, onStudentAdded }: AddStudentDialogProps) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    setLoading(true);
    try {
      // Cerca studenti per email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .ilike('email', `%${searchEmail}%`)
        .limit(10);

      if (profileError) throw profileError;

      if (!profiles || profiles.length === 0) {
        toast.info('Nessuno studente trovato');
        setSearchResults([]);
        return;
      }

      // Filtra solo gli studenti (controllando user_roles)
      const studentIds = profiles.map(p => p.id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('user_id', studentIds)
        .eq('role', 'student');

      const studentRoleIds = new Set(roles?.map(r => r.user_id) || []);
      const students = profiles.filter(p => studentRoleIds.has(p.id));

      // Escludi studenti già nella classe
      const { data: existingStudents } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', classId);

      const existingIds = new Set(existingStudents?.map(s => s.student_id) || []);
      const availableStudents = students.filter(s => !existingIds.has(s.id));

      setSearchResults(availableStudents);
      
      if (availableStudents.length === 0) {
        toast.info('Tutti gli studenti trovati sono già nella classe');
      }
    } catch (error: any) {
      toast.error('Errore nella ricerca: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentId: string) => {
    setAdding(true);
    try {
      const { error } = await supabase
        .from('class_students')
        .insert({
          class_id: classId,
          student_id: studentId,
        });

      if (error) throw error;

      toast.success('Studente aggiunto alla classe');
      setSearchResults(prev => prev.filter(s => s.id !== studentId));
      onStudentAdded();
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
          <DialogTitle>Aggiungi Studente</DialogTitle>
          <DialogDescription>
            Cerca studenti per email e aggiungili alla classe
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search">Email Studente</Label>
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
              <Label>Risultati</Label>
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {searchResults.map((student) => (
                  <div key={student.id} className="p-3 flex items-center justify-between hover:bg-accent/50">
                    <div>
                      <p className="font-medium">{student.first_name} {student.last_name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddStudent(student.id)}
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
