# Riferimento Formale MicroASM

## <a id="intro"></a>Introduzione

MicroASM è un linguaggio assembly didattico progettato per simulare il funzionamento di un semplice microprocessore con architettura a registri.

**Caratteristiche principali:**

- 4 registri generali a 16-bit signed (R0, R1, R2, R3)
- 256 celle di memoria da 16-bit signed
- Stack integrato per gestione subroutine
- Flag per controllo del flusso (ZF, SF)
- Set di istruzioni completo per aritmetica, logica e I/O

---

## Architettura del Processore

### Registri Generali

- **R0, R1, R2, R3**: 4 registri a 16-bit signed (range: -32768 a 32767)

### Registri Speciali

- **PC (Program Counter)**: Punta all'istruzione corrente
- **SP (Stack Pointer)**: Gestisce lo stack (inizia a 256 e decresce)
- **ZF (Zero Flag)**: Impostato a 1 quando il risultato è zero
- **SF (Sign Flag)**: Impostato a 1 quando il risultato è negativo

### Memoria

- 256 celle di memoria (indirizzi 0-255)
- Ogni cella contiene un valore signed a 16-bit
- Lo stack cresce verso il basso dalla posizione 256

---

## Sintassi di Base

### Formato delle Istruzioni

```
OPCODE operando1, operando2  ; commento
```

### Commenti

Utilizzare `;` per commenti di linea:

```asm
; Questo è un commento
MOV R0, 10  ; Commento inline
```

### Etichette (Labels)

Le etichette marcano posizioni nel codice per salti e chiamate:

```asm
LOOP:          ; Definizione etichetta
  INC R0
  JMP LOOP     ; Salto all'etichetta
```

### Note

- Il linguaggio è case-insensitive (MOV = mov = Mov)
- Gli operandi sono separati da virgole
- Gli spazi sono opzionali

---

## <a id="addressing"></a>Modalità di Indirizzamento

### Immediato

Valore costante numerico:

```asm
MOV R0, 42     ; R0 = 42
```

### Registro

Accesso diretto a un registro:

```asm
MOV R0, R1     ; R0 = R1
```

### Diretto

Accesso diretto alla memoria tra parentesi quadre:

```asm
MOV R0, [10]   ; R0 = memoria[10]
MOV [5], R0    ; memoria[5] = R0
```

### Indiretto

Usa il valore di un registro come indirizzo di memoria:

```asm
MOV R1, 10     ; R1 = 10
MOV R0, [R1]   ; R0 = memoria[10]
```

---

## <a id="data-transfer"></a>Set di Istruzioni - Trasferimento Dati

### MOV dest, src

Copia un valore dalla sorgente alla destinazione.

**Sintassi:**
```
MOV Rdest, src
```

**Operandi:**
- `Rdest`: Registro destinazione (R0-R3)
- `src`: Sorgente (immediato, registro, o memoria)

**Esempi:**
```asm
MOV R0, 10     ; R0 = 10
MOV R1, R0     ; R1 = R0
MOV [5], R2    ; memoria[5] = R2
MOV R0, [R1]   ; R0 = memoria[R1]
```

**Flag:** Nessuno

---

### PUSH src

Inserisce un valore nello stack.

**Sintassi:**
```
PUSH src
```

**Operandi:**
- `src`: Valore da inserire (registro, immediato, o memoria)

**Comportamento:**
1. SP = SP - 1 (decrementa stack pointer)
2. memoria[SP] = src (scrive valore)

**Esempi:**
```asm
PUSH R0        ; Stack ← R0
PUSH 42        ; Stack ← 42
PUSH [10]      ; Stack ← memoria[10]
```

**Flag:** Nessuno

---

### POP dest

Estrae un valore dallo stack.

**Sintassi:**
```
POP dest
```

**Operandi:**
- `dest`: Destinazione (registro o memoria)

**Comportamento:**
1. dest = memoria[SP] (legge valore)
2. SP = SP + 1 (incrementa stack pointer)

**Esempi:**
```asm
POP R0         ; R0 ← Stack
POP [10]       ; memoria[10] ← Stack
```

**Flag:** Nessuno

---

## <a id="arithmetic"></a>Set di Istruzioni - Aritmetica

> **Nota:** Tutte le operazioni aritmetiche aggiornano ZF e SF

### ADD dest, src

Addizione: `dest = dest + src`

**Esempi:**
```asm
ADD R0, R1     ; R0 = R0 + R1
ADD R0, 5      ; R0 = R0 + 5
```

**Flag:** ZF, SF

---

### SUB dest, src

Sottrazione: `dest = dest - src`

**Esempi:**
```asm
SUB R0, R1     ; R0 = R0 - R1
SUB R0, 3      ; R0 = R0 - 3
```

**Flag:** ZF, SF

---

### MOL dest, src

Moltiplicazione: `dest = dest * src`

**Esempi:**
```asm
MOL R0, R1     ; R0 = R0 * R1
MOL R0, 2      ; R0 = R0 * 2
```

**Flag:** ZF, SF
**Cicli:** 3

---

### DIV dest, src

Divisione intera: `dest = dest / src`

**Nota:** Genera errore se `src = 0`

**Esempi:**
```asm
DIV R0, R1     ; R0 = R0 / R1
DIV R0, 4      ; R0 = R0 / 4
```

**Flag:** ZF, SF

---

### INC dest

Incremento: `dest = dest + 1`

**Esempi:**
```asm
INC R0         ; R0 = R0 + 1
```

**Flag:** ZF, SF

---

### DEC dest

Decremento: `dest = dest - 1`

**Esempi:**
```asm
DEC R0         ; R0 = R0 - 1
```

**Flag:** ZF, SF

---

## <a id="logic"></a>Set di Istruzioni - Operazioni Logiche

> **Nota:** Tutte le operazioni logiche aggiornano ZF e SF

### AND dest, src

AND bit a bit: `dest = dest & src`

**Esempi:**
```asm
AND R0, R1     ; R0 = R0 & R1
AND R0, 15     ; R0 = R0 & 15 (maschera bit)
```

**Flag:** ZF, SF

---

### OR dest, src

OR bit a bit: `dest = dest | src`

**Esempi:**
```asm
OR R0, R1      ; R0 = R0 | R1
OR R0, 8       ; R0 = R0 | 8 (set bit)
```

**Flag:** ZF, SF

---

### NOT dest

NOT bit a bit: `dest = ~dest`

**Esempi:**
```asm
NOT R0         ; R0 = ~R0
```

**Flag:** ZF, SF

---

## <a id="control-flow"></a>Set di Istruzioni - Controllo del Flusso

### JMP label

Salto incondizionato all'etichetta.

**Esempi:**
```asm
JMP LOOP       ; Salta a LOOP
JMP END        ; Salta a END
```

**Flag:** Nessuno

---

### JZ label

Salto se Zero Flag = 1 (risultato = 0).

**Esempi:**
```asm
CMP R0, 0
JZ END         ; Salta se R0 = 0
```

**Flag:** Legge ZF

---

### JNZ label

Salto se Zero Flag = 0 (risultato ≠ 0).

**Esempi:**
```asm
CMP R0, 10
JNZ LOOP       ; Salta se R0 ≠ 10
```

**Flag:** Legge ZF

---

### JS label

Salto se Sign Flag = 1 (risultato < 0).

**Esempi:**
```asm
CMP R0, 0
JS NEGATIVE    ; Salta se R0 < 0
```

**Flag:** Legge SF

---

### JNS label

Salto se Sign Flag = 0 (risultato ≥ 0).

**Esempi:**
```asm
CMP R0, 0
JNS POSITIVE   ; Salta se R0 ≥ 0
```

**Flag:** Legge SF

---

### CMP op1, op2

Confronta `op1` con `op2` (esegue `op1 - op2` e aggiorna flag).

**Nota:** Non modifica gli operandi, solo i flag.

**Esempi:**
```asm
CMP R0, R1     ; Confronta R0 con R1
CMP R0, 10     ; Confronta R0 con 10
JZ EQUAL       ; Salta se uguali
```

**Flag:** ZF, SF

---

## <a id="stack"></a>Set di Istruzioni - Subroutine

### CALL label

Chiama una subroutine.

**Comportamento:**
1. PUSH PC+1 (salva indirizzo di ritorno)
2. PC = label (salta alla subroutine)

**Esempi:**
```asm
CALL FUNCTION  ; Chiama subroutine FUNCTION
```

**Flag:** Nessuno

---

### RET

Ritorna da una subroutine.

**Comportamento:**
1. POP PC (ripristina indirizzo di ritorno)

**Esempi:**
```asm
FUNCTION:
  ; ... codice subroutine ...
  RET          ; Ritorna al chiamante
```

**Flag:** Nessuno

---

## <a id="io"></a>Set di Istruzioni - Input/Output

### OUT src

Visualizza un valore nell'Output Log.

**Esempi:**
```asm
OUT R0         ; Stampa valore di R0
OUT 42         ; Stampa 42
OUT [10]       ; Stampa memoria[10]
```

**Flag:** Nessuno

---

### HLT

Ferma l'esecuzione del programma.

**Esempi:**
```asm
HLT            ; Termina programma
```

**Flag:** Nessuno

---

## Flag e Condizioni

I flag sono registri speciali che memorizzano lo stato dell'ultima operazione:

- **ZF (Zero Flag)**: Impostato a 1 se il risultato è zero, altrimenti 0
- **SF (Sign Flag)**: Impostato a 1 se il risultato è negativo, altrimenti 0

### Istruzioni che Modificano i Flag

| Istruzione | Modifica ZF/SF | Note |
|------------|----------------|------|
| MOV | NO | Solo movimento |
| ADD/SUB/MOL/DIV | SÌ | Dopo operazione |
| INC/DEC | SÌ | Dopo operazione |
| AND/OR/NOT | SÌ | Dopo operazione |
| CMP | SÌ | Confronto non distruttivo |
| JMP/JZ/JNZ/JS/JNS | NO | Solo cambio flusso |
| PUSH/POP | NO | Solo stack |
| CALL/RET | NO | Solo subroutine |
| OUT/HLT | NO | Solo I/O e controllo |

---

## Riferimento Rapido

| Istruzione | Sintassi | Descrizione | Cicli | Flag |
|------------|----------|-------------|-------|------|
| MOV | MOV dest, src | Copia valore | 1 | - |
| PUSH | PUSH src | Inserisce nello stack | 2 | - |
| POP | POP dest | Estrae dallo stack | 2 | - |
| ADD | ADD dest, src | Addizione | 1 | ZF, SF |
| SUB | SUB dest, src | Sottrazione | 1 | ZF, SF |
| MOL | MOL dest, src | Moltiplicazione | 3 | ZF, SF |
| DIV | DIV dest, src | Divisione | 3 | ZF, SF |
| INC | INC dest | Incremento | 1 | ZF, SF |
| DEC | DEC dest | Decremento | 1 | ZF, SF |
| AND | AND dest, src | AND logico | 1 | ZF, SF |
| OR | OR dest, src | OR logico | 1 | ZF, SF |
| NOT | NOT dest | NOT logico | 1 | ZF, SF |
| JMP | JMP label | Salto incondizionato | 1 | - |
| JZ | JZ label | Salto se zero | 1 | Legge ZF |
| JNZ | JNZ label | Salto se non zero | 1 | Legge ZF |
| JS | JS label | Salto se negativo | 1 | Legge SF |
| JNS | JNS label | Salto se non negativo | 1 | Legge SF |
| CMP | CMP op1, op2 | Confronto | 1 | ZF, SF |
| CALL | CALL label | Chiama subroutine | 3 | - |
| RET | RET | Ritorna da subroutine | 2 | - |
| OUT | OUT src | Output valore | 1 | - |
| HLT | HLT | Ferma esecuzione | 1 | - |
