import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { ProgramCard } from '../dashboard/ProgramCard';
import { getAllFolderPaths } from '@/utils/folderTree';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface SavedProgram {
  id: string;
  name: string;
  description: string | null;
  code: string;
  folder_path: string;
  is_public: boolean;
  public_link_token: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface FileGridViewProps {
  programs: SavedProgram[];
  onOpenProgram: (code: string, programId: string) => void;
  onDeleteProgram: (id: string) => Promise<boolean>;
  onGeneratePublicLink: (id: string) => Promise<string | null>;
}

export const FileGridView = ({ programs, onOpenProgram, onDeleteProgram, onGeneratePublicLink }: FileGridViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const navigate = useNavigate();

  const folderPaths = ['all', ...getAllFolderPaths(programs)];

  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFolder = selectedFolder === 'all' || program.folder_path === selectedFolder;

      return matchesSearch && matchesFolder;
    });
  }, [programs, searchQuery, selectedFolder]);

  const handleOpen = (code: string, id: string) => {
    onOpenProgram(code, id);
  };

  const handleEdit = (program: SavedProgram) => {
    localStorage.setItem('microasm_loaded_code', program.code);
    navigate('/');
    toast.info('Programma caricato nell\'editor per la modifica');
  };

  const handleShare = async (id: string) => {
    const program = programs.find(p => p.id === id);
    
    if (program?.public_link_token) {
      const link = `${window.location.origin}/p/${program.public_link_token}`;
      navigator.clipboard.writeText(link);
      toast.success('Link pubblico copiato negli appunti!');
    } else {
      const link = await onGeneratePublicLink(id);
      if (link) {
        navigator.clipboard.writeText(link);
        toast.success('Link pubblico generato e copiato!');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca programmi..."
            className="pl-9"
          />
        </div>
        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">📁 Tutte le cartelle</SelectItem>
            {folderPaths.slice(1).map(path => (
              <SelectItem key={path} value={path}>
                {path === '/' ? '📁 Root' : `📁 ${path}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredPrograms.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nessun programma trovato</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.map(program => (
            <ProgramCard
              key={program.id}
              program={program}
              onOpen={() => handleOpen(program.code, program.id)}
              onEdit={() => handleEdit(program)}
              onDelete={() => onDeleteProgram(program.id)}
              onShare={() => handleShare(program.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
