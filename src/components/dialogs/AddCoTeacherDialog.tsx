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
import { RoleBadge } from '@/components/shared/RoleBadge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

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
  const t = useTranslation();
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
      setSearchQuery('');
      setSelectedTeacherIds(new Set());
    }
  }, [open, classId]);

  const fetchAllTeachers = async () => {
    setLoading(true);
    try {
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

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', teacherIds)
        .order('last_name', { ascending: true });

      if (profilesError) throw profilesError;

      const { data: existingTeachers, error: existingError } = await supabase
        .from('class_teachers')
        .select('teacher_id')
        .eq('class_id', classId);

      if (existingError) throw existingError;

      setExistingTeacherIds(new Set(existingTeachers?.map(t => t.teacher_id) || []));
      setAllTeachers(profiles || []);
    } catch (error: any) {
      console.error('Error loading teachers:', error);
      toast.error(t.toasts.error + ': ' + error.message);
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

  const availableTeachers = useMemo(() => 
    filteredTeachers.filter(t => !existingTeacherIds.has(t.id)),
    [filteredTeachers, existingTeacherIds]
  );

  const handleToggleTeacher = (teacherId: string) => {
    if (existingTeacherIds.has(teacherId)) return;
    
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
      setSelectedTeacherIds(new Set());
    } else {
      setSelectedTeacherIds(new Set(availableTeachers.map(t => t.id)));
    }
  };

  const handleAddSelectedTeachers = async () => {
    if (selectedTeacherIds.size === 0) {
      toast.warning(t.dialogs.selectAtLeastOne);
      return;
    }

    setAdding(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
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
      toast.success(`${count} ${t.dialogs.coTeachersAdded}`);
      
      setSelectedTeacherIds(new Set());
      onCoTeacherAdded();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding co-teachers:', error);
      toast.error(t.toasts.error + ': ' + error.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t.dialogs.addCoTeachersToClass}</DialogTitle>
          <DialogDescription>
            {t.dialogs.selectOneOrMore}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div>
            <Label htmlFor="search-teacher">{t.common.search} {t.classes.teacher}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search-teacher"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.dialogs.searchByNameEmail}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{t.dialogs.loadingTeachers}</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              {searchQuery ? t.dialogs.noTeacherFound : t.dialogs.noTeacherRegistered}
            </div>
          ) : (
            <>
              {availableTeachers.length > 0 && (
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    id="select-all-teachers"
                    checked={selectedTeacherIds.size === availableTeachers.length && availableTeachers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all-teachers" className="cursor-pointer">
                    {selectedTeacherIds.size === availableTeachers.length && availableTeachers.length > 0
                      ? t.dialogs.deselectAll
                      : `${t.dialogs.selectAll} (${availableTeachers.length} ${t.dialogs.available})`}
                  </Label>
                </div>
              )}

              <ScrollArea className="h-[400px] -mx-6 px-6">
                <div className="space-y-2 pr-4">
                  {filteredTeachers.map((teacher) => {
                    const isAlreadyInClass = existingTeacherIds.has(teacher.id);
                    
                    return (
                      <div 
                        key={teacher.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-colors",
                          isAlreadyInClass 
                            ? "opacity-50 cursor-not-allowed bg-muted" 
                            : "hover:bg-accent/50 cursor-pointer"
                        )}
                        onClick={() => !isAlreadyInClass && handleToggleTeacher(teacher.id)}
                      >
                        <Checkbox
                          id={`teacher-${teacher.id}`}
                          checked={isAlreadyInClass || selectedTeacherIds.has(teacher.id)}
                          disabled={isAlreadyInClass}
                          onCheckedChange={() => !isAlreadyInClass && handleToggleTeacher(teacher.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Label 
                              htmlFor={`teacher-${teacher.id}`}
                              className={cn(
                                "font-medium",
                                isAlreadyInClass ? "cursor-not-allowed" : "cursor-pointer"
                              )}
                            >
                              {teacher.last_name} {teacher.first_name}
                            </Label>
                            <RoleBadge role="teacher" />
                            {isAlreadyInClass && (
                              <Badge variant="secondary" className="text-xs">
                                {t.classes.alreadyInClass}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {teacher.email}
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
            {selectedTeacherIds.size > 0 && (
              <span className="font-medium text-foreground">
                {selectedTeacherIds.size} {t.dialogs.selected}
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
              onClick={handleAddSelectedTeachers}
              disabled={selectedTeacherIds.size === 0 || adding}
            >
              {adding ? (
                t.dialogs.adding
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t.dialogs.addCoTeachers} {selectedTeacherIds.size > 0 ? `(${selectedTeacherIds.size})` : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};