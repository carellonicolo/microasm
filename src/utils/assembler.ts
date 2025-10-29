import { Instruction, RuntimeError } from '@/types/microasm';

const VALID_OPCODES = [
  'MOV', 'PUSH', 'POP',
  'ADD', 'SUB', 'MOL', 'DIV', 'INC', 'DEC',
  'AND', 'OR', 'NOT',
  'JMP', 'JZ', 'JNZ', 'JS', 'CALL', 'RET',
  'CMP', 'OUT', 'HLT'
];

export function parseProgram(sourceCode: string): { instructions: Instruction[], labels: Map<string, number>, error?: RuntimeError } {
  const lines = sourceCode.split('\n');
  const instructions: Instruction[] = [];
  const labels = new Map<string, number>();
  
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    
    // Skip empty lines and comments
    if (!rawLine || rawLine.startsWith(';')) continue;
    
    // Remove inline comments
    const withoutComment = rawLine.split(';')[0].trim();
    if (!withoutComment) continue;
    
    // Check for label
    let label: string | undefined;
    let codePart = withoutComment;
    
    if (withoutComment.includes(':')) {
      const parts = withoutComment.split(':');
      label = parts[0].trim().toUpperCase();
      codePart = parts.slice(1).join(':').trim();
      
      // Store label pointing to next instruction index
      labels.set(label, instructions.length);
      
      // If there's no code after the label, continue
      if (!codePart) continue;
    }
    
    // Parse instruction
    const tokens = codePart.split(/[\s,]+/).filter(t => t);
    if (tokens.length === 0) continue;
    
    const opcode = tokens[0].toUpperCase();
    
    // Validate opcode
    if (!VALID_OPCODES.includes(opcode)) {
      return { 
        instructions: [], 
        labels: new Map(),
        error: { message: `Invalid instruction: ${opcode}`, line: i + 1 }
      };
    }
    
    const operands = tokens.slice(1);
    
    instructions.push({
      line: i + 1,
      label,
      opcode,
      operands,
      rawLine: withoutComment
    });
  }
  
  // Validate label references
  for (const instr of instructions) {
    if (['JMP', 'JZ', 'JNZ', 'JS', 'CALL'].includes(instr.opcode)) {
      if (instr.operands.length === 0) {
        return {
          instructions: [],
          labels: new Map(),
          error: { message: `${instr.opcode} requires a label`, line: instr.line }
        };
      }
      const targetLabel = instr.operands[0].toUpperCase();
      if (!labels.has(targetLabel)) {
        return {
          instructions: [],
          labels: new Map(),
          error: { message: `Undefined label: ${targetLabel}`, line: instr.line }
        };
      }
    }
  }
  
  return { instructions, labels };
}

export function validateOperand(operand: string): { valid: boolean, error?: string } {
  // Register
  if (/^R[0-3]$/i.test(operand)) return { valid: true };
  
  // Immediate value
  if (/^-?\d+$/.test(operand)) {
    const val = parseInt(operand);
    if (val < -32768 || val > 32767) {
      return { valid: false, error: 'Immediate value out of range (-32768 to 32767)' };
    }
    return { valid: true };
  }
  
  // Direct memory address [num]
  if (/^\[\d+\]$/.test(operand)) {
    const addr = parseInt(operand.slice(1, -1));
    if (addr < 0 || addr > 255) {
      return { valid: false, error: 'Memory address out of range (0 to 255)' };
    }
    return { valid: true };
  }
  
  // Indirect memory address [Rx]
  if (/^\[R[0-3]\]$/i.test(operand)) return { valid: true };
  
  // Label (for jumps/calls)
  if (/^[A-Z_][A-Z0-9_]*$/i.test(operand)) return { valid: true };
  
  return { valid: false, error: 'Invalid operand format' };
}
