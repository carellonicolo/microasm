import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { ExecutionState } from "@/types/microasm";
import { DocumentationDialog } from "./DocumentationDialog";
import { useEffect, useRef } from "react";

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onLoad: () => void;
  onRun: () => void;
  onStep: () => void;
  onReset: () => void;
  executionState: ExecutionState;
  currentLine?: number;
}

export function CodeEditor({
  code,
  onCodeChange,
  onLoad,
  onRun,
  onStep,
  onReset,
  executionState,
  currentLine
}: CodeEditorProps) {
  const lines = code.split('\n');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to current line during execution
  useEffect(() => {
    if (currentLine && scrollRef.current) {
      // Use requestAnimationFrame to avoid forced reflow
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          const lineHeight = 24; // leading-6 = 1.5rem = 24px
          const scrollTop = (currentLine - 1) * lineHeight;
          const containerHeight = scrollRef.current.clientHeight;
          
          // Center the current line in viewport
          scrollRef.current.scrollTop = scrollTop - (containerHeight / 2) + (lineHeight / 2);
        }
      });
    }
  }, [currentLine]);
  
  return (
    <Card className={`flex flex-col h-full card-hover rounded-2xl border-2 border-primary/10 overflow-hidden bg-gradient-to-br from-card via-card to-card/80 ${executionState === 'running' ? 'apple-intelligence-editor' : ''}`}>
      <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-accent/5 to-transparent">
        <h2 className="text-xl font-bold font-heading">Codice Sorgente</h2>
        <div className="flex gap-2">
          <DocumentationDialog />
          <Button 
            onClick={onLoad} 
            variant="secondary" 
            size="sm" 
            disabled={executionState === 'running'}
            className="hover:glow-primary transition-all"
            aria-label="Carica programma"
          >
            Carica
          </Button>
          <Button 
            onClick={onRun} 
            variant={executionState === 'running' ? 'destructive' : 'default'}
            size="sm"
            disabled={executionState === 'error'}
            aria-label={executionState === 'running' ? 'Pausa esecuzione programma' : 'Esegui programma'}
            className={executionState === 'running' ? '' : 'relative overflow-hidden group'}
          >
            {executionState === 'running' ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Pausa</span>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-light to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Play className="relative w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline relative">Esegui</span>
              </>
            )}
          </Button>
          <Button 
            onClick={onStep} 
            variant="outline" 
            size="sm" 
            disabled={executionState === 'running'}
            aria-label="Step through program"
            className="hover:bg-primary/10 hover:border-primary/50 transition-all"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button 
            onClick={onReset} 
            variant="outline" 
            size="sm"
            aria-label="Reset program"
            className="hover:bg-accent/10 hover:border-accent/50 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-code-bg relative overflow-hidden">
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent h-20 animate-scan opacity-30" />
        </div>
        
        {/* Grid pattern background */}
        <div 
          className="absolute inset-0 opacity-[0.02] z-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2333aaff' stroke-width='0.5'/%3E%3C/svg%3E")`
          }}
        />
        
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="flex font-mono text-sm min-h-full relative z-20 p-4">
            <div className="bg-gradient-to-r from-code-bg to-transparent mr-4 pr-3 select-none text-right flex-shrink-0 border-r border-code-text/20">
              {lines.map((_, idx) => (
                <div 
                  key={idx}
                  className={`leading-6 px-2 transition-all ${
                    currentLine === idx + 1 
                      ? 'bg-code-highlight/20 border-l-4 border-code-highlight text-code-highlight font-bold scale-105 glow-primary' 
                      : 'text-code-text/50'
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              rows={Math.max(lines.length, 20)}
              className="flex-1 bg-transparent text-code-text font-mono text-sm resize-none outline-none leading-6"
              spellCheck={false}
              wrap="off"
              aria-label="MicroASM source code editor"
              style={{ 
                tabSize: 2,
                height: 'auto'
              }}
            />
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}
