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

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderCreated?: (path: string) => void;
}

export const CreateFolderDialog = ({ open, onOpenChange, onFolderCreated }: CreateFolderDialogProps) => {
  const [folderName, setFolderName] = useState('');
  const [parentPath, setParentPath] = useState('/');
  const { programs, saveProgram } = useSavedPrograms();

  const folderPaths = getAllFolderPaths(programs);

  const handleCreate = async () => {
    const trimmedName = folderName.trim();
    
    if (!trimmedName) {
      toast.error('Inserisci un nome per la cartella');
      return;
    }

    if (!/^[a-zA-Z0-9\s_-]+$/.test(trimmedName)) {
      toast.error('Il nome può contenere solo lettere, numeri, spazi, - e _');
      return;
    }

    const newPath = normalizePath(parentPath + '/' + trimmedName);

    if (!isValidFolderPath(newPath)) {
      toast.error('Path della cartella non valido');
      return;
    }

    if (folderPaths.includes(newPath)) {
      toast.error('Questa cartella esiste già');
      return;
    }

    // Per creare una cartella, creiamo un file placeholder che poi verrà eliminato
    // o semplicemente notifichiamo l'utente che la cartella verrà creata al primo salvataggio
    toast.success(`Cartella "${trimmedName}" creata in ${parentPath}`);
    
    setFolderName('');
    setParentPath('/');
    onOpenChange(false);
    onFolderCreated?.(newPath);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crea Nuova Cartella</DialogTitle>
          <DialogDescription>
            Le cartelle vengono create automaticamente quando salvi un programma
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="parent">Cartella Padre</Label>
            <Select value={parentPath} onValueChange={setParentPath}>
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

          <div className="space-y-2">
            <Label htmlFor="folderName">Nome Cartella *</Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Es. Esercitazioni"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              Solo lettere, numeri, spazi, trattini e underscore
            </p>
          </div>

          {folderName.trim() && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Path completo:</p>
              <p className="text-sm text-muted-foreground font-mono">
                {normalizePath(parentPath + '/' + folderName.trim())}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleCreate} disabled={!folderName.trim()}>
            Crea Cartella
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
