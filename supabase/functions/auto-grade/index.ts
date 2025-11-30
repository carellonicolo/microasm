import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ==================== TYPES ====================
type Register = 'R0' | 'R1' | 'R2' | 'R3';

interface CPUState {
  R0: number;
  R1: number;
  R2: number;
  R3: number;
  PC: number;
  SP: number;
  ZF: boolean;
  SF: boolean;
}

interface Instruction {
  line: number;
  label?: string;
  opcode: string;
  operands: string[];
  rawLine: string;
}

interface RuntimeError {
  message: string;
  line?: number;
}

// ==================== ASSEMBLER ====================
const VALID_OPCODES = [
  'MOV', 'PUSH', 'POP',
  'ADD', 'SUB', 'MOL', 'DIV', 'INC', 'DEC',
  'AND', 'OR', 'NOT',
  'JMP', 'JZ', 'JNZ', 'JS', 'JNS', 'CALL', 'RET',
  'CMP', 'OUT', 'HLT'
];

function parseProgram(sourceCode: string): { 
  instructions: Instruction[], 
  labels: Map<string, number>, 
  error?: RuntimeError 
} {
  const lines = sourceCode.split('\n');
  const instructions: Instruction[] = [];
  const labels = new Map<string, number>();
  
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    
    if (!rawLine || rawLine.startsWith(';')) continue;
    
    const withoutComment = rawLine.split(';')[0].trim();
    if (!withoutComment) continue;
    
    let label: string | undefined;
    let codePart = withoutComment;
    
    if (withoutComment.includes(':')) {
      const parts = withoutComment.split(':');
      label = parts[0].trim().toUpperCase();
      codePart = parts.slice(1).join(':').trim();
      
      labels.set(label, instructions.length);
      
      if (!codePart) continue;
    }
    
    const tokens = codePart.split(/[\s,]+/).filter(t => t);
    if (tokens.length === 0) continue;
    
    const opcode = tokens[0].toUpperCase();
    
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
    if (['JMP', 'JZ', 'JNZ', 'JS', 'JNS', 'CALL'].includes(instr.opcode)) {
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

// ==================== EXECUTOR ====================
class CPUExecutor {
  private state: CPUState;
  private memory: number[];
  private instructions: Instruction[];
  private labels: Map<string, number>;
  private output: string[];
  private maxSteps: number;
  private stepCount: number;

  constructor(instructions: Instruction[], labels: Map<string, number>, maxSteps = 100000) {
    this.instructions = instructions;
    this.labels = labels;
    this.maxSteps = maxSteps;
    this.stepCount = 0;
    this.output = [];
    this.state = {
      R0: 0, R1: 0, R2: 0, R3: 0,
      PC: 0, SP: 255, ZF: false, SF: false
    };
    this.memory = new Array(256).fill(0);
  }

  step(): RuntimeError | null {
    if (this.stepCount >= this.maxSteps) {
      return { message: 'Execution limit exceeded (possible infinite loop)' };
    }
    this.stepCount++;

    if (this.state.PC < 0 || this.state.PC >= this.instructions.length) {
      return { message: 'Program counter out of bounds' };
    }

    const instr = this.instructions[this.state.PC];
    const error = this.executeInstruction(instr);
    
    if (error) {
      error.line = instr.line;
      return error;
    }

    return null;
  }

  getOutput(): string[] {
    return this.output;
  }

  private executeInstruction(instr: Instruction): RuntimeError | null {
    const { opcode, operands } = instr;

    switch (opcode) {
      case 'MOV': return this.execMOV(operands);
      case 'PUSH': return this.execPUSH(operands);
      case 'POP': return this.execPOP(operands);
      case 'ADD': return this.execADD(operands);
      case 'SUB': return this.execSUB(operands);
      case 'MOL': return this.execMOL(operands);
      case 'DIV': return this.execDIV(operands);
      case 'INC': return this.execINC(operands);
      case 'DEC': return this.execDEC(operands);
      case 'AND': return this.execAND(operands);
      case 'OR': return this.execOR(operands);
      case 'NOT': return this.execNOT(operands);
      case 'JMP': return this.execJMP(operands);
      case 'JZ': return this.execJZ(operands);
      case 'JNZ': return this.execJNZ(operands);
      case 'JS': return this.execJS(operands);
      case 'JNS': return this.execJNS(operands);
      case 'CALL': return this.execCALL(operands);
      case 'RET': return this.execRET();
      case 'CMP': return this.execCMP(operands);
      case 'OUT': return this.execOUT(operands);
      case 'HLT': return { message: 'HALT' };
      default: return { message: `Unknown opcode: ${opcode}` };
    }
  }

  private getValue(operand: string): number | RuntimeError {
    if (/^R[0-3]$/i.test(operand)) {
      const reg = operand.toUpperCase() as Register;
      return this.state[reg];
    }
    if (/^-?\d+$/.test(operand)) {
      return parseInt(operand);
    }
    if (/^\[\d+\]$/.test(operand)) {
      const addr = parseInt(operand.slice(1, -1));
      if (addr < 0 || addr > 255) return { message: 'Memory address out of range' };
      return this.memory[addr];
    }
    if (/^\[R[0-3]\]$/i.test(operand)) {
      const reg = operand.slice(1, -1).toUpperCase() as Register;
      const addr = this.state[reg];
      if (addr < 0 || addr > 255) return { message: 'Memory address out of range' };
      return this.memory[addr];
    }
    return { message: `Invalid operand: ${operand}` };
  }

  private setValue(operand: string, value: number): RuntimeError | null {
    const clamped = this.clamp16bit(value);
    
    if (/^R[0-3]$/i.test(operand)) {
      const reg = operand.toUpperCase() as Register;
      this.state[reg] = clamped;
      return null;
    }
    if (/^\[\d+\]$/.test(operand)) {
      const addr = parseInt(operand.slice(1, -1));
      if (addr < 0 || addr > 255) return { message: 'Memory address out of range' };
      this.memory[addr] = clamped;
      return null;
    }
    if (/^\[R[0-3]\]$/i.test(operand)) {
      const reg = operand.slice(1, -1).toUpperCase() as Register;
      const addr = this.state[reg];
      if (addr < 0 || addr > 255) return { message: 'Memory address out of range' };
      this.memory[addr] = clamped;
      return null;
    }
    return { message: `Cannot write to: ${operand}` };
  }

  private updateFlags(value: number): void {
    this.state.ZF = (value === 0);
    this.state.SF = (value < 0);
  }

  private clamp16bit(value: number): number {
    if (value > 32767) return value - 65536;
    if (value < -32768) return value + 65536;
    return value;
  }

  private execMOV(operands: string[]): RuntimeError | null {
    if (operands.length !== 2) return { message: 'MOV requires 2 operands' };
    const value = this.getValue(operands[1]);
    if (typeof value === 'object') return value;
    const error = this.setValue(operands[0], value);
    if (error) return error;
    this.state.PC++;
    return null;
  }

  private execPUSH(operands: string[]): RuntimeError | null {
    if (operands.length !== 1) return { message: 'PUSH requires 1 operand' };
    const value = this.getValue(operands[0]);
    if (typeof value === 'object') return value;
    if (this.state.SP < 0) return { message: 'Stack overflow' };
    this.memory[this.state.SP] = value;
    this.state.SP--;
    this.state.PC++;
    return null;
  }

  private execPOP(operands: string[]): RuntimeError | null {
    if (operands.length !== 1) return { message: 'POP requires 1 operand' };
    if (this.state.SP >= 255) return { message: 'Stack underflow' };
    this.state.SP++;
    const value = this.memory[this.state.SP];
    const error = this.setValue(operands[0], value);
    if (error) return error;
    this.state.PC++;
    return null;
  }

  private execADD(operands: string[]): RuntimeError | null {
    if (operands.length !== 2) return { message: 'ADD requires 2 operands' };
    const val1 = this.getValue(operands[0]);
    if (typeof val1 === 'object') return val1;
    const val2 = this.getValue(operands[1]);
    if (typeof val2 === 'object') return val2;
    const result = val1 + val2;
    const error = this.setValue(operands[0], result);
    if (error) return error;
    this.updateFlags(this.clamp16bit(result));
    this.state.PC++;
    return null;
  }

  private execSUB(operands: string[]): RuntimeError | null {
    if (operands.length !== 2) return { message: 'SUB requires 2 operands' };
    const val1 = this.getValue(operands[0]);
    if (typeof val1 === 'object') return val1;
    const val2 = this.getValue(operands[1]);
    if (typeof val2 === 'object') return val2;
    const result = val1 - val2;
    const error = this.setValue(operands[0], result);
    if (error) return error;
    this.updateFlags(this.clamp16bit(result));
    this.state.PC++;
    return null;
  }

  private execMOL(operands: string[]): RuntimeError | null {
    if (operands.length !== 2) return { message: 'MOL requires 2 operands' };
    const val1 = this.getValue(operands[0]);
    if (typeof val1 === 'object') return val1;
    const val2 = this.getValue(operands[1]);
    if (typeof val2 === 'object') return val2;
    const result = val1 * val2;
    const error = this.setValue(operands[0], result);
    if (error) return error;
    this.updateFlags(this.clamp16bit(result));
    this.state.PC++;
    return null;
  }

  private execDIV(operands: string[]): RuntimeError | null {
    if (operands.length !== 2) return { message: 'DIV requires 2 operands' };
    const val1 = this.getValue(operands[0]);
    if (typeof val1 === 'object') return val1;
    const val2 = this.getValue(operands[1]);
    if (typeof val2 === 'object') return val2;
    if (val2 === 0) return { message: 'Division by zero' };
    const result = Math.floor(val1 / val2);
    const error = this.setValue(operands[0], result);
    if (error) return error;
    this.updateFlags(result);
    this.state.PC++;
    return null;
  }

  private execINC(operands: string[]): RuntimeError | null {
    if (operands.length !== 1) return { message: 'INC requires 1 operand' };
    const value = this.getValue(operands[0]);
    if (typeof value === 'object') return value;
    const result = value + 1;
    const error = this.setValue(operands[0], result);
    if (error) return error;
    this.updateFlags(this.clamp16bit(result));
    this.state.PC++;
    return null;
  }

  private execDEC(operands: string[]): RuntimeError | null {
    if (operands.length !== 1) return { message: 'DEC requires 1 operand' };
    const value = this.getValue(operands[0]);
    if (typeof value === 'object') return value;
    const result = value - 1;
    const error = this.setValue(operands[0], result);
    if (error) return error;
    this.updateFlags(this.clamp16bit(result));
    this.state.PC++;
    return null;
  }

  private execAND(operands: string[]): RuntimeError | null {
    if (operands.length !== 2) return { message: 'AND requires 2 operands' };
    const val1 = this.getValue(operands[0]);
    if (typeof val1 === 'object') return val1;
    const val2 = this.getValue(operands[1]);
    if (typeof val2 === 'object') return val2;
    const result = val1 & val2;
    const error = this.setValue(operands[0], result);
    if (error) return error;
    this.updateFlags(result);
    this.state.PC++;
    return null;
  }

  private execOR(operands: string[]): RuntimeError | null {
    if (operands.length !== 2) return { message: 'OR requires 2 operands' };
    const val1 = this.getValue(operands[0]);
    if (typeof val1 === 'object') return val1;
    const val2 = this.getValue(operands[1]);
    if (typeof val2 === 'object') return val2;
    const result = val1 | val2;
    const error = this.setValue(operands[0], result);
    if (error) return error;
    this.updateFlags(result);
    this.state.PC++;
    return null;
  }

  private execNOT(operands: string[]): RuntimeError | null {
    if (operands.length !== 1) return { message: 'NOT requires 1 operand' };
    const value = this.getValue(operands[0]);
    if (typeof value === 'object') return value;
    const result = ~value;
    const error = this.setValue(operands[0], result);
    if (error) return error;
    this.updateFlags(this.clamp16bit(result));
    this.state.PC++;
    return null;
  }

  private execJMP(operands: string[]): RuntimeError | null {
    if (operands.length !== 1) return { message: 'JMP requires 1 operand' };
    const target = this.labels.get(operands[0].toUpperCase());
    if (target === undefined) return { message: `Label not found: ${operands[0]}` };
    this.state.PC = target;
    return null;
  }

  private execJZ(operands: string[]): RuntimeError | null {
    if (operands.length !== 1) return { message: 'JZ requires 1 operand' };
    if (this.state.ZF) {
      const target = this.labels.get(operands[0].toUpperCase());
      if (target === undefined) return { message: `Label not found: ${operands[0]}` };
      this.state.PC = target;
    } else {
      this.state.PC++;
    }
    return null;
  }

  private execJNZ(operands: string[]): RuntimeError | null {
    if (operands.length !== 1) return { message: 'JNZ requires 1 operand' };
    if (!this.state.ZF) {
      const target = this.labels.get(operands[0].toUpperCase());
      if (target === undefined) return { message: `Label not found: ${operands[0]}` };
      this.state.PC = target;
    } else {
      this.state.PC++;
    }
    return null;
  }

  private execJS(operands: string[]): RuntimeError | null {
    if (operands.length !== 1) return { message: 'JS requires 1 operand' };
    if (this.state.SF) {
      const target = this.labels.get(operands[0].toUpperCase());
      if (target === undefined) return { message: `Label not found: ${operands[0]}` };
      this.state.PC = target;
    } else {
      this.state.PC++;
    }
    return null;
  }

  private execJNS(operands: string[]): RuntimeError | null {
    if (operands.length !== 1) return { message: 'JNS requires 1 operand' };
    if (!this.state.SF) {
      const target = this.labels.get(operands[0].toUpperCase());
      if (target === undefined) return { message: `Label not found: ${operands[0]}` };
      this.state.PC = target;
    } else {
      this.state.PC++;
    }
    return null;
  }

  private execCALL(operands: string[]): RuntimeError | null {
    if (operands.length !== 1) return { message: 'CALL requires 1 operand' };
    const target = this.labels.get(operands[0].toUpperCase());
    if (target === undefined) return { message: `Label not found: ${operands[0]}` };
    if (this.state.SP < 0) return { message: 'Stack overflow' };
    this.memory[this.state.SP] = this.state.PC + 1;
    this.state.SP--;
    this.state.PC = target;
    return null;
  }

  private execRET(): RuntimeError | null {
    if (this.state.SP >= 255) return { message: 'Stack underflow' };
    this.state.SP++;
    this.state.PC = this.memory[this.state.SP];
    return null;
  }

  private execCMP(operands: string[]): RuntimeError | null {
    if (operands.length !== 2) return { message: 'CMP requires 2 operands' };
    const val1 = this.getValue(operands[0]);
    if (typeof val1 === 'object') return val1;
    const val2 = this.getValue(operands[1]);
    if (typeof val2 === 'object') return val2;
    const result = val1 - val2;
    this.updateFlags(this.clamp16bit(result));
    this.state.PC++;
    return null;
  }

  private execOUT(operands: string[]): RuntimeError | null {
    if (operands.length !== 1) return { message: 'OUT requires 1 operand' };
    const value = this.getValue(operands[0]);
    if (typeof value === 'object') return value;
    this.output.push(value.toString());
    this.state.PC++;
    return null;
  }
}

// ==================== OUTPUT COMPARISON ====================
interface ComparisonResult {
  match: 'full' | 'partial' | 'none';
  matchedLines: number;
  totalLines: number;
  grade: number;
  maxGrade: number;
  feedback: string;
}

function normalizeOutput(output: string): string[] {
  return output
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

function compareOutput(
  studentOutput: string[],
  expectedOutput: string,
  maxPoints: number
): ComparisonResult {
  const expected = normalizeOutput(expectedOutput);
  const student = studentOutput.map(s => s.trim());

  // Handle empty expected output
  if (expected.length === 0) {
    return {
      match: 'none',
      matchedLines: 0,
      totalLines: 0,
      grade: 0,
      maxGrade: maxPoints,
      feedback: 'Nessun output atteso definito per questo esercizio.'
    };
  }

  // Check for exact match
  if (student.length === expected.length) {
    const allMatch = student.every((line, idx) => line === expected[idx]);
    if (allMatch) {
      return {
        match: 'full',
        matchedLines: expected.length,
        totalLines: expected.length,
        grade: maxPoints,
        maxGrade: maxPoints,
        feedback: `✅ Output corretto! Tutte le ${expected.length} righe corrispondono perfettamente.`
      };
    }
  }

  // Partial match: count matching lines
  const minLength = Math.min(student.length, expected.length);
  let matchedLines = 0;
  const differences: string[] = [];

  for (let i = 0; i < minLength; i++) {
    if (student[i] === expected[i]) {
      matchedLines++;
    } else {
      differences.push(`Riga ${i + 1}: atteso "${expected[i]}", ottenuto "${student[i]}"`);
    }
  }

  // Check for length mismatch
  if (student.length !== expected.length) {
    differences.push(`Numero righe: attese ${expected.length}, ottenute ${student.length}`);
  }

  if (matchedLines === 0) {
    return {
      match: 'none',
      matchedLines: 0,
      totalLines: expected.length,
      grade: 0,
      maxGrade: maxPoints,
      feedback: `❌ Output completamente errato.\n\n` +
        `Output atteso:\n${expected.join('\n')}\n\n` +
        `Output ottenuto:\n${student.join('\n') || '(nessun output)'}\n\n` +
        `Differenze:\n${differences.join('\n')}`
    };
  }

  // Proportional grading
  const percentage = matchedLines / expected.length;
  const grade = Math.round(maxPoints * percentage * 10) / 10;

  return {
    match: 'partial',
    matchedLines,
    totalLines: expected.length,
    grade,
    maxGrade: maxPoints,
    feedback: `⚠️ Output parzialmente corretto: ${matchedLines}/${expected.length} righe corrette (${Math.round(percentage * 100)}%).\n\n` +
      `Punteggio assegnato: ${grade}/${maxPoints}\n\n` +
      `Differenze:\n${differences.slice(0, 5).join('\n')}` +
      (differences.length > 5 ? `\n... e altre ${differences.length - 5} differenze` : '')
  };
}

// ==================== MAIN HANDLER ====================
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { assignment_id } = await req.json();

    if (!assignment_id) {
      return new Response(
        JSON.stringify({ error: 'assignment_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🚀 Starting auto-grading for assignment ${assignment_id}`);

    // 1. Fetch assignment with exercises
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select(`
        *,
        assignment_exercises (
          id,
          repository_exercise_id,
          custom_exercise_id,
          max_points,
          display_order,
          exercise_repository (
            expected_output,
            solution_code
          ),
          custom_exercises (
            expected_output,
            solution_code
          )
        )
      `)
      .eq('id', assignment_id)
      .single();

    if (assignmentError || !assignment) {
      throw new Error(`Assignment not found: ${assignmentError?.message}`);
    }

    console.log(`📋 Assignment: ${assignment.title}, Exercises: ${assignment.assignment_exercises?.length || 0}`);

    // 2. Fetch all final submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        student_id,
        submission_answers (
          id,
          assignment_exercise_id,
          submitted_code
        )
      `)
      .eq('assignment_id', assignment_id)
      .eq('is_final', true);

    if (submissionsError) {
      throw new Error(`Error fetching submissions: ${submissionsError.message}`);
    }

    console.log(`👥 Found ${submissions?.length || 0} final submissions to grade`);

    let totalGraded = 0;
    let totalErrors = 0;

    // 3. Process each submission
    for (const submission of submissions || []) {
      console.log(`\n📝 Processing submission ${submission.id} for student ${submission.student_id}`);

      for (const answer of submission.submission_answers || []) {
        // Find corresponding exercise
        const exercise = assignment.assignment_exercises?.find(
          (ex: any) => ex.id === answer.assignment_exercise_id
        );

        if (!exercise) {
          console.warn(`⚠️ Exercise not found for answer ${answer.id}`);
          continue;
        }

        const expectedOutput = exercise.exercise_repository?.expected_output || 
                               exercise.custom_exercises?.expected_output;
        const maxPoints = exercise.max_points;

        if (!expectedOutput) {
          console.log(`⏭️ Skipping answer ${answer.id}: no expected output defined`);
          
          await supabase.from('auto_grading_logs').insert({
            assignment_id,
            submission_id: submission.id,
            submission_answer_id: answer.id,
            status: 'skipped',
            error_message: 'No expected output defined for this exercise',
            max_grade: maxPoints
          });
          
          continue;
        }

        const startTime = Date.now();
        let status = 'success';
        let studentOutput: string[] = [];
        let grade = 0;
        let feedback = '';
        let errorMessage: string | null = null;

        try {
          // Parse student code
          const parseResult = parseProgram(answer.submitted_code || '');
          
          if (parseResult.error) {
            status = 'error';
            grade = 0;
            feedback = `❌ Errore di compilazione alla riga ${parseResult.error.line || '?'}:\n${parseResult.error.message}`;
            errorMessage = parseResult.error.message;
          } else {
            // Execute code
            const executor = new CPUExecutor(parseResult.instructions, parseResult.labels, 100000);
            let halted = false;
            
            while (!halted) {
              const error = executor.step();
              if (error) {
                if (error.message === 'HALT') {
                  halted = true;
                } else {
                  status = 'error';
                  grade = 0;
                  feedback = `❌ Errore di esecuzione alla riga ${error.line || '?'}:\n${error.message}`;
                  errorMessage = error.message;
                  break;
                }
              }
            }

            // If execution succeeded, compare output
            if (status === 'success') {
              studentOutput = executor.getOutput();
              const comparison = compareOutput(studentOutput, expectedOutput, maxPoints);
              
              grade = comparison.grade;
              feedback = comparison.feedback;
              
              if (comparison.match === 'none') {
                status = 'error';
              } else if (comparison.match === 'partial') {
                status = 'partial';
              }
            }
          }
        } catch (error) {
          status = 'error';
          grade = 0;
          const errorMsg = error instanceof Error ? error.message : String(error);
          feedback = `❌ Errore imprevisto durante l'esecuzione: ${errorMsg}`;
          errorMessage = errorMsg;
          console.error(`Error processing answer ${answer.id}:`, error);
          totalErrors++;
        }

        const executionTime = Date.now() - startTime;

        // Update submission_answer with grade and feedback
        const { error: updateError } = await supabase
          .from('submission_answers')
          .update({
            grade,
            feedback,
            is_auto_graded: true,
            graded_at: new Date().toISOString()
          })
          .eq('id', answer.id);

        if (updateError) {
          console.error(`Error updating answer ${answer.id}:`, updateError);
          totalErrors++;
        } else {
          totalGraded++;
          console.log(`✅ Graded answer ${answer.id}: ${grade}/${maxPoints} (${status})`);
        }

        // Log to auto_grading_logs
        await supabase.from('auto_grading_logs').insert({
          assignment_id,
          submission_id: submission.id,
          submission_answer_id: answer.id,
          status,
          student_output: studentOutput.join('\n'),
          expected_output: expectedOutput,
          grade_assigned: grade,
          max_grade: maxPoints,
          error_message: errorMessage,
          execution_time_ms: executionTime
        });
      }

      // Update submission status to graded
      await supabase
        .from('submissions')
        .update({ status: 'graded' })
        .eq('id', submission.id);
    }

    // 4. Mark assignment as auto-graded
    await supabase
      .from('assignments')
      .update({
        auto_graded: true,
        auto_graded_at: new Date().toISOString()
      })
      .eq('id', assignment_id);

    console.log(`\n✅ Auto-grading completed: ${totalGraded} answers graded, ${totalErrors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        assignment_id,
        total_graded: totalGraded,
        total_errors: totalErrors
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fatal error in auto-grade:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
