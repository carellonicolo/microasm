import { CPUState, Instruction, Register, RuntimeError } from '@/types/microasm';

export class CPUExecutor {
  cpu: CPUState;
  memory: number[];
  instructions: Instruction[];
  labels: Map<string, number>;
  output: string[];
  halted: boolean;
  
  constructor(instructions: Instruction[], labels: Map<string, number>) {
    this.cpu = {
      R0: 0, R1: 0, R2: 0, R3: 0,
      PC: 0, SP: 256,
      ZF: false, SF: false
    };
    this.memory = new Array(256).fill(0);
    this.instructions = instructions;
    this.labels = labels;
    this.output = [];
    this.halted = false;
  }
  
  reset() {
    this.cpu = {
      R0: 0, R1: 0, R2: 0, R3: 0,
      PC: 0, SP: 256,
      ZF: false, SF: false
    };
    this.memory.fill(0);
    this.output = [];
    this.halted = false;
  }
  
  step(): RuntimeError | null {
    if (this.halted) return null;
    if (this.cpu.PC >= this.instructions.length) {
      return { message: 'Execution out of bounds' };
    }
    
    const instr = this.instructions[this.cpu.PC];
    const error = this.executeInstruction(instr);
    
    if (!error && !this.halted) {
      this.cpu.PC++;
    }
    
    return error;
  }
  
  private executeInstruction(instr: Instruction): RuntimeError | null {
    try {
      switch (instr.opcode) {
        case 'MOV': return this.execMOV(instr);
        case 'PUSH': return this.execPUSH(instr);
        case 'POP': return this.execPOP(instr);
        case 'ADD': return this.execADD(instr);
        case 'SUB': return this.execSUB(instr);
        case 'MOL': return this.execMOL(instr);
        case 'DIV': return this.execDIV(instr);
        case 'INC': return this.execINC(instr);
        case 'DEC': return this.execDEC(instr);
        case 'AND': return this.execAND(instr);
        case 'OR': return this.execOR(instr);
        case 'NOT': return this.execNOT(instr);
        case 'JMP': return this.execJMP(instr);
        case 'JZ': return this.execJZ(instr);
        case 'JNZ': return this.execJNZ(instr);
        case 'JS': return this.execJS(instr);
        case 'CALL': return this.execCALL(instr);
        case 'RET': return this.execRET(instr);
        case 'CMP': return this.execCMP(instr);
        case 'OUT': return this.execOUT(instr);
        case 'HLT': this.halted = true; return null;
        default: return { message: `Unknown instruction: ${instr.opcode}`, line: instr.line };
      }
    } catch (e) {
      return { message: e instanceof Error ? e.message : 'Unknown error', line: instr.line };
    }
  }
  
  private getValue(operand: string): number {
    // Register
    if (/^R[0-3]$/i.test(operand)) {
      return this.cpu[operand.toUpperCase() as Register];
    }
    // Immediate
    if (/^-?\d+$/.test(operand)) {
      return parseInt(operand);
    }
    // Direct address [n]
    if (/^\[\d+\]$/.test(operand)) {
      const addr = parseInt(operand.slice(1, -1));
      if (addr < 0 || addr > 255) throw new Error('Invalid memory access');
      return this.memory[addr];
    }
    // Indirect address [Rx]
    if (/^\[R[0-3]\]$/i.test(operand)) {
      const reg = operand.slice(1, -1).toUpperCase() as Register;
      const addr = this.cpu[reg];
      if (addr < 0 || addr > 255) throw new Error('Invalid memory access');
      return this.memory[addr];
    }
    throw new Error(`Invalid operand: ${operand}`);
  }
  
  private setValue(operand: string, value: number): void {
    const clamped = this.clamp16bit(value);
    
    // Register
    if (/^R[0-3]$/i.test(operand)) {
      this.cpu[operand.toUpperCase() as Register] = clamped;
      return;
    }
    // Direct address [n]
    if (/^\[\d+\]$/.test(operand)) {
      const addr = parseInt(operand.slice(1, -1));
      if (addr < 0 || addr > 255) throw new Error('Invalid memory access');
      this.memory[addr] = clamped;
      return;
    }
    // Indirect address [Rx]
    if (/^\[R[0-3]\]$/i.test(operand)) {
      const reg = operand.slice(1, -1).toUpperCase() as Register;
      const addr = this.cpu[reg];
      if (addr < 0 || addr > 255) throw new Error('Invalid memory access');
      this.memory[addr] = clamped;
      return;
    }
    throw new Error(`Cannot set value for: ${operand}`);
  }
  
  private updateFlags(value: number): void {
    const clamped = this.clamp16bit(value);
    this.cpu.ZF = clamped === 0;
    this.cpu.SF = clamped < 0;
  }
  
  private clamp16bit(value: number): number {
    // Clamp to 16-bit signed integer range
    if (value > 32767) return 32767;
    if (value < -32768) return -32768;
    return Math.floor(value);
  }
  
  // Instruction implementations
  private execMOV(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 2) return { message: 'MOV requires 2 operands', line: instr.line };
    const value = this.getValue(instr.operands[1]);
    this.setValue(instr.operands[0], value);
    return null;
  }
  
  private execPUSH(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 1) return { message: 'PUSH requires 1 operand', line: instr.line };
    if (this.cpu.SP <= 0) return { message: 'Stack overflow', line: instr.line };
    this.cpu.SP--;
    const value = this.getValue(instr.operands[0]);
    this.memory[this.cpu.SP] = value;
    return null;
  }
  
  private execPOP(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 1) return { message: 'POP requires 1 operand', line: instr.line };
    if (this.cpu.SP >= 256) return { message: 'Stack underflow', line: instr.line };
    const value = this.memory[this.cpu.SP];
    this.cpu.SP++;
    this.setValue(instr.operands[0], value);
    return null;
  }
  
  private execADD(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 2) return { message: 'ADD requires 2 operands', line: instr.line };
    const dest = this.getValue(instr.operands[0]);
    const src = this.getValue(instr.operands[1]);
    const result = dest + src;
    if (result > 32767 || result < -32768) return { message: 'Arithmetic overflow', line: instr.line };
    this.setValue(instr.operands[0], result);
    this.updateFlags(result);
    return null;
  }
  
  private execSUB(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 2) return { message: 'SUB requires 2 operands', line: instr.line };
    const dest = this.getValue(instr.operands[0]);
    const src = this.getValue(instr.operands[1]);
    const result = dest - src;
    if (result > 32767 || result < -32768) return { message: 'Arithmetic overflow', line: instr.line };
    this.setValue(instr.operands[0], result);
    this.updateFlags(result);
    return null;
  }
  
  private execMOL(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 2) return { message: 'MOL requires 2 operands', line: instr.line };
    const dest = this.getValue(instr.operands[0]);
    const src = this.getValue(instr.operands[1]);
    const result = dest * src;
    if (result > 32767 || result < -32768) return { message: 'Arithmetic overflow', line: instr.line };
    this.setValue(instr.operands[0], result);
    this.updateFlags(result);
    return null;
  }
  
  private execDIV(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 2) return { message: 'DIV requires 2 operands', line: instr.line };
    const dest = this.getValue(instr.operands[0]);
    const src = this.getValue(instr.operands[1]);
    if (src === 0) return { message: 'Division by zero', line: instr.line };
    const result = Math.floor(dest / src);
    this.setValue(instr.operands[0], result);
    this.updateFlags(result);
    return null;
  }
  
  private execINC(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 1) return { message: 'INC requires 1 operand', line: instr.line };
    const value = this.getValue(instr.operands[0]);
    const result = value + 1;
    if (result > 32767) return { message: 'Arithmetic overflow', line: instr.line };
    this.setValue(instr.operands[0], result);
    this.updateFlags(result);
    return null;
  }
  
  private execDEC(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 1) return { message: 'DEC requires 1 operand', line: instr.line };
    const value = this.getValue(instr.operands[0]);
    const result = value - 1;
    if (result < -32768) return { message: 'Arithmetic overflow', line: instr.line };
    this.setValue(instr.operands[0], result);
    this.updateFlags(result);
    return null;
  }
  
  private execAND(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 2) return { message: 'AND requires 2 operands', line: instr.line };
    const dest = this.getValue(instr.operands[0]);
    const src = this.getValue(instr.operands[1]);
    const result = dest & src;
    this.setValue(instr.operands[0], result);
    this.updateFlags(result);
    return null;
  }
  
  private execOR(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 2) return { message: 'OR requires 2 operands', line: instr.line };
    const dest = this.getValue(instr.operands[0]);
    const src = this.getValue(instr.operands[1]);
    const result = dest | src;
    this.setValue(instr.operands[0], result);
    this.updateFlags(result);
    return null;
  }
  
  private execNOT(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 1) return { message: 'NOT requires 1 operand', line: instr.line };
    const value = this.getValue(instr.operands[0]);
    const result = ~value;
    this.setValue(instr.operands[0], result);
    this.updateFlags(result);
    return null;
  }
  
  private execJMP(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 1) return { message: 'JMP requires a label', line: instr.line };
    const label = instr.operands[0].toUpperCase();
    const addr = this.labels.get(label);
    if (addr === undefined) return { message: `Undefined label: ${label}`, line: instr.line };
    this.cpu.PC = addr - 1; // -1 because PC will be incremented after
    return null;
  }
  
  private execJZ(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 1) return { message: 'JZ requires a label', line: instr.line };
    if (this.cpu.ZF) {
      const label = instr.operands[0].toUpperCase();
      const addr = this.labels.get(label);
      if (addr === undefined) return { message: `Undefined label: ${label}`, line: instr.line };
      this.cpu.PC = addr - 1;
    }
    return null;
  }
  
  private execJNZ(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 1) return { message: 'JNZ requires a label', line: instr.line };
    if (!this.cpu.ZF) {
      const label = instr.operands[0].toUpperCase();
      const addr = this.labels.get(label);
      if (addr === undefined) return { message: `Undefined label: ${label}`, line: instr.line };
      this.cpu.PC = addr - 1;
    }
    return null;
  }
  
  private execJS(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 1) return { message: 'JS requires a label', line: instr.line };
    if (this.cpu.SF) {
      const label = instr.operands[0].toUpperCase();
      const addr = this.labels.get(label);
      if (addr === undefined) return { message: `Undefined label: ${label}`, line: instr.line };
      this.cpu.PC = addr - 1;
    }
    return null;
  }
  
  private execCALL(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 1) return { message: 'CALL requires a label', line: instr.line };
    if (this.cpu.SP <= 0) return { message: 'Stack overflow', line: instr.line };
    
    // Push return address (next instruction)
    this.cpu.SP--;
    this.memory[this.cpu.SP] = this.cpu.PC + 1;
    
    const label = instr.operands[0].toUpperCase();
    const addr = this.labels.get(label);
    if (addr === undefined) return { message: `Undefined label: ${label}`, line: instr.line };
    this.cpu.PC = addr - 1;
    return null;
  }
  
  private execRET(instr: Instruction): RuntimeError | null {
    if (this.cpu.SP >= 256) return { message: 'Stack underflow', line: instr.line };
    const retAddr = this.memory[this.cpu.SP];
    this.cpu.SP++;
    this.cpu.PC = retAddr - 1;
    return null;
  }
  
  private execCMP(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 2) return { message: 'CMP requires 2 operands', line: instr.line };
    const op1 = this.getValue(instr.operands[0]);
    const op2 = this.getValue(instr.operands[1]);
    const result = op1 - op2;
    this.updateFlags(result);
    return null;
  }
  
  private execOUT(instr: Instruction): RuntimeError | null {
    if (instr.operands.length < 1) return { message: 'OUT requires 1 operand', line: instr.line };
    const value = this.getValue(instr.operands[0]);
    this.output.push(value.toString());
    return null;
  }
}
