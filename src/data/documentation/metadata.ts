// Documentation Metadata and Navigation Structure

export interface NavigationNode {
  id: string;
  titleIt: string;
  titleEn: string;
  icon?: string;
  children?: NavigationSection[];
}

export interface NavigationSection {
  id: string;
  titleIt: string;
  titleEn: string;
  anchor: string;
}

export interface OpcodeInfo {
  instruction: string;
  binary: string;
  hex: string;
  cycles: number;
  flags: string;
  category: string;
  description: string;
}

// Educational Opcode Encoding Schema
// DISCLAIMER: This is a hypothetical educational schema.
// The MicroASM simulator internally uses ASCII string opcodes, not binary encodings.
export const OPCODE_TABLE: OpcodeInfo[] = [
  // Data Transfer (00001-00011)
  { instruction: 'MOV', binary: '00001', hex: '0x01', cycles: 1, flags: 'None', category: 'Data Transfer', description: 'Move/Copy value' },
  { instruction: 'PUSH', binary: '00010', hex: '0x02', cycles: 2, flags: 'None', category: 'Data Transfer', description: 'Push to stack' },
  { instruction: 'POP', binary: '00011', hex: '0x03', cycles: 2, flags: 'None', category: 'Data Transfer', description: 'Pop from stack' },

  // Arithmetic (01000-01101)
  { instruction: 'ADD', binary: '01000', hex: '0x08', cycles: 1, flags: 'ZF, SF', category: 'Arithmetic', description: 'Addition' },
  { instruction: 'SUB', binary: '01001', hex: '0x09', cycles: 1, flags: 'ZF, SF', category: 'Arithmetic', description: 'Subtraction' },
  { instruction: 'MOL', binary: '01010', hex: '0x0A', cycles: 3, flags: 'ZF, SF', category: 'Arithmetic', description: 'Multiplication' },
  { instruction: 'DIV', binary: '01011', hex: '0x0B', cycles: 3, flags: 'ZF, SF', category: 'Arithmetic', description: 'Division' },
  { instruction: 'INC', binary: '01100', hex: '0x0C', cycles: 1, flags: 'ZF, SF', category: 'Arithmetic', description: 'Increment' },
  { instruction: 'DEC', binary: '01101', hex: '0x0D', cycles: 1, flags: 'ZF, SF', category: 'Arithmetic', description: 'Decrement' },

  // Logic (10000-10010)
  { instruction: 'AND', binary: '10000', hex: '0x10', cycles: 1, flags: 'ZF, SF', category: 'Logic', description: 'Bitwise AND' },
  { instruction: 'OR', binary: '10001', hex: '0x11', cycles: 1, flags: 'ZF, SF', category: 'Logic', description: 'Bitwise OR' },
  { instruction: 'NOT', binary: '10010', hex: '0x12', cycles: 1, flags: 'ZF, SF', category: 'Logic', description: 'Bitwise NOT' },

  // Control Flow (10100-11001)
  { instruction: 'JMP', binary: '10100', hex: '0x14', cycles: 1, flags: 'None', category: 'Control Flow', description: 'Unconditional jump' },
  { instruction: 'JZ', binary: '10101', hex: '0x15', cycles: 1, flags: 'Reads ZF', category: 'Control Flow', description: 'Jump if zero' },
  { instruction: 'JNZ', binary: '10110', hex: '0x16', cycles: 1, flags: 'Reads ZF', category: 'Control Flow', description: 'Jump if not zero' },
  { instruction: 'JS', binary: '10111', hex: '0x17', cycles: 1, flags: 'Reads SF', category: 'Control Flow', description: 'Jump if sign' },
  { instruction: 'JNS', binary: '11000', hex: '0x18', cycles: 1, flags: 'Reads SF', category: 'Control Flow', description: 'Jump if not sign' },
  { instruction: 'CMP', binary: '11001', hex: '0x19', cycles: 1, flags: 'ZF, SF', category: 'Control Flow', description: 'Compare' },

  // Stack (11010-11011)
  { instruction: 'CALL', binary: '11010', hex: '0x1A', cycles: 3, flags: 'None', category: 'Stack', description: 'Call subroutine' },
  { instruction: 'RET', binary: '11011', hex: '0x1B', cycles: 2, flags: 'None', category: 'Stack', description: 'Return from subroutine' },

  // I/O (11100-11101)
  { instruction: 'OUT', binary: '11100', hex: '0x1C', cycles: 1, flags: 'None', category: 'I/O', description: 'Output value' },
  { instruction: 'HLT', binary: '11101', hex: '0x1D', cycles: 1, flags: 'None', category: 'I/O', description: 'Halt execution' },
];

// Navigation Tree Structure
export const DOCUMENTATION_NAV: NavigationNode[] = [
  {
    id: 'reference',
    titleIt: '📖 Riferimento Formale',
    titleEn: '📖 Formal Reference',
    children: [
      { id: 'intro', titleIt: 'Introduzione', titleEn: 'Introduction', anchor: 'intro' },
      { id: 'data-transfer', titleIt: 'Trasferimento Dati', titleEn: 'Data Transfer', anchor: 'data-transfer' },
      { id: 'arithmetic', titleIt: 'Aritmetica', titleEn: 'Arithmetic', anchor: 'arithmetic' },
      { id: 'logic', titleIt: 'Logica', titleEn: 'Logic', anchor: 'logic' },
      { id: 'control-flow', titleIt: 'Controllo di Flusso', titleEn: 'Control Flow', anchor: 'control-flow' },
      { id: 'stack', titleIt: 'Stack', titleEn: 'Stack', anchor: 'stack' },
      { id: 'io', titleIt: 'I/O', titleEn: 'I/O', anchor: 'io' },
      { id: 'addressing', titleIt: 'Modalità di Indirizzamento', titleEn: 'Addressing Modes', anchor: 'addressing' },
    ]
  },
  {
    id: 'tutorial',
    titleIt: '🎓 Tutorial Principianti',
    titleEn: '🎓 Beginner Tutorial',
    children: [
      { id: 'getting-started', titleIt: 'Primi Passi', titleEn: 'Getting Started', anchor: 'getting-started' },
      { id: 'first-program', titleIt: 'Il Tuo Primo Programma', titleEn: 'Your First Program', anchor: 'first-program' },
      { id: 'registers', titleIt: 'Capire i Registri', titleEn: 'Understanding Registers', anchor: 'registers' },
      { id: 'memory', titleIt: 'Lavorare con la Memoria', titleEn: 'Working with Memory', anchor: 'memory' },
      { id: 'arithmetic-ops', titleIt: 'Operazioni Aritmetiche', titleEn: 'Arithmetic Operations', anchor: 'arithmetic-ops' },
      { id: 'conditional', titleIt: 'Logica Condizionale', titleEn: 'Conditional Logic', anchor: 'conditional' },
      { id: 'loops', titleIt: 'Loop e Contatori', titleEn: 'Loops and Counters', anchor: 'loops' },
      { id: 'stack-usage', titleIt: 'Usare lo Stack', titleEn: 'Using the Stack', anchor: 'stack-usage' },
      { id: 'subroutines', titleIt: 'Subroutine', titleEn: 'Subroutines', anchor: 'subroutines' },
      { id: 'common-errors', titleIt: 'Errori Comuni', titleEn: 'Common Mistakes', anchor: 'common-errors' },
    ]
  },
  {
    id: 'opcodes',
    titleIt: '⚙️ Dettagli Opcode',
    titleEn: '⚙️ Opcode Details',
    children: [
      { id: 'arch-overview', titleIt: 'Panoramica Architettura', titleEn: 'Architecture Overview', anchor: 'arch-overview' },
      { id: 'encoding', titleIt: 'Encoding Istruzioni', titleEn: 'Instruction Encoding', anchor: 'encoding' },
      { id: 'data-opcodes', titleIt: 'Opcode Trasferimento Dati', titleEn: 'Data Transfer Opcodes', anchor: 'data-opcodes' },
      { id: 'arith-opcodes', titleIt: 'Opcode Aritmetica', titleEn: 'Arithmetic Opcodes', anchor: 'arith-opcodes' },
      { id: 'logic-opcodes', titleIt: 'Opcode Logica', titleEn: 'Logic Opcodes', anchor: 'logic-opcodes' },
      { id: 'control-opcodes', titleIt: 'Opcode Controllo Flusso', titleEn: 'Control Flow Opcodes', anchor: 'control-opcodes' },
      { id: 'stack-opcodes', titleIt: 'Opcode Stack', titleEn: 'Stack Opcodes', anchor: 'stack-opcodes' },
      { id: 'io-opcodes', titleIt: 'Opcode I/O', titleEn: 'I/O Opcodes', anchor: 'io-opcodes' },
      { id: 'cycles', titleIt: 'Riferimento Cicli', titleEn: 'Clock Cycles Reference', anchor: 'cycles' },
      { id: 'flags-behavior', titleIt: 'Comportamento Flag', titleEn: 'Flag Behavior', anchor: 'flags-behavior' },
    ]
  },
  {
    id: 'architecture',
    titleIt: '💾 Memoria e Stack',
    titleEn: '💾 Memory & Stack',
    children: [
      { id: 'memory-org', titleIt: 'Organizzazione Memoria', titleEn: 'Memory Organization', anchor: 'memory-org' },
      { id: '16bit-cells', titleIt: 'Celle a 16-bit', titleEn: '16-bit Memory Cells', anchor: '16bit-cells' },
      { id: 'addressing-detail', titleIt: 'Modalità Indirizzamento', titleEn: 'Addressing Modes Detail', anchor: 'addressing-detail' },
      { id: 'stack-mechanism', titleIt: 'Meccanismo Stack', titleEn: 'Stack Mechanism', anchor: 'stack-mechanism' },
      { id: 'stack-pointer', titleIt: 'Stack Pointer (SP)', titleEn: 'Stack Pointer (SP)', anchor: 'stack-pointer' },
      { id: 'push-pop', titleIt: 'PUSH/POP Internals', titleEn: 'PUSH/POP Internals', anchor: 'push-pop' },
      { id: 'call-ret', titleIt: 'CALL/RET Internals', titleEn: 'CALL/RET Internals', anchor: 'call-ret' },
      { id: 'stack-vs-memory', titleIt: 'Stack vs Memoria', titleEn: 'Stack vs Memory', anchor: 'stack-vs-memory' },
    ]
  }
];

// Helper function to get opcode by instruction name
export function getOpcode(instruction: string): OpcodeInfo | undefined {
  return OPCODE_TABLE.find(op => op.instruction.toUpperCase() === instruction.toUpperCase());
}

// Helper function to get all opcodes by category
export function getOpcodesByCategory(category: string): OpcodeInfo[] {
  return OPCODE_TABLE.filter(op => op.category === category);
}

// Helper function to get navigation node by ID
export function getNavNode(nodeId: string): NavigationNode | undefined {
  return DOCUMENTATION_NAV.find(node => node.id === nodeId);
}

// Helper function to get all section IDs for a language
export function getAllSectionIds(): string[] {
  return DOCUMENTATION_NAV.map(node => node.id);
}
