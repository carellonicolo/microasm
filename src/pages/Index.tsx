import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { CodeEditor } from "@/components/CodeEditor";
import { CPUStatus } from "@/components/CPUStatus";
import { MemoryView } from "@/components/MemoryView";
import { OutputLog } from "@/components/OutputLog";
import { Header } from "@/components/shared/Header";
import { SaveProgramDialog } from "@/components/dialogs/SaveProgramDialog";
import { DisplayFormat, ExecutionState } from "@/types/microasm";
import { parseProgram } from "@/utils/assembler";
import { CPUExecutor } from "@/utils/executor";
import { toast } from "sonner";
import { EXAMPLE_PROGRAMS } from "@/data/examples";

const Index = () => {
  const location = useLocation();
  const [code, setCode] = useState(EXAMPLE_PROGRAMS.factorial);
  const [format, setFormat] = useState<DisplayFormat>('decimal');
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  
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
  const stepCountRef = useRef(0);
  const MAX_STEPS_PER_RUN = 100000;

  // Load code from localStorage if coming from dashboard
  useEffect(() => {
    const savedCode = localStorage.getItem('microasm_loaded_code');
    if (savedCode) {
      setCode(savedCode);
      localStorage.removeItem('microasm_loaded_code');
      toast.success('Programma caricato');
    }
  }, [location]);

  // Autosave code every 5 seconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('microasm_autosave', code);
      localStorage.setItem('microasm_autosave_timestamp', Date.now().toString());
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [code]);

  // Check for autosaved code on mount
  useEffect(() => {
    const autosaved = localStorage.getItem('microasm_autosave');
    const timestamp = localStorage.getItem('microasm_autosave_timestamp');
    
    if (autosaved && timestamp) {
      const savedDate = new Date(parseInt(timestamp));
      const age = Date.now() - savedDate.getTime();
      
      // If the save is recent (< 24 hours) and different from current code
      if (age < 24 * 60 * 60 * 1000 && autosaved !== code && autosaved !== EXAMPLE_PROGRAMS.factorial) {
        const restore = window.confirm(
          `È stato trovato un programma non salvato dal ${savedDate.toLocaleString()}. Vuoi ripristinarlo?`
        );
        if (restore) {
          setCode(autosaved);
          toast.success('Programma ripristinato');
        }
      }
    }
  }, []);

  // Helper function to safely stop execution
  const stopExecution = useCallback(() => {
    if (runIntervalRef.current) {
      clearInterval(runIntervalRef.current);
      runIntervalRef.current = null;
    }
  }, []);

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
    // Se c'è un'esecuzione in corso, chiedi conferma prima di fermarla
    if (executionState === 'running' || executionState === 'paused') {
      const confirmed = window.confirm(
        'Esecuzione in corso. Vuoi fermarla e caricare un nuovo programma?'
      );
      if (!confirmed) return;
      
      // Ferma esecuzione in corso
      stopExecution();
    }

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
    stepCountRef.current = 0;
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
      // PAUSA: Ferma l'esecuzione
      stopExecution();
      setExecutionState('paused');
      toast.info('Esecuzione in pausa');
    } else {
      // PLAY: Avvia l'esecuzione
      // Protezione doppio avvio (solo nel branch di avvio!)
      if (runIntervalRef.current) {
        console.warn('Tentativo di doppio avvio prevenuto');
        return;
      }
      
      setExecutionState('running');
      runIntervalRef.current = window.setInterval(() => {
        if (executorRef.current) {
          stepCountRef.current++;
          
          // Protezione ciclo infinito
          if (stepCountRef.current > MAX_STEPS_PER_RUN) {
            stopExecution();
            setExecutionState('error');
            setErrors([`Possibile ciclo infinito rilevato. Esecuzione fermata dopo ${MAX_STEPS_PER_RUN.toLocaleString()} istruzioni.`]);
            toast.error('Ciclo infinito rilevato!');
            return;
          }
          
          const error = executorRef.current.step();
          updateState();
          
          if (error) {
            setErrors([`Riga ${error.line || '?'}: ${error.message}`]);
            setExecutionState('error');
            stopExecution();
            toast.error('Errore di runtime');
          } else if (executorRef.current.halted) {
            setExecutionState('idle');
            stopExecution();
            toast.success('Programma terminato');
          }
        }
      }, 200);
      toast.info('Esecuzione in corso...');
    }
  };

  const handleReset = () => {
    stopExecution();
    
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
    stepCountRef.current = 0;
    toast.info('Reset completato');
  };

  const handleClearLog = () => {
    setOutput([]);
    setErrors([]);
    toast.info('Log pulito');
  };

  useEffect(() => {
    return () => {
      stopExecution();
    };
  }, [stopExecution]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(51,153,255,0.08),rgba(170,85,255,0.04),transparent)] dark:opacity-100 opacity-30 transition-opacity duration-500" />
        
        {/* Dots pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(51,153,255,0.06)_1px,transparent_1px)] bg-[length:40px_40px] dark:opacity-40 opacity-20 transition-opacity duration-500" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 dark:bg-primary/10 bg-primary/5 rounded-full blur-3xl animate-float transition-all duration-500" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 dark:bg-accent/8 bg-accent/4 rounded-full blur-3xl animate-float transition-all duration-500" style={{animationDelay: '1s'}} />
      </div>

      <div className="max-w-[1800px] mx-auto space-y-6 relative z-0">
        <Header 
          onLoadExample={setCode}
          onLoadExercise={setCode}
          onSaveProgram={() => setSaveDialogOpen(true)}
        />
        
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
              <OutputLog output={output} errors={errors} onClear={handleClearLog} />
            </div>
          </div>
        </main>

        <footer className="mt-8 border-t border-border pt-3 pb-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-muted-foreground">
            <a 
              href="https://apps.nicolocarello.it" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Prof. Nicolò Carello
            </a>
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

      <SaveProgramDialog 
        open={saveDialogOpen} 
        onOpenChange={setSaveDialogOpen} 
        code={code} 
      />
    </div>
  );
};

export default Index;
