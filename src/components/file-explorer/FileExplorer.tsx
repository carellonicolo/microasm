import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderPlus, LayoutGrid, LayoutList } from 'lucide-react';
import { buildFolderTree } from '@/utils/folderTree';
import { useSavedPrograms } from '@/hooks/useSavedPrograms';
import { FolderTreeView } from './FolderTreeView';
import { FileGridView } from './FileGridView';
import { CreateFolderDialog } from '../dialogs/CreateFolderDialog';

interface FileExplorerProps {
  onOpenProgram: (code: string, programId: string) => void;
}

export const FileExplorer = ({ onOpenProgram }: FileExplorerProps) => {
  const { programs } = useSavedPrograms();
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('grid');
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  const tree = buildFolderTree(programs);

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">File Manager</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCreateFolderOpen(true)}
              title="Crea cartella"
            >
              <FolderPlus className="w-4 h-4" />
            </Button>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'tree' ? 'secondary' : 'ghost'}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode('tree')}
              >
                <LayoutList className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {viewMode === 'tree' ? (
          <FolderTreeView tree={tree} onOpenProgram={onOpenProgram} />
        ) : (
          <FileGridView programs={programs} onOpenProgram={onOpenProgram} />
        )}
      </Card>

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
      />
    </>
  );
};
