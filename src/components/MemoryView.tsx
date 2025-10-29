import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisplayFormat } from "@/types/microasm";
import { formatValue } from "@/utils/formatter";

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
        <h2 className="text-lg font-semibold">Memoria e Stack</h2>
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
            const isStack = addr >= sp && addr < 256;
            const nonZero = value !== 0;
            
            return (
              <div
                key={addr}
                className={`p-1 rounded text-center transition-colors ${
                  isStack 
                    ? 'bg-warning/20 border border-warning/40' 
                    : nonZero
                    ? 'bg-memory/10 border border-memory/30'
                    : 'bg-secondary/50'
                }`}
                title={`[${addr}] = ${formatValue(value, format)}`}
              >
                <div className="text-[10px] text-muted-foreground">{addr}</div>
                <div className="text-xs truncate">{nonZero ? formatValue(value, 'decimal') : '0'}</div>
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
      </div>
    </Card>
  );
}
