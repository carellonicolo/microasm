import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisplayFormat } from "@/types/microasm";
import { formatValue } from "@/utils/formatter";
import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MemoryViewProps {
  memory: number[];
  sp: number;
  format: DisplayFormat;
  onFormatChange: (format: DisplayFormat) => void;
}

export function MemoryView({ memory, sp, format, onFormatChange }: MemoryViewProps) {
  return (
    <Card className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Memoria e Stack</h2>
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2 text-sm">
                <h3 className="font-semibold">Memoria (256 byte)</h3>
                <p>
                  La memoria contiene tutti i dati del programma.
                  Ogni cella ha un indirizzo da 0 a 255.
                </p>
                
                <h3 className="font-semibold mt-3">Stack (Pila)</h3>
                <p>
                  Lo stack cresce dall'alto verso il basso.
                  SP (Stack Pointer) punta alla prossima posizione libera dello stack.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>PUSH</strong>: aggiunge valore in cima (SP diminuisce)</li>
                  <li><strong>POP</strong>: rimuove valore dalla cima (SP aumenta)</li>
                  <li><strong>SP=256</strong>: stack vuoto</li>
                  <li><strong>SP=0</strong>: stack pieno (overflow!)</li>
                </ul>
                
                <div className="mt-3 p-2 bg-secondary rounded text-xs font-mono">
                  <strong>Esempio:</strong><br/>
                  PUSH R0 → SP: 256→255, memory[255]=R0<br/>
                  PUSH R1 → SP: 255→254, memory[254]=R1<br/>
                  POP R2 → R2=memory[254], SP: 254→255
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={format === 'decimal' ? 'default' : 'outline'}
            onClick={() => onFormatChange('decimal')}
          >
            DEC
          </Button>
          <Button
            size="sm"
            variant={format === 'hexadecimal' ? 'default' : 'outline'}
            onClick={() => onFormatChange('hexadecimal')}
          >
            HEX
          </Button>
          <Button
            size="sm"
            variant={format === 'binary' ? 'default' : 'outline'}
            onClick={() => onFormatChange('binary')}
          >
            BIN
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 gap-1 font-mono text-xs">
          {memory.map((value, addr) => {
            const isTopOfStack = sp < 256 && addr === sp;
            const isStack = sp < 256 && addr > sp && addr < 256;
            const nonZero = value !== 0;
            
            return (
              <div
                key={addr}
                className={`p-1 rounded text-center transition-colors ${
                  isTopOfStack
                    ? 'bg-orange-500/30 border-2 border-orange-600' 
                    : isStack 
                    ? 'bg-warning/20 border border-warning/40' 
                    : nonZero
                    ? 'bg-memory/10 border border-memory/30'
                    : 'bg-secondary/50'
                }`}
                title={`[${addr}] = ${formatValue(value, format)}${
                  isTopOfStack ? ' (SP - Top of Stack)' : ''
                }`}
              >
                <div className="text-[10px] text-muted-foreground">
                  {addr}{isTopOfStack ? ' ←SP' : ''}
                </div>
                <div className="text-xs truncate">
                  {nonZero ? formatValue(value, format) : '0'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-memory/10 border border-memory/30 rounded"></div>
          <span>Dati</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-warning/20 border border-warning/40 rounded"></div>
          <span>Stack</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500/30 border-2 border-orange-600 rounded"></div>
          <span>Top of Stack (SP)</span>
        </div>
      </div>
    </Card>
  );
}
