import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { ExecutionState } from "@/types/microasm";
import { DocumentationDialog } from "./DocumentationDialog";

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
  
  return (
    <Card className="flex flex-col h-full card-hover rounded-2xl border-2 border-primary/10 overflow-hidden bg-gradient-to-br from-card via-card to-card/80">
      <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-accent/5 to-transparent">
        <h2 className="text-xl font-bold font-heading">Codice Sorgente</h2>
        <div className="flex gap-2">
          <DocumentationDialog />
          <Button onClick={onLoad} variant="secondary" size="sm" className="hover:glow-primary transition-all">
            Carica
          </Button>
          <Button 
            onClick={onRun} 
            variant={executionState === 'running' ? 'destructive' : 'default'}
            size="sm"
            disabled={executionState === 'error'}
            aria-label={executionState === 'running' ? 'Pause execution' : 'Run program'}
            className={executionState === 'running' ? '' : 'relative overflow-hidden group'}
          >
            {executionState === 'running' ? (
              <Pause className="w-4 h-4" />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-light to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Play className="relative w-4 h-4 group-hover:scale-110 transition-transform" />
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
      <div className="flex-1 p-4 overflow-auto bg-code-bg relative">
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent h-20 animate-scan opacity-30" />
        </div>
        
        {/* Grid pattern background */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M30 0v60M0 30h60' stroke='%2333aaff' stroke-width='0.5'/%3E%3C/svg%3E")`
          }}
        />
        
        <div className="flex font-mono text-sm h-full relative z-10">
          <div className="bg-gradient-to-r from-primary/5 to-transparent mr-4 pr-3 select-none text-right flex-shrink-0 border-r border-primary/20">
            {lines.map((_, idx) => (
              <div 
                key={idx}
                className={`leading-6 px-2 transition-all ${
                  currentLine === idx + 1 
                    ? 'bg-primary/20 border-l-4 border-primary text-primary font-bold scale-105 glow-primary' 
                    : 'text-muted-foreground/60'
                }`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className="flex-1 bg-transparent text-code-text font-mono text-sm resize-none outline-none leading-6 overflow-hidden"
            spellCheck={false}
            aria-label="MicroASM source code editor"
            style={{ 
              minHeight: '100%',
              tabSize: 2
            }}
          />
        </div>
      </div>
    </Card>
  );
}
