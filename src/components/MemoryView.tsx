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
    <Card className="p-6 flex flex-col h-full card-hover rounded-2xl border-2 border-memory/10 bg-gradient-to-br from-card via-card to-card/80">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold font-heading">Memoria e Stack</h2>
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Informazioni su memoria e stack"
              >
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
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={format === 'decimal' ? 'default' : 'outline'}
            onClick={() => onFormatChange('decimal')}
            className={format === 'decimal' ? 'glow-primary' : ''}
            aria-label="DEC - Visualizza in formato decimale"
          >
            DEC
          </Button>
          <Button
            size="sm"
            variant={format === 'hexadecimal' ? 'default' : 'outline'}
            onClick={() => onFormatChange('hexadecimal')}
            className={format === 'hexadecimal' ? 'glow-primary' : ''}
            aria-label="HEX - Visualizza in formato esadecimale"
          >
            HEX
          </Button>
          <Button
            size="sm"
            variant={format === 'binary' ? 'default' : 'outline'}
            onClick={() => onFormatChange('binary')}
            className={format === 'binary' ? 'glow-primary' : ''}
            aria-label="BIN - Visualizza in formato binario"
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
                className={`relative p-2 rounded-lg text-center transition-all duration-300 hover:scale-105 hover:z-10 group ${
                  isTopOfStack
                    ? 'bg-gradient-to-br from-warning/30 to-warning/10 border-2 border-warning animate-glow-pulse ring-2 ring-warning/30' 
                    : isStack 
                    ? 'bg-gradient-to-br from-warning/15 to-transparent border border-warning/30 hover:border-warning/50' 
                    : nonZero
                    ? 'bg-gradient-to-br from-memory/15 to-memory-to/5 border border-memory/30 hover:border-memory/50'
                    : 'bg-secondary/30 border border-border/50 hover:border-border'
                }`}
                title={`[${addr}] = ${formatValue(value, format)}${
                  isTopOfStack ? ' (SP - Top of Stack)' : ''
                }`}
              >
                {/* Tooltip glassmorphism */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  <div className="glass-card px-3 py-2 rounded-lg whitespace-nowrap text-xs font-mono border border-primary/30">
                    [{addr}] = {formatValue(value, format)}
                    {isTopOfStack && <span className="text-warning font-bold ml-2">← SP</span>}
                  </div>
                </div>
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
      
      <div className="mt-3 text-xs text-muted-foreground flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-memory/15 to-memory-to/5 border border-memory/30 rounded"></div>
          <span className="font-medium">Dati</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-warning/15 to-transparent border border-warning/30 rounded"></div>
          <span className="font-medium">Stack</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-warning/30 to-warning/10 border-2 border-warning rounded ring-1 ring-warning/30"></div>
          <span className="font-medium">Top (SP)</span>
        </div>
      </div>
    </Card>
  );
}
