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
  const [allTeachers, setAllTeachers] = useState<TeacherProfile[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [existingTeacherIds, setExistingTeacherIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      fetchAllTeachers();
    } else {
      // Reset quando si chiude
      setSearchQuery('');
      setSelectedTeacherIds(new Set());
    }
  }, [open, classId]);

  const fetchAllTeachers = async () => {
    setLoading(true);
    try {
      // Step 1: Ottieni tutti i profili con ruolo teacher
      const { data: teacherRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'teacher');

      if (rolesError) throw rolesError;

      const teacherIds = teacherRoles?.map(r => r.user_id) || [];

      if (teacherIds.length === 0) {
        setAllTeachers([]);
        setLoading(false);
        return;
      }

      // Step 2: Ottieni i profili completi
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', teacherIds)
        .order('last_name', { ascending: true });

      if (profilesError) throw profilesError;

      // Step 3: Ottieni insegnanti già nella classe
      const { data: existingTeachers, error: existingError } = await supabase
        .from('class_teachers')
        .select('teacher_id')
        .eq('class_id', classId);

      if (existingError) throw existingError;

      setExistingTeacherIds(new Set(existingTeachers?.map(t => t.teacher_id) || []));
      setAllTeachers(profiles || []);
    } catch (error: any) {
      console.error('Errore nel caricamento insegnanti:', error);
      toast.error('Errore nel caricamento della lista insegnanti: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return allTeachers;

    const query = searchQuery.toLowerCase();
    return allTeachers.filter(teacher => 
      teacher.first_name.toLowerCase().includes(query) ||
      teacher.last_name.toLowerCase().includes(query) ||
      teacher.email.toLowerCase().includes(query) ||
      `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(query)
    );
  }, [allTeachers, searchQuery]);

  // Insegnanti disponibili = non già nella classe
  const availableTeachers = useMemo(() => 
    filteredTeachers.filter(t => !existingTeacherIds.has(t.id)),
    [filteredTeachers, existingTeacherIds]
  );

  const handleToggleTeacher = (teacherId: string) => {
    setSelectedTeacherIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teacherId)) {
        newSet.delete(teacherId);
      } else {
        newSet.add(teacherId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTeacherIds.size === availableTeachers.length) {
      // Deseleziona tutti
      setSelectedTeacherIds(new Set());
    } else {
      // Seleziona tutti gli insegnanti disponibili
      setSelectedTeacherIds(new Set(availableTeachers.map(t => t.id)));
    }
  };

  const handleAddSelectedTeachers = async () => {
    if (selectedTeacherIds.size === 0) {
      toast.warning('Seleziona almeno un insegnante');
      return;
    }

    setAdding(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      // Inserimento batch con array di oggetti
      const teachersToAdd = Array.from(selectedTeacherIds).map(teacherId => ({
        class_id: classId,
        teacher_id: teacherId,
        added_by: currentUser.user?.id,
      }));

      const { error } = await supabase
        .from('class_teachers')
        .insert(teachersToAdd);

      if (error) throw error;

      const count = selectedTeacherIds.size;
      toast.success(`${count} co-insegnant${count > 1 ? 'i aggiunti' : 'e aggiunto'} alla classe`);
      
      setSelectedTeacherIds(new Set());
      onCoTeacherAdded();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Errore nell\'aggiunta co-insegnanti:', error);
      toast.error('Errore nell\'aggiunta dei co-insegnanti: ' + error.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Aggiungi Co-Insegnanti alla Classe</DialogTitle>
          <DialogDescription>
            Seleziona uno o più insegnanti da aggiungere come co-insegnanti
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Campo di ricerca */}
          <div>
            <Label htmlFor="search-teacher">Cerca Insegnante</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search-teacher"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca per nome, cognome o email..."
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Caricamento insegnanti...</p>
            </div>
          ) : availableTeachers.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              {searchQuery ? 
                'Nessun insegnante trovato con questa ricerca' : 
                'Tutti gli insegnanti sono già nella classe'}
            </div>
          ) : (
            <>
              {/* Seleziona tutti */}
              <div className="flex items-center gap-2 pb-2 border-b">
                <Checkbox
                  id="select-all-teachers"
                  checked={selectedTeacherIds.size === availableTeachers.length && availableTeachers.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all-teachers" className="cursor-pointer">
                  {selectedTeacherIds.size === availableTeachers.length && availableTeachers.length > 0
                    ? 'Deseleziona tutti'
                    : `Seleziona tutti (${availableTeachers.length} disponibili)`}
                </Label>
              </div>

              {/* Lista insegnanti con checkbox */}
              <ScrollArea className="h-[400px] -mx-6 px-6">
                <div className="space-y-2 pr-4">
                  {availableTeachers.map((teacher) => (
                    <div 
                      key={teacher.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => handleToggleTeacher(teacher.id)}
                    >
                      <Checkbox
                        id={`teacher-${teacher.id}`}
                        checked={selectedTeacherIds.has(teacher.id)}
                        onCheckedChange={() => handleToggleTeacher(teacher.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Label 
                            htmlFor={`teacher-${teacher.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {teacher.last_name} {teacher.first_name}
                          </Label>
                          <RoleBadge role="teacher" />
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {teacher.email}
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
            {selectedTeacherIds.size > 0 && (
              <span className="font-medium text-foreground">
                {selectedTeacherIds.size} insegnant{selectedTeacherIds.size > 1 ? 'i' : 'e'} selezionat{selectedTeacherIds.size > 1 ? 'i' : 'o'}
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
              onClick={handleAddSelectedTeachers}
              disabled={selectedTeacherIds.size === 0 || adding}
            >
              {adding ? (
                'Aggiunta in corso...'
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Aggiungi {selectedTeacherIds.size > 0 ? selectedTeacherIds.size : ''} Co-Insegnant{selectedTeacherIds.size !== 1 ? 'i' : 'e'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
