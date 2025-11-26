import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useSavedPrograms } from '@/hooks/useSavedPrograms';
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

interface EditorContextType {
  currentProgram: SavedProgram | null;
  isModified: boolean;
  code: string;
  setCode: (code: string) => void;
  openProgram: (program: SavedProgram) => void;
  closeProgram: () => void;
  saveCurrentProgram: () => Promise<boolean>;
  saveAsNewProgram: (name: string, description?: string, folderPath?: string) => Promise<boolean>;
  markAsModified: () => void;
  resetModified: () => void;
  checkUnsavedChanges: () => boolean;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [currentProgram, setCurrentProgram] = useState<SavedProgram | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [code, setCodeState] = useState('');
  const { saveProgram, updateProgram } = useSavedPrograms();

  const setCode = useCallback((newCode: string) => {
    setCodeState(newCode);
    if (currentProgram && newCode !== currentProgram.code) {
      setIsModified(true);
    }
  }, [currentProgram]);

  const openProgram = useCallback((program: SavedProgram) => {
    if (isModified) {
      const confirm = window.confirm(
        'Ci sono modifiche non salvate. Vuoi continuare senza salvare?'
      );
      if (!confirm) return;
    }

    setCurrentProgram(program);
    setCodeState(program.code);
    setIsModified(false);
    toast.success(`Programma "${program.name}" aperto`);
  }, [isModified]);

  const closeProgram = useCallback(() => {
    if (isModified) {
      const confirm = window.confirm(
        'Ci sono modifiche non salvate. Vuoi continuare senza salvare?'
      );
      if (!confirm) return;
    }

    setCurrentProgram(null);
    setIsModified(false);
  }, [isModified]);

  const saveCurrentProgram = useCallback(async () => {
    if (!currentProgram) {
      toast.error('Nessun programma aperto');
      return false;
    }

    const success = await updateProgram(currentProgram.id, {
      code,
      name: currentProgram.name
    });

    if (success) {
      setIsModified(false);
      setCurrentProgram(prev => prev ? { ...prev, code } : null);
      return true;
    }
    return false;
  }, [currentProgram, code, updateProgram]);

  const saveAsNewProgram = useCallback(async (
    name: string,
    description?: string,
    folderPath: string = '/'
  ) => {
    const result = await saveProgram(name, code, description, folderPath);
    
    if (result) {
      setCurrentProgram(result);
      setIsModified(false);
      return true;
    }
    return false;
  }, [code, saveProgram]);

  const markAsModified = useCallback(() => {
    setIsModified(true);
  }, []);

  const resetModified = useCallback(() => {
    setIsModified(false);
  }, []);

  const checkUnsavedChanges = useCallback(() => {
    return isModified;
  }, [isModified]);

  // Shortcut Ctrl+S per salvare
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentProgram && isModified) {
          saveCurrentProgram();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProgram, isModified, saveCurrentProgram]);

  return (
    <EditorContext.Provider
      value={{
        currentProgram,
        isModified,
        code,
        setCode,
        openProgram,
        closeProgram,
        saveCurrentProgram,
        saveAsNewProgram,
        markAsModified,
        resetModified,
        checkUnsavedChanges
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
};
