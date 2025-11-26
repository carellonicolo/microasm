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
      toast.info('La cartella selezionata è uguale a quella attuale');
      onOpenChange(false);
      return;
    }

    setLoading(true);
    const success = await updateProgram(programId, { folder_path: folderPath });
    setLoading(false);

    if (success) {
      toast.success(`"${programName}" spostato in ${folderPath}`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sposta Programma</DialogTitle>
          <DialogDescription>
            Sposta "{programName}" in un'altra cartella
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folder">Cartella di Destinazione</Label>
            <Select value={folderPath} onValueChange={setFolderPath}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {folderPaths.map(path => (
                  <SelectItem key={path} value={path}>
                    {path === '/' ? '📁 Root' : `📁 ${path}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-muted rounded-md space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Da:</span>
              <span className="font-mono">{currentFolderPath}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">A:</span>
              <span className="font-mono font-medium">{folderPath}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handleMove} disabled={loading}>
            {loading ? 'Spostamento...' : 'Sposta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
