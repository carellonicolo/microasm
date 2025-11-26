interface SavedProgram {
  id: string;
  name: string;
  folder_path: string;
  [key: string]: any;
}

export interface FolderNode {
  name: string;
  path: string;
  type: 'folder';
  children: (FolderNode | FileNode)[];
}

export interface FileNode {
  type: 'file';
  program: SavedProgram;
}

export type TreeNode = FolderNode | FileNode;

/**
 * Costruisce un albero di cartelle e file da una lista piatta di programmi
 */
export const buildFolderTree = (programs: SavedProgram[]): FolderNode => {
  const root: FolderNode = {
    name: 'root',
    path: '/',
    type: 'folder',
    children: []
  };

  // Mappa per accesso rapido alle cartelle
  const folderMap = new Map<string, FolderNode>();
  folderMap.set('/', root);

  // Prima pass: crea tutte le cartelle
  const allPaths = new Set<string>();
  programs.forEach(program => {
    const parts = program.folder_path.split('/').filter(Boolean);
    let currentPath = '';
    
    parts.forEach(part => {
      currentPath += '/' + part;
      allPaths.add(currentPath);
    });
  });

  // Crea le cartelle nell'albero
  Array.from(allPaths).sort().forEach(path => {
    if (folderMap.has(path)) return;

    const parts = path.split('/').filter(Boolean);
    const name = parts[parts.length - 1];
    const parentPath = parts.length > 1 
      ? '/' + parts.slice(0, -1).join('/')
      : '/';

    const folder: FolderNode = {
      name,
      path,
      type: 'folder',
      children: []
    };

    folderMap.set(path, folder);
    
    const parent = folderMap.get(parentPath);
    if (parent) {
      parent.children.push(folder);
    }
  });

  // Seconda pass: aggiungi i file
  programs.forEach(program => {
    const parentPath = program.folder_path || '/';
    const parent = folderMap.get(parentPath);
    
    if (parent) {
      parent.children.push({
        type: 'file',
        program
      });
    }
  });

  // Ordina children: cartelle prima, poi file alfabeticamente
  const sortChildren = (node: FolderNode) => {
    node.children.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      
      const nameA = a.type === 'folder' ? a.name : a.program.name;
      const nameB = b.type === 'folder' ? b.name : b.program.name;
      return nameA.localeCompare(nameB);
    });

    node.children.forEach(child => {
      if (child.type === 'folder') {
        sortChildren(child);
      }
    });
  };

  sortChildren(root);
  return root;
};

/**
 * Ottiene tutti i path delle cartelle esistenti
 */
export const getAllFolderPaths = (programs: SavedProgram[]): string[] => {
  const paths = new Set<string>(['/']);
  
  programs.forEach(program => {
    const parts = program.folder_path.split('/').filter(Boolean);
    let currentPath = '';
    
    parts.forEach(part => {
      currentPath += '/' + part;
      paths.add(currentPath);
    });
  });

  return Array.from(paths).sort();
};

/**
 * Valida che un path sia valido
 */
export const isValidFolderPath = (path: string): boolean => {
  if (!path.startsWith('/')) return false;
  if (path !== '/' && path.endsWith('/')) return false;
  
  const parts = path.split('/').filter(Boolean);
  return parts.every(part => {
    // No caratteri speciali, solo alfanumerici, spazi, trattini e underscore
    return /^[a-zA-Z0-9\s_-]+$/.test(part);
  });
};

/**
 * Normalizza un path (rimuove slash finali extra, etc)
 */
export const normalizePath = (path: string): string => {
  if (path === '/' || !path) return '/';
  
  const parts = path.split('/').filter(Boolean);
  return '/' + parts.join('/');
};
