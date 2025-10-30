import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function FetchExecuteTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Il Ciclo Fetch-Decode-Execute</CardTitle>
          <CardDescription>
            Il ciclo fondamentale che ogni CPU ripete continuamente per eseguire programmi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="font-mono text-xs bg-secondary p-4 rounded-lg overflow-x-auto whitespace-pre">
{`┌─────────────────────────────────────────────────────────────────┐
│                    FETCH-DECODE-EXECUTE CYCLE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  1. FETCH (Carica istruzione)                             │  │
│  │                                                            │  │
│  │  ┌──────┐        ┌────────┐        ┌────────────┐        │  │
│  │  │  PC  │───────►│Address │───────►│   Memory   │        │  │
│  │  └──────┘        │  Bus   │        └─────┬──────┘        │  │
│  │                  └────────┘              │               │  │
│  │                                          │               │  │
│  │                  ┌────────┐              │               │  │
│  │                  │ Data   │◄─────────────┘               │  │
│  │                  │  Bus   │                              │  │
│  │                  └───┬────┘                              │  │
│  │                      │                                   │  │
│  │                      ▼                                   │  │
│  │                  ┌──────┐                                │  │
│  │                  │  IR  │  (Instruction Register)        │  │
│  │                  └──────┘                                │  │
│  └────────────────────────────────────────────────────────-─┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  2. DECODE (Decodifica istruzione)                        │  │
│  │                                                            │  │
│  │  ┌──────┐        ┌────────────┐                          │  │
│  │  │  IR  │───────►│  Decoder   │                          │  │
│  │  └──────┘        └─────┬──────┘                          │  │
│  │                        │                                  │  │
│  │                        ▼                                  │  │
│  │               ┌────────────────┐                         │  │
│  │               │ Control Signals│                         │  │
│  │               └────────────────┘                         │  │
│  │                                                           │  │
│  │  Identifica:                                             │  │
│  │    • Opcode (quale operazione)                           │  │
│  │    • Operandi (registri, valori, indirizzi)             │  │
│  │    • Tipo di indirizzamento                              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  3. EXECUTE (Esegui operazione)                           │  │
│  │                                                            │  │
│  │  In base all'istruzione:                                  │  │
│  │                                                            │  │
│  │  ┌────────────────┐   ┌─────────────┐   ┌─────────────┐ │  │
│  │  │ Operazioni ALU │   │  Accesso    │   │   Salti     │ │  │
│  │  │                │   │  Memoria    │   │   (Jump)    │ │  │
│  │  │  ADD, SUB,     │   │             │   │             │ │  │
│  │  │  AND, OR, etc. │   │  LDR, STR,  │   │  JMP, JZ,   │ │  │
│  │  │                │   │  PUSH, POP  │   │  CALL, RET  │ │  │
│  │  └────────────────┘   └─────────────┘   └─────────────┘ │  │
│  │                                                           │  │
│  │  Aggiorna:                                               │  │
│  │    • Registri                                            │  │
│  │    • Memoria                                             │  │
│  │    • Flag (ZF, SF)                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  4. UPDATE PC (Aggiorna Program Counter)                 │  │
│  │                                                            │  │
│  │  Se non è un salto:   PC = PC + 1                        │  │
│  │  Se è un salto:       PC = indirizzo destinazione        │  │
│  │                                                            │  │
│  │  Poi torna al passo 1 (FETCH)                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           │                                     │
│                           └────┐                                │
│                                │                                │
│                                ▼                                │
│                         ┌────────────┐                         │
│                         │ HLT or END?│────No────┐              │
│                         └─────┬──────┘          │              │
│                               │                 │              │
│                              Yes                │              │
│                               │                 │              │
│                               ▼                 │              │
│                         ┌──────────┐            │              │
│                         │   STOP   │            │              │
│                         └──────────┘            │              │
│                                                 │              │
│                                      ┌──────────┘              │
│                                      │                         │
│                                      │ Loop continuo          │
│                                      └─► Torna a FETCH         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘`}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge className="bg-primary">1</Badge>
                  FETCH
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><strong>Obiettivo:</strong> Caricare la prossima istruzione dalla memoria</div>
                <div className="font-mono text-xs bg-background p-2 rounded space-y-1">
                  <div>1. Address Bus ← PC</div>
                  <div>2. Control Bus ← READ</div>
                  <div>3. Data Bus ← Memory[PC]</div>
                  <div>4. IR ← Data Bus</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  L'istruzione è ora nell'Instruction Register, pronta per essere decodificata
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge variant="secondary">2</Badge>
                  DECODE
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><strong>Obiettivo:</strong> Interpretare l'istruzione e preparare i segnali</div>
                <div className="font-mono text-xs bg-background p-2 rounded space-y-1">
                  <div>1. Decoder analizza IR</div>
                  <div>2. Identifica opcode (es: ADD)</div>
                  <div>3. Estrae operandi (es: R0, R1)</div>
                  <div>4. Genera segnali di controllo</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  La Control Unit sa ora quale operazione eseguire e su quali dati
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge className="bg-accent text-accent-foreground">3</Badge>
                  EXECUTE
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><strong>Obiettivo:</strong> Eseguire effettivamente l'operazione</div>
                <div className="text-xs space-y-2 mt-2">
                  <div>
                    <strong>Se ALU:</strong>
                    <div className="font-mono text-xs bg-background p-2 rounded mt-1">
                      Operandi → ALU → Risultato → Registro
                    </div>
                  </div>
                  <div>
                    <strong>Se Memoria:</strong>
                    <div className="font-mono text-xs bg-background p-2 rounded mt-1">
                      Address Bus + Data Bus + Control Bus
                    </div>
                  </div>
                  <div>
                    <strong>Se Salto:</strong>
                    <div className="font-mono text-xs bg-background p-2 rounded mt-1">
                      Verifica condizione → Modifica PC
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-warning/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge className="bg-warning text-warning-foreground">4</Badge>
                  UPDATE PC
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><strong>Obiettivo:</strong> Preparare la prossima istruzione</div>
                <div className="font-mono text-xs bg-background p-2 rounded space-y-1">
                  <div>if (istruzione non è salto):</div>
                  <div className="ml-3">PC = PC + 1</div>
                  <div>else if (salto condizionato && condizione vera):</div>
                  <div className="ml-3">PC = indirizzo_destinazione</div>
                  <div>else if (salto incondizionato):</div>
                  <div className="ml-3">PC = indirizzo_destinazione</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Poi il ciclo ricomincia da FETCH (a meno che non sia HLT)
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Esempio Completo: Trace di un Programma</CardTitle>
          <CardDescription>
            Seguiamo passo-passo l'esecuzione di un piccolo programma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="bg-muted">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Programma</CardTitle>
              </CardHeader>
              <CardContent className="font-mono text-xs space-y-1">
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  <span className="text-muted-foreground">0:</span>
                  <span>MOV R0, 10</span>
                  <span className="text-muted-foreground">1:</span>
                  <span>MOV R1, 5</span>
                  <span className="text-muted-foreground">2:</span>
                  <span>ADD R0, R1</span>
                  <span className="text-muted-foreground">3:</span>
                  <span>CMP R0, 15</span>
                  <span className="text-muted-foreground">4:</span>
                  <span>JZ END</span>
                  <span className="text-muted-foreground">5:</span>
                  <span>OUT R0</span>
                  <span className="text-muted-foreground">6:</span>
                  <span>END: HLT</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Stato Iniziale</CardTitle>
              </CardHeader>
              <CardContent className="font-mono text-xs space-y-1">
                <div>PC = 0</div>
                <div>R0 = 0, R1 = 0</div>
                <div>ZF = 0, SF = 0</div>
                <div>SP = 256</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 space-y-3">
            {[
              {
                cycle: 1,
                pc: 0,
                instr: "MOV R0, 10",
                fetch: "Memory[0] → IR: 'MOV R0, 10'",
                decode: "Opcode=MOV, Rdest=R0, src=10",
                execute: "10 → Data Bus → R0",
                update: "PC = 1",
                state: "R0=10, PC=1"
              },
              {
                cycle: 2,
                pc: 1,
                instr: "MOV R1, 5",
                fetch: "Memory[1] → IR: 'MOV R1, 5'",
                decode: "Opcode=MOV, Rdest=R1, src=5",
                execute: "5 → Data Bus → R1",
                update: "PC = 2",
                state: "R0=10, R1=5, PC=2"
              },
              {
                cycle: 3,
                pc: 2,
                instr: "ADD R0, R1",
                fetch: "Memory[2] → IR: 'ADD R0, R1'",
                decode: "Opcode=ADD, Rdest=R0, Rsrc=R1",
                execute: "R0(10) + R1(5) → ALU → 15 → R0, ZF=0, SF=0",
                update: "PC = 3",
                state: "R0=15, R1=5, PC=3, ZF=0, SF=0"
              },
              {
                cycle: 4,
                pc: 3,
                instr: "CMP R0, 15",
                fetch: "Memory[3] → IR: 'CMP R0, 15'",
                decode: "Opcode=CMP, Ra=R0, Rb=15",
                execute: "R0(15) - 15 = 0 → ZF=1, SF=0 (risultato scartato)",
                update: "PC = 4",
                state: "R0=15, R1=5, PC=4, ZF=1, SF=0"
              },
              {
                cycle: 5,
                pc: 4,
                instr: "JZ END",
                fetch: "Memory[4] → IR: 'JZ END'",
                decode: "Opcode=JZ, label=END (addr=6)",
                execute: "ZF=1 → condizione vera → PC = 6",
                update: "PC già aggiornato da JZ",
                state: "R0=15, R1=5, PC=6, ZF=1"
              },
              {
                cycle: 6,
                pc: 6,
                instr: "HLT",
                fetch: "Memory[6] → IR: 'HLT'",
                decode: "Opcode=HLT",
                execute: "Control Bus ← HALT signal",
                update: "Esecuzione terminata",
                state: "PROGRAMMA TERMINATO"
              }
            ].map((step) => (
              <Card key={step.cycle} className="bg-secondary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      Ciclo {step.cycle}: PC={step.pc}
                    </CardTitle>
                    <code className="text-xs bg-background px-2 py-1 rounded">{step.instr}</code>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                    <Badge variant="outline" className="text-xs">Fetch</Badge>
                    <span className="font-mono">{step.fetch}</span>
                    
                    <Badge variant="outline" className="text-xs">Decode</Badge>
                    <span className="font-mono">{step.decode}</span>
                    
                    <Badge variant="outline" className="text-xs">Execute</Badge>
                    <span className="font-mono">{step.execute}</span>
                    
                    <Badge variant="outline" className="text-xs">Update</Badge>
                    <span className="font-mono">{step.update}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <strong>Stato:</strong> <span className="font-mono">{step.state}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 bg-success/10 border-success/30">
            <CardContent className="p-4">
              <div className="text-sm">
                <strong>Risultato finale:</strong> Il programma salta direttamente a HLT perché R0 (15) è uguale a 15, quindi ZF=1 e il salto JZ viene eseguito. L'istruzione OUT R0 alla linea 5 viene saltata.
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
