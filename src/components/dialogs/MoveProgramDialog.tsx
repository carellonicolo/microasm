import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSavedPrograms } from '@/hooks/useSavedPrograms';
import { getAllFolderPaths } from '@/utils/folderTree';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

interface MoveProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  programName: string;
  currentFolderPath: string;
}

export const MoveProgramDialog = ({ 
  open, 
  onOpenChange, 
  programId,
  programName,
  currentFolderPath 
}: MoveProgramDialogProps) => {
  const t = useTranslation();
  const [folderPath, setFolderPath] = useState(currentFolderPath);
  const [loading, setLoading] = useState(false);
  const { updateProgram, programs } = useSavedPrograms();

  const folderPaths = getAllFolderPaths(programs);

  useEffect(() => {
    if (open) {
      setFolderPath(currentFolderPath);
    }
  }, [open, currentFolderPath]);

  const handleMove = async () => {
    if (folderPath === currentFolderPath) {
      toast.info(t.common.noResults);
      onOpenChange(false);
      return;
    }

    setLoading(true);
    const success = await updateProgram(programId, { folder_path: folderPath });
    setLoading(false);

    if (success) {
      toast.success(t.programs.programMoved);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.programs.move}</DialogTitle>
          <DialogDescription>
            {t.dialogs.moveToFolder}: "{programName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folder">{t.dialogs.selectFolder}</Label>
            <Select value={folderPath} onValueChange={setFolderPath}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {folderPaths.map(path => (
                  <SelectItem key={path} value={path}>
                    {path === '/' ? `📁 ${t.dialogs.rootFolder}` : `📁 ${path}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleMove} disabled={loading}>
            {loading ? t.common.loading : t.programs.move}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};