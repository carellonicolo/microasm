import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function OverviewTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Architettura Von Neumann Semplificata</CardTitle>
          <CardDescription>
            Questa CPU simulata segue il modello Von Neumann con memoria unificata per dati e istruzioni
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="font-mono text-xs bg-secondary p-4 rounded-lg overflow-x-auto whitespace-pre">
{`┌─────────────────────────────────────────────────────────────────┐
│                         CPU ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐        ┌──────────────┐                     │
│  │   REGISTERS   │        │  CONTROL     │                     │
│  │               │        │  UNIT (CU)   │                     │
│  │  R0  R1       │◄──────►│              │                     │
│  │  R2  R3       │        │  - Decoder   │                     │
│  │               │        │  - IR        │                     │
│  │  PC   SP      │        │  - Sequencer │                     │
│  │  ZF   SF      │        └──────┬───────┘                     │
│  └───────┬───────┘               │                             │
│          │                       │                             │
│          │    ┌──────────────────┴──────┐                      │
│          │    │                         │                      │
│          ▼    ▼                         ▼                      │
│  ┌─────────────────┐           ┌────────────────┐             │
│  │                 │           │                │             │
│  │   DATA BUS      │◄─────────►│   ADDRESS BUS  │             │
│  │   (16 bit)      │           │   (8 bit)      │             │
│  │                 │           │                │             │
│  └────────┬────────┘           └────────┬───────┘             │
│           │                             │                      │
│           │    ┌───────────────────────┐│                      │
│           │    │                       ││                      │
│           ▼    ▼                       ▼▼                      │
│     ┌──────────────┐           ┌──────────────┐               │
│     │              │           │              │               │
│     │     ALU      │           │    MEMORY    │               │
│     │              │           │   (256 byte) │               │
│     │  +  -  *     │           │              │               │
│     │  &  |  ^  ~  │           │  0x00 - 0xFF │               │
│     │              │           │              │               │
│     │  ZF SF flags │           │  Unified:    │               │
│     │              │           │  - Code      │               │
│     └──────────────┘           │  - Data      │               │
│                                │  - Stack     │               │
│                                └──────────────┘               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             CONTROL BUS (Read/Write/Halt)                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘`}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Registri (Registers)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><strong>R0-R3:</strong> 4 registri generici da 16 bit</div>
                <div><strong>PC:</strong> Program Counter (punta all'istruzione corrente)</div>
                <div><strong>SP:</strong> Stack Pointer (punta alla cima dello stack)</div>
                <div><strong>ZF:</strong> Zero Flag (1 se risultato = 0)</div>
                <div><strong>SF:</strong> Sign Flag (1 se risultato negativo)</div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/50">
              <CardHeader>
                <CardTitle className="text-base">Unità di Controllo (CU)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><strong>IR:</strong> Instruction Register (istruzione corrente)</div>
                <div><strong>Decoder:</strong> Decodifica l'opcode</div>
                <div><strong>Sequencer:</strong> Genera i segnali di controllo</div>
                <div><strong>Ciclo:</strong> Fetch → Decode → Execute</div>
              </CardContent>
            </Card>

            <Card className="bg-accent/20">
              <CardHeader>
                <CardTitle className="text-base">ALU (Arithmetic Logic Unit)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><strong>Aritmetica:</strong> ADD, SUB, INC, DEC, MOL</div>
                <div><strong>Logica:</strong> AND, OR, XOR, NOT</div>
                <div><strong>Comparazione:</strong> CMP (aggiorna flag)</div>
                <div><strong>Output:</strong> Risultato + aggiornamento flag ZF/SF</div>
              </CardContent>
            </Card>

            <Card className="bg-warning/10">
              <CardHeader>
                <CardTitle className="text-base">Memoria (Memory)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><strong>Dimensione:</strong> 256 byte (0x00 - 0xFF)</div>
                <div><strong>Architettura:</strong> Von Neumann (unified)</div>
                <div><strong>Contiene:</strong> Codice + Dati + Stack</div>
                <div><strong>Stack:</strong> Cresce dall'alto (255) verso il basso</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-base">Bus di Sistema</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <strong className="text-primary">Data Bus (16 bit):</strong> Trasferisce dati tra CPU, memoria e registri
              </div>
              <div>
                <strong className="text-accent">Address Bus (8 bit):</strong> Specifica l'indirizzo di memoria (0-255)
              </div>
              <div>
                <strong className="text-warning">Control Bus:</strong> Segnali di controllo (READ, WRITE, HALT, etc.)
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Caratteristiche Didattiche</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>✓ Architettura RISC semplificata (20 istruzioni)</div>
          <div>✓ Indirizzamento diretto e indiretto</div>
          <div>✓ Supporto stack con PUSH/POP e subroutine con CALL/RET</div>
          <div>✓ Flag condizionali per salti (JZ, JNZ)</div>
          <div>✓ Operazioni aritmetiche e logiche base</div>
          <div>✓ I/O semplificato con istruzione OUT</div>
        </CardContent>
      </Card>
    </div>
  );
}
