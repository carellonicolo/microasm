# Architettura Memoria e Stack

## <a id="memory-org"></a>Organizzazione della Memoria

### Caratteristiche Generali

MicroASM dispone di **256 celle di memoria**, ognuna in grado di memorizzare un valore signed a 16-bit.

| Proprietà | Valore |
|-----------|--------|
| **Numero celle** | 256 |
| **Range indirizzi** | 0 - 255 |
| **Dimensione cella** | 16 bit (2 byte) |
| **Tipo dato** | Signed integer |
| **Range valori** | -32,768 a 32,767 |
| **Stato iniziale** | Tutte le celle = 0 |

### Layout Memoria

```
Indirizzo    Utilizzo
┌─────────┐
│  255    │  ← Stack (quando SP < 256)
│  254    │
│  ...    │  ↓ Stack cresce verso il basso
│  SP →   │  ← Top of Stack (posizione corrente)
│  ...    │
│  100    │
│  ...    │  ← Dati utente
│   10    │
│  ...    │
│    1    │
│    0    │  ← Prima cella
└─────────┘
```

### Accesso alla Memoria

**Modalità disponibili:**

1. **Diretto** - `[indirizzo]`
   ```asm
   MOV R0, [100]    ; Carica da indirizzo 100
   MOV [50], R1     ; Salva in indirizzo 50
   ```

2. **Indiretto** - `[Registro]`
   ```asm
   MOV R0, 10       ; R0 = 10 (indirizzo)
   MOV R1, [R0]     ; R1 = Memory[10]
   ```

### Protezioni

- **Range check**: Accesso a indirizzi < 0 o > 255 genera errore
- **No segmentation**: Tutta la memoria è accessibile
- **No MMU**: Nessuna traduzione indirizzi virtuali/fisici

---

## <a id="16bit-cells"></a>Celle a 16-bit e Rappresentazione

### Formato Signed Integer

Ogni cella usa la rappresentazione **complemento a 2** per i numeri negativi.

**Esempi:**

| Valore Decimale | Binario (16-bit) | Hex |
|-----------------|------------------|-----|
| 0 | `0000000000000000` | 0x0000 |
| 1 | `0000000000000001` | 0x0001 |
| 100 | `0000000001100100` | 0x0064 |
| 32,767 | `0111111111111111` | 0x7FFF |
| -1 | `1111111111111111` | 0xFFFF |
| -100 | `1111111110011100` | 0xFF9C |
| -32,768 | `1000000000000000` | 0x8000 |

### Bit più Significativo (MSB)

Il **bit più a sinistra** indica il segno:
- `0` = Numero positivo o zero
- `1` = Numero negativo

Questo è il motivo per cui il Sign Flag (SF) controlla semplicemente il MSB del risultato.

### Overflow

Un **overflow** si verifica quando il risultato di un'operazione esce dal range -32,768 a 32,767:

```asm
MOV R0, 32000
ADD R0, 1000     ; Overflow! 33,000 > 32,767
```

MicroASM genera un errore runtime quando rileva overflow.

---

## <a id="addressing-detail"></a>Modalità di Indirizzamento - Dettaglio

### 1. Indirizzamento Immediato

Il valore è specificato direttamente nell'istruzione.

```asm
MOV R0, 42       ; Valore letterale 42
ADD R1, -5       ; Valore letterale -5
```

**Caratteristiche:**
- Nessun accesso memoria
- Veloce (1 ciclo)
- Valore hardcodato nel codice

---

### 2. Indirizzamento a Registro

L'operando è un registro.

```asm
MOV R0, R1       ; Copia R1 in R0
ADD R2, R3       ; R2 = R2 + R3
```

**Caratteristiche:**
- Nessun accesso memoria
- Velocissimo
- Valori volatili (si perdono allo spegnimento)

---

### 3. Indirizzamento Diretto

L'indirizzo di memoria è specificato direttamente.

```asm
MOV R0, [100]    ; R0 = Memory[100]
MOV [50], R1     ; Memory[50] = R1
```

**Caratteristiche:**
- Richiede accesso memoria
- Indirizzo fisso nel codice
- Utile per variabili globali

**Esempio - Variabile Globale:**
```asm
; Definisci indirizzo 200 come "counter"
MOV [200], 0     ; Inizializza counter = 0

LOOP:
  MOV R0, [200]  ; Carica counter
  INC R0         ; Incrementa
  MOV [200], R0  ; Salva counter
  CMP R0, 10
  JNZ LOOP
```

---

### 4. Indirizzamento Indiretto

L'indirizzo è contenuto in un registro.

```asm
MOV R0, 100      ; R0 contiene l'indirizzo 100
MOV R1, [R0]     ; R1 = Memory[100]
```

**Caratteristiche:**
- Richiede accesso memoria
- Indirizzo dinamico (può cambiare)
- Utile per array e puntatori

**Esempio - Array:**
```asm
; Array inizia all'indirizzo 50
MOV R0, 50       ; R0 = puntatore all'array

; Scrive array[0] = 10
MOV [R0], 10

; Scrive array[1] = 20
INC R0           ; R0 = 51
MOV [R0], 20

; Scrive array[2] = 30
INC R0           ; R0 = 52
MOV [R0], 30
```

---

## <a id="stack-mechanism"></a>Meccanismo dello Stack

### Cos'è lo Stack?

Lo **stack** (pila) è una struttura dati LIFO (Last In, First Out) implementata nella parte alta della memoria.

**Analogia:**
Pensa a una pila di piatti:
- PUSH = Metti un piatto in cima
- POP = Togli il piatto dalla cima

### Proprietà dello Stack

| Proprietà | Valore |
|-----------|--------|
| **Posizione** | Top della memoria (cresce verso il basso) |
| **Direzione crescita** | Downward (da 256 verso 0) |
| **Stack Pointer (SP)** | Punta alla prossima cella libera |
| **SP iniziale** | 256 (stack vuoto) |
| **SP minimo** | 0 (stack pieno, 256 elementi) |
| **SP massimo** | 256 (stack vuoto) |

### Visualizzazione

```
SP = 256 (Stack Vuoto)
┌─────────┐
│  255    │  ← Posizione libera
│  254    │  ← Posizione libera
│  ...    │
└─────────┘

Dopo PUSH 10:
SP = 255
┌─────────┐
│  255    │  ← 10 (SP punta qui)
│  254    │  ← Posizione libera
│  ...    │
└─────────┘

Dopo PUSH 20:
SP = 254
┌─────────┐
│  255    │  ← 10
│  254    │  ← 20 (SP punta qui)
│  253    │  ← Posizione libera
│  ...    │
└─────────┘

Dopo POP R0:
SP = 255, R0 = 20
┌─────────┐
│  255    │  ← 10 (SP punta qui)
│  254    │  ← (valore non più valido)
│  253    │  ← Posizione libera
│  ...    │
└─────────┘
```

---

## <a id="stack-pointer"></a>Stack Pointer (SP)

### Comportamento del SP

Il **Stack Pointer** è un registro speciale che traccia la posizione corrente dello stack.

**Regole:**
1. SP inizia a **256** (stack vuoto)
2. **PUSH decrementa** SP prima di scrivere (pre-decrement)
3. **POP legge** poi incrementa SP (post-increment)
4. SP punta sempre alla **prossima cella libera** (top of stack)

### Stati dello Stack

| Condizione | SP | Stato |
|------------|----|----|
| Stack vuoto | 256 | Nessun elemento |
| 1 elemento | 255 | Un elemento in Memory[255] |
| 10 elementi | 246 | Elementi in Memory[255-246] |
| Stack pieno | 0 | 256 elementi (Memory[255-0]) |

### Errori Stack

**Stack Overflow:**
```asm
; SP = 0 (stack già pieno)
PUSH R0          ; Errore: SP non può diventare -1!
```

**Stack Underflow:**
```asm
; SP = 256 (stack vuoto)
POP R0           ; Errore: Nessun elemento da estrarre!
```

---

## <a id="push-pop"></a>PUSH/POP Internals

### PUSH - Passo-Passo

**Istruzione:** `PUSH R0` (dove R0 = 42)

**Stato iniziale:**
- SP = 256
- R0 = 42

**Esecuzione:**

1. **Decrementa SP**
   ```
   SP = SP - 1 = 255
   ```

2. **Scrivi in Memory[SP]**
   ```
   Memory[255] = R0 = 42
   ```

**Stato finale:**
- SP = 255
- Memory[255] = 42

**Cicli:** 2 (1 per decremento SP, 1 per scrittura)

---

### POP - Passo-Passo

**Istruzione:** `POP R1`

**Stato iniziale:**
- SP = 255
- Memory[255] = 42
- R1 = 0

**Esecuzione:**

1. **Leggi da Memory[SP]**
   ```
   R1 = Memory[255] = 42
   ```

2. **Incrementa SP**
   ```
   SP = SP + 1 = 256
   ```

**Stato finale:**
- SP = 256
- R1 = 42
- Memory[255] = 42 (valore ancora lì, ma non più valido)

**Cicli:** 2 (1 per lettura, 1 per incremento SP)

---

### Esempio Completo

```asm
; Stato iniziale: SP = 256

PUSH 10          ; SP = 255, Memory[255] = 10
PUSH 20          ; SP = 254, Memory[254] = 20
PUSH 30          ; SP = 253, Memory[253] = 30

POP R0           ; SP = 254, R0 = 30
POP R1           ; SP = 255, R1 = 20
POP R2           ; SP = 256, R2 = 10

; Ordine di estrazione: 30, 20, 10 (inverso!)
```

---

## <a id="call-ret"></a>CALL/RET Internals

### CALL - Chiamata Subroutine

**Istruzione:** `CALL FUNCTION`

**Cosa succede:**

1. **Salva Return Address**
   ```
   SP = SP - 1
   Memory[SP] = PC + 1  (indirizzo istruzione successiva)
   ```

2. **Salta alla Funzione**
   ```
   PC = indirizzo di FUNCTION
   ```

**Esempio:**

```asm
; PC = 5
MOV R0, 10       ; Istruzione a PC=5
CALL DOUBLE      ; Istruzione a PC=6
OUT R0           ; Istruzione a PC=7 ← Return qui

; PC = 20
DOUBLE:          ; Etichetta a PC=20
  ADD R0, R0
  RET
```

**Esecuzione CALL:**
1. SP = 255 (da 256)
2. Memory[255] = 7 (PC + 1)
3. PC = 20 (salta a DOUBLE)

---

### RET - Ritorno da Subroutine

**Istruzione:** `RET`

**Cosa succede:**

1. **Recupera Return Address**
   ```
   PC = Memory[SP]
   ```

2. **Ripristina SP**
   ```
   SP = SP + 1
   ```

**Esecuzione RET:**
1. PC = Memory[255] = 7
2. SP = 256

Il programma continua da PC=7 (OUT R0).

---

### Nesting - Chiamate Annidate

Lo stack permette chiamate annidate:

```asm
CALL A      ; Salva return address R1
HLT

A:
  CALL B    ; Salva return address R2
  RET       ; Ritorna a R1

B:
  CALL C    ; Salva return address R3
  RET       ; Ritorna a R2

C:
  RET       ; Ritorna a R3
```

**Stack durante esecuzione:**
```
Dopo CALL A: SP=255, Memory[255]=R1
Dopo CALL B: SP=254, Memory[255]=R1, Memory[254]=R2
Dopo CALL C: SP=253, Memory[255]=R1, Memory[254]=R2, Memory[253]=R3

RET da C: SP=254
RET da B: SP=255
RET da A: SP=256
```

---

## <a id="stack-vs-memory"></a>Stack vs Memoria

### Quando Usare lo Stack

**Usa PUSH/POP per:**
1. Salvare/ripristinare registri temporaneamente
2. Passare parametri a subroutine
3. Salvare return address (CALL/RET)
4. Gestire dati temporanei in subroutine

**Esempio:**
```asm
; Salvare R0 prima di usarlo
PUSH R0
MOV R0, 100
; ... usa R0 ...
POP R0          ; Ripristina valore originale
```

---

### Quando Usare la Memoria Diretta

**Usa MOV [addr] per:**
1. Variabili globali
2. Dati persistenti
3. Array e strutture dati
4. Comunicazione tra parti diverse del programma

**Esempio:**
```asm
; Variabile globale contatore
MOV [200], 0    ; Inizializza contatore

LOOP:
  MOV R0, [200]
  INC R0
  MOV [200], R0
  CMP R0, 100
  JNZ LOOP
```

---

### Confronto

| Aspetto | Stack | Memoria Diretta |
|---------|-------|-----------------|
| **Accesso** | LIFO (ordinato) | Random (qualsiasi indirizzo) |
| **Gestione** | Automatica (SP) | Manuale (tu scegli indirizzo) |
| **Velocità** | Veloce | Veloce |
| **Uso tipico** | Dati temporanei | Dati persistenti |
| **Dimensione** | Dinamica (fino a 256) | Fissa (256 celle totali) |
| **Condivisione** | Con stack/memoria | Con stack/memoria |

---

## Esempi Pratici

### Esempio 1: Array con Indirizzamento Indiretto

```asm
; Array di 5 elementi a partire da indirizzo 50
; Array = [10, 20, 30, 40, 50]

MOV R0, 50       ; R0 = base pointer

; Inizializza array
MOV [R0], 10     ; array[0] = 10
INC R0
MOV [R0], 20     ; array[1] = 20
INC R0
MOV [R0], 30     ; array[2] = 30
INC R0
MOV [R0], 40     ; array[3] = 40
INC R0
MOV [R0], 50     ; array[4] = 50

; Somma elementi
MOV R0, 50       ; Reset pointer
MOV R1, 0        ; Sum = 0
MOV R2, 5        ; Counter = 5

LOOP:
  ADD R1, [R0]   ; Sum += array[i]
  INC R0         ; i++
  DEC R2
  JNZ LOOP

OUT R1           ; Stampa 150 (10+20+30+40+50)
HLT
```

---

### Esempio 2: Stack per Salvare Stato

```asm
; Funzione che usa tutti i registri
MOV R0, 100
MOV R1, 200
MOV R2, 300
MOV R3, 400

CALL FUNCTION

; Qui R0-R3 devono avere ancora i valori originali
OUT R0           ; 100
OUT R1           ; 200
OUT R2           ; 300
OUT R3           ; 400
HLT

FUNCTION:
  ; Salva tutti i registri
  PUSH R0
  PUSH R1
  PUSH R2
  PUSH R3

  ; Usa registri liberamente
  MOV R0, 1
  MOV R1, 2
  MOV R2, 3
  MOV R3, 4

  ; Ripristina registri (ordine inverso!)
  POP R3
  POP R2
  POP R1
  POP R0

  RET
```

---

### Esempio 3: Recursione (Fattoriale)

```asm
; Calcola fattoriale ricorsivo
; factorial(n) = n * factorial(n-1)
; factorial(1) = 1

MOV R0, 5        ; Calcola 5!
CALL FACTORIAL
OUT R1           ; Risultato in R1
HLT

FACTORIAL:
  ; Caso base: n = 1
  CMP R0, 1
  JZ BASE_CASE

  ; Salva n
  PUSH R0

  ; Chiama factorial(n-1)
  DEC R0
  CALL FACTORIAL

  ; Ripristina n
  POP R0

  ; n * factorial(n-1)
  MOL R1, R0
  RET

BASE_CASE:
  MOV R1, 1
  RET
```

**Stack durante esecuzione (n=5):**
```
CALL factorial(5): Memory[255] = R_main
CALL factorial(4): Memory[254] = R_5, Memory[253] = R_4
CALL factorial(3): Memory[252] = R_3
CALL factorial(2): Memory[251] = R_2
CALL factorial(1): Base case
RET: Unwinding stack...
```

---

## Conclusione

L'architettura memoria e stack di MicroASM fornisce:

1. **256 celle di memoria** per dati persistenti
2. **Stack LIFO** integrato per gestione chiamate e dati temporanei
3. **4 modalità di indirizzamento** (immediato, registro, diretto, indiretto)
4. **Stack Pointer automatico** per gestione stack
5. **Supporto recursione** tramite CALL/RET

Questa architettura semplice ma completa ti permette di implementare algoritmi complessi pur mantenendo la semplicità didattica.
