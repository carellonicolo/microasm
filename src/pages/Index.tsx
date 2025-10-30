import { useState, useEffect, useRef } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { CPUStatus } from "@/components/CPUStatus";
import { MemoryView } from "@/components/MemoryView";
import { OutputLog } from "@/components/OutputLog";
import { DisplayFormat, ExecutionState } from "@/types/microasm";
import { parseProgram } from "@/utils/assembler";
import { CPUExecutor } from "@/utils/executor";
import { toast } from "sonner";

const EXAMPLE_PROGRAM = `; Esempio: Calcolo fattoriale
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
HLT                ; Termina il programma`;

const Index = () => {
  const [code, setCode] = useState(EXAMPLE_PROGRAM);
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
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
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
      </div>
    </div>
  );
};

export default Index;
