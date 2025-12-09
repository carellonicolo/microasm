# Tutorial Principianti MicroASM

Benvenuto! Questa guida ti accompagnerà passo-passo nell'apprendimento del linguaggio assembly MicroASM.

---

## <a id="getting-started"></a>Primi Passi

### Cos'è l'Assembly?

L'assembly è un linguaggio di programmazione di "basso livello" che parla direttamente con il processore. A differenza dei linguaggi ad alto livello (come Python o JavaScript), ogni istruzione assembly corrisponde a un'operazione molto semplice del processore.

**Analogia:** Pensa all'assembly come dare istruzioni molto dettagliate a un robot: "Prendi l'oggetto A", "Mettilo nella scatola B", "Confronta i pesi", ecc. Mentre un linguaggio ad alto livello sarebbe come dire "Organizza gli oggetti per peso" - il robot sa già come farlo.

### Perché Imparare l'Assembly?

1. **Capire come funzionano i computer** - Vedi esattamente cosa succede "sotto il cofano"
2. **Ottimizzazione** - Scrivi codice ultra-veloce quando serve
3. **Debug** - Capisci meglio gli errori nei linguaggi ad alto livello
4. **Programmazione di sistemi** - Necessario per sistemi operativi e firmware

---

## <a id="first-program"></a>Il Tuo Primo Programma

Iniziamo con un esempio semplicissimo: sommare due numeri e stampare il risultato.

```asm
; Il mio primo programma MicroASM
; Somma 10 + 20 e stampa il risultato

MOV R0, 10      ; Metti il numero 10 nel registro R0
MOV R1, 20      ; Metti il numero 20 nel registro R1
ADD R0, R1      ; Somma R1 a R0 (R0 = R0 + R1 = 30)
OUT R0          ; Stampa il valore di R0
HLT             ; Ferma il programma
```

**Cosa succede passo-passo:**

1. **Riga 4:** Carichiamo il valore `10` nel registro R0
2. **Riga 5:** Carichiamo il valore `20` nel registro R1
3. **Riga 6:** Sommiamo R1 a R0, il risultato (30) viene salvato in R0
4. **Riga 7:** Stampiamo il valore di R0 nell'output
5. **Riga 8:** Fermiamo l'esecuzione

**Output:**
```
R0 = 30
```

### Commenti

Hai notato le righe che iniziano con `;`? Sono **commenti** - note per noi programmatori che il computer ignora completamente. Usa i commenti per spiegare cosa fa il tuo codice!

---

## <a id="registers"></a>Capire i Registri

### Cosa sono i Registri?

I registri sono piccole "scatole" dentro il processore dove puoi memorizzare temporaneamente dei numeri. Sono **ultra-veloci** da accedere.

**Analogia:** Pensa ai registri come alle tue tasche. Hai 4 tasche (R0, R1, R2, R3) dove puoi tenere oggetti (numeri) per usarli velocemente. Se devi usare più di 4 oggetti, devi metterne alcuni nello zaino (la memoria).

### I 4 Registri Generali

MicroASM ha 4 registri che puoi usare liberamente:

- **R0** - Primo registro
- **R1** - Secondo registro
- **R2** - Terzo registro
- **R3** - Quarto registro

Ogni registro può contenere un numero intero da **-32,768** a **32,767** (16 bit signed).

### Esempio: Usare Più Registri

```asm
; Calcola (A + B) * C
MOV R0, 5       ; A = 5
MOV R1, 3       ; B = 3
MOV R2, 2       ; C = 2

ADD R0, R1      ; R0 = A + B = 8
MOL R0, R2      ; R0 = (A+B) * C = 16

OUT R0          ; Stampa 16
HLT
```

---

## <a id="memory"></a>Lavorare con la Memoria

### Cos'è la Memoria?

Oltre ai 4 registri, hai 256 **celle di memoria** (indirizzi 0-255). La memoria è più lenta dei registri, ma hai molto più spazio.

**Analogia:** I registri sono le tue tasche (veloci, ma poche). La memoria è il tuo zaino (più lento da aprire, ma spazioso).

### Salvare in Memoria

Usa le **parentesi quadre** `[ ]` per accedere alla memoria:

```asm
MOV R0, 42      ; R0 = 42
MOV [10], R0    ; Salva R0 nella cella 10 di memoria
```

### Caricare dalla Memoria

```asm
MOV R0, [10]    ; Carica il valore dalla cella 10 in R0
OUT R0          ; Stampa il valore
```

### Esempio Completo

```asm
; Salvare e recuperare dalla memoria
MOV R0, 100     ; R0 = 100
MOV [50], R0    ; memoria[50] = 100

MOV R1, 200     ; R1 = 200
MOV [51], R1    ; memoria[51] = 200

; Ora recuperiamo e sommiamo
MOV R2, [50]    ; R2 = memoria[50] = 100
MOV R3, [51]    ; R3 = memoria[51] = 200
ADD R2, R3      ; R2 = 100 + 200 = 300

OUT R2          ; Stampa 300
HLT
```

### Indirizzamento Indiretto

Puoi usare un registro per memorizzare un **indirizzo** di memoria:

```asm
MOV R0, 10      ; R0 contiene l'indirizzo 10
MOV R1, 99      ; R1 = 99
MOV [R0], R1    ; memoria[10] = 99 (usa R0 come indirizzo!)
```

**Analogia:** È come dire "metti questo oggetto nella scatola numero che ho scritto su questo foglio".

---

## <a id="arithmetic-ops"></a>Operazioni Aritmetiche

### Le 6 Operazioni

MicroASM supporta 6 operazioni aritmetiche:

1. **ADD** - Addizione
2. **SUB** - Sottrazione
3. **MOL** - Moltiplicazione
4. **DIV** - Divisione (intera)
5. **INC** - Incremento (+1)
6. **DEC** - Decremento (-1)

### Esempio: Calcolare un Fattoriale

Calcoliamo 5! (5 fattoriale = 5 × 4 × 3 × 2 × 1 = 120):

```asm
; Calcolo di 5!
MOV R0, 5       ; N = 5
MOV R1, 1       ; risultato = 1

FACTORIAL:
CMP R0, 1       ; Confronta N con 1
JZ END          ; Se N = 1, vai a END

MOL R1, R0      ; risultato = risultato * N
DEC R0          ; N = N - 1
JMP FACTORIAL   ; Ripeti il loop

END:
OUT R1          ; Stampa il risultato (120)
HLT
```

**Spiegazione:**
- Iniziamo con N=5 e risultato=1
- Loop: moltiplichiamo risultato per N, poi decrementiamo N
- Quando N arriva a 1, usciamo dal loop
- Risultato finale: 5×4×3×2×1 = 120

---

## <a id="conditional"></a>Logica Condizionale

### I Flag: ZF e SF

Quando fai operazioni aritmetiche, il processore aggiorna due **flag** (bandierine):

- **ZF (Zero Flag)**: È 1 se il risultato è zero, altrimenti 0
- **SF (Sign Flag)**: È 1 se il risultato è negativo, altrimenti 0

### L'Istruzione CMP

**CMP** confronta due valori facendo una sottrazione "invisibile":

```asm
CMP R0, 10      ; Confronta R0 con 10 (fa R0 - 10 ma non salva il risultato)
```

Se R0 = 10, allora R0 - 10 = 0, quindi **ZF diventa 1**.

### I Salti Condizionali

Dopo un CMP, puoi saltare in base ai flag:

- **JZ** - Salta se Zero (ZF = 1)
- **JNZ** - Salta se Non Zero (ZF = 0)
- **JS** - Salta se Negativo (SF = 1)
- **JNS** - Salta se Non Negativo (SF = 0)

### Esempio: Trovare il Maggiore

```asm
; Trova il maggiore tra R0 e R1
MOV R0, 15
MOV R1, 20

CMP R0, R1      ; Confronta R0 con R1 (fa R0 - R1 = -5)
JS R1_BIGGER    ; Se negativo, R1 è più grande

; Se arriviamo qui, R0 >= R1
OUT R0
JMP END

R1_BIGGER:
OUT R1

END:
HLT
```

**Output:** 20 (perché R1 > R0)

---

## <a id="loops"></a>Loop e Contatori

I loop (cicli) ti permettono di ripetere codice.

### Esempio: Contare da 1 a 5

```asm
; Conta da 1 a 5
MOV R0, 1       ; contatore = 1

LOOP:
OUT R0          ; Stampa il contatore
INC R0          ; contatore = contatore + 1
CMP R0, 6       ; Confronta con 6
JNZ LOOP        ; Se contatore ≠ 6, ripeti

HLT
```

**Output:**
```
R0 = 1
R0 = 2
R0 = 3
R0 = 4
R0 = 5
```

### Esempio: Somma dei Primi N Numeri

Sommiamo 1+2+3+4+5:

```asm
; Somma 1+2+3+4+5
MOV R0, 1       ; contatore = 1
MOV R1, 0       ; somma = 0

LOOP:
ADD R1, R0      ; somma = somma + contatore
INC R0          ; contatore++
CMP R0, 6       ; Confronta con 6
JNZ LOOP        ; Se ≠ 6, ripeti

OUT R1          ; Stampa la somma (15)
HLT
```

**Output:** R1 = 15

---

## <a id="stack-usage"></a>Usare lo Stack

### Cos'è lo Stack?

Lo stack (pila) è una struttura dati **LIFO** (Last In, First Out - ultimo entrato, primo uscito). Pensa a una pila di piatti: l'ultimo piatto che metti sopra è il primo che togli.

**Analogia:** Come una pila di libri. Puoi solo aggiungere o rimuovere libri dalla cima.

### PUSH e POP

- **PUSH** - Mette un valore in cima allo stack
- **POP** - Toglie un valore dalla cima dello stack

### Esempio: Salvare e Ripristinare

```asm
; Salvare valori temporaneamente
MOV R0, 100
MOV R1, 200

PUSH R0         ; Salva R0 nello stack
PUSH R1         ; Salva R1 nello stack

; Ora possiamo usare R0 e R1 per altro
MOV R0, 999
MOV R1, 888

; Ripristiniamo i valori originali (ordine inverso!)
POP R1          ; Ripristina R1 (era 200)
POP R0          ; Ripristina R0 (era 100)

OUT R0          ; Stampa 100
OUT R1          ; Stampa 200
HLT
```

**Importante:** Lo stack funziona al contrario! Se fai PUSH R0, PUSH R1, poi devi fare POP R1, POP R0.

---

## <a id="subroutines"></a>Subroutine

### Cosa sono le Subroutine?

Le subroutine (o funzioni) sono pezzi di codice riutilizzabili. Come le funzioni in Python o JavaScript.

### CALL e RET

- **CALL label** - Chiama una subroutine
- **RET** - Ritorna al chiamante

### Esempio: Funzione per Raddoppiare

```asm
; Programma principale
MOV R0, 10
CALL DOUBLE     ; Chiama la funzione DOUBLE
OUT R0          ; Stampa 20

MOV R0, 5
CALL DOUBLE     ; Chiama di nuovo
OUT R0          ; Stampa 10

HLT

; Subroutine DOUBLE: raddoppia R0
DOUBLE:
ADD R0, R0      ; R0 = R0 + R0
RET             ; Ritorna
```

**Output:**
```
R0 = 20
R0 = 10
```

### Esempio: Funzione con Parametri

Passiamo parametri usando i registri:

```asm
; Funzione che somma R0 e R1, risultato in R2
MOV R0, 15
MOV R1, 25
CALL SUM        ; Chiama SUM
OUT R2          ; Stampa 40
HLT

; Subroutine SUM
SUM:
MOV R2, R0      ; R2 = R0
ADD R2, R1      ; R2 = R2 + R1
RET
```

---

## <a id="common-errors"></a>Errori Comuni e Come Evitarli

### 1. Stack Overflow

**Errore:** Troppi PUSH senza corrispondenti POP.

```asm
; SBAGLIATO!
PUSH R0
PUSH R1
PUSH R2
; Dimenticato di fare POP!
HLT
```

**Soluzione:** Ogni PUSH deve avere un corrispondente POP.

```asm
; CORRETTO
PUSH R0
PUSH R1
; ... fai operazioni ...
POP R1
POP R0
HLT
```

---

### 2. Stack Underflow

**Errore:** Troppi POP senza corrispondenti PUSH.

```asm
; SBAGLIATO!
POP R0          ; Stack vuoto, errore!
```

---

### 3. Division by Zero

**Errore:** Dividere per zero.

```asm
; SBAGLIATO!
MOV R0, 10
MOV R1, 0
DIV R0, R1      ; Errore: divisione per zero!
```

**Soluzione:** Controlla prima di dividere.

```asm
; CORRETTO
MOV R0, 10
MOV R1, 0

CMP R1, 0       ; R1 è zero?
JZ SKIP_DIV     ; Se sì, salta la divisione

DIV R0, R1      ; Sicuro dividere

SKIP_DIV:
OUT R0
HLT
```

---

### 4. Overflow Aritmetico

**Errore:** Risultato > 32,767 o < -32,768.

```asm
; SBAGLIATO!
MOV R0, 30000
ADD R0, 10000   ; 40,000 > 32,767, overflow!
```

---

### 5. Etichetta Non Definita

**Errore:** Saltare a un'etichetta che non esiste.

```asm
; SBAGLIATO!
JMP MYLABEL     ; MYLABEL non esiste!
HLT
```

**Soluzione:** Assicurati di definire tutte le etichette.

```asm
; CORRETTO
JMP MYLABEL
HLT

MYLABEL:
OUT R0
HLT
```

---

### 6. Dimenticare HLT

**Errore:** Non terminare il programma con HLT.

```asm
; SBAGLIATO!
MOV R0, 10
OUT R0
; Manca HLT! Il PC continuerà oltre il programma
```

**Soluzione:** Termina sempre con HLT.

```asm
; CORRETTO
MOV R0, 10
OUT R0
HLT
```

---

### 7. Loop Infinito

**Errore:** Loop che non termina mai.

```asm
; SBAGLIATO!
LOOP:
OUT R0
JMP LOOP        ; Loop infinito!
```

**Soluzione:** Usa un contatore o una condizione di uscita.

```asm
; CORRETTO
MOV R0, 0

LOOP:
OUT R0
INC R0
CMP R0, 10
JNZ LOOP        ; Esce quando R0 = 10

HLT
```

---

### 8. Accesso Memoria Invalido

**Errore:** Accedere a indirizzi < 0 o > 255.

```asm
; SBAGLIATO!
MOV R0, [300]   ; 300 > 255, errore!
```

---

## Consigli Finali

1. **Usa commenti** - Documenta il tuo codice!
2. **Testa passo-passo** - Usa il pulsante STEP per debuggare
3. **Usa OUT per debug** - Stampa valori intermedi per capire cosa succede
4. **Nomina bene le etichette** - Usa nomi descrittivi come `LOOP`, `END`, `CALCULATE`
5. **Bilancia lo stack** - Ogni PUSH deve avere un POP
6. **Termina con HLT** - Sempre!
7. **Controlla i limiti** - Attenzione agli overflow e agli accessi memoria
8. **Pianifica prima di codificare** - Scrivi l'algoritmo su carta prima

---

## Esercizi Pratici

### Esercizio 1: Somma Semplice

Scrivi un programma che somma tre numeri (5, 10, 15) e stampa il risultato.

<details>
<summary>Soluzione</summary>

```asm
MOV R0, 5
ADD R0, 10
ADD R0, 15
OUT R0
HLT
```
</details>

---

### Esercizio 2: Massimo tra Due Numeri

Scrivi un programma che trova il massimo tra R0=30 e R1=25.

<details>
<summary>Soluzione</summary>

```asm
MOV R0, 30
MOV R1, 25

CMP R0, R1
JNS R0_MAX

OUT R1
JMP END

R0_MAX:
OUT R0

END:
HLT
```
</details>

---

### Esercizio 3: Conta Pari

Conta quanti numeri pari ci sono da 1 a 10.

<details>
<summary>Soluzione</summary>

```asm
MOV R0, 1       ; contatore
MOV R1, 0       ; count pari

LOOP:
MOV R2, R0
AND R2, 1       ; R2 = R0 & 1 (bit meno significativo)
JNZ ODD         ; Se R2 ≠ 0, è dispari

INC R1          ; Incrementa count pari

ODD:
INC R0
CMP R0, 11
JNZ LOOP

OUT R1          ; Stampa count (5)
HLT
```
</details>

---

## Prossimi Passi

Ora che hai le basi, esplora:

1. **Dettagli Opcode** - Impara come funzionano internamente le istruzioni
2. **Architettura Memoria/Stack** - Approfondisci il funzionamento interno
3. **Esempi Avanzati** - Prova algoritmi più complessi

Buon coding! 🚀
