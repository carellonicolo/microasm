# MicroASM Formal Reference

## <a id="intro"></a>Introduction

MicroASM is an educational assembly language designed to simulate the operation of a simple register-based microprocessor.

**Key Features:**

- 4 general-purpose 16-bit signed registers (R0, R1, R2, R3)
- 256 memory cells of 16-bit signed integers
- Integrated stack for subroutine management
- Flags for flow control (ZF, SF)
- Complete instruction set for arithmetic, logic, and I/O

---

## Processor Architecture

### General-Purpose Registers

- **R0, R1, R2, R3**: 4 16-bit signed registers (range: -32768 to 32767)

### Special-Purpose Registers

- **PC (Program Counter)**: Points to the current instruction
- **SP (Stack Pointer)**: Manages the stack (starts at 256 and decreases)
- **ZF (Zero Flag)**: Set to 1 when the result is zero
- **SF (Sign Flag)**: Set to 1 when the result is negative

### Memory

- 256 memory cells (addresses 0-255)
- Each cell contains a 16-bit signed value
- The stack grows downward from position 256

---

## Basic Syntax

### Instruction Format

```
OPCODE operand1, operand2  ; comment
```

### Comments

Use `;` for line comments:

```asm
; This is a comment
MOV R0, 10  ; Inline comment
```

### Labels

Labels mark positions in code for jumps and calls:

```asm
LOOP:          ; Label definition
  INC R0
  JMP LOOP     ; Jump to label
```

### Notes

- The language is case-insensitive (MOV = mov = Mov)
- Operands are separated by commas
- Spaces are optional

---

## <a id="addressing"></a>Addressing Modes

### Immediate

Numeric constant value:

```asm
MOV R0, 42     ; R0 = 42
```

### Register

Direct access to a register:

```asm
MOV R0, R1     ; R0 = R1
```

### Direct

Direct memory access in square brackets:

```asm
MOV R0, [10]   ; R0 = memory[10]
MOV [5], R0    ; memory[5] = R0
```

### Indirect

Uses a register value as memory address:

```asm
MOV R1, 10     ; R1 = 10
MOV R0, [R1]   ; R0 = memory[10]
```

---

## <a id="data-transfer"></a>Instruction Set - Data Transfer

### MOV dest, src

Copies a value from source to destination.

**Syntax:**
```
MOV Rdest, src
```

**Operands:**
- `Rdest`: Destination register (R0-R3)
- `src`: Source (immediate, register, or memory)

**Examples:**
```asm
MOV R0, 10     ; R0 = 10
MOV R1, R0     ; R1 = R0
MOV [5], R2    ; memory[5] = R2
MOV R0, [R1]   ; R0 = memory[R1]
```

**Flags:** None

---

### PUSH src

Pushes a value onto the stack.

**Syntax:**
```
PUSH src
```

**Operands:**
- `src`: Value to push (register, immediate, or memory)

**Behavior:**
1. SP = SP - 1 (decrement stack pointer)
2. memory[SP] = src (write value)

**Examples:**
```asm
PUSH R0        ; Stack ← R0
PUSH 42        ; Stack ← 42
PUSH [10]      ; Stack ← memory[10]
```

**Flags:** None

---

### POP dest

Pops a value from the stack.

**Syntax:**
```
POP dest
```

**Operands:**
- `dest`: Destination (register or memory)

**Behavior:**
1. dest = memory[SP] (read value)
2. SP = SP + 1 (increment stack pointer)

**Examples:**
```asm
POP R0         ; R0 ← Stack
POP [10]       ; memory[10] ← Stack
```

**Flags:** None

---

## <a id="arithmetic"></a>Instruction Set - Arithmetic

> **Note:** All arithmetic operations update ZF and SF

### ADD dest, src

Addition: `dest = dest + src`

**Examples:**
```asm
ADD R0, R1     ; R0 = R0 + R1
ADD R0, 5      ; R0 = R0 + 5
```

**Flags:** ZF, SF

---

### SUB dest, src

Subtraction: `dest = dest - src`

**Examples:**
```asm
SUB R0, R1     ; R0 = R0 - R1
SUB R0, 3      ; R0 = R0 - 3
```

**Flags:** ZF, SF

---

### MOL dest, src

Multiplication: `dest = dest * src`

**Examples:**
```asm
MOL R0, R1     ; R0 = R0 * R1
MOL R0, 2      ; R0 = R0 * 2
```

**Flags:** ZF, SF
**Cycles:** 3

---

### DIV dest, src

Integer division: `dest = dest / src`

**Note:** Generates error if `src = 0`

**Examples:**
```asm
DIV R0, R1     ; R0 = R0 / R1
DIV R0, 4      ; R0 = R0 / 4
```

**Flags:** ZF, SF

---

### INC dest

Increment: `dest = dest + 1`

**Examples:**
```asm
INC R0         ; R0 = R0 + 1
```

**Flags:** ZF, SF

---

### DEC dest

Decrement: `dest = dest - 1`

**Examples:**
```asm
DEC R0         ; R0 = R0 - 1
```

**Flags:** ZF, SF

---

## <a id="logic"></a>Instruction Set - Logical Operations

> **Note:** All logical operations update ZF and SF

### AND dest, src

Bitwise AND: `dest = dest & src`

**Examples:**
```asm
AND R0, R1     ; R0 = R0 & R1
AND R0, 15     ; R0 = R0 & 15 (bit mask)
```

**Flags:** ZF, SF

---

### OR dest, src

Bitwise OR: `dest = dest | src`

**Examples:**
```asm
OR R0, R1      ; R0 = R0 | R1
OR R0, 8       ; R0 = R0 | 8 (set bit)
```

**Flags:** ZF, SF

---

### NOT dest

Bitwise NOT: `dest = ~dest`

**Examples:**
```asm
NOT R0         ; R0 = ~R0
```

**Flags:** ZF, SF

---

## <a id="control-flow"></a>Instruction Set - Control Flow

### JMP label

Unconditional jump to label.

**Examples:**
```asm
JMP LOOP       ; Jump to LOOP
JMP END        ; Jump to END
```

**Flags:** None

---

### JZ label

Jump if Zero Flag = 1 (result = 0).

**Examples:**
```asm
CMP R0, 0
JZ END         ; Jump if R0 = 0
```

**Flags:** Reads ZF

---

### JNZ label

Jump if Zero Flag = 0 (result ≠ 0).

**Examples:**
```asm
CMP R0, 10
JNZ LOOP       ; Jump if R0 ≠ 10
```

**Flags:** Reads ZF

---

### JS label

Jump if Sign Flag = 1 (result < 0).

**Examples:**
```asm
CMP R0, 0
JS NEGATIVE    ; Jump if R0 < 0
```

**Flags:** Reads SF

---

### JNS label

Jump if Sign Flag = 0 (result ≥ 0).

**Examples:**
```asm
CMP R0, 0
JNS POSITIVE   ; Jump if R0 ≥ 0
```

**Flags:** Reads SF

---

### CMP op1, op2

Compares `op1` with `op2` (performs `op1 - op2` and updates flags).

**Note:** Does not modify operands, only flags.

**Examples:**
```asm
CMP R0, R1     ; Compare R0 with R1
CMP R0, 10     ; Compare R0 with 10
JZ EQUAL       ; Jump if equal
```

**Flags:** ZF, SF

---

## <a id="stack"></a>Instruction Set - Subroutines

### CALL label

Calls a subroutine.

**Behavior:**
1. PUSH PC+1 (save return address)
2. PC = label (jump to subroutine)

**Examples:**
```asm
CALL FUNCTION  ; Call FUNCTION subroutine
```

**Flags:** None

---

### RET

Returns from a subroutine.

**Behavior:**
1. POP PC (restore return address)

**Examples:**
```asm
FUNCTION:
  ; ... subroutine code ...
  RET          ; Return to caller
```

**Flags:** None

---

## <a id="io"></a>Instruction Set - Input/Output

### OUT src

Displays a value in the Output Log.

**Examples:**
```asm
OUT R0         ; Print value of R0
OUT 42         ; Print 42
OUT [10]       ; Print memory[10]
```

**Flags:** None

---

### HLT

Halts program execution.

**Examples:**
```asm
HLT            ; Terminate program
```

**Flags:** None

---

## Flags and Conditions

Flags are special registers that store the state of the last operation:

- **ZF (Zero Flag)**: Set to 1 if the result is zero, otherwise 0
- **SF (Sign Flag)**: Set to 1 if the result is negative, otherwise 0

### Instructions that Modify Flags

| Instruction | Modifies ZF/SF | Notes |
|------------|----------------|------|
| MOV | NO | Data movement only |
| ADD/SUB/MOL/DIV | YES | After operation |
| INC/DEC | YES | After operation |
| AND/OR/NOT | YES | After operation |
| CMP | YES | Non-destructive compare |
| JMP/JZ/JNZ/JS/JNS | NO | Flow control only |
| PUSH/POP | NO | Stack only |
| CALL/RET | NO | Subroutines only |
| OUT/HLT | NO | I/O and control only |

---

## Quick Reference

| Instruction | Syntax | Description | Cycles | Flags |
|------------|----------|-------------|-------|------|
| MOV | MOV dest, src | Copy value | 1 | - |
| PUSH | PUSH src | Push to stack | 2 | - |
| POP | POP dest | Pop from stack | 2 | - |
| ADD | ADD dest, src | Addition | 1 | ZF, SF |
| SUB | SUB dest, src | Subtraction | 1 | ZF, SF |
| MOL | MOL dest, src | Multiplication | 3 | ZF, SF |
| DIV | DIV dest, src | Division | 3 | ZF, SF |
| INC | INC dest | Increment | 1 | ZF, SF |
| DEC | DEC dest | Decrement | 1 | ZF, SF |
| AND | AND dest, src | Logical AND | 1 | ZF, SF |
| OR | OR dest, src | Logical OR | 1 | ZF, SF |
| NOT | NOT dest | Logical NOT | 1 | ZF, SF |
| JMP | JMP label | Unconditional jump | 1 | - |
| JZ | JZ label | Jump if zero | 1 | Reads ZF |
| JNZ | JNZ label | Jump if not zero | 1 | Reads ZF |
| JS | JS label | Jump if negative | 1 | Reads SF |
| JNS | JNS label | Jump if not negative | 1 | Reads SF |
| CMP | CMP op1, op2 | Compare | 1 | ZF, SF |
| CALL | CALL label | Call subroutine | 3 | - |
| RET | RET | Return from subroutine | 2 | - |
| OUT | OUT src | Output value | 1 | - |
| HLT | HLT | Halt execution | 1 | - |
