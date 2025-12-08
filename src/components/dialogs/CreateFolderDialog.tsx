import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllFolderPaths, isValidFolderPath, normalizePath } from '@/utils/folderTree';
import { useSavedPrograms } from '@/hooks/useSavedPrograms';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderCreated?: (path: string) => void;
}

export const CreateFolderDialog = ({ open, onOpenChange, onFolderCreated }: CreateFolderDialogProps) => {
  const t = useTranslation();
  const [folderName, setFolderName] = useState('');
  const [parentPath, setParentPath] = useState('/');
  const { programs } = useSavedPrograms();

  const folderPaths = getAllFolderPaths(programs);

  const handleCreate = async () => {
    const trimmedName = folderName.trim();
    
    if (!trimmedName) {
      toast.error(t.dialogs.folderName);
      return;
    }

    if (!/^[a-zA-Z0-9\s_-]+$/.test(trimmedName)) {
      toast.error(t.toasts.error);
      return;
    }

    const newPath = normalizePath(parentPath + '/' + trimmedName);

    if (!isValidFolderPath(newPath)) {
      toast.error(t.toasts.error);
      return;
    }

    if (folderPaths.includes(newPath)) {
      toast.error(t.toasts.error);
      return;
    }

    toast.success(t.toasts.success);
    
    setFolderName('');
    setParentPath('/');
    onOpenChange(false);
    onFolderCreated?.(newPath);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.dialogs.createFolder}</DialogTitle>
          <DialogDescription>
            {t.dialogs.programDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="parent">{t.dialogs.selectFolder}</Label>
            <Select value={parentPath} onValueChange={setParentPath}>
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

          <div className="space-y-2">
            <Label htmlFor="folderName">{t.dialogs.folderName} *</Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder={t.dialogs.folderName}
              maxLength={50}
            />
          </div>

          {folderName.trim() && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Path:</p>
              <p className="text-sm text-muted-foreground font-mono">
                {normalizePath(parentPath + '/' + folderName.trim())}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleCreate} disabled={!folderName.trim()}>
            {t.common.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};