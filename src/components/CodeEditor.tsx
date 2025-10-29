import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { ExecutionState } from "@/types/microasm";

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
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Codice Sorgente</h2>
        <div className="flex gap-2">
          <Button onClick={onLoad} variant="secondary" size="sm">
            Carica
          </Button>
          <Button 
            onClick={onRun} 
            variant={executionState === 'running' ? 'destructive' : 'default'}
            size="sm"
            disabled={executionState === 'error'}
          >
            {executionState === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button onClick={onStep} variant="outline" size="sm" disabled={executionState === 'running'}>
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button onClick={onReset} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto bg-code-bg">
        <div className="font-mono text-sm">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`flex ${
                currentLine === idx + 1 ? 'bg-code-highlight/20' : ''
              } hover:bg-code-highlight/10 transition-colors`}
            >
              <span className="text-muted-foreground mr-4 select-none w-12 text-right">
                {idx + 1}
              </span>
              <span className="text-code-text flex-1">{line || ' '}</span>
            </div>
          ))}
        </div>
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full resize-none"
          spellCheck={false}
        />
      </div>
    </Card>
  );
}
