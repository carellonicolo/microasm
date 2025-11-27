import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DocumentationDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Apri documentazione MicroASM">
          <BookOpen className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Guida MicroASM</DialogTitle>
          <DialogDescription>
            Riferimento completo al linguaggio assembly MicroASM
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <Accordion type="multiple" defaultValue={["intro", "architecture"]} className="w-full">
            {/* Introduzione */}
            <AccordionItem value="intro">
              <AccordionTrigger>1. Introduzione</AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p>
                  MicroASM è un linguaggio assembly didattico progettato per simulare il funzionamento
                  di un semplice microprocessore con architettura a registri.
                </p>
                <p>
                  <strong>Caratteristiche principali:</strong>
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>4 registri generali a 16-bit signed (R0, R1, R2, R3)</li>
                  <li>256 celle di memoria da 16-bit signed</li>
                  <li>Stack integrato per gestione subroutine</li>
                  <li>Flag per controllo del flusso (ZF, SF)</li>
                  <li>Set di istruzioni completo per aritmetica, logica e I/O</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Architettura */}
            <AccordionItem value="architecture">
              <AccordionTrigger>2. Architettura del Processore</AccordionTrigger>
              <AccordionContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Registri Generali</h4>
                  <ul className="list-disc ml-6 space-y-1">
                    <li><code className="bg-muted px-1 rounded">R0, R1, R2, R3</code>: 4 registri a 16-bit signed (range: -32768 a 32767)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Registri Speciali</h4>
                  <ul className="list-disc ml-6 space-y-1">
                    <li><code className="bg-muted px-1 rounded">PC (Program Counter)</code>: Punta all'istruzione corrente</li>
                    <li><code className="bg-muted px-1 rounded">SP (Stack Pointer)</code>: Gestisce lo stack (inizia a 256 e decresce)</li>
                    <li><code className="bg-muted px-1 rounded">ZF (Zero Flag)</code>: Impostato a 1 quando il risultato è zero</li>
                    <li><code className="bg-muted px-1 rounded">SF (Sign Flag)</code>: Impostato a 1 quando il risultato è negativo</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Memoria</h4>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>256 celle di memoria (indirizzi 0-255)</li>
                    <li>Ogni cella contiene un valore signed a 16-bit</li>
                    <li>Lo stack cresce verso il basso dalla posizione 256</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Sintassi */}
            <AccordionItem value="syntax">
              <AccordionTrigger>3. Sintassi di Base</AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Formato delle Istruzioni</h4>
                  <pre className="bg-muted p-3 rounded font-mono text-xs">
{`OPCODE operando1, operando2  ; commento`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Commenti</h4>
                  <p>Utilizzare <code className="bg-muted px-1 rounded">;</code> per commenti di linea:</p>
                  <pre className="bg-muted p-3 rounded font-mono text-xs">
{`; Questo è un commento
MOV R0, 10  ; Commento inline`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Etichette (Labels)</h4>
                  <p>Le etichette marcano posizioni nel codice per salti e chiamate:</p>
                  <pre className="bg-muted p-3 rounded font-mono text-xs">
{`LOOP:          ; Definizione etichetta
  INC R0
  JMP LOOP     ; Salto all'etichetta`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Note</h4>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Il linguaggio è case-insensitive (MOV = mov = Mov)</li>
                    <li>Gli operandi sono separati da virgole</li>
                    <li>Gli spazi sono opzionali</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Modalità di Indirizzamento */}
            <AccordionItem value="addressing">
              <AccordionTrigger>4. Modalità di Indirizzamento</AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Immediato</h4>
                  <p>Valore costante numerico:</p>
                  <pre className="bg-muted p-3 rounded font-mono text-xs">
{`MOV R0, 42     ; R0 = 42`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Registro</h4>
                  <p>Accesso diretto a un registro:</p>
                  <pre className="bg-muted p-3 rounded font-mono text-xs">
{`MOV R0, R1     ; R0 = R1`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Diretto</h4>
                  <p>Accesso diretto alla memoria tra parentesi quadre:</p>
                  <pre className="bg-muted p-3 rounded font-mono text-xs">
{`MOV R0, [10]   ; R0 = memoria[10]
MOV [5], R0    ; memoria[5] = R0`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Indiretto</h4>
                  <p>Usa il valore di un registro come indirizzo di memoria:</p>
                  <pre className="bg-muted p-3 rounded font-mono text-xs">
{`MOV R1, 10     ; R1 = 10
MOV R0, [R1]   ; R0 = memoria[10]`}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Set di Istruzioni */}
            <AccordionItem value="instructions">
              <AccordionTrigger>5. Set di Istruzioni Completo</AccordionTrigger>
              <AccordionContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">5.1 Movimento Dati</h4>
                  <div className="space-y-2">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">MOV dest, src</code>
                      <p className="ml-4 mt-1">Copia un valore dalla sorgente alla destinazione</p>
                      <pre className="bg-muted p-3 rounded font-mono text-xs ml-4 mt-1">
{`MOV R0, 10     ; R0 = 10
MOV R1, R0     ; R1 = R0
MOV [5], R2    ; memoria[5] = R2
MOV R0, [R1]   ; R0 = memoria[R1]`}
                      </pre>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">PUSH src</code>
                      <p className="ml-4 mt-1">Inserisce un valore nello stack</p>
                      <pre className="bg-muted p-3 rounded font-mono text-xs ml-4 mt-1">
{`PUSH R0        ; Stack ← R0
PUSH 42        ; Stack ← 42
PUSH [10]      ; Stack ← memoria[10]`}
                      </pre>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">POP dest</code>
                      <p className="ml-4 mt-1">Estrae un valore dallo stack</p>
                      <pre className="bg-muted p-3 rounded font-mono text-xs ml-4 mt-1">
{`POP R0         ; R0 ← Stack
POP [10]       ; memoria[10] ← Stack`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">5.2 Operazioni Aritmetiche</h4>
                  <div className="space-y-2">
                    <p className="text-muted-foreground italic">Tutte le operazioni aritmetiche aggiornano ZF e SF</p>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">ADD dest, src</code>
                      <p className="ml-4 mt-1">Addizione: dest = dest + src</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">SUB dest, src</code>
                      <p className="ml-4 mt-1">Sottrazione: dest = dest - src</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">MOL dest, src</code>
                      <p className="ml-4 mt-1">Moltiplicazione: dest = dest * src</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">DIV dest, src</code>
                      <p className="ml-4 mt-1">Divisione intera: dest = dest / src</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">INC dest</code>
                      <p className="ml-4 mt-1">Incremento: dest = dest + 1</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">DEC dest</code>
                      <p className="ml-4 mt-1">Decremento: dest = dest - 1</p>
                    </div>
                    <pre className="bg-muted p-3 rounded font-mono text-xs mt-2">
{`MOV R0, 10
ADD R0, 5      ; R0 = 15
SUB R0, 3      ; R0 = 12
MOL R0, 2      ; R0 = 24
DIV R0, 4      ; R0 = 6
INC R0         ; R0 = 7
DEC R0         ; R0 = 6`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">5.3 Operazioni Logiche</h4>
                  <div className="space-y-2">
                    <p className="text-muted-foreground italic">Tutte le operazioni logiche aggiornano ZF e SF</p>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">AND dest, src</code>
                      <p className="ml-4 mt-1">AND bit a bit: dest = dest & src</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">OR dest, src</code>
                      <p className="ml-4 mt-1">OR bit a bit: dest = dest | src</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">NOT dest</code>
                      <p className="ml-4 mt-1">NOT bit a bit: dest = ~dest</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">5.4 Controllo del Flusso</h4>
                  <div className="space-y-2">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">JMP label</code>
                      <p className="ml-4 mt-1">Salto incondizionato all'etichetta</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">JZ label</code>
                      <p className="ml-4 mt-1">Salto se Zero Flag = 1 (risultato = 0)</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">JNZ label</code>
                      <p className="ml-4 mt-1">Salto se Zero Flag = 0 (risultato ≠ 0)</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">JS label</code>
                      <p className="ml-4 mt-1">Salto se Sign Flag = 1 (risultato &lt; 0)</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">CMP op1, op2</code>
                      <p className="ml-4 mt-1">Confronta op1 con op2 (setta flag senza modificare operandi)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">5.5 Subroutine</h4>
                  <div className="space-y-2">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">CALL label</code>
                      <p className="ml-4 mt-1">Chiama una subroutine (salva PC nello stack)</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">RET</code>
                      <p className="ml-4 mt-1">Ritorna da una subroutine (ripristina PC dallo stack)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">5.6 Input/Output e Controllo</h4>
                  <div className="space-y-2">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">OUT src</code>
                      <p className="ml-4 mt-1">Visualizza un valore nell'Output Log</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">HLT</code>
                      <p className="ml-4 mt-1">Ferma l'esecuzione del programma</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Flag */}
            <AccordionItem value="flags">
              <AccordionTrigger>6. Flag e Condizioni</AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p>I flag sono registri speciali che memorizzano lo stato dell'ultima operazione:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>ZF (Zero Flag)</strong>: Impostato a 1 se il risultato è zero, altrimenti 0</li>
                  <li><strong>SF (Sign Flag)</strong>: Impostato a 1 se il risultato è negativo, altrimenti 0</li>
                </ul>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Istruzioni che Modificano i Flag</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left">Istruzione</th>
                          <th className="p-2 text-left">Modifica ZF/SF</th>
                          <th className="p-2 text-left">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr><td className="p-2">MOV</td><td className="p-2">NO</td><td className="p-2">Solo movimento</td></tr>
                        <tr><td className="p-2">ADD/SUB/MOL/DIV</td><td className="p-2">SÌ</td><td className="p-2">Dopo operazione</td></tr>
                        <tr><td className="p-2">INC/DEC</td><td className="p-2">SÌ</td><td className="p-2">Dopo operazione</td></tr>
                        <tr><td className="p-2">AND/OR/NOT</td><td className="p-2">SÌ</td><td className="p-2">Dopo operazione</td></tr>
                        <tr><td className="p-2">CMP</td><td className="p-2">SÌ</td><td className="p-2">Confronto non distruttivo</td></tr>
                        <tr><td className="p-2">JMP/JZ/JNZ/JS</td><td className="p-2">NO</td><td className="p-2">Solo cambio flusso</td></tr>
                        <tr><td className="p-2">PUSH/POP</td><td className="p-2">NO</td><td className="p-2">Solo stack</td></tr>
                        <tr><td className="p-2">CALL/RET</td><td className="p-2">NO</td><td className="p-2">Solo subroutine</td></tr>
                        <tr><td className="p-2">OUT/HLT</td><td className="p-2">NO</td><td className="p-2">Solo I/O e controllo</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Esempi */}
            <AccordionItem value="examples">
              <AccordionTrigger>7. Esempi Pratici</AccordionTrigger>
              <AccordionContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Esempio 1: Somma Semplice</h4>
                  <pre className="bg-muted p-3 rounded font-mono text-xs">
{`; Somma di due numeri
MOV R0, 10      ; primo numero
MOV R1, 20      ; secondo numero
ADD R0, R1      ; R0 = R0 + R1 = 30
OUT R0          ; visualizza 30
HLT`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Esempio 2: Loop con Contatore</h4>
                  <pre className="bg-muted p-3 rounded font-mono text-xs">
{`; Conta da 1 a 5
MOV R0, 1       ; contatore
LOOP:
OUT R0          ; stampa contatore
INC R0          ; incrementa
CMP R0, 6       ; confronta con 6
JNZ LOOP        ; ripeti se non zero
HLT`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Esempio 3: Fattoriale</h4>
                  <pre className="bg-muted p-3 rounded font-mono text-xs">
{`; Calcolo del fattoriale di 5
MOV R0, 5       ; N = 5
MOV R1, 1       ; risultato = 1
FACTORIAL:
CMP R0, 1       ; confronta N con 1
JZ END          ; se N = 1, vai a END
MOL R1, R0      ; risultato *= N
DEC R0          ; N--
JMP FACTORIAL   ; ripeti
END:
OUT R1          ; stampa il risultato (120)
HLT`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Esempio 4: Uso dello Stack</h4>
                  <pre className="bg-muted p-3 rounded font-mono text-xs">
{`; Salvare e ripristinare valori
MOV R0, 100
MOV R1, 200
PUSH R0         ; salva R0 nello stack
PUSH R1         ; salva R1 nello stack
MOV R0, 0       ; azzera R0
MOV R1, 0       ; azzera R1
POP R1          ; ripristina R1 (200)
POP R0          ; ripristina R0 (100)
OUT R0
OUT R1
HLT`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Esempio 5: Subroutine</h4>
                  <pre className="bg-muted p-3 rounded font-mono text-xs">
{`; Chiamata a subroutine
MOV R0, 10
CALL DOUBLE     ; chiama subroutine
OUT R0          ; stampa 20
HLT

DOUBLE:         ; subroutine che raddoppia R0
ADD R0, R0
RET             ; ritorna`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Esempio 6: Accesso alla Memoria</h4>
                  <pre className="bg-muted p-3 rounded font-mono text-xs">
{`; Utilizzo della memoria
MOV [10], 42    ; salva 42 nella cella 10
MOV R0, [10]    ; carica da cella 10 in R0
MOV R1, 10      ; R1 = 10 (indirizzo)
MOV R2, [R1]    ; accesso indiretto: R2 = memoria[R1]
OUT R2          ; stampa 42
HLT`}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Errori Comuni */}
            <AccordionItem value="errors">
              <AccordionTrigger>8. Errori Comuni</AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <ul className="list-disc ml-6 space-y-2">
                  <li>
                    <strong>Stack Overflow</strong>: Troppi PUSH senza corrispondenti POP
                  </li>
                  <li>
                    <strong>Stack Underflow</strong>: Troppi POP o RET senza corrispondenti PUSH o CALL
                  </li>
                  <li>
                    <strong>Division by Zero</strong>: Tentativo di dividere per zero con DIV
                  </li>
                  <li>
                    <strong>Arithmetic Overflow</strong>: Risultato maggiore di 32767 o minore di -32768
                  </li>
                  <li>
                    <strong>Invalid Memory Access</strong>: Accesso a indirizzi &lt; 0 o &gt; 255
                  </li>
                  <li>
                    <strong>Undefined Label</strong>: JMP o CALL a un'etichetta non definita
                  </li>
                  <li>
                    <strong>Execution Out of Bounds</strong>: Program Counter esce dal programma (manca HLT)
                  </li>
                  <li>
                    <strong>Invalid Operands</strong>: Numero o tipo di operandi errato per l'istruzione
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Best Practices */}
            <AccordionItem value="best-practices">
              <AccordionTrigger>9. Consigli e Best Practices</AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <ul className="list-disc ml-6 space-y-2">
                  <li>
                    <strong>Usa commenti</strong>: Documenta il tuo codice per renderlo comprensibile
                  </li>
                  <li>
                    <strong>Nomi significativi per le label</strong>: Usa nomi descrittivi come LOOP, END, FACTORIAL
                  </li>
                  <li>
                    <strong>Verifica i limiti della memoria</strong>: Assicurati che gli indirizzi siano tra 0 e 255
                  </li>
                  <li>
                    <strong>Bilancia lo stack</strong>: Ogni PUSH deve avere un corrispondente POP
                  </li>
                  <li>
                    <strong>Usa CMP prima dei salti condizionali</strong>: Per decisioni basate su confronti
                  </li>
                  <li>
                    <strong>Testa passo-passo</strong>: Usa il pulsante STEP per debuggare il codice
                  </li>
                  <li>
                    <strong>Usa OUT per debug</strong>: Stampa valori intermedi per tracciare l'esecuzione
                  </li>
                  <li>
                    <strong>Termina sempre con HLT</strong>: Evita che il PC esca dal programma
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Riferimento Rapido */}
            <AccordionItem value="quick-reference">
              <AccordionTrigger>10. Riferimento Rapido</AccordionTrigger>
              <AccordionContent className="text-sm">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Istruzione</th>
                        <th className="p-2 text-left">Sintassi</th>
                        <th className="p-2 text-left">Descrizione</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-mono">
                      <tr><td className="p-2">MOV</td><td className="p-2">MOV dest, src</td><td className="p-2 font-sans">Copia valore</td></tr>
                      <tr><td className="p-2">PUSH</td><td className="p-2">PUSH src</td><td className="p-2 font-sans">Inserisce nello stack</td></tr>
                      <tr><td className="p-2">POP</td><td className="p-2">POP dest</td><td className="p-2 font-sans">Estrae dallo stack</td></tr>
                      <tr><td className="p-2">ADD</td><td className="p-2">ADD dest, src</td><td className="p-2 font-sans">Addizione</td></tr>
                      <tr><td className="p-2">SUB</td><td className="p-2">SUB dest, src</td><td className="p-2 font-sans">Sottrazione</td></tr>
                      <tr><td className="p-2">MOL</td><td className="p-2">MOL dest, src</td><td className="p-2 font-sans">Moltiplicazione</td></tr>
                      <tr><td className="p-2">DIV</td><td className="p-2">DIV dest, src</td><td className="p-2 font-sans">Divisione</td></tr>
                      <tr><td className="p-2">INC</td><td className="p-2">INC dest</td><td className="p-2 font-sans">Incremento</td></tr>
                      <tr><td className="p-2">DEC</td><td className="p-2">DEC dest</td><td className="p-2 font-sans">Decremento</td></tr>
                      <tr><td className="p-2">AND</td><td className="p-2">AND dest, src</td><td className="p-2 font-sans">AND logico</td></tr>
                      <tr><td className="p-2">OR</td><td className="p-2">OR dest, src</td><td className="p-2 font-sans">OR logico</td></tr>
                      <tr><td className="p-2">NOT</td><td className="p-2">NOT dest</td><td className="p-2 font-sans">NOT logico</td></tr>
                      <tr><td className="p-2">JMP</td><td className="p-2">JMP label</td><td className="p-2 font-sans">Salto incondizionato</td></tr>
                      <tr><td className="p-2">JZ</td><td className="p-2">JZ label</td><td className="p-2 font-sans">Salto se zero</td></tr>
                      <tr><td className="p-2">JNZ</td><td className="p-2">JNZ label</td><td className="p-2 font-sans">Salto se non zero</td></tr>
                      <tr><td className="p-2">JS</td><td className="p-2">JS label</td><td className="p-2 font-sans">Salto se negativo</td></tr>
                      <tr><td className="p-2">CMP</td><td className="p-2">CMP op1, op2</td><td className="p-2 font-sans">Confronto</td></tr>
                      <tr><td className="p-2">CALL</td><td className="p-2">CALL label</td><td className="p-2 font-sans">Chiama subroutine</td></tr>
                      <tr><td className="p-2">RET</td><td className="p-2">RET</td><td className="p-2 font-sans">Ritorna da subroutine</td></tr>
                      <tr><td className="p-2">OUT</td><td className="p-2">OUT src</td><td className="p-2 font-sans">Output valore</td></tr>
                      <tr><td className="p-2">HLT</td><td className="p-2">HLT</td><td className="p-2 font-sans">Ferma esecuzione</td></tr>
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
