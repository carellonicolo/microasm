# Dettagli Opcode e Architettura Interna

## <a id="arch-overview"></a>Panoramica Architettura CPU

### Componenti Principali

La CPU MicroASM è composta da:

- **Registri**: 4 general-purpose (R0-R3) + 2 speciali (PC, SP) + 2 flag (ZF, SF)
- **ALU (Arithmetic Logic Unit)**: Esegue operazioni aritmetiche e logiche
- **Control Unit**: Decodifica ed esegue le istruzioni
- **Memory**: 256 celle a 16-bit
- **Bus System**: Address Bus, Data Bus, Control Bus

### Ciclo Fetch-Decode-Execute

Ogni istruzione segue questo ciclo:

1. **Fetch**: Leggi l'istruzione da Memory[PC]
2. **Decode**: Decodifica opcode e operandi
3. **Execute**: Esegui l'operazione
4. **Update**: Incrementa PC (se non è un salto)

---

## <a id="encoding"></a>Encoding Istruzioni

> ⚠️ **NOTA IMPORTANTE - Schema Educativo**
>
> Gli opcode mostrati di seguito sono uno **schema educativo ipotetico** creato per scopi didattici. Il simulatore MicroASM usa internamente **stringhe ASCII** per gli opcode (es. "MOV", "ADD"), non encoding binari.
>
> Questo schema ti aiuta a capire come funzionano i processori reali, ma non corrisponde all'implementazione effettiva del simulatore.

### Schema di Encoding (5 bit)

Ogni istruzione è rappresentata da un opcode a 5 bit, permettendo fino a 32 istruzioni diverse.

**Formato Generale:**
```
[5 bit opcode] [parametri variabili]
```

### Categorie di Opcode

| Categoria | Range Binario | Range Hex | Istruzioni |
|-----------|---------------|-----------|------------|
| Data Transfer | 00001-00011 | 0x01-0x03 | MOV, PUSH, POP |
| Arithmetic | 01000-01101 | 0x08-0x0D | ADD, SUB, MOL, DIV, INC, DEC |
| Logic | 10000-10010 | 0x10-0x12 | AND, OR, NOT |
| Control Flow | 10100-11001 | 0x14-0x19 | JMP, JZ, JNZ, JS, JNS, CMP |
| Stack/Subroutine | 11010-11011 | 0x1A-0x1B | CALL, RET |
| I/O | 11100-11101 | 0x1C-0x1D | OUT, HLT |

---

## <a id="data-opcodes"></a>Opcode Trasferimento Dati

### MOV (0x01)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `00001` |
| **Opcode Hex** | `0x01` |
| **Cicli Clock** | 1 |
| **Flag Modificati** | Nessuno |

**Componenti Coinvolti:**
- Data Bus
- Registro destinazione
- Registro/Memoria sorgente (se applicabile)

**Data Flow:**
```
1. Data Bus ← Sorgente
2. Registro Dest ← Data Bus
```

---

### PUSH (0x02)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `00010` |
| **Opcode Hex** | `0x02` |
| **Cicli Clock** | 2 |
| **Flag Modificati** | Nessuno |

**Componenti Coinvolti:**
- ALU (per decrementare SP)
- Stack Pointer (SP)
- Memory
- Data Bus
- Address Bus
- Control Bus

**Data Flow:**
```
1. ALU: SP_new = SP - 1
2. SP ← SP_new
3. Address Bus ← SP
4. Data Bus ← Sorgente
5. Control Bus ← WRITE
6. Memory[SP] ← Data Bus
```

---

### POP (0x03)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `00011` |
| **Opcode Hex** | `0x03` |
| **Cicli Clock** | 2 |
| **Flag Modificati** | Nessuno |

**Componenti Coinvolti:**
- ALU (per incrementare SP)
- Stack Pointer (SP)
- Memory
- Data Bus
- Address Bus
- Control Bus

**Data Flow:**
```
1. Address Bus ← SP
2. Control Bus ← READ
3. Data Bus ← Memory[SP]
4. Destinazione ← Data Bus
5. ALU: SP_new = SP + 1
6. SP ← SP_new
```

---

## <a id="arith-opcodes"></a>Opcode Aritmetica

### ADD (0x08)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `01000` |
| **Opcode Hex** | `0x08` |
| **Cicli Clock** | 1 |
| **Flag Modificati** | ZF, SF |

**Componenti Coinvolti:**
- ALU (operazione addizione)
- Registro destinazione
- Flag Register

**Data Flow:**
```
1. ALU Input A ← Rdest
2. ALU Input B ← Sorgente
3. ALU Operation ← ADD
4. ALU Output → Rdest
5. ZF ← (risultato == 0)
6. SF ← (risultato < 0)
```

**Overflow Detection:**
- Se risultato > 32,767 o < -32,768 → Runtime Error

---

### SUB (0x09)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `01001` |
| **Opcode Hex** | `0x09` |
| **Cicli Clock** | 1 |
| **Flag Modificati** | ZF, SF |

**Componenti Coinvolti:**
- ALU (operazione sottrazione)
- Registro destinazione
- Flag Register

**Data Flow:**
```
1. ALU Input A ← Rdest
2. ALU Input B ← Sorgente
3. ALU Operation ← SUB
4. ALU Output → Rdest
5. ZF ← (risultato == 0)
6. SF ← (risultato < 0)
```

---

### MOL (0x0A)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `01010` |
| **Opcode Hex** | `0x0A` |
| **Cicli Clock** | 3 |
| **Flag Modificati** | ZF, SF |

**Componenti Coinvolti:**
- ALU (operazione moltiplicazione)
- Registro destinazione
- Flag Register

**Nota:** Richiede 3 cicli perché la moltiplicazione è un'operazione complessa che richiede più tempo dell'addizione.

---

### DIV (0x0B)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `01011` |
| **Opcode Hex** | `0x0B` |
| **Cicli Clock** | 3 |
| **Flag Modificati** | ZF, SF |

**Controlli Speciali:**
- Division by zero check (genera errore se divisore = 0)
- Risultato arrotondato (divisione intera, floor)

---

### INC (0x0C)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `01100` |
| **Opcode Hex** | `0x0C` |
| **Cicli Clock** | 1 |
| **Flag Modificati** | ZF, SF |

**Data Flow:**
```
1. ALU Input A ← Rdest
2. ALU Input B ← 1
3. ALU Operation ← ADD
4. ALU Output → Rdest
5. Update Flags
```

---

### DEC (0x0D)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `01101` |
| **Opcode Hex** | `0x0D` |
| **Cicli Clock** | 1 |
| **Flag Modificati** | ZF, SF |

**Data Flow:**
```
1. ALU Input A ← Rdest
2. ALU Input B ← 1
3. ALU Operation ← SUB
4. ALU Output → Rdest
5. Update Flags
```

---

## <a id="logic-opcodes"></a>Opcode Logica

### AND (0x10)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `10000` |
| **Opcode Hex** | `0x10` |
| **Cicli Clock** | 1 |
| **Flag Modificati** | ZF, SF |

**Operazione Bit-a-Bit:**
```
R0 = 0b1100 (12)
R1 = 0b1010 (10)
AND R0, R1
→ R0 = 0b1000 (8)
```

---

### OR (0x11)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `10001` |
| **Opcode Hex** | `0x11` |
| **Cicli Clock** | 1 |
| **Flag Modificati** | ZF, SF |

**Operazione Bit-a-Bit:**
```
R0 = 0b1100 (12)
R1 = 0b1010 (10)
OR R0, R1
→ R0 = 0b1110 (14)
```

---

### NOT (0x12)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `10010` |
| **Opcode Hex** | `0x12` |
| **Cicli Clock** | 1 |
| **Flag Modificati** | ZF, SF |

**Operazione Bit-a-Bit (complemento a 1):**
```
R0 = 0b00001111 (15)
NOT R0
→ R0 = 0b11110000 (-16 in complemento a 2)
```

---

## <a id="control-opcodes"></a>Opcode Controllo Flusso

### JMP (0x14)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `10100` |
| **Opcode Hex** | `0x14` |
| **Cicli Clock** | 1 |
| **Flag Modificati** | Nessuno |

**Data Flow:**
```
1. Address Bus ← Label Address
2. PC ← Address Bus
```

**Nota:** PC non viene incrementato automaticamente dopo l'esecuzione.

---

### JZ (0x15)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `10101` |
| **Opcode Hex** | `0x15` |
| **Cicli Clock** | 1 |
| **Flag Letti** | ZF |

**Data Flow:**
```
1. Control Unit ← ZF
2. IF ZF == 1:
     PC ← Label Address
   ELSE:
     PC ← PC + 1
```

---

### JNZ (0x16)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `10110` |
| **Opcode Hex** | `0x16` |
| **Cicli Clock** | 1 |
| **Flag Letti** | ZF |

**Data Flow:**
```
1. Control Unit ← ZF
2. IF ZF == 0:
     PC ← Label Address
   ELSE:
     PC ← PC + 1
```

---

### JS (0x17)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `10111` |
| **Opcode Hex** | `0x17` |
| **Cicli Clock** | 1 |
| **Flag Letti** | SF |

**Salta se il risultato dell'ultima operazione era negativo.**

---

### JNS (0x18)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `11000` |
| **Opcode Hex** | `0x18` |
| **Cicli Clock** | 1 |
| **Flag Letti** | SF |

**Salta se il risultato dell'ultima operazione era non negativo (≥ 0).**

---

### CMP (0x19)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `11001` |
| **Opcode Hex** | `0x19` |
| **Cicli Clock** | 1 |
| **Flag Modificati** | ZF, SF |

**Data Flow:**
```
1. ALU Input A ← Op1
2. ALU Input B ← Op2
3. ALU Operation ← SUB
4. Temp ← ALU Output (risultato NON salvato!)
5. ZF ← (Temp == 0)
6. SF ← (Temp < 0)
```

**Importante:** CMP è non-distruttivo - gli operandi non vengono modificati.

---

## <a id="stack-opcodes"></a>Opcode Stack e Subroutine

### CALL (0x1A)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `11010` |
| **Opcode Hex** | `0x1A` |
| **Cicli Clock** | 3 |
| **Flag Modificati** | Nessuno |

**Data Flow:**
```
1. SP ← SP - 1
2. Memory[SP] ← PC + 1 (return address)
3. PC ← Label Address
```

**Nota:** Salva l'indirizzo della **prossima** istruzione (PC+1) nello stack.

---

### RET (0x1B)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `11011` |
| **Opcode Hex** | `0x1B` |
| **Cicli Clock** | 2 |
| **Flag Modificati** | Nessuno |

**Data Flow:**
```
1. PC ← Memory[SP] (return address)
2. SP ← SP + 1
```

---

## <a id="io-opcodes"></a>Opcode I/O

### OUT (0x1C)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `11100` |
| **Opcode Hex** | `0x1C` |
| **Cicli Clock** | 1 |
| **Flag Modificati** | Nessuno |

**Data Flow:**
```
1. Data Bus ← Sorgente
2. Output Device ← Data Bus
```

**Formato Output:**
```
OUT R0  → "R0 = [valore]"
OUT 42  → "42 = 42"
```

---

### HLT (0x1D)

| Proprietà | Valore |
|-----------|--------|
| **Opcode Binario** | `11101` |
| **Opcode Hex** | `0x1D` |
| **Cicli Clock** | 1 |
| **Flag Modificati** | Nessuno |

**Data Flow:**
```
1. Control Unit ← HALT Signal
2. Execution Stops
```

---

## <a id="cycles"></a>Riferimento Cicli Clock

### Tabella Completa Cicli

| Istruzione | Cicli | Motivo |
|------------|-------|--------|
| MOV | 1 | Singolo trasferimento dati |
| PUSH | 2 | Decremento SP + Scrittura memoria |
| POP | 2 | Lettura memoria + Incremento SP |
| ADD | 1 | Operazione ALU semplice |
| SUB | 1 | Operazione ALU semplice |
| MOL | 3 | Moltiplicazione complessa |
| DIV | 3 | Divisione complessa + controllo zero |
| INC | 1 | Operazione ALU semplice |
| DEC | 1 | Operazione ALU semplice |
| AND | 1 | Operazione ALU bit-a-bit |
| OR | 1 | Operazione ALU bit-a-bit |
| NOT | 1 | Operazione ALU bit-a-bit |
| JMP | 1 | Modifica PC |
| JZ/JNZ | 1 | Controllo flag + Modifica PC |
| JS/JNS | 1 | Controllo flag + Modifica PC |
| CMP | 1 | Operazione ALU (risultato scartato) |
| CALL | 3 | Decremento SP + Scrittura + Salto |
| RET | 2 | Lettura + Incremento SP |
| OUT | 1 | Scrittura su output device |
| HLT | 1 | Stop execution |

### Ottimizzazione Cicli

**Istruzioni più veloci (1 ciclo):**
- Operazioni semplici: MOV, ADD, SUB, INC, DEC
- Operazioni logiche: AND, OR, NOT
- Salti: JMP, JZ, JNZ, JS, JNS, CMP
- I/O: OUT, HLT

**Istruzioni intermedie (2 cicli):**
- Stack: PUSH, POP, RET

**Istruzioni più lente (3 cicli):**
- Aritmetica complessa: MOL, DIV
- Chiamate: CALL

---

## <a id="flags-behavior"></a>Comportamento Flag

### Zero Flag (ZF)

**Viene impostato a 1 quando:**
- Risultato dell'operazione = 0
- Operazione di confronto trova valori uguali (CMP)

**Esempi:**
```asm
MOV R0, 5
SUB R0, 5      ; R0 = 0, ZF = 1

CMP R0, R1     ; Se R0 == R1, ZF = 1
```

**Usato da:** JZ, JNZ

---

### Sign Flag (SF)

**Viene impostato a 1 quando:**
- Risultato dell'operazione < 0
- Bit più significativo del risultato = 1

**Esempi:**
```asm
MOV R0, 5
SUB R0, 10     ; R0 = -5, SF = 1

CMP R0, R1     ; Se R0 < R1, SF = 1
```

**Usato da:** JS, JNS

---

### Tabella Aggiornamento Flag

| Operazione | Esempio | ZF | SF |
|------------|---------|----|----|
| ADD R0, R1 (5+(-5)=0) | 0 | 1 | 0 |
| SUB R0, R1 (5-10=-5) | -5 | 0 | 1 |
| MOL R0, 0 | 0 | 1 | 0 |
| INC R0 (da -1) | 0 | 1 | 0 |
| AND R0, 0 | 0 | 1 | 0 |
| NOT R0 (da -1) | 0 | 1 | 0 |
| CMP R0, R0 | - | 1 | 0 |
| CMP 5, 10 | - | 0 | 1 |

---

## Considerazioni Finali

### Limiti dell'Implementazione

1. **Range Valori:** -32,768 a 32,767 (16-bit signed)
2. **Memoria:** 256 celle (indirizzi 0-255)
3. **Stack:** Massimo 256 elementi
4. **Istruzioni:** Limite di 100,000 esecuzioni (anti-loop infinito)

### Performance

**Programma Example - Fattoriale di 5:**
```asm
MOV R0, 5      ; 1 ciclo
MOV R1, 1      ; 1 ciclo
LOOP:
  CMP R0, 1    ; 1 ciclo × 5
  JZ END       ; 1 ciclo × 5
  MOL R1, R0   ; 3 cicli × 4
  DEC R0       ; 1 ciclo × 4
  JMP LOOP     ; 1 ciclo × 4
END:
  OUT R1       ; 1 ciclo
  HLT          ; 1 ciclo

Totale: 1+1 + (1+1+3+1+1)×4 + (1+1) + 1+1 = 34 cicli
```
