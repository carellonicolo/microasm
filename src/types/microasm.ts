export type Register = 'R0' | 'R1' | 'R2' | 'R3';

export interface CPUState {
  R0: number;
  R1: number;
  R2: number;
  R3: number;
  PC: number;
  SP: number;
  ZF: boolean;
  SF: boolean;
}

export interface Instruction {
  line: number;
  label?: string;
  opcode: string;
  operands: string[];
  rawLine: string;
}

export type DisplayFormat = 'decimal' | 'hexadecimal' | 'binary';

export type ExecutionState = 'idle' | 'running' | 'paused' | 'error';

export interface RuntimeError {
  message: string;
  line?: number;
}
