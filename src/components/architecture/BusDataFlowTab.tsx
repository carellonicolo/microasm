import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BUS_EXAMPLES } from "@/data/cpuArchitecture";
import { ArrowRight, Cpu, HardDrive, Zap } from "lucide-react";

export function BusDataFlowTab() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedExample, setSelectedExample] = useState<string>('MOV_IMMEDIATE');

  const example = BUS_EXAMPLES[selectedExample];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schema Bus di Sistema</CardTitle>
          <CardDescription>
            I tre bus principali che connettono CPU, Memoria e altri componenti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-xs bg-secondary p-4 rounded-lg overflow-x-auto whitespace-pre">
{`┌──────────────────────────────────────────────────────────────────────────┐
│                           BUS ARCHITECTURE                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌─────────────────┐                              ┌──────────────────┐  │
│   │   REGISTERS     │                              │     MEMORY       │  │
│   │                 │                              │   (256 bytes)    │  │
│   │  R0  R1  R2  R3 │                              │                  │  │
│   │  PC  SP         │                              │  0x00 - 0xFF     │  │
│   │  ZF  SF         │                              │                  │  │
│   └────────┬────────┘                              └────────┬─────────┘  │
│            │                                                │             │
│            │                                                │             │
│            ▼                                                ▼             │
│   ╔════════════════════════════════════════════════════════════════╗     │
│   ║               DATA BUS (16 bit - Bidirectional)                ║     │
│   ║  ◄═══════════════════════════════════════════════════════════► ║     │
│   ╚════════════════════════════════════════════════════════════════╝     │
│            ▲                                                ▲             │
│            │                                                │             │
│   ┌────────┴────────┐                              ┌────────┴─────────┐  │
│   │      ALU        │                              │   INPUT/OUTPUT   │  │
│   │                 │                              │                  │  │
│   │  Arithmetic &   │                              │  OUT instruction │  │
│   │  Logic Ops      │                              │                  │  │
│   └─────────────────┘                              └──────────────────┘  │
│                                                                            │
│   ╔════════════════════════════════════════════════════════════════╗     │
│   ║            ADDRESS BUS (8 bit - Unidirectional)                ║     │
│   ║  ════════════════════════════════════════════════════════════► ║     │
│   ╚════════════════════════════════════════════════════════════════╝     │
│            │                                                              │
│            │   From: PC, SP, Address operands                            │
│            └────► To: Memory address selector                            │
│                                                                            │
│   ╔════════════════════════════════════════════════════════════════╗     │
│   ║              CONTROL BUS (Multiple signals)                    ║     │
│   ║  READ | WRITE | HALT | CLOCK | ALU_OP | REG_ENABLE            ║     │
│   ╚════════════════════════════════════════════════════════════════╝     │
│            │                                                              │
│            │   From: Control Unit                                        │
│            └────► To: All components (coordination & timing)             │
│                                                                            │
└──────────────────────────────────────────────────────────────────────────┘`}
          </div>

          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <Card className="bg-primary/5 border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Data Bus</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>• 16 bit (valori -32768 a 32767)</div>
                <div>• Bidirezionale</div>
                <div>• Trasporta dati tra tutti i componenti</div>
              </CardContent>
            </Card>

            <Card className="bg-accent/10 border-accent/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-accent" />
                  <CardTitle className="text-sm">Address Bus</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>• 8 bit (indirizzi 0-255)</div>
                <div>• Unidirezionale (CPU → Mem)</div>
                <div>• Specifica indirizzo memoria</div>
              </CardContent>
            </Card>

            <Card className="bg-warning/10 border-warning/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-warning" />
                  <CardTitle className="text-sm">Control Bus</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>• Segnali multipli</div>
                <div>• Da CU a tutti i componenti</div>
                <div>• Coordina operazioni (READ/WRITE/HALT)</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Esempi Animati di Flusso Dati</CardTitle>
          <CardDescription>
            Segui passo-passo il flusso dei dati attraverso i bus per diverse istruzioni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedExample} onValueChange={(val) => { setSelectedExample(val); setActiveStep(0); }}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="MOV_IMMEDIATE">MOV imm</TabsTrigger>
              <TabsTrigger value="LDR_MEMORY">LDR</TabsTrigger>
              <TabsTrigger value="PUSH">PUSH</TabsTrigger>
              <TabsTrigger value="POP">POP</TabsTrigger>
              <TabsTrigger value="ADD">ADD</TabsTrigger>
              <TabsTrigger value="JZ">JZ</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedExample} className="space-y-4 mt-6">
              <Card className="bg-muted">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{example.title}</CardTitle>
                      <code className="text-sm text-muted-foreground">{example.instruction}</code>
                    </div>
                    <Badge>
                      Step {activeStep + 1} / {example.steps.length}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid gap-2">
                {example.steps.map((step, idx) => (
                  <Card
                    key={idx}
                    className={`cursor-pointer transition-all ${
                      idx === activeStep
                        ? 'bg-primary/10 border-primary shadow-lg'
                        : idx < activeStep
                        ? 'bg-secondary/50 opacity-60'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setActiveStep(idx)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          idx === activeStep
                            ? 'bg-primary text-primary-foreground'
                            : idx < activeStep
                            ? 'bg-success text-success-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {idx + 1}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{step.phase}</div>
                          <div className="text-xs text-muted-foreground mt-1 font-mono">{step.desc}</div>
                        </div>

                        <div className="flex gap-1">
                          {step.activeBuses.includes('data') && (
                            <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30">Data</Badge>
                          )}
                          {step.activeBuses.includes('address') && (
                            <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30">Addr</Badge>
                          )}
                          {step.activeBuses.includes('control') && (
                            <Badge variant="outline" className="text-xs bg-warning/10 border-warning/30">Ctrl</Badge>
                          )}
                        </div>

                        {idx < example.steps.length - 1 && idx === activeStep && (
                          <ArrowRight className="h-5 w-5 text-primary animate-pulse" />
                        )}
                      </div>

                      {idx === activeStep && Object.keys(step.state || {}).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="text-xs font-semibold mb-1">Stato aggiornato:</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(step.state || {}).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="font-mono text-xs">
                                {key} = {String(value)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Precedente
                </button>
                <button
                  onClick={() => setActiveStep(Math.min(example.steps.length - 1, activeStep + 1))}
                  disabled={activeStep === example.steps.length - 1}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Successivo →
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
