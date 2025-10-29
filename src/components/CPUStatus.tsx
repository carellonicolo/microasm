import { Card } from "@/components/ui/card";
import { CPUState, DisplayFormat } from "@/types/microasm";
import { formatValue } from "@/utils/formatter";

interface CPUStatusProps {
  cpu: CPUState;
  format: DisplayFormat;
}

export function CPUStatus({ cpu, format }: CPUStatusProps) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Stato CPU</h2>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Registri Generici</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['R0', 'R1', 'R2', 'R3'] as const).map((reg) => (
              <div key={reg} className="flex justify-between items-center p-2 bg-secondary rounded">
                <span className="font-mono text-sm font-semibold text-register">{reg}</span>
                <span className="font-mono text-sm">{formatValue(cpu[reg], format)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Registri Speciali</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-secondary rounded">
              <span className="font-mono text-sm font-semibold">PC</span>
              <span className="font-mono text-sm">{cpu.PC}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-secondary rounded">
              <span className="font-mono text-sm font-semibold">SP</span>
              <span className="font-mono text-sm">{cpu.SP}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Flags</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between items-center p-2 bg-secondary rounded">
              <span className="font-mono text-sm font-semibold">ZF</span>
              <span className={`font-mono text-sm font-bold ${cpu.ZF ? 'text-success' : 'text-muted-foreground'}`}>
                {cpu.ZF ? '1' : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-secondary rounded">
              <span className="font-mono text-sm font-semibold">SF</span>
              <span className={`font-mono text-sm font-bold ${cpu.SF ? 'text-warning' : 'text-muted-foreground'}`}>
                {cpu.SF ? '1' : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
