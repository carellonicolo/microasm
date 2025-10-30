import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

export function ComponentsTab() {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={["registers", "alu", "control", "memory"]} className="w-full">
        <AccordionItem value="registers">
          <AccordionTrigger className="text-lg font-semibold">
            Registri (Registers)
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Card className="p-4 bg-primary/5">
                <h4 className="font-semibold mb-2">Registri Generici (R0-R3)</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Tipo:</strong> 16 bit signed integer (-32768 a 32767)</p>
                  <p><strong>Numero:</strong> 4 registri (R0, R1, R2, R3)</p>
                  <p><strong>Uso:</strong> Memorizzazione temporanea di dati e risultati di operazioni</p>
                  <p><strong>Accesso:</strong> Lettura e scrittura diretta tramite istruzioni</p>
                  <div className="mt-3 p-3 bg-background rounded font-mono text-xs">
                    MOV R0, 42    ; R0 = 42<br/>
                    ADD R1, R0    ; R1 = R1 + R0<br/>
                    PUSH R2       ; Salva R2 nello stack
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-secondary/30">
                <h4 className="font-semibold mb-2">Program Counter (PC)</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Tipo:</strong> Puntatore a 8 bit (0-255)</p>
                  <p><strong>Funzione:</strong> Contiene l'indirizzo della prossima istruzione da eseguire</p>
                  <p><strong>Aggiornamento:</strong> Incrementato automaticamente dopo ogni istruzione (PC++), modificato da salti (JMP, JZ, CALL, RET)</p>
                  <p><strong>Inizializzazione:</strong> PC = 0 all'avvio</p>
                  <div className="mt-3 p-3 bg-background rounded font-mono text-xs">
                    ; PC=0: MOV R0, 5<br/>
                    ; PC=1: JMP LOOP   (PC diventa indirizzo di LOOP)<br/>
                    ; LOOP: ADD R0, 1  (PC continua da qui)
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-warning/10">
                <h4 className="font-semibold mb-2">Stack Pointer (SP)</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Tipo:</strong> Puntatore a 8 bit (0-256)</p>
                  <p><strong>Funzione:</strong> Punta alla cima dello stack (prossima posizione libera)</p>
                  <p><strong>Inizializzazione:</strong> SP = 256 (stack vuoto)</p>
                  <p><strong>Direzione:</strong> Cresce verso il basso (255 → 0)</p>
                  <p><strong>PUSH:</strong> SP--, poi Memory[SP] = valore</p>
                  <p><strong>POP:</strong> valore = Memory[SP], poi SP++</p>
                  <div className="mt-3 p-3 bg-background rounded font-mono text-xs">
                    ; SP=256 (stack vuoto)<br/>
                    PUSH R0    ; SP=255, Memory[255]=R0<br/>
                    PUSH R1    ; SP=254, Memory[254]=R1<br/>
                    POP R2     ; R2=Memory[254], SP=255
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-accent/20">
                <h4 className="font-semibold mb-2">Flag Register (ZF, SF)</h4>
                <div className="text-sm space-y-3">
                  <div>
                    <p><strong>Zero Flag (ZF):</strong></p>
                    <p className="ml-3">• ZF = 1 se il risultato dell'ultima operazione è 0</p>
                    <p className="ml-3">• ZF = 0 altrimenti</p>
                    <p className="ml-3">• Usato da: JZ (salta se ZF=1), JNZ (salta se ZF=0)</p>
                  </div>
                  <div>
                    <p><strong>Sign Flag (SF):</strong></p>
                    <p className="ml-3">• SF = 1 se il risultato è negativo (&lt; 0)</p>
                    <p className="ml-3">• SF = 0 se il risultato è positivo o zero (≥ 0)</p>
                    <p className="ml-3">• Usato per determinare il segno del risultato</p>
                  </div>
                  <div className="mt-3 p-3 bg-background rounded font-mono text-xs">
                    MOV R0, 5<br/>
                    SUB R0, 5    ; R0=0, ZF=1, SF=0<br/>
                    JZ ZERO      ; Salta perché ZF=1<br/>
                    <br/>
                    MOV R1, 10<br/>
                    SUB R1, 15   ; R1=-5, ZF=0, SF=1
                  </div>
                </div>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="alu">
          <AccordionTrigger className="text-lg font-semibold">
            ALU (Arithmetic Logic Unit)
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Funzione</h4>
                <p className="text-sm">
                  L'ALU è il cuore computazionale della CPU. Esegue tutte le operazioni aritmetiche e logiche,
                  ricevendo due input (A e B), un codice operazione, e producendo un risultato più i flag di stato.
                </p>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4 bg-primary/5">
                  <h4 className="font-semibold mb-2">Operazioni Aritmetiche</h4>
                  <div className="text-sm space-y-1 font-mono">
                    <div>ADD: A + B → Result</div>
                    <div>SUB: A - B → Result</div>
                    <div>INC: A + 1 → Result</div>
                    <div>DEC: A - 1 → Result</div>
                    <div>MOL: A × B → Result</div>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Tutte aggiornano ZF e SF in base al risultato
                  </div>
                </Card>

                <Card className="p-4 bg-secondary/30">
                  <h4 className="font-semibold mb-2">Operazioni Logiche</h4>
                  <div className="text-sm space-y-1 font-mono">
                    <div>AND: A & B → Result</div>
                    <div>OR:  A | B → Result</div>
                    <div>XOR: A ^ B → Result</div>
                    <div>NOT: ~A → Result</div>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Operazioni bit a bit, aggiornano ZF e SF
                  </div>
                </Card>
              </div>

              <Card className="p-4 bg-accent/10">
                <h4 className="font-semibold mb-2">Flusso di Lavoro ALU</h4>
                <div className="font-mono text-xs bg-background p-3 rounded whitespace-pre">
{`1. INPUT:  Registro A → ALU Input A
           Registro/Valore B → ALU Input B
           Opcode → ALU Control

2. PROCESS: ALU esegue l'operazione specificata
           Calcola Result = f(A, B, Opcode)

3. FLAGS:  ZF = (Result == 0) ? 1 : 0
           SF = (Result < 0) ? 1 : 0

4. OUTPUT: Result → Data Bus → Registro Destinazione
           Flags → Flag Register`}
                </div>
              </Card>

              <Card className="p-4 bg-warning/10">
                <h4 className="font-semibold mb-2">Esempio: ADD R0, R1</h4>
                <div className="text-sm space-y-2">
                  <div>Stato iniziale: R0 = 10, R1 = -15</div>
                  <div className="font-mono text-xs bg-background p-3 rounded space-y-1">
                    <div>1. R0 (10) → ALU Input A</div>
                    <div>2. R1 (-15) → ALU Input B</div>
                    <div>3. Opcode ADD → ALU Control</div>
                    <div>4. ALU calcola: 10 + (-15) = -5</div>
                    <div>5. Result (-5) → R0</div>
                    <div>6. ZF = 0 (risultato ≠ 0)</div>
                    <div>7. SF = 1 (risultato &lt; 0)</div>
                  </div>
                  <div>Stato finale: R0 = -5, ZF = 0, SF = 1</div>
                </div>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="control">
          <AccordionTrigger className="text-lg font-semibold">
            Unità di Controllo (Control Unit)
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Funzione</h4>
                <p className="text-sm">
                  L'Unità di Controllo coordina tutte le operazioni della CPU. Gestisce il ciclo
                  Fetch-Decode-Execute, genera i segnali di controllo per i bus, e sincronizza
                  l'accesso ai registri e alla memoria.
                </p>
              </Card>

              <Card className="p-4 bg-primary/5">
                <h4 className="font-semibold mb-2">Instruction Register (IR)</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Funzione:</strong> Contiene l'istruzione corrente in esecuzione</p>
                  <p><strong>Caricamento:</strong> Durante la fase Fetch, Memory[PC] → IR</p>
                  <p><strong>Formato:</strong> Contiene opcode e operandi dell'istruzione</p>
                  <div className="mt-3 p-3 bg-background rounded font-mono text-xs">
                    ; PC = 5<br/>
                    Fetch: Memory[5] → IR    (es: "ADD R0, R1")<br/>
                    Decode: IR analizzato → Opcode=ADD, Dest=R0, Src=R1<br/>
                    Execute: R0 = R0 + R1
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-secondary/30">
                <h4 className="font-semibold mb-2">Decoder (Decodificatore)</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Input:</strong> Istruzione dall'IR</p>
                  <p><strong>Output:</strong> Segnali di controllo per ALU, registri, memoria, bus</p>
                  <p><strong>Processo:</strong></p>
                  <div className="ml-3 space-y-1">
                    <div>1. Identifica l'opcode (MOV, ADD, JMP, etc.)</div>
                    <div>2. Estrae gli operandi (registri, valori immediati, indirizzi)</div>
                    <div>3. Genera la sequenza di microoperazioni necessarie</div>
                    <div>4. Attiva i segnali di controllo appropriati</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-accent/10">
                <h4 className="font-semibold mb-2">Sequencer (Sequenziatore)</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Funzione:</strong> Gestisce il timing e la sequenza delle operazioni</p>
                  <p><strong>Ciclo base:</strong></p>
                  <div className="font-mono text-xs bg-background p-3 rounded space-y-1">
                    <div><strong>T1 (Fetch):</strong></div>
                    <div className="ml-3">• Address Bus ← PC</div>
                    <div className="ml-3">• Control Bus ← READ</div>
                    <div className="ml-3">• Data Bus → IR</div>
                    <div className="mt-2"><strong>T2 (Decode):</strong></div>
                    <div className="ml-3">• Decoder analizza IR</div>
                    <div className="ml-3">• Genera segnali di controllo</div>
                    <div className="mt-2"><strong>T3-Tn (Execute):</strong></div>
                    <div className="ml-3">• Esegue microoperazioni</div>
                    <div className="ml-3">• Numero variabile di cicli</div>
                    <div className="mt-2"><strong>Tn+1 (Update):</strong></div>
                    <div className="ml-3">• PC ← PC + 1 (o nuovo indirizzo se salto)</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-warning/10">
                <h4 className="font-semibold mb-2">Segnali di Controllo</h4>
                <div className="text-sm space-y-2">
                  <p>La CU genera questi segnali sul Control Bus:</p>
                  <div className="grid gap-2 mt-2">
                    <div className="p-2 bg-background rounded">
                      <strong>READ:</strong> Attiva la lettura dalla memoria (Memory → Data Bus)
                    </div>
                    <div className="p-2 bg-background rounded">
                      <strong>WRITE:</strong> Attiva la scrittura in memoria (Data Bus → Memory)
                    </div>
                    <div className="p-2 bg-background rounded">
                      <strong>ALU_OP:</strong> Specifica l'operazione ALU da eseguire
                    </div>
                    <div className="p-2 bg-background rounded">
                      <strong>REG_ENABLE:</strong> Abilita lettura/scrittura registri
                    </div>
                    <div className="p-2 bg-background rounded">
                      <strong>HALT:</strong> Ferma l'esecuzione del programma
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="memory">
          <AccordionTrigger className="text-lg font-semibold">
            Memoria (Memory)
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Architettura Von Neumann</h4>
                <p className="text-sm">
                  Questa CPU utilizza un'architettura a memoria unificata: lo stesso spazio di indirizzamento
                  contiene sia le istruzioni del programma che i dati. Questo semplifica il design ma richiede
                  attenzione per evitare che lo stack o i dati sovrascrivano il codice.
                </p>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4 bg-primary/5">
                  <h4 className="font-semibold mb-2">Caratteristiche</h4>
                  <div className="text-sm space-y-2">
                    <div><strong>Dimensione:</strong> 256 byte (8 bit di indirizzamento)</div>
                    <div><strong>Range indirizzi:</strong> 0x00 (0) - 0xFF (255)</div>
                    <div><strong>Tipo celle:</strong> 16 bit signed integer per cella</div>
                    <div><strong>Accesso:</strong> Tramite Address Bus e Data Bus</div>
                    <div><strong>Tempo accesso:</strong> 1 ciclo per READ, 1 ciclo per WRITE</div>
                  </div>
                </Card>

                <Card className="p-4 bg-secondary/30">
                  <h4 className="font-semibold mb-2">Organizzazione</h4>
                  <div className="text-sm space-y-2 font-mono text-xs">
                    <div className="p-2 bg-background rounded">
                      0x00 - 0xEF: Codice e Dati (240 byte)
                    </div>
                    <div className="p-2 bg-warning/20 rounded">
                      0xF0 - 0xFF: Stack (16 byte, cresce verso il basso)
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground font-sans">
                      Nota: La divisione è logica, non fisica. Lo stack può crescere oltre 0xF0 se necessario.
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-4 bg-accent/10">
                <h4 className="font-semibold mb-2">Accesso in Lettura (READ)</h4>
                <div className="font-mono text-xs bg-background p-3 rounded whitespace-pre">
{`Esempio: LDR R0, [100]

1. Control Unit → Address Bus: 100
2. Control Unit → Control Bus: READ signal
3. Memory[100] → Data Bus
4. Data Bus → R0

Timing:
  Ciclo 1: Address Bus e Control Bus attivi
  Ciclo 2: Data Bus trasferisce il dato`}
                </div>
              </Card>

              <Card className="p-4 bg-warning/10">
                <h4 className="font-semibold mb-2">Accesso in Scrittura (WRITE)</h4>
                <div className="font-mono text-xs bg-background p-3 rounded whitespace-pre">
{`Esempio: STR R0, [100]

1. Control Unit → Address Bus: 100
2. R0 → Data Bus
3. Control Unit → Control Bus: WRITE signal
4. Data Bus → Memory[100]

Timing:
  Ciclo 1: Address Bus, Data Bus e Control Bus attivi
  Ciclo 2: Dato scritto in memoria`}
                </div>
              </Card>

              <Card className="p-4 bg-primary/10">
                <h4 className="font-semibold mb-2">Stack in Memoria</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Crescita:</strong> Dall'alto verso il basso (255 → 0)</p>
                  <p><strong>Stack Pointer:</strong> Punta alla prossima posizione libera</p>
                  <div className="font-mono text-xs bg-background p-3 rounded mt-2">
                    Iniziale: SP = 256 (stack vuoto)<br/>
                    <br/>
                    PUSH R0 (R0=42):<br/>
                    • SP = SP - 1 = 255<br/>
                    • Memory[255] = 42<br/>
                    <br/>
                    PUSH R1 (R1=99):<br/>
                    • SP = SP - 1 = 254<br/>
                    • Memory[254] = 99<br/>
                    <br/>
                    POP R2:<br/>
                    • R2 = Memory[254] = 99<br/>
                    • SP = SP + 1 = 255<br/>
                    <br/>
                    Visualizzazione memoria:<br/>
                    [253]: vuoto<br/>
                    [254]: 99 ← top dopo primo POP<br/>
                    [255]: 42 ← SP punta qui<br/>
                    [256]: (fuori limite)
                  </div>
                </div>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="buses">
          <AccordionTrigger className="text-lg font-semibold">
            Bus di Sistema
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Card className="p-4">
                <p className="text-sm">
                  I bus sono le "autostrade" della CPU: connettono tutti i componenti e permettono
                  il trasferimento di dati, indirizzi e segnali di controllo. In questa architettura
                  abbiamo tre bus principali.
                </p>
              </Card>

              <Card className="p-4 bg-primary/5 border-primary/30">
                <h4 className="font-semibold mb-2 text-primary">Data Bus (Bus Dati)</h4>
                <div className="text-sm space-y-2">
                  <div><strong>Larghezza:</strong> 16 bit (può trasferire valori da -32768 a 32767)</div>
                  <div><strong>Direzione:</strong> Bidirezionale (può trasferire dati in entrambe le direzioni)</div>
                  <div><strong>Funzione:</strong> Trasporta tutti i dati tra CPU, memoria e registri</div>
                  <div><strong>Utilizzato da:</strong></div>
                  <div className="ml-3 space-y-1">
                    <div>• Lettura/scrittura registri</div>
                    <div>• Lettura/scrittura memoria</div>
                    <div>• Trasferimento risultati ALU</div>
                    <div>• Trasferimento valori immediati</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-accent/10 border-accent/30">
                <h4 className="font-semibold mb-2 text-accent">Address Bus (Bus Indirizzi)</h4>
                <div className="text-sm space-y-2">
                  <div><strong>Larghezza:</strong> 8 bit (può indirizzare 256 posizioni: 0-255)</div>
                  <div><strong>Direzione:</strong> Unidirezionale (solo CPU → Memoria)</div>
                  <div><strong>Funzione:</strong> Specifica quale cella di memoria accedere</div>
                  <div><strong>Utilizzato da:</strong></div>
                  <div className="ml-3 space-y-1">
                    <div>• Fetch istruzioni (PC → Address Bus → Memory)</div>
                    <div>• Accesso dati (LDR, STR)</div>
                    <div>• Operazioni stack (PUSH, POP)</div>
                    <div>• Indirizzamento indiretto</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-warning/10 border-warning/30">
                <h4 className="font-semibold mb-2 text-warning">Control Bus (Bus Controllo)</h4>
                <div className="text-sm space-y-2">
                  <div><strong>Tipo:</strong> Insieme di linee di segnale (non un bus dati)</div>
                  <div><strong>Direzione:</strong> Principalmente CPU → altri componenti</div>
                  <div><strong>Funzione:</strong> Coordina e sincronizza tutte le operazioni</div>
                  <div><strong>Segnali principali:</strong></div>
                  <div className="ml-3 grid gap-2 mt-2">
                    <div className="p-2 bg-background rounded text-xs">
                      <strong>READ:</strong> Attiva lettura dalla memoria
                    </div>
                    <div className="p-2 bg-background rounded text-xs">
                      <strong>WRITE:</strong> Attiva scrittura in memoria
                    </div>
                    <div className="p-2 bg-background rounded text-xs">
                      <strong>CLOCK:</strong> Sincronizza le operazioni (non implementato esplicitamente)
                    </div>
                    <div className="p-2 bg-background rounded text-xs">
                      <strong>HALT:</strong> Ferma l'esecuzione (istruzione HLT)
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-secondary/30">
                <h4 className="font-semibold mb-2">Esempio: Interazione tra Bus</h4>
                <div className="text-sm">
                  <p className="mb-2">Istruzione: <code className="bg-background px-2 py-1 rounded">STR R0, [100]</code> (R0 contiene 42)</p>
                  <div className="font-mono text-xs bg-background p-3 rounded space-y-2">
                    <div><strong>Step 1:</strong> Fetch istruzione</div>
                    <div className="ml-3 text-primary">• Address Bus ← PC (es: 5)</div>
                    <div className="ml-3 text-warning">• Control Bus ← READ</div>
                    <div className="ml-3 text-primary">• Data Bus ← Memory[5] ("STR R0, [100]")</div>
                    
                    <div className="mt-3"><strong>Step 2:</strong> Decode</div>
                    <div className="ml-3">• CU decodifica: STR, src=R0, addr=100</div>
                    
                    <div className="mt-3"><strong>Step 3:</strong> Execute - Address</div>
                    <div className="ml-3 text-accent">• Address Bus ← 100</div>
                    
                    <div className="mt-3"><strong>Step 4:</strong> Execute - Data</div>
                    <div className="ml-3 text-primary">• Data Bus ← R0 (42)</div>
                    
                    <div className="mt-3"><strong>Step 5:</strong> Execute - Write</div>
                    <div className="ml-3 text-warning">• Control Bus ← WRITE</div>
                    <div className="ml-3">• Memory[100] ← Data Bus (42)</div>
                    
                    <div className="mt-3"><strong>Step 6:</strong> Update PC</div>
                    <div className="ml-3">• PC ← PC + 1 (6)</div>
                  </div>
                </div>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
