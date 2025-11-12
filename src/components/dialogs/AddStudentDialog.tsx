import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [existingStudentIds, setExistingStudentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      fetchAllStudents();
    } else {
      // Reset quando si chiude
      setSearchQuery('');
      setSelectedStudentIds(new Set());
    }
  }, [open, classId]);

  const fetchAllStudents = async () => {
    setLoading(true);
    try {
      // Step 1: Ottieni tutti i profili con ruolo studente
      const { data: studentRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');

      if (rolesError) throw rolesError;

      const studentIds = studentRoles?.map(r => r.user_id) || [];

      if (studentIds.length === 0) {
        setAllStudents([]);
        setLoading(false);
        return;
      }

      // Step 2: Ottieni i profili completi (la nuova RLS policy permette questo!)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', studentIds)
        .order('last_name', { ascending: true });

      if (profilesError) throw profilesError;

      // Step 3: Ottieni studenti già nella classe
      const { data: existingStudents, error: existingError } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', classId);

      if (existingError) throw existingError;

      setExistingStudentIds(new Set(existingStudents?.map(s => s.student_id) || []));
      setAllStudents(profiles || []);
    } catch (error: any) {
      console.error('Errore nel caricamento studenti:', error);
      toast.error('Errore nel caricamento della lista studenti: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return allStudents;

    const query = searchQuery.toLowerCase();
    return allStudents.filter(student => 
      student.first_name.toLowerCase().includes(query) ||
      student.last_name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(query)
    );
  }, [allStudents, searchQuery]);

  // Studenti disponibili = non già nella classe
  const availableStudents = useMemo(() => 
    filteredStudents.filter(s => !existingStudentIds.has(s.id)),
    [filteredStudents, existingStudentIds]
  );

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.size === availableStudents.length) {
      // Deseleziona tutti
      setSelectedStudentIds(new Set());
    } else {
      // Seleziona tutti gli studenti disponibili
      setSelectedStudentIds(new Set(availableStudents.map(s => s.id)));
    }
  };

  const handleAddSelectedStudents = async () => {
    if (selectedStudentIds.size === 0) {
      toast.warning('Seleziona almeno uno studente');
      return;
    }

    setAdding(true);
    try {
      // Inserimento batch con array di oggetti
      const studentsToAdd = Array.from(selectedStudentIds).map(studentId => ({
        class_id: classId,
        student_id: studentId,
      }));

      const { error } = await supabase
        .from('class_students')
        .insert(studentsToAdd);

      if (error) throw error;

      const count = selectedStudentIds.size;
      toast.success(`${count} student${count > 1 ? 'i aggiunti' : 'e aggiunto'} alla classe`);
      
      setSelectedStudentIds(new Set());
      onStudentAdded();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Errore nell\'aggiunta studenti:', error);
      toast.error('Errore nell\'aggiunta degli studenti: ' + error.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Aggiungi Studenti alla Classe</DialogTitle>
          <DialogDescription>
            Seleziona uno o più studenti da aggiungere
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Campo di ricerca */}
          <div>
            <Label htmlFor="search">Cerca Studente</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca per nome, cognome o email..."
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Caricamento studenti...</p>
            </div>
          ) : availableStudents.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              {searchQuery ? 
                'Nessuno studente trovato con questa ricerca' : 
                'Tutti gli studenti sono già nella classe'}
            </div>
          ) : (
            <>
              {/* Seleziona tutti */}
              <div className="flex items-center gap-2 pb-2 border-b">
                <Checkbox
                  id="select-all"
                  checked={selectedStudentIds.size === availableStudents.length && availableStudents.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="cursor-pointer">
                  {selectedStudentIds.size === availableStudents.length && availableStudents.length > 0
                    ? 'Deseleziona tutti'
                    : `Seleziona tutti (${availableStudents.length} disponibili)`}
                </Label>
              </div>

              {/* Lista studenti con checkbox */}
              <ScrollArea className="h-[400px] -mx-6 px-6">
                <div className="space-y-2 pr-4">
                  {availableStudents.map((student) => (
                    <div 
                      key={student.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => handleToggleStudent(student.id)}
                    >
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={selectedStudentIds.has(student.id)}
                        onCheckedChange={() => handleToggleStudent(student.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <Label 
                          htmlFor={`student-${student.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {student.last_name} {student.first_name}
                        </Label>
                        <p className="text-sm text-muted-foreground truncate">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        {/* Footer con contatore e pulsanti */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedStudentIds.size > 0 && (
              <span className="font-medium text-foreground">
                {selectedStudentIds.size} student{selectedStudentIds.size > 1 ? 'i' : 'e'} selezionat{selectedStudentIds.size > 1 ? 'i' : 'o'}
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={adding}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleAddSelectedStudents}
              disabled={selectedStudentIds.size === 0 || adding}
            >
              {adding ? (
                'Aggiunta in corso...'
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Aggiungi {selectedStudentIds.size > 0 ? selectedStudentIds.size : ''} Student{selectedStudentIds.size !== 1 ? 'i' : 'e'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
