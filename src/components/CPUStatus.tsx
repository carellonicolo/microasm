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
      <Card className="p-6 card-hover rounded-2xl border-2 border-primary/10 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-heading flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            Stato CPU
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setArchitectureDialogOpen(true)}
            className="gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <Cpu className="h-4 w-4" />
            Architettura
          </Button>
        </div>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Registri Generici</h3>
          <div className="grid grid-cols-2 gap-3">
            {(['R0', 'R1', 'R2', 'R3'] as const).map((reg) => (
              <div key={reg} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-register to-register-to rounded-xl blur opacity-20 group-hover:opacity-60 transition" />
                <div className="relative flex justify-between items-center p-3 bg-card/80 backdrop-blur-sm rounded-xl border border-register/20 group-hover:border-register/40 transition-all">
                  <span className="font-mono text-sm font-bold bg-gradient-to-r from-register to-register-to bg-clip-text text-transparent">
                    {reg}
                  </span>
                  <span className="font-mono text-sm font-semibold">{formatValue(cpu[reg], format)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Registri Speciali</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border border-primary/20 hover:border-primary/40 transition-all">
              <span className="font-mono text-sm font-bold text-primary">PC</span>
              <span className="font-mono text-sm font-semibold">{cpu.PC}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-accent/5 to-transparent rounded-xl border border-accent/20 hover:border-accent/40 transition-all">
              <span className="font-mono text-sm font-bold text-accent">SP</span>
              <span className="font-mono text-sm font-semibold">{cpu.SP}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Flags</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className={`relative p-3 rounded-xl border transition-all ${
              cpu.ZF 
                ? 'bg-success/10 border-success/30 glow-success' 
                : 'bg-secondary/50 border-border'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm font-bold">ZF</span>
                <span className={`font-mono text-lg font-bold ${cpu.ZF ? 'text-success' : 'text-muted-foreground'}`}>
                  {cpu.ZF ? '1' : '0'}
                </span>
              </div>
              {cpu.ZF && <div className="absolute inset-0 bg-success/5 rounded-xl animate-pulse" />}
            </div>
            <div className={`relative p-3 rounded-xl border transition-all ${
              cpu.SF 
                ? 'bg-warning/10 border-warning/30' 
                : 'bg-secondary/50 border-border'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm font-bold">SF</span>
                <span className={`font-mono text-lg font-bold ${cpu.SF ? 'text-warning' : 'text-muted-foreground'}`}>
                  {cpu.SF ? '1' : '0'}
                </span>
              </div>
              {cpu.SF && <div className="absolute inset-0 bg-warning/5 rounded-xl animate-pulse" />}
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
