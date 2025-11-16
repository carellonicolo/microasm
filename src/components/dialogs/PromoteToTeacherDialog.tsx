import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, UserCog } from 'lucide-react';
import { RoleBadge } from '@/components/shared/RoleBadge';

interface PromoteToTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentPromoted: () => void;
}

interface StudentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

// Helper function to escape SQL wildcards in ILIKE queries
const escapeILike = (str: string) => str.replace(/[%_]/g, '\\$&');

export const PromoteToTeacherDialog = ({ open, onOpenChange, onStudentPromoted }: PromoteToTeacherDialogProps) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    setLoading(true);
    try {
      // Escape SQL wildcards to prevent wildcard injection
      const escapedEmail = escapeILike(searchEmail.trim());
      
      // Cerca utenti per email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .ilike('email', `%${escapedEmail}%`)
        .limit(10);

      if (profileError) throw profileError;

      if (!profiles || profiles.length === 0) {
        toast.info('Nessun utente trovato');
        setSearchResults([]);
        return;
      }

      // Filtra solo gli studenti che NON sono già teacher
      const userIds = profiles.map(p => p.id);
      
      // Ottieni tutti i ruoli degli utenti trovati
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const rolesMap = new Map<string, Set<string>>();
      roles?.forEach(r => {
        if (!rolesMap.has(r.user_id)) {
          rolesMap.set(r.user_id, new Set());
        }
        rolesMap.get(r.user_id)?.add(r.role);
      });

      // Filtra: deve essere studente e NON essere già teacher
      const eligibleStudents = profiles.filter(p => {
        const userRoles = rolesMap.get(p.id);
        return userRoles?.has('student') && !userRoles?.has('teacher');
      });

      setSearchResults(eligibleStudents);
      
      if (eligibleStudents.length === 0) {
        toast.info('Nessuno studente idoneo trovato');
      }
    } catch (error: any) {
      toast.error('Errore nella ricerca: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (studentId: string, studentName: string) => {
    setPromoting(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: studentId,
          role: 'teacher',
          assigned_by: currentUser.user?.id,
        });

      if (error) throw error;

      toast.success(`${studentName} è stato promosso a insegnante!`);
      setSearchResults(prev => prev.filter(s => s.id !== studentId));
      onStudentPromoted();
    } catch (error: any) {
      toast.error('Errore nella promozione: ' + error.message);
    } finally {
      setPromoting(false);
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
          <DialogTitle>Promuovi Studente a Insegnante</DialogTitle>
          <DialogDescription>
            Cerca uno studente e promuovilo a insegnante. Manterrà anche il ruolo di studente.
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
              <Label>Studenti Idonei</Label>
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {searchResults.map((student) => (
                  <div key={student.id} className="p-3 flex items-center justify-between hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{student.first_name} {student.last_name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      <RoleBadge role="student" />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePromote(student.id, `${student.first_name} ${student.last_name}`)}
                      disabled={promoting}
                    >
                      <UserCog className="w-4 h-4 mr-2" />
                      Promuovi
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
