import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileCode, MoreVertical, Edit, Trash2, FolderInput } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FolderNode, FileNode } from '@/utils/folderTree';
import { RenameProgramDialog } from '../dialogs/RenameProgramDialog';
import { MoveProgramDialog } from '../dialogs/MoveProgramDialog';
import { useSavedPrograms } from '@/hooks/useSavedPrograms';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FolderTreeViewProps {
  tree: FolderNode;
  onOpenProgram: (code: string, programId: string) => void;
}

export const FolderTreeView = ({ tree, onOpenProgram }: FolderTreeViewProps) => {
  return (
    <div className="space-y-1">
      {tree.children.map((node, idx) => (
        <TreeNode key={idx} node={node} onOpenProgram={onOpenProgram} level={0} />
      ))}
    </div>
  );
};

interface TreeNodeProps {
  node: FolderNode | FileNode;
  onOpenProgram: (code: string, programId: string) => void;
  level: number;
}

const TreeNode = ({ node, onOpenProgram, level }: TreeNodeProps) => {
  const [expanded, setExpanded] = useState(level === 0);
  const [renameOpen, setRenameOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { deleteProgram } = useSavedPrograms();

  if (node.type === 'folder') {
    return (
      <div>
        <div
          className="flex items-center gap-1 py-1 px-2 hover:bg-accent rounded-md cursor-pointer group"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => setExpanded(!expanded)}
        >
          <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
            {expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </Button>
          <Folder className="w-4 h-4 text-primary" />
          <span className="text-sm flex-1">{node.name}</span>
        </div>
        {expanded && (
          <div>
            {node.children.map((child, idx) => (
              <TreeNode key={idx} node={child} onOpenProgram={onOpenProgram} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const program = node.program;

  const handleDelete = async () => {
    const success = await deleteProgram(program.id);
    if (success) {
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <div
        className="flex items-center gap-2 py-1 px-2 hover:bg-accent rounded-md group"
        style={{ paddingLeft: `${level * 20 + 28}px` }}
      >
        <FileCode className="w-4 h-4 text-muted-foreground" />
        <button
          className="text-sm flex-1 text-left hover:underline"
          onClick={() => onOpenProgram(program.code, program.id)}
        >
          {program.name}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setRenameOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Rinomina
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMoveOpen(true)}>
              <FolderInput className="w-4 h-4 mr-2" />
              Sposta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Elimina
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <RenameProgramDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        programId={program.id}
        currentName={program.name}
      />

      <MoveProgramDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        programId={program.id}
        programName={program.name}
        currentFolderPath={program.folder_path}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare "{program.name}"? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
