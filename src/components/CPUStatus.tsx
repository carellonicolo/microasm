import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CPUState, DisplayFormat } from "@/types/microasm";
import { formatValue } from "@/utils/formatter";
import { CPUArchitectureDialog } from "./CPUArchitectureDialog";
import { Cpu } from "lucide-react";

interface CPUStatusProps {
  cpu: CPUState;
  format: DisplayFormat;
}

export function CPUStatus({ cpu, format }: CPUStatusProps) {
  const [architectureDialogOpen, setArchitectureDialogOpen] = useState(false);

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Stato CPU</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setArchitectureDialogOpen(true)}
            className="gap-2"
          >
            <Cpu className="h-4 w-4" />
            Architettura CPU
          </Button>
        </div>
      
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

      <CPUArchitectureDialog
        open={architectureDialogOpen}
        onOpenChange={setArchitectureDialogOpen}
      />
    </>
  );
}
