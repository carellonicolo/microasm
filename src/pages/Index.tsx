import { useState, useEffect, useRef } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { CPUStatus } from "@/components/CPUStatus";
import { MemoryView } from "@/components/MemoryView";
import { OutputLog } from "@/components/OutputLog";
import { DisplayFormat, ExecutionState } from "@/types/microasm";
import { parseProgram } from "@/utils/assembler";
import { CPUExecutor } from "@/utils/executor";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EXAMPLE_PROGRAMS = {
  factorial: `; Esempio: Calcolo fattoriale
MOV R0, 5          ; Numero per calcolare il fattoriale
MOV R1, 1          ; Risultato (inizia con 1)

LOOP:
CMP R0, 0          ; Confronta R0 con 0
JZ END             ; Se R0 = 0, salta a END
MOL R1, R0         ; R1 = R1 * R0
DEC R0             ; R0 = R0 - 1
JMP LOOP           ; Ripeti il loop

END:
OUT R1             ; Stampa il risultato
HLT                ; Termina il programma`,

  stackDemo: `; Esempio: Uso dello Stack
; Mostra come funzionano PUSH e POP

MOV R0, 10         ; R0 = 10
MOV R1, 20         ; R1 = 20
MOV R2, 30         ; R2 = 30

; Salva i valori nello stack
PUSH R0            ; Stack: [10], SP: 256→255
PUSH R1            ; Stack: [10, 20], SP: 255→254
PUSH R2            ; Stack: [10, 20, 30], SP: 254→253

; Ora modifica i registri
MOV R0, 0
MOV R1, 0
MOV R2, 0

; Recupera i valori dallo stack (ordine inverso!)
POP R2             ; R2 = 30, Stack: [10, 20], SP: 253→254
POP R1             ; R1 = 20, Stack: [10], SP: 254→255
POP R0             ; R0 = 10, Stack: [], SP: 255→256

; Stampa i risultati
OUT R0             ; Dovrebbe stampare 10
OUT R1             ; Dovrebbe stampare 20
OUT R2             ; Dovrebbe stampare 30
HLT`,

  subroutine: `; Esempio: Chiamata a Subroutine
; Dimostra l'uso di CALL e RET con lo stack

MOV R0, 5          ; Argomento per la funzione
CALL DOUBLE        ; Chiama la subroutine (pushia PC nello stack)
OUT R0             ; Stampa il risultato (dovrebbe essere 10)
HLT

DOUBLE:
; Subroutine che raddoppia R0
PUSH R1            ; Salva R1 (lo useremo temporaneamente)
MOV R1, R0         ; R1 = R0
ADD R0, R1         ; R0 = R0 + R1 (raddoppia)
POP R1             ; Ripristina R1
RET                ; Torna al chiamante (poppa PC dallo stack)`,

  signCheck: `; Esempio: Test del segno con JNS
; Controlla se un numero è positivo, negativo o zero

MOV R0, 10         ; Cambia questo valore per testare

; Test se zero
CMP R0, 0
JZ IS_ZERO

; Test se positivo (>= 0 e != 0, quindi > 0)
CMP R0, 0
JNS IS_POSITIVE

; Se arriviamo qui, è negativo
IS_NEGATIVE:
MOV R1, -1         ; R1 = -1 (codice per negativo)
JMP END

IS_POSITIVE:
MOV R1, 1          ; R1 = 1 (codice per positivo)
JMP END

IS_ZERO:
MOV R1, 0          ; R1 = 0 (codice per zero)

END:
OUT R1             ; Stampa: -1, 0, o 1
HLT`
};

const Index = () => {
  const [selectedExample, setSelectedExample] = useState<keyof typeof EXAMPLE_PROGRAMS>('factorial');
  const [code, setCode] = useState(EXAMPLE_PROGRAMS.factorial);
  const [format, setFormat] = useState<DisplayFormat>('decimal');
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  
  const executorRef = useRef<CPUExecutor | null>(null);
  const [cpu, setCpu] = useState({
    R0: 0, R1: 0, R2: 0, R3: 0,
    PC: 0, SP: 256,
    ZF: false, SF: false
  });
  const [memory, setMemory] = useState<number[]>(new Array(256).fill(0));
  const [output, setOutput] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState<number | undefined>();
  const runIntervalRef = useRef<number | null>(null);

  const updateState = () => {
    if (executorRef.current) {
      setCpu({ ...executorRef.current.cpu });
      setMemory([...executorRef.current.memory]);
      setOutput([...executorRef.current.output]);
      
      if (executorRef.current.cpu.PC < executorRef.current.instructions.length) {
        setCurrentLine(executorRef.current.instructions[executorRef.current.cpu.PC].line);
      }
    }
  };

  const handleLoad = () => {
    const { instructions, labels, error } = parseProgram(code);
    
    if (error) {
      setErrors([`Riga ${error.line}: ${error.message}`]);
      setExecutionState('error');
      toast.error('Errore di compilazione');
      return;
    }
    
    executorRef.current = new CPUExecutor(instructions, labels);
    setErrors([]);
    setExecutionState('idle');
    updateState();
    setCurrentLine(instructions.length > 0 ? instructions[0].line : undefined);
    toast.success('Programma caricato con successo');
  };

  const handleStep = () => {
    if (!executorRef.current) {
      toast.error('Carica prima un programma');
      return;
    }
    
    const error = executorRef.current.step();
    if (error) {
      setErrors([`Riga ${error.line || '?'}: ${error.message}`]);
      setExecutionState('error');
      toast.error('Errore di runtime');
    } else if (executorRef.current.halted) {
      setExecutionState('idle');
      toast.success('Programma terminato');
    }
    
    updateState();
  };

  const handleRun = () => {
    if (!executorRef.current) {
      toast.error('Carica prima un programma');
      return;
    }
    
    if (executionState === 'running') {
      // Stop
      if (runIntervalRef.current) {
        clearInterval(runIntervalRef.current);
        runIntervalRef.current = null;
      }
      setExecutionState('paused');
      toast.info('Esecuzione in pausa');
    } else {
      // Start
      setExecutionState('running');
      runIntervalRef.current = window.setInterval(() => {
        if (executorRef.current) {
          const error = executorRef.current.step();
          updateState();
          
          if (error) {
            setErrors([`Riga ${error.line || '?'}: ${error.message}`]);
            setExecutionState('error');
            if (runIntervalRef.current) clearInterval(runIntervalRef.current);
            toast.error('Errore di runtime');
          } else if (executorRef.current.halted) {
            setExecutionState('idle');
            if (runIntervalRef.current) clearInterval(runIntervalRef.current);
            toast.success('Programma terminato');
          }
        }
      }, 200);
      toast.info('Esecuzione in corso...');
    }
  };

  const handleReset = () => {
    if (runIntervalRef.current) {
      clearInterval(runIntervalRef.current);
      runIntervalRef.current = null;
    }
    
    if (executorRef.current) {
      executorRef.current.reset();
      updateState();
      setCurrentLine(
        executorRef.current.instructions.length > 0 
          ? executorRef.current.instructions[0].line 
          : undefined
      );
    }
    
    setErrors([]);
    setExecutionState('idle');
    toast.info('Reset completato');
  };

  useEffect(() => {
    return () => {
      if (runIntervalRef.current) {
        clearInterval(runIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-[1800px] mx-auto space-y-4">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MicroASM
          </h1>
          <p className="text-muted-foreground">
            Simulatore Didattico di Pseudo-Assembly
          </p>
          <p className="text-sm text-muted-foreground/80 italic">
            Powered by Prof. Nicolò Carello
          </p>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <label className="text-sm font-medium">Esempi:</label>
              <Select 
                value={selectedExample} 
                onValueChange={(value) => {
                  const exampleKey = value as keyof typeof EXAMPLE_PROGRAMS;
                  setSelectedExample(exampleKey);
                  setCode(EXAMPLE_PROGRAMS[exampleKey]);
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="factorial">Fattoriale (base)</SelectItem>
                  <SelectItem value="stackDemo">Demo Stack (PUSH/POP)</SelectItem>
                  <SelectItem value="subroutine">Subroutine (CALL/RET)</SelectItem>
                  <SelectItem value="signCheck">Test Segno (JNS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-[500px]">
              <CodeEditor
                code={code}
                onCodeChange={setCode}
                onLoad={handleLoad}
                onRun={handleRun}
                onStep={handleStep}
                onReset={handleReset}
                executionState={executionState}
                currentLine={currentLine}
              />
            </div>
            
            <div className="h-[400px]">
              <MemoryView
                memory={memory}
                sp={cpu.SP}
                format={format}
                onFormatChange={setFormat}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <CPUStatus cpu={cpu} format={format} />
            
            <div className="h-[400px]">
              <OutputLog output={output} errors={errors} />
            </div>
          </div>
        </main>

        <footer className="mt-8 border-t border-border pt-3 pb-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Prof. Nicolò Carello</span>
            <span className="hidden sm:inline text-border">•</span>
            <a 
              href="mailto:info@nicolocarello.it" 
              className="hover:text-primary transition-colors"
            >
              info@nicolocarello.it
            </a>
            <span className="hidden sm:inline text-border">•</span>
            <span className="text-xs">© 2025</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
