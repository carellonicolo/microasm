import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

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
  const t = useTranslation();
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
      setSearchQuery('');
      setSelectedStudentIds(new Set());
    }
  }, [open, classId]);

  const fetchAllStudents = async () => {
    setLoading(true);
    try {
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

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', studentIds)
        .order('last_name', { ascending: true });

      if (profilesError) throw profilesError;

      const { data: existingStudents, error: existingError } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', classId);

      if (existingError) throw existingError;

      setExistingStudentIds(new Set(existingStudents?.map(s => s.student_id) || []));
      setAllStudents(profiles || []);
    } catch (error: any) {
      console.error('Error loading students:', error);
      toast.error(t.toasts.error + ': ' + error.message);
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

  const availableStudents = useMemo(() => 
    filteredStudents.filter(s => !existingStudentIds.has(s.id)),
    [filteredStudents, existingStudentIds]
  );

  const handleToggleStudent = (studentId: string) => {
    if (existingStudentIds.has(studentId)) return;
    
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
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(availableStudents.map(s => s.id)));
    }
  };

  const handleAddSelectedStudents = async () => {
    if (selectedStudentIds.size === 0) {
      toast.warning(t.dialogs.selectAtLeastOne);
      return;
    }

    setAdding(true);
    try {
      const studentsToAdd = Array.from(selectedStudentIds).map(studentId => ({
        class_id: classId,
        student_id: studentId,
      }));

      const { error } = await supabase
        .from('class_students')
        .insert(studentsToAdd);

      if (error) throw error;

      const count = selectedStudentIds.size;
      toast.success(`${count} ${t.dialogs.studentsAdded}`);
      
      setSelectedStudentIds(new Set());
      onStudentAdded();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding students:', error);
      toast.error(t.toasts.error + ': ' + error.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t.dialogs.addStudentsToClass}</DialogTitle>
          <DialogDescription>
            {t.dialogs.selectOneOrMore}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div>
            <Label htmlFor="search">{t.common.search} {t.classes.student}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.dialogs.searchByNameEmail}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{t.dialogs.loadingStudents}</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              {searchQuery ? t.dialogs.noStudentFound : t.dialogs.noStudentRegistered}
            </div>
          ) : (
            <>
              {availableStudents.length > 0 && (
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    id="select-all"
                    checked={selectedStudentIds.size === availableStudents.length && availableStudents.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="cursor-pointer">
                    {selectedStudentIds.size === availableStudents.length && availableStudents.length > 0
                      ? t.dialogs.deselectAll
                      : `${t.dialogs.selectAll} (${availableStudents.length} ${t.dialogs.available})`}
                  </Label>
                </div>
              )}

              <ScrollArea className="h-[400px] -mx-6 px-6">
                <div className="space-y-2 pr-4">
                  {filteredStudents.map((student) => {
                    const isAlreadyInClass = existingStudentIds.has(student.id);
                    
                    return (
                      <div 
                        key={student.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-colors",
                          isAlreadyInClass 
                            ? "opacity-50 cursor-not-allowed bg-muted" 
                            : "hover:bg-accent/50 cursor-pointer"
                        )}
                        onClick={() => !isAlreadyInClass && handleToggleStudent(student.id)}
                      >
                        <Checkbox
                          id={`student-${student.id}`}
                          checked={isAlreadyInClass || selectedStudentIds.has(student.id)}
                          disabled={isAlreadyInClass}
                          onCheckedChange={() => !isAlreadyInClass && handleToggleStudent(student.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Label 
                              htmlFor={`student-${student.id}`}
                              className={cn(
                                "font-medium",
                                isAlreadyInClass ? "cursor-not-allowed" : "cursor-pointer"
                              )}
                            >
                              {student.last_name} {student.first_name}
                            </Label>
                            {isAlreadyInClass && (
                              <Badge variant="secondary" className="text-xs">
                                {t.classes.alreadyInClass}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedStudentIds.size > 0 && (
              <span className="font-medium text-foreground">
                {selectedStudentIds.size} {t.dialogs.selected}
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={adding}
            >
              {t.common.cancel}
            </Button>
            <Button 
              onClick={handleAddSelectedStudents}
              disabled={selectedStudentIds.size === 0 || adding}
            >
              {adding ? (
                t.dialogs.adding
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t.dialogs.addStudents} {selectedStudentIds.size > 0 ? `(${selectedStudentIds.size})` : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};