# MicroASM Pseudo-Assembly Language - Complete Technical Reference

**Version:** 1.0  
**Project:** MicroASM Didactic Simulator  
**Author Information:** Prof. Nicolò Carello  
**Contact:** info@nicolocarello.it

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [CPU Architecture](#cpu-architecture)
3. [Complete Instruction Set](#complete-instruction-set)
4. [Syntax Rules](#syntax-rules)
5. [Addressing Modes](#addressing-modes)
6. [Flags and Status Registers](#flags-and-status-registers)
7. [Example Programs](#example-programs)
8. [Error Handling](#error-handling)
9. [Data Flow and Bus Operations](#data-flow-and-bus-operations)

---

## Architecture Overview

MicroASM is a didactic pseudo-assembly language simulator designed to teach the fundamentals of microprocessor architecture and low-level programming. The simulator provides:

- **4 General-Purpose Registers** (R0-R3): 16-bit signed integer storage
- **256-byte Memory Space**: Each cell stores a 16-bit signed integer
- **Integrated Stack**: For function calls and data storage
- **Status Flags**: Zero Flag (ZF) and Sign Flag (SF) for conditional control flow
- **Complete Instruction Set**: 22 instructions covering data movement, arithmetic, logic, control flow, stack operations, and I/O

---

## CPU Architecture

### Registers

#### General-Purpose Registers (R0-R3)
- **Count:** 4 registers
- **Name:** R0, R1, R2, R3
- **Size:** 16-bit signed integer
- **Range:** -32,768 to 32,767 (2^15 - 1 to -(2^15))
- **Purpose:** Store intermediate values, arguments, results

#### Special-Purpose Registers

| Register | Name | Size | Range | Purpose |
|----------|------|------|-------|---------|
| PC | Program Counter | Integer | 0 to (instruction_count-1) | Points to current instruction being executed |
| SP | Stack Pointer | Integer | 0 to 256 | Manages stack growth (decreases with PUSH, increases with POP) |
| ZF | Zero Flag | Boolean (0/1) | 0 or 1 | Set to 1 when ALU result = 0, otherwise 0 |
| SF | Sign Flag | Boolean (0/1) | 0 or 1 | Set to 1 when ALU result < 0, otherwise 0 |

#### Register Behavior Details

- **PC (Program Counter):**
  - Initialized to 0
  - Automatically incremented after each instruction (except jumps)
  - Jump instructions set PC directly
  - CALL/RET use stack to save/restore return address

- **SP (Stack Pointer):**
  - Initialized to 256
  - Decrements with PUSH (pre-decrement: SP--, then write)
  - Increments with POP (post-increment: read, then SP++)
  - Valid range: 1 to 256
  - SP = 256 indicates empty stack
  - SP = 0 indicates full stack

- **ZF (Zero Flag):**
  - Set by arithmetic operations (ADD, SUB, MOL, DIV, INC, DEC)
  - Set by logical operations (AND, OR, NOT)
  - Set by comparison (CMP)
  - Used by conditional jumps (JZ, JNZ)

- **SF (Sign Flag):**
  - Set by arithmetic operations
  - Set by logical operations
  - Set by comparison (CMP)
  - Used by conditional jumps (JS, JNS)

### Memory Architecture

| Property | Value |
|----------|-------|
| Total Memory | 256 cells (addresses 0-255) |
| Cell Size | 16-bit signed integer |
| Range per Cell | -32,768 to 32,767 |
| Stack Location | Top of memory (grows downward from address 256) |
| Initial State | All cells = 0 |

#### Memory Layout
```
Address   Content
255       ├─ Stack grows downward ↓
...       │
SP ← Current Top
...       │
...       ├─ Program Data (accessible via LDR/STR)
...       │
1         │
0         └─ (User accessible)
```

#### Special Memory Regions

- **User Accessible:** Addresses 0-255 (directly accessible via LDR/STR and indirect addressing)
- **Stack Region:** Addresses (SP to 255) - grows downward
- **Program Instructions:** Not stored in memory - stored in separate instruction list

---

## Complete Instruction Set

The MicroASM instruction set contains **21 instructions** organized into 6 categories.

### 1. Data Transfer Instructions

#### 1.1 MOV - Move/Copy Value
```
Syntax: MOV Rdest, src
Operands: 
  - Rdest: Register destination (R0-R3)
  - src: Source value (register, immediate, or memory address)

Description:
Copies the value from source to destination register. Does not affect flags.

Behavior:
- If src is immediate: value → Rdest
- If src is register: Rsrc → Rdest
- If src is memory address [addr]: Memory[addr] → Rdest
- If src is indirect [Rx]: Memory[Rx] → Rdest

Examples:
  MOV R0, 42           ; R0 = 42 (immediate)
  MOV R1, R0           ; R1 = R0 (register)
  MOV R0, [100]        ; R0 = Memory[100] (direct address)
  MOV R1, 10
  MOV R0, [R1]         ; R0 = Memory[10] (indirect via R1)

Flags Affected: None
Cycles: 1
Data Flow:
  - Data Bus ← src
  - Rdest ← Data Bus

Special Notes:
- Source and destination must be 16-bit signed values (-32768 to 32767)
- Values are clamped to 16-bit range if exceeding
```

#### 1.2 LDR - Load from Memory
```
Syntax: LDR Rdest, [addr]
Operands:
  - Rdest: Register destination (R0-R3)
  - [addr]: Memory address (0-255)

Description:
Loads a value from memory at specified address into register.

Behavior:
- Memory[addr] → Rdest
- Address must be in range 0-255

Examples:
  LDR R0, [100]        ; R0 = Memory[100]
  MOV R1, 50
  LDR R2, [R1]         ; R2 = Memory[50]

Flags Affected: None
Cycles: 2
Data Flow:
  - Address Bus ← addr
  - Control Bus ← READ
  - Data Bus ← Memory[addr]
  - Rdest ← Data Bus

Error Conditions:
- Invalid memory address (< 0 or > 255): "Invalid memory access"
```

#### 1.3 STR - Store to Memory
```
Syntax: STR Rsrc, [addr]
Operands:
  - Rsrc: Register source (R0-R3) or value
  - [addr]: Memory address (0-255)

Description:
Stores a value from register/immediate into memory at specified address.

Behavior:
- Rsrc → Memory[addr]

Examples:
  STR R0, [100]        ; Memory[100] = R0
  MOV R0, 42
  STR R0, [50]         ; Memory[50] = 42

Flags Affected: None
Cycles: 2
Data Flow:
  - Address Bus ← addr
  - Data Bus ← Rsrc
  - Control Bus ← WRITE
  - Memory[addr] ← Data Bus

Error Conditions:
- Invalid memory address (< 0 or > 255): "Invalid memory access"
```

---

### 2. Arithmetic Instructions

#### 2.1 ADD - Addition
```
Syntax: ADD Rdest, src
Operands:
  - Rdest: Destination register (R0-R3)
  - src: Source value (register, immediate, or memory)

Description:
Adds source value to destination register value, stores result in destination.
Rdest = Rdest + src

Examples:
  ADD R0, 5            ; R0 = R0 + 5
  ADD R0, R1           ; R0 = R0 + R1
  ADD R0, [100]        ; R0 = R0 + Memory[100]

Flags Affected: ZF, SF
  - ZF = 1 if result = 0
  - SF = 1 if result < 0

Cycles: 1
Data Flow:
  - Data Bus ← Rdest
  - ALU Input A ← Data Bus
  - Data Bus ← src
  - ALU Input B ← Data Bus
  - ALU Operation ← ADD
  - Rdest ← ALU Output
  - Flags ← ALU Flags

Error Conditions:
- Arithmetic overflow (result > 32767 or < -32768): "Arithmetic overflow"
- The result is clamped to 16-bit range

Special Notes:
- Overflow can occur with large positive + positive or negative + negative
- Flags are updated based on the final clamped result
```

#### 2.2 SUB - Subtraction
```
Syntax: SUB Rdest, src
Operands:
  - Rdest: Destination register (R0-R3)
  - src: Source value (register, immediate, or memory)

Description:
Subtracts source value from destination register, stores result in destination.
Rdest = Rdest - src

Examples:
  SUB R0, 5            ; R0 = R0 - 5
  SUB R0, R1           ; R0 = R0 - R1
  SUB R0, [100]        ; R0 = R0 - Memory[100]

Flags Affected: ZF, SF
  - ZF = 1 if result = 0
  - SF = 1 if result < 0

Cycles: 1
Data Flow:
  - Data Bus ← Rdest
  - ALU Input A ← Data Bus
  - Data Bus ← src
  - ALU Input B ← Data Bus
  - ALU Operation ← SUB
  - Rdest ← ALU Output
  - Flags ← ALU Flags

Error Conditions:
- Arithmetic overflow: "Arithmetic overflow"
```

#### 2.3 MOL - Multiplication
```
Syntax: MOL Rdest, src
Operands:
  - Rdest: Destination register (R0-R3)
  - src: Source value (register, immediate, or memory)

Description:
Multiplies destination register by source value, stores result in destination.
Rdest = Rdest * src
(Note: "MOL" is Italian for "multiply" - "moltiplicazione")

Examples:
  MOL R0, 2            ; R0 = R0 * 2
  MOL R0, R1           ; R0 = R0 * R1
  MOL R0, [100]        ; R0 = R0 * Memory[100]

Flags Affected: ZF, SF
  - ZF = 1 if result = 0
  - SF = 1 if result < 0

Cycles: 3
Data Flow:
  - ALU Input A ← Rdest
  - ALU Input B ← src
  - ALU Operation ← MUL
  - Rdest ← ALU Output

Error Conditions:
- Arithmetic overflow: "Arithmetic overflow"

Special Notes:
- Takes 3 cycles (more expensive than addition/subtraction)
- Multiplication result is clamped to 16-bit range
```

#### 2.4 DIV - Division
```
Syntax: DIV Rdest, src
Operands:
  - Rdest: Destination register (R0-R3)
  - src: Divisor (register, immediate, or memory)

Description:
Performs integer division of destination by source, stores result in destination.
Rdest = Floor(Rdest / src)

Examples:
  DIV R0, 2            ; R0 = Floor(R0 / 2)
  DIV R0, R1           ; R0 = Floor(R0 / R1)
  DIV R0, [100]        ; R0 = Floor(R0 / Memory[100])

Flags Affected: ZF, SF
  - ZF = 1 if result = 0
  - SF = 1 if result < 0

Cycles: 1
Data Flow:
  - ALU Input A ← Rdest
  - ALU Input B ← src
  - ALU Operation ← DIV
  - Rdest ← ALU Output

Error Conditions:
- Division by zero (src = 0): "Division by zero"

Special Notes:
- Uses floor division (rounds toward negative infinity)
- Result is always clamped to 16-bit range
- Dividing by 0 terminates program with error
```

#### 2.5 INC - Increment
```
Syntax: INC Rdest
Operands:
  - Rdest: Destination register (R0-R3)

Description:
Increments the destination register by 1.
Rdest = Rdest + 1

Examples:
  INC R0               ; R0 = R0 + 1
  INC R2               ; R2 = R2 + 1

Flags Affected: ZF, SF
  - ZF = 1 if result = 0
  - SF = 1 if result < 0

Cycles: 1
Data Flow:
  - Data Bus ← Rdest
  - ALU Input A ← Data Bus
  - ALU Input B ← 1
  - ALU Operation ← ADD
  - Rdest ← ALU Output

Error Conditions:
- Arithmetic overflow if result > 32767: "Arithmetic overflow"

Special Notes:
- Commonly used for loop counters
- Single operand instruction
```

#### 2.6 DEC - Decrement
```
Syntax: DEC Rdest
Operands:
  - Rdest: Destination register (R0-R3)

Description:
Decrements the destination register by 1.
Rdest = Rdest - 1

Examples:
  DEC R0               ; R0 = R0 - 1
  DEC R2               ; R2 = R2 - 1

Flags Affected: ZF, SF
  - ZF = 1 if result = 0
  - SF = 1 if result < 0

Cycles: 1
Data Flow:
  - Data Bus ← Rdest
  - ALU Input A ← Data Bus
  - ALU Input B ← 1
  - ALU Operation ← SUB
  - Rdest ← ALU Output

Error Conditions:
- Arithmetic overflow if result < -32768: "Arithmetic overflow"

Special Notes:
- Commonly used for loop countdown
- Single operand instruction
```

---

### 3. Logical Instructions

#### 3.1 AND - Bitwise AND
```
Syntax: AND Rdest, src
Operands:
  - Rdest: Destination register (R0-R3)
  - src: Source value (register, immediate, or memory)

Description:
Performs bitwise AND operation between destination and source.
Rdest = Rdest & src (bitwise AND)

Examples:
  AND R0, R1           ; R0 = R0 & R1
  AND R0, 0xFF         ; R0 = R0 & 0xFF (mask lower byte)
  AND R0, [100]        ; R0 = R0 & Memory[100]

Flags Affected: ZF, SF
  - ZF = 1 if result = 0
  - SF = 1 if result < 0

Cycles: 1
Data Flow:
  - ALU Input A ← Rdest
  - ALU Input B ← src
  - ALU Operation ← AND
  - Rdest ← ALU Output

Special Notes:
- Bitwise operation (operates on individual bits)
- Used for bit manipulation and masking
- Result is never > source magnitudes
```

#### 3.2 OR - Bitwise OR
```
Syntax: OR Rdest, src
Operands:
  - Rdest: Destination register (R0-R3)
  - src: Source value (register, immediate, or memory)

Description:
Performs bitwise OR operation between destination and source.
Rdest = Rdest | src (bitwise OR)

Examples:
  OR R0, R1            ; R0 = R0 | R1
  OR R0, 0x01          ; R0 = R0 | 0x01 (set bit 0)
  OR R0, [100]         ; R0 = R0 | Memory[100]

Flags Affected: ZF, SF
  - ZF = 1 if result = 0
  - SF = 1 if result < 0

Cycles: 1
Data Flow:
  - ALU Input A ← Rdest
  - ALU Input B ← src
  - ALU Operation ← OR
  - Rdest ← ALU Output

Special Notes:
- Bitwise operation
- Used for bit set operations and flag setting
```

#### 3.3 NOT - Bitwise NOT
```
Syntax: NOT Rdest
Operands:
  - Rdest: Destination register (R0-R3)

Description:
Performs bitwise NOT (complement) operation on destination.
Rdest = ~Rdest (bitwise NOT - all bits inverted)

Examples:
  NOT R0               ; R0 = ~R0
  NOT R1               ; R1 = ~R1

Flags Affected: ZF, SF
  - ZF = 1 if result = 0
  - SF = 1 if result < 0

Cycles: 1
Data Flow:
  - ALU Input A ← Rdest
  - ALU Operation ← NOT
  - Rdest ← ALU Output

Special Notes:
- Single operand instruction
- Inverts all bits (0→1, 1→0)
- For positive value N, NOT(N) = -(N+1)
- For negative value N, NOT(N) = -(N+1)

Example Behavior:
  R0 = 5     (binary: 0000000000000101)
  NOT R0
  R0 = -6    (binary: 1111111111111010 in two's complement)
```

#### 3.4 XOR - Bitwise XOR (DOCUMENTED BUT NOT IMPLEMENTED)
```
NOTE: XOR is documented in the instruction set reference but is NOT
currently implemented in the executor. It is listed in the architecture
documentation for completeness.

Syntax: XOR Rdest, src
Operands:
  - Rdest: Destination register (R0-R3)
  - src: Source value (register, immediate, or memory)

Description:
Performs bitwise XOR operation between destination and source.
Rdest = Rdest ^ src (bitwise XOR)

Would Affect: ZF, SF (if implemented)

Examples:
  XOR R0, R1           ; R0 = R0 ^ R1
  XOR R0, 0xFF         ; R0 = R0 ^ 0xFF
```

---

### 4. Control Flow Instructions

#### 4.1 JMP - Unconditional Jump
```
Syntax: JMP label
Operands:
  - label: Label name (target instruction location)

Description:
Unconditionally jumps to the specified label.
PC = address_of_label

Examples:
  JMP LOOP             ; Jump to LOOP label
  JMP END              ; Jump to END label
  
  LOOP:
    INC R0
    JMP LOOP

Flags Affected: None
Cycles: 1
Data Flow:
  - Address Bus ← label_address
  - PC ← Address Bus

Error Conditions:
- Undefined label: "Undefined label: {LABEL}"

Special Notes:
- PC is set to point to the target label
- Any previous program flow is abandoned
- Used for loops and goto-like behavior (not recommended in high-level style)
```

#### 4.2 JZ - Jump if Zero
```
Syntax: JZ label
Operands:
  - label: Label name (target instruction location)

Description:
Jumps to label if Zero Flag (ZF) is set (result of last operation = 0).
If ZF = 1: PC = address_of_label
If ZF = 0: PC = PC + 1 (continue to next instruction)

Examples:
  CMP R0, 0            ; Compare R0 with 0
  JZ ZERO_CASE         ; Jump if R0 is zero
  
  MOV R0, 10
  DEC R0
  JZ END               ; Jump to END when R0 = 0

Flags Affected: None (reads ZF but doesn't modify)
Cycles: 1
Data Flow:
  - Control Unit ← ZF
  - If ZF=1: Address Bus ← label_address, PC ← Address Bus
  - If ZF=0: PC = PC + 1

Error Conditions:
- Undefined label: "Undefined label: {LABEL}"

Special Notes:
- Conditional jump based on Zero Flag
- Used after comparison (CMP) or arithmetic operations
- JZ and JNZ are complementary
```

#### 4.3 JNZ - Jump if Not Zero
```
Syntax: JNZ label
Operands:
  - label: Label name (target instruction location)

Description:
Jumps to label if Zero Flag (ZF) is not set (result of last operation ≠ 0).
If ZF = 0: PC = address_of_label
If ZF = 1: PC = PC + 1 (continue to next instruction)

Examples:
  CMP R0, 0            ; Compare R0 with 0
  JNZ NOT_ZERO_CASE    ; Jump if R0 is not zero
  
  LOOP:
    DEC R0
    JNZ LOOP           ; Loop while R0 ≠ 0

Flags Affected: None (reads ZF but doesn't modify)
Cycles: 1
Data Flow:
  - Control Unit ← ZF
  - If ZF=0: PC ← label_address
  - If ZF=1: PC = PC + 1

Error Conditions:
- Undefined label: "Undefined label: {LABEL}"

Special Notes:
- Conditional jump based on NOT Zero Flag
- Opposite of JZ
- Commonly used for loop termination
```

#### 4.4 JS - Jump if Sign (Negative)
```
Syntax: JS label
Operands:
  - label: Label name (target instruction location)

Description:
Jumps to label if Sign Flag (SF) is set (result of last operation < 0).
If SF = 1: PC = address_of_label (result was negative)
If SF = 0: PC = PC + 1 (continue to next instruction)

Examples:
  SUB R0, R1           ; R0 = R0 - R1
  JS NEGATIVE_CASE     ; Jump if result is negative
  
  CMP R0, 0
  JS IS_NEGATIVE       ; Jump if R0 < 0

Flags Affected: None (reads SF but doesn't modify)
Cycles: 1
Data Flow:
  - Control Unit ← SF
  - If SF=1: Address Bus ← label_address, PC ← Address Bus
  - If SF=0: PC = PC + 1

Error Conditions:
- Undefined label: "Undefined label: {LABEL}"

Special Notes:
- Conditional jump based on Sign Flag
- Used for signed number comparisons
- SF is set by arithmetic/logical operations
- Complement of JNS instruction
```

#### 4.5 JNS - Jump if Not Sign
```
Syntax: JNS label
Operands:
  - label: Label name (target instruction location)

Description:
Jumps to label if Sign Flag (SF) is NOT set (result of last operation ≥ 0).
If SF = 0: PC = address_of_label (result was zero or positive)
If SF = 1: PC = PC + 1 (continue to next instruction)

This instruction is the complement of JS and is useful for detecting non-negative results.

Examples:
  SUB R0, R1           ; R0 = R0 - R1
  JNS NON_NEGATIVE     ; Jump if result ≥ 0
  
  CMP R0, 0
  JNS POSITIVE_OR_ZERO ; Jump if R0 ≥ 0
  
  ; Absolute value implementation
  MOV R0, -15
  CMP R0, 0
  JNS SKIP_NEGATE      ; Skip if already non-negative
  MOV R1, 0
  SUB R1, R0           ; R1 = -R0 (negate)
  MOV R0, R1
  SKIP_NEGATE:
  OUT R0               ; Output: 15

Flags Affected: None (reads SF but doesn't modify)
Cycles: 1
Data Flow:
  - Control Unit ← SF
  - If SF=0: Address Bus ← label_address, PC ← Address Bus
  - If SF=1: PC = PC + 1

Error Conditions:
- Undefined label: "Undefined label: {LABEL}"

Special Notes:
- Conditional jump based on NOT Sign Flag
- Complement of JS instruction
- Useful for detecting non-negative results (result ≥ 0)
- Combined with CMP, implements ">=" comparisons
- Essential for proper signed arithmetic flow control

Comparison Table:
| Condition       | Previous Result | Jump Instruction |
|-----------------|-----------------|------------------|
| result < 0      | SF = 1          | JS               |
| result ≥ 0      | SF = 0          | JNS              |
| result = 0      | ZF = 1          | JZ               |
| result ≠ 0      | ZF = 0          | JNZ              |
```

#### 4.6 CMP - Compare
```
Syntax: CMP op1, op2
Operands:
  - op1: First operand (register, immediate, or memory)
  - op2: Second operand (register, immediate, or memory)

Description:
Compares two operands by subtracting op2 from op1 and updating flags.
The operands themselves are NOT modified (non-destructive compare).
Internally: temp = op1 - op2, then set flags based on temp

Examples:
  CMP R0, R1           ; Compare R0 with R1
  JZ EQUAL             ; Jump if equal
  
  CMP R0, 10
  JZ IS_TEN            ; Jump if R0 = 10
  
  CMP R0, 0
  JS IS_NEGATIVE       ; Jump if R0 < 0
  JZ IS_ZERO           ; Jump if R0 = 0

Flags Affected: ZF, SF
  - ZF = 1 if op1 = op2 (difference = 0)
  - SF = 1 if op1 < op2 (difference < 0)

Cycles: 1
Data Flow:
  - ALU Input A ← op1
  - ALU Input B ← op2
  - ALU Operation ← SUB
  - Flags ← ALU Flags (result is discarded, not stored)

Special Notes:
- Non-destructive: neither operand is modified
- Result of subtraction is discarded
- Only flags are updated
- Essential for conditional branching
- Can compare registers, immediates, and memory values
```

---

### 5. Stack Instructions

#### 5.1 PUSH - Push to Stack
```
Syntax: PUSH src
Operands:
  - src: Source value (register, immediate, or memory)

Description:
Pushes a value onto the stack. SP is decremented before writing.
Sequence: SP = SP - 1, then Memory[SP] = src

Examples:
  PUSH R0              ; Push R0 onto stack
  PUSH 42              ; Push immediate value 42
  PUSH [100]           ; Push value from memory address 100
  
  ; Stack example:
  MOV R0, 10
  MOV R1, 20
  PUSH R0              ; Stack: [10], SP: 256→255
  PUSH R1              ; Stack: [10, 20], SP: 255→254

Flags Affected: None
Cycles: 2
Data Flow:
  - ALU Input A ← SP
  - ALU Input B ← 1
  - ALU Operation ← SUB
  - SP ← ALU Output
  - Address Bus ← SP
  - Data Bus ← src
  - Control Bus ← WRITE
  - Memory[SP] ← Data Bus

Error Conditions:
- Stack overflow (SP ≤ 0): "Stack overflow"

Special Notes:
- SP is decremented BEFORE writing (pre-decrement)
- Stack grows downward (toward address 0)
- Initial SP = 256 (empty stack)
- Each PUSH decreases SP by 1
- Can push any value type (register, immediate, memory)
- Must balance PUSH with POP to maintain stack integrity
```

#### 5.2 POP - Pop from Stack
```
Syntax: POP dest
Operands:
  - dest: Destination (register or memory address)

Description:
Pops a value from the stack into destination. SP is incremented after reading.
Sequence: value = Memory[SP], then SP = SP + 1

Examples:
  POP R0               ; Pop from stack into R0
  POP [100]            ; Pop from stack into memory
  
  ; Stack example (continuing from PUSH):
  POP R1               ; R1 = 20, Stack: [10], SP: 254→255
  POP R0               ; R0 = 10, Stack: [], SP: 255→256

Flags Affected: None
Cycles: 2
Data Flow:
  - Address Bus ← SP
  - Control Bus ← READ
  - Data Bus ← Memory[SP]
  - dest ← Data Bus
  - ALU Input A ← SP
  - ALU Input B ← 1
  - ALU Operation ← ADD
  - SP ← ALU Output

Error Conditions:
- Stack underflow (SP ≥ 256): "Stack underflow"

Special Notes:
- Value is read BEFORE SP is incremented (post-increment)
- Stack grows downward (toward address 0)
- Removes and returns the most recently pushed value (LIFO)
- Must not POP more than PUSH operations
- PUSH/POP must be balanced for clean execution
- POP can restore to register or memory
```

#### 5.3 CALL - Call Subroutine
```
Syntax: CALL label
Operands:
  - label: Label of subroutine entry point

Description:
Calls a subroutine by pushing the return address (PC+1) onto the stack,
then jumping to the subroutine. The return address is the address of the
next instruction after CALL.

Sequence:
  1. SP = SP - 1
  2. Memory[SP] = PC + 1 (return address)
  3. PC = address_of_label

Examples:
  MOV R0, 5
  CALL DOUBLE          ; Call DOUBLE subroutine
  OUT R0               ; Returns here (return address saved)
  HLT
  
  DOUBLE:
    ADD R0, R0         ; Double R0
    RET                ; Return to caller

Flags Affected: None
Cycles: 3
Data Flow:
  - SP ← SP - 1
  - Memory[SP] ← PC + 1 (return address)
  - PC ← label_address

Error Conditions:
- Stack overflow (SP ≤ 0): "Stack overflow"
- Undefined label: "Undefined label: {LABEL}"

Special Notes:
- Enables subroutine/function calls
- Return address is PC+1 (next instruction after CALL)
- Return address is saved on stack (top of stack)
- Must be paired with RET
- Nested CALL/RET are allowed (call stack)
- Used for code reuse and modular programming
```

#### 5.4 RET - Return from Subroutine
```
Syntax: RET
Operands: None

Description:
Returns from a subroutine by popping the return address from the stack
and restoring it to the Program Counter.

Sequence:
  1. PC = Memory[SP]
  2. SP = SP + 1

Examples:
  DOUBLE:
    ADD R0, R0         ; Perform operation
    RET                ; Return to caller

  ; When RET executes, control returns to instruction after CALL

Flags Affected: None
Cycles: 2
Data Flow:
  - PC ← Memory[SP] (return address)
  - SP ← SP + 1

Error Conditions:
- Stack underflow (SP ≥ 256): "Stack underflow"
- RET without matching CALL will pop garbage data

Special Notes:
- Must be paired with CALL
- Pops the return address from stack
- Restores execution to the instruction after the CALL
- Used to exit subroutine and return control to caller
- Without proper CALL/RET pairing, program behavior is undefined
```

---

### 6. Input/Output and System Instructions

#### 6.1 OUT - Output Value
```
Syntax: OUT src
Operands:
  - src: Source value (register, immediate, or memory)

Description:
Outputs/displays the value to the output log. The value is appended to
the program's output buffer.

Examples:
  MOV R0, 42
  OUT R0               ; Output: 42
  
  OUT 100              ; Output: 100
  
  OUT [50]             ; Output memory[50]

Flags Affected: None
Cycles: 1
Data Flow:
  - Data Bus ← src
  - Output Device ← Data Bus

Special Notes:
- Used for program output and debugging
- Values are converted to decimal representation
- Multiple OUT calls append to output log
- Visible in the Output Log panel of simulator
- Useful for verifying program correctness
- Can output registers, immediates, or memory values
```

#### 6.2 HLT - Halt Execution
```
Syntax: HLT
Operands: None

Description:
Terminates the program execution immediately. Sets the halted flag
and stops instruction processing.

Examples:
  MOV R0, 100
  OUT R0
  HLT                  ; Program terminates

Flags Affected: None
Cycles: 1
Data Flow:
  - Control Unit ← HALT signal
  - Execution stops

Special Notes:
- Must be included at the end of programs
- Without HLT, if PC reaches end of instructions, error occurs
- All operations before HLT are completed
- Program cannot be resumed once HLT is executed
- Necessary for clean program termination
```

---

## Syntax Rules

### General Syntax

#### 1. Instruction Format
```
OPCODE operand1, operand2  ; optional comment
```

**Rules:**
- Opcode must be uppercase (MOV, ADD, etc.) or case-insensitive
- Operands are separated by commas
- Comments begin with semicolon (;) and continue to end of line
- Whitespace is flexible (spaces/tabs are optional)

#### 2. Comments
```
; This is a full-line comment

MOV R0, 42    ; This is an inline comment

; Comments are ignored by the assembler
```

**Rules:**
- Comments start with `;`
- Entire line after `;` is ignored
- Can be full-line or inline
- Used for documentation and clarity

#### 3. Labels
```
LOOP:          ; Label definition
  INC R0
  JMP LOOP     ; Reference to label

FACTORIAL:
  MOL R1, R0
  DEC R0
  JNZ FACTORIAL

END:
  HLT
```

**Rules:**
- Label name followed by colon `:`
- Label points to the next instruction
- Labels must be unique
- Label names are case-insensitive but conventionally uppercase
- Can be on same line as instruction or on separate line
- Used as targets for jumps and calls

#### 4. Case Sensitivity
- **Opcodes:** Case-insensitive (MOV = mov = Mov)
- **Registers:** Case-insensitive (R0 = r0 = R0)
- **Labels:** Case-insensitive (LOOP = loop = Loop)
- **Immediate values:** Numeric values only

#### 5. Whitespace
- Spaces and tabs around operands are flexible
- Between opcode and operands: optional
- Around commas: optional
- Leading/trailing whitespace: ignored

**Valid Examples:**
```
MOV R0,42
MOV R0, 42
MOV  R0  ,  42
MOV R0,42;comment
```

---

### Operand Types

#### 1. Registers
```
R0, R1, R2, R3    ; 16-bit general-purpose registers
```

**Range:** -32,768 to 32,767

**Usage:**
```
MOV R0, R1        ; Register to register
ADD R0, 10        ; Register with immediate
```

#### 2. Immediates (Literal Values)
```
42                ; Positive integer
-42               ; Negative integer
0                 ; Zero
32767             ; Maximum (2^15 - 1)
-32768            ; Minimum (-2^15)
```

**Range:** -32,768 to 32,767 (16-bit signed integer)

**Valid:** Decimal numbers only

**Usage:**
```
MOV R0, 42
ADD R0, -10
CMP R0, 0
```

**Out of Range:** Values exceeding ±32767 are clamped to valid range

#### 3. Direct Memory Addressing
```
[0]               ; Address 0
[100]             ; Address 100
[255]             ; Address 255 (maximum)
```

**Syntax:** Square brackets with numeric address

**Range:** 0 to 255

**Usage:**
```
MOV R0, [100]     ; Load from memory[100]
STR R0, [50]      ; Store to memory[50]
LDR R1, [200]     ; Load from memory[200]
```

**Error:** Addresses outside 0-255 raise "Invalid memory access"

#### 4. Indirect Memory Addressing
```
[R0]              ; Address from R0
[R1]              ; Address from R1
[R2]              ; Address from R2
[R3]              ; Address from R3
```

**Syntax:** Square brackets with register name

**Behavior:** The value in the register is used as the memory address

**Range:** Register value must be 0-255 to be valid

**Usage:**
```
MOV R1, 100       ; R1 = 100
MOV R0, [R1]      ; R0 = Memory[100] (indirection)

MOV R2, 50
STR R0, [R2]      ; Memory[50] = R0
```

**Error:** If register value is < 0 or > 255, "Invalid memory access"

#### 5. Labels (for Jumps/Calls)
```
LOOP
END
FACTORIAL
MY_FUNCTION
```

**Syntax:** Identifier (letters, digits, underscores)

**Case:** Case-insensitive, conventionally uppercase

**Usage:**
```
JMP LOOP          ; Jump to LOOP label
CALL FACTORIAL    ; Call FACTORIAL subroutine
JZ END            ; Conditional jump

LOOP:             ; Label definition
  INC R0
```

**Error:** "Undefined label: {NAME}" if referenced label doesn't exist

---

### Instruction Validation Rules

#### Operand Count
| Instruction | Operands | Requirement |
|-------------|----------|-------------|
| MOV | 2 | Both required |
| LDR | 2 | Both required |
| STR | 2 | Both required |
| ADD | 2 | Both required |
| SUB | 2 | Both required |
| MOL | 2 | Both required |
| DIV | 2 | Both required |
| CMP | 2 | Both required |
| AND | 2 | Both required |
| OR | 2 | Both required |
| INC | 1 | One required |
| DEC | 1 | One required |
| NOT | 1 | One required |
| PUSH | 1 | One required |
| POP | 1 | One required |
| JMP | 1 | Label required |
| JZ | 1 | Label required |
| JNZ | 1 | Label required |
| JS | 1 | Label required |
| CALL | 1 | Label required |
| RET | 0 | No operands |
| OUT | 1 | One required |
| HLT | 0 | No operands |

#### Operand Type Restrictions

**Destination-Only Instructions (must be register):**
- MOV Rdest, src (Rdest must be register)
- LDR Rdest, [addr] (Rdest must be register)
- POP dest (dest can be register or memory)
- INC Rdest (must be register)
- DEC Rdest (must be register)
- NOT Rdest (must be register)

**Flexible Operands:**
- ADD/SUB/MOL/DIV: Register OP (register/immediate/memory)
- AND/OR: Register OP (register/immediate/memory)
- CMP: Operand OP Operand (both can be any type)
- PUSH/OUT: Value from any source type

---

## Addressing Modes

The MicroASM simulator supports four addressing modes:

### 1. Immediate Addressing
```
Syntax: MOV R0, 42
        MOV R1, -100

Behavior:
The value is directly specified in the instruction.
The value is loaded directly into the destination register.

Data Path:
Immediate Value → Destination Register

Supported by:
MOV, PUSH, OUT, and all arithmetic/logical instructions when used as source operand
```

### 2. Register Addressing
```
Syntax: MOV R0, R1
        ADD R0, R1

Behavior:
The operand is a register reference.
The value from the source register is used.

Data Path:
Source Register → Destination Register/ALU

Supported by:
MOV, PUSH, OUT, and all arithmetic/logical operations
```

### 3. Direct Memory Addressing
```
Syntax: MOV R0, [100]     ; Load from address 100
        STR R0, [50]      ; Store to address 50
        LDR R1, [200]     ; Load from address 200

Behavior:
A literal memory address is specified in brackets.
Memory at that address is accessed directly.

Data Path:
Memory[address] ↔ Destination

Constraints:
Address must be 0-255
Address must be an integer constant

Supported by:
MOV, LDR, STR, PUSH, OUT, and arithmetic/logical as source
```

### 4. Indirect Memory Addressing (Register Indirect)
```
Syntax: MOV R0, [R1]      ; R1 contains the address
        STR R0, [R2]      ; R2 contains the address
        LDR R0, [R3]      ; R3 contains the address

Behavior:
A register contains the memory address.
Memory at the address stored in the register is accessed.

Data Path:
Register Value (as address) → Memory Address
Memory[Address] ↔ Destination

Constraints:
Register value must be 0-255 at runtime
Address calculation happens at execution time

Examples:
MOV R1, 50
MOV R0, [R1]      ; R0 = Memory[50]
ADD R1, 10        ; R1 = 60
MOV R0, [R1]      ; R0 = Memory[60]
```

### Addressing Mode Summary Table

| Mode | Syntax | Example | Data Source |
|------|--------|---------|-------------|
| Immediate | value | `MOV R0, 42` | Constant in instruction |
| Register | Rn | `MOV R0, R1` | Value in register |
| Direct | [addr] | `MOV R0, [100]` | Memory cell 0-255 |
| Indirect | [Rn] | `MOV R0, [R1]` | Memory at address in Rn |

---

## Flags and Status Registers

### Zero Flag (ZF)

**Purpose:** Indicates whether the result of the last operation is zero

**Behavior:**
- Set to 1 if last operation result = 0
- Set to 0 if last operation result ≠ 0
- Useful for determining equality and loop termination

**Affected By:**
- Arithmetic: ADD, SUB, MOL, DIV, INC, DEC
- Logical: AND, OR, NOT
- Comparison: CMP

**Not Affected By:**
- Data movement: MOV, PUSH, POP, LDR, STR
- Control flow: JMP, JZ, JNZ, JS, CALL, RET
- I/O: OUT, HLT

**Usage in Conditionals:**
```
CMP R0, 0         ; Subtract 0 from R0, set flags
JZ ZERO_CASE      ; Jump if ZF = 1 (R0 was 0)
JNZ NOT_ZERO      ; Jump if ZF = 0 (R0 was not 0)
```

### Sign Flag (SF)

**Purpose:** Indicates whether the result of the last operation is negative

**Behavior:**
- Set to 1 if last operation result < 0 (negative)
- Set to 0 if last operation result ≥ 0 (zero or positive)
- Used for signed number comparisons

**Affected By:**
- Arithmetic: ADD, SUB, MOL, DIV, INC, DEC
- Logical: AND, OR, NOT
- Comparison: CMP

**Not Affected By:**
- Data movement: MOV, PUSH, POP, LDR, STR
- Control flow: JMP, JZ, JNZ, JS, CALL, RET
- I/O: OUT, HLT

**Usage in Conditionals:**
```
SUB R0, R1        ; R0 = R0 - R1, set flags
JS IS_NEGATIVE    ; Jump if SF = 1 (R0 < R1)
```

### Flag Update Rules

#### Zero Flag (ZF) Logic
```
If result = 0:   ZF = 1
If result ≠ 0:   ZF = 0
```

#### Sign Flag (SF) Logic
```
If result < 0:   SF = 1
If result ≥ 0:   SF = 0
```

#### Combined Flag Conditions
| Condition | ZF | SF | Example |
|-----------|----|----|---------|
| result = 0 | 1 | 0 | Zero |
| result > 0 | 0 | 0 | Positive |
| result < 0 | 0 | 1 | Negative |
| result = -1 | 0 | 1 | Negative |
| result = 1 | 0 | 0 | Positive |

### Flag State Persistence

- Flags persist across instructions until modified
- Only operations that set flags change them
- Previous flag values remain until new operation overwrites them

**Example:**
```
MOV R0, 10       ; No flag change
CMP R0, 10       ; ZF = 1, SF = 0 (comparison result = 0)
JNZ SKIP         ; JNZ reads ZF, but doesn't modify it
                 ; ZF and SF still = 1, 0

MOV R1, 20       ; Still no flag change
CMP R0, 20       ; ZF = 0, SF = 1 (result = -10)
                 ; Flags are now updated
```

---

## Example Programs

### Example 1: Simple Addition

```assembly
; Simple addition of two numbers
MOV R0, 10       ; R0 = 10
MOV R1, 20       ; R1 = 20
ADD R0, R1       ; R0 = R0 + R1 = 30
OUT R0           ; Output: 30
HLT              ; Program terminates

Output: 30
```

**Explanation:**
- Load two numbers into registers R0 and R1
- Add them together
- Output the result
- Halt execution

---

### Example 2: Factorial Calculation

```assembly
; Calculate factorial of 5 (5! = 120)
MOV R0, 5        ; N = 5
MOV R1, 1        ; Result = 1 (starting value for multiplication)

LOOP:
CMP R0, 1        ; Compare N with 1
JZ END           ; If N = 1, exit loop
MOL R1, R0       ; Result = Result * N
DEC R0           ; N = N - 1
JMP LOOP         ; Repeat

END:
OUT R1           ; Output result
HLT

Execution:
Initial: R0=5, R1=1
Iteration 1: R1 = 1*5 = 5, R0 = 4
Iteration 2: R1 = 5*4 = 20, R0 = 3
Iteration 3: R1 = 20*3 = 60, R0 = 2
Iteration 4: R1 = 60*2 = 120, R0 = 1
Condition ZF=1, exit loop
Output: 120
```

**Explanation:**
- Initialize N=5 and result=1
- Loop: multiply result by N, decrement N
- Exit when N = 1
- Output the factorial

---

### Example 3: Loop with Counter

```assembly
; Count from 1 to 5
MOV R0, 1        ; Counter = 1

LOOP:
OUT R0           ; Output current counter
INC R0           ; Counter++
CMP R0, 6        ; Compare counter with 6
JNZ LOOP         ; If counter ≠ 6, repeat

HLT

Output:
1
2
3
4
5
```

**Explanation:**
- Initialize counter to 1
- Output current value
- Increment counter
- Loop while counter < 6

---

### Example 4: Stack Operations

```assembly
; Demonstrate stack operations
MOV R0, 10       ; R0 = 10
MOV R1, 20       ; R1 = 20
MOV R2, 30       ; R2 = 30

; Push values onto stack
PUSH R0          ; Stack: [10], SP: 255
PUSH R1          ; Stack: [10, 20], SP: 254
PUSH R2          ; Stack: [10, 20, 30], SP: 253

; Clear registers
MOV R0, 0
MOV R1, 0
MOV R2, 0

; Pop values back (LIFO order)
POP R2           ; R2 = 30
POP R1           ; R1 = 20
POP R0           ; R0 = 10

; Output restored values
OUT R0           ; Output: 10
OUT R1           ; Output: 20
OUT R2           ; Output: 30
HLT

Output:
10
20
30
```

**Explanation:**
- Push three values onto stack
- Clear registers (demonstrate LIFO)
- Pop values back in reverse order
- Output to verify stack behavior

---

### Example 5: Subroutine with Function Call

```assembly
; Demonstrate subroutine calls
MOV R0, 7        ; Argument: 7

CALL DOUBLE      ; Call DOUBLE subroutine
                 ; Returns here with R0 = 14
OUT R0           ; Output: 14
HLT

DOUBLE:          ; Subroutine: doubles the value in R0
PUSH R1          ; Save R1 (we'll use it temporarily)
MOV R1, R0       ; R1 = R0
ADD R0, R1       ; R0 = R0 + R1 (double)
POP R1           ; Restore R1
RET              ; Return to caller

Output: 14
```

**Explanation:**
- CALL saves the return address on the stack
- Subroutine DOUBLE performs the doubling
- RET pops return address and continues execution
- Demonstrates function call mechanism

---

### Example 6: Memory Access

```assembly
; Demonstrate memory operations
MOV [10], 42     ; Memory[10] = 42
MOV [20], 100    ; Memory[20] = 100

LDR R0, [10]     ; R0 = Memory[10] = 42
LDR R1, [20]     ; R1 = Memory[20] = 100

ADD R0, R1       ; R0 = 42 + 100 = 142
STR R0, [30]     ; Memory[30] = 142

LDR R2, [30]     ; R2 = Memory[30] = 142
OUT R2           ; Output: 142
HLT

Output: 142
```

**Explanation:**
- Store values directly to memory
- Load from memory into registers
- Perform arithmetic
- Store result back to memory
- Load and output final result

---

### Example 7: Indirect Memory Addressing

```assembly
; Demonstrate indirect memory addressing
MOV R1, 50       ; R1 = 50 (address)
MOV [50], 999    ; Memory[50] = 999

; Access memory using indirect addressing
MOV R0, [R1]     ; R0 = Memory[50] = 999
OUT R0           ; Output: 999

; Update address
ADD R1, 5        ; R1 = 55
MOV [55], 777    ; Memory[55] = 777
MOV R2, [R1]     ; R2 = Memory[55] = 777
OUT R2           ; Output: 777
HLT

Output:
999
777
```

**Explanation:**
- Use register R1 to hold memory address
- Access memory indirectly using [R1]
- Change address in register to access different memory location

---

### Example 8: Conditional Logic

```assembly
; Compare values and branch
MOV R0, 15
MOV R1, 10

CMP R0, R1       ; R0 - R1 = 5 (positive)
JS LESS          ; Jump if SF=1 (only jumps if R0 < R1)
                 ; SF = 0, so skip this
OUT 1            ; Output: 1 (R0 >= R1)
JMP END

LESS:
OUT 2            ; Would output 2 if R0 < R1
OUT 3

END:
HLT

Output: 1
```

**Explanation:**
- Compare two values using CMP
- Jump conditionally based on Sign Flag
- Different code paths based on comparison result

---

### Example 9: Bitwise Operations

```assembly
; Demonstrate logical operations
MOV R0, 15       ; R0 = 15 (binary: 0000 1111)
MOV R1, 7        ; R1 = 7  (binary: 0000 0111)

AND R0, R1       ; R0 = 15 & 7 = 7 (binary: 0000 0111)
OUT R0           ; Output: 7

MOV R0, 15
MOV R1, 7
OR R0, R1        ; R0 = 15 | 7 = 15 (binary: 0000 1111)
OUT R0           ; Output: 15

MOV R0, 5
NOT R0           ; R0 = ~5 = -6 (binary inversion)
OUT R0           ; Output: -6
HLT

Output:
7
15
-6
```

**Explanation:**
- AND: bitwise AND operation (bits both 1)
- OR: bitwise OR operation (bits either 1)
- NOT: bitwise NOT operation (invert all bits)

---

### Example 10: Nested Loops

```assembly
; Nested loops: count i from 1 to 3, j from 1 to 2
MOV R0, 1        ; i = 1

OUTER:
CMP R0, 4        ; if i >= 4, exit
JNZ INNER        ; Continue to inner loop
JMP END

INNER:
MOV R1, 1        ; j = 1

INNER_LOOP:
OUT R0           ; Output i
OUT R1           ; Output j

INC R1           ; j++
CMP R1, 3        ; if j >= 3, exit inner
JNZ INNER_LOOP   ; Continue inner loop

INC R0           ; i++
JMP OUTER        ; Continue outer loop

END:
HLT

Output:
1 1
1 2
2 1
2 2
3 1
3 2
```

**Explanation:**
- Outer loop iterates R0 from 1 to 3
- Inner loop iterates R1 from 1 to 2 for each R0
- Demonstrates nested loop structure

---

### Example 11: Absolute Value using JNS

```assembly
; Calculate absolute value of R0
; Input: R0 = any signed value
; Output: R0 = |R0| (absolute value)

START:
  MOV R0, -15       ; Test value (change to test positive/negative)
  
  CMP R0, 0         ; Compare with 0
  JNS ALREADY_POS   ; If R0 >= 0, skip negation
  
NEGATE:
  ; R0 is negative, need to negate it
  MOV R1, 0
  SUB R1, R0        ; R1 = 0 - R0 (negate)
  MOV R0, R1        ; R0 = -R0 (now positive)
  
ALREADY_POS:
  OUT R0            ; Output: 15 (absolute value)
  HLT

; Test Cases:
; R0 = -15  → Output: 15
; R0 = 15   → Output: 15
; R0 = 0    → Output: 0
```

**Explanation:**
- **CMP R0, 0**: Sets SF=1 if R0<0, SF=0 if R0≥0
- **JNS ALREADY_POS**: Uses new JNS instruction to skip negation for non-negative values
- **Negation logic**: For negative values, compute 0 - R0 to get positive equivalent
- **Key concept**: JNS complements JS, allowing elegant handling of ≥ 0 conditions
- **Educational value**: Demonstrates signed number handling and conditional flow with new instruction

**Why JNS is useful here:**
- Without JNS, would need JS followed by JMP (less elegant)
- JNS directly expresses "if non-negative" condition
- Makes code more readable and maintainable
- Mirrors real CPU architectures that have both signed/unsigned jump variants

---

## Error Handling

### Compile-Time Errors

Errors detected during parsing/assembly phase:

#### 1. Invalid Instruction
```
Error: Invalid instruction: INVALID_OP
Line: 5

Cause: Opcode is not recognized
Solution: Check spelling of instruction (MOV, ADD, etc.)
```

#### 2. Undefined Label
```
Error: Undefined label: MISSING_LABEL
Line: 10

Cause: Referenced label does not exist
Solution: Define label with LABEL_NAME: syntax
```

#### 3. Missing Operand
```
Error: JMP requires a label
Line: 15

Cause: Instruction requires operand but none provided
Solution: Provide required operands
```

#### 4. Out of Range Immediate
```
Error: Immediate value out of range (-32768 to 32767)
Line: 20

Cause: Numeric value exceeds 16-bit signed range
Solution: Use value within -32768 to 32767
```

#### 5. Invalid Memory Address
```
Error: Memory address out of range (0 to 255)
Line: 25

Cause: Memory address is not 0-255
Solution: Use addresses 0-255
```

---

### Runtime Errors

Errors detected during program execution:

#### 1. Stack Overflow
```
Error: Stack overflow
Line: 30

Cause: SP <= 0 (too many PUSH or CALL without corresponding POP/RET)
Solution: Balance PUSH/POP and CALL/RET pairs
```

#### 2. Stack Underflow
```
Error: Stack underflow
Line: 35

Cause: SP >= 256 (too many POP or RET without corresponding PUSH/CALL)
Solution: Ensure PUSH precedes POP and CALL precedes RET
```

#### 3. Division by Zero
```
Error: Division by zero
Line: 40

Cause: DIV instruction with divisor = 0
Solution: Check divisor before dividing
```

#### 4. Arithmetic Overflow
```
Error: Arithmetic overflow
Line: 45

Cause: Operation result > 32767 or < -32768
Solution: Use smaller values or different algorithm

Example:
  MOV R0, 32767
  ADD R0, 1        ; Error: exceeds maximum
```

#### 5. Invalid Memory Access
```
Error: Invalid memory access
Line: 50

Cause: Memory address < 0 or > 255
Solution: Use valid memory addresses 0-255

Example:
  MOV R0, 300
  MOV R1, [R0]     ; Error: address 300 is out of range
```

#### 6. Execution Out of Bounds
```
Error: Execution out of bounds
Line: N/A

Cause: Program Counter reaches beyond last instruction (missing HLT)
Solution: Always end program with HLT instruction
```

#### 7. Execution Limit Exceeded
```
Error: Execution limit exceeded (100000 instructions). Possible infinite loop detected.

Cause: Program exceeded 100,000 instruction limit
Solution: Check for infinite loops or excessive iterations
```

---

### Error Recovery

The simulator provides:

1. **Error Detection:** Compile-time validation before execution
2. **Error Reporting:** Clear error messages with line numbers
3. **Execution Halt:** Stops at first error to prevent cascading issues
4. **Step Debugging:** Use STEP button to execute one instruction at a time

**Debugging Strategy:**
1. Check syntax first (comments, labels, operators)
2. Verify label definitions
3. Trace stack operations (PUSH/POP balance)
4. Use OUT statements to debug variable values
5. Use STEP mode for detailed execution tracking

---

## Data Flow and Bus Operations

### CPU Components

```
┌─────────────────────────────────────────────────────┐
│                    CPU Architecture                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │        Register File (R0-R3, PC, SP)         │  │
│  └──────────────────────────────────────────────┘  │
│         ▲                           ▼               │
│         │                    Data Bus              │
│         │                           │               │
│  ┌──────┴─────────────────────┬─────▼──────────┐  │
│  │                            │                │   │
│  │    ALU                 Control Unit         │   │
│  │  (ADD/SUB/MUL/DIV)    (Sequencing)        │   │
│  │  (AND/OR/NOT)         (Flag Update)       │   │
│  │                                            │   │
│  └────────────────────────────────────────────┘  │
│         ▲              ▲              ▲           │
│         │              │              │           │
│      Control        Address          Data        │
│       Bus            Bus              Bus        │
│         │              │              │           │
├────────┼──────────────┼──────────────┼────────────┤
│        │              │              │           │
│        │         ┌────▼────┐        │           │
│        │         │ Memory  │        │           │
│        │         │(0-255)  │        │           │
│        │         └─────────┘        │           │
│        │              ▲              │           │
│        └──────────────┴──────────────┘           │
│                                                   │
└─────────────────────────────────────────────────────┘
```

### Bus Operations

The simulator includes three buses for communication:

#### 1. Data Bus
- **Width:** 16-bit signed integer
- **Purpose:** Transfer data values
- **Bidirectional:** Can carry data in both directions

**Participants:**
- Registers (R0-R3)
- Memory cells
- ALU (input and output)
- Immediate values

#### 2. Address Bus
- **Width:** 8-bit (0-255)
- **Purpose:** Specify memory addresses
- **Direction:** Unidirectional (from control unit to memory)

**Participants:**
- PC (for instruction fetch)
- Memory addressing operations
- Register indirect addressing

#### 3. Control Bus
- **Signals:** READ, WRITE, HALT
- **Purpose:** Control unit operations
- **Direction:** From control unit to memory

**Signals:**
- **READ:** Fetch data from memory
- **WRITE:** Store data to memory
- **HALT:** Stop execution

### Instruction Execution Phases

#### Fetch Phase
```
PC → Address Bus
Memory[PC] → Data Bus
Data Bus → Instruction Register
PC = PC + 1
```

#### Decode Phase
```
Instruction Register → Control Unit
Control Unit determines:
  - Opcode type
  - Operand types
  - Required bus operations
```

#### Execute Phase
```
Based on opcode:
  - Load operands onto Data Bus
  - Feed to ALU or memory
  - Perform operation
  - Write result to destination
  - Update flags (if applicable)
```

### Example: MOV R0, 42

```
┌─ Fetch ─────────────────────────────────┐
│ PC → Address Bus (points to instruction) │
│ Memory[PC] → Data Bus                   │
│ Data Bus → Instruction Register (IR)    │
│ IR = "MOV R0, 42"                       │
│ PC = PC + 1                             │
└─────────────────────────────────────────┘

┌─ Decode ────────────────────────────────┐
│ Control Unit analyzes IR                 │
│ Opcode: MOV                              │
│ Operand 1: R0 (destination)              │
│ Operand 2: 42 (immediate value)          │
└─────────────────────────────────────────┘

┌─ Execute ───────────────────────────────┐
│ 42 → Data Bus                            │
│ Data Bus → R0                            │
│ (Flags: No flag update for MOV)         │
└─────────────────────────────────────────┘
```

### Example: ADD R0, R1

```
┌─ Fetch ──────────────────────────────────┐
│ PC → Address Bus                         │
│ Memory[PC] → Instruction Register        │
│ IR = "ADD R0, R1"                        │
│ PC = PC + 1                              │
└──────────────────────────────────────────┘

┌─ Decode ─────────────────────────────────┐
│ Opcode: ADD                              │
│ Operand 1: R0 (destination register)     │
│ Operand 2: R1 (source register)          │
└──────────────────────────────────────────┘

┌─ Execute ────────────────────────────────┐
│ Step 1: Load A                           │
│   R0 → Data Bus → ALU Input A            │
│                                          │
│ Step 2: Load B                           │
│   R1 → Data Bus → ALU Input B            │
│                                          │
│ Step 3: Perform ALU Operation            │
│   ALU Operation: A + B                   │
│   Result → ALU Output                    │
│                                          │
│ Step 4: Store Result                     │
│   ALU Output → Data Bus → R0             │
│                                          │
│ Step 5: Update Flags                     │
│   ALU Flags → ZF, SF                     │
└──────────────────────────────────────────┘
```

### Example: LDR R0, [100]

```
┌─ Fetch ──────────────────────────────────┐
│ PC → Address Bus                         │
│ Memory[PC] → Instruction Register        │
│ IR = "LDR R0, [100]"                     │
│ PC = PC + 1                              │
└──────────────────────────────────────────┘

┌─ Decode ─────────────────────────────────┐
│ Opcode: LDR                              │
│ Operand 1: R0 (destination)              │
│ Operand 2: [100] (direct memory address) │
└──────────────────────────────────────────┘

┌─ Execute ────────────────────────────────┐
│ Step 1: Address Setup                    │
│   100 → Address Bus                      │
│                                          │
│ Step 2: Memory Read                      │
│   Control Bus ← READ                     │
│   Data Bus ← Memory[100]                 │
│                                          │
│ Step 3: Store Result                     │
│   Data Bus → R0                          │
│                                          │
│ (Flags: Not affected by LDR)            │
└──────────────────────────────────────────┘
```

### Example: PUSH R0

```
┌─ Execute ────────────────────────────────┐
│ Step 1: Decrement Stack Pointer          │
│   SP - 1 → SP                            │
│   (SP was 256, now 255)                  │
│                                          │
│ Step 2: Address Setup                    │
│   SP → Address Bus                       │
│   (Address Bus = 255)                    │
│                                          │
│ Step 3: Prepare Data                     │
│   R0 → Data Bus                          │
│                                          │
│ Step 4: Write to Memory                  │
│   Control Bus ← WRITE                    │
│   Memory[255] ← Data Bus                 │
│   (Memory[255] = R0 value)               │
│                                          │
│ (Flags: Not affected by PUSH)           │
└──────────────────────────────────────────┘
```

### Data Flow Summary Table

| Instruction | Data Sources | Data Path | Destinations | Flags |
|-------------|--------------|-----------|--------------|-------|
| MOV | Register, Immediate, Memory | Source → Data Bus → Dest | Register, Memory | No |
| ADD | Register, Immediate, Memory | ALU(R+Src) → Data Bus → R | Register | Yes (ZF, SF) |
| LDR | Memory | Memory[addr] → Data Bus → R | Register | No |
| STR | Register, Immediate, Memory | Src → Data Bus → Memory[addr] | Memory | No |
| PUSH | Register, Immediate, Memory | Src → Data Bus → Memory[SP] | Memory | No |
| POP | Memory | Memory[SP] → Data Bus → Dest | Register, Memory | No |
| CMP | Register, Immediate, Memory | ALU(Op1-Op2) → Flags | Flags only | Yes (ZF, SF) |
| JZ | Internal | None (reads ZF) | PC (conditional) | No |
| CALL | Internal | PC+1 → Memory[SP] | Memory, PC | No |
| RET | Memory | Memory[SP] → PC | PC | No |

---

## Implementation Details

### Register Clamping

Values exceeding 16-bit signed range are clamped:
```
If value > 32767:  clamp to 32767
If value < -32768: clamp to -32768
Otherwise: use as-is
```

### Division Behavior

Division uses floor division (rounds toward negative infinity):
```
10 / 3 = 3 (not 3.33...)
-10 / 3 = -4 (floor of -3.33...)
10 / -3 = -4 (floor of -3.33...)
```

### Stack Growth Direction

Stack grows downward (toward address 0):
```
Initial State: SP = 256 (empty)
After PUSH:   SP = 255
After PUSH:   SP = 254
After POP:    SP = 255
After POP:    SP = 256 (empty again)
```

### Flag Persistence

Flags remain set until modified by an operation:
```
MOV R0, 10       ; No flag change
CMP R0, 10       ; ZF = 1 (result = 0)
JNZ SKIP         ; Reads ZF = 1, doesn't change it
MOV R1, 20       ; No flag change
CMP R0, 20       ; ZF = 0 (result = -10), SF = 1
```

### Program Termination

Program must end with HLT instruction:
```
✓ Correct:
  MOV R0, 42
  OUT R0
  HLT           ; Proper termination

✗ Incorrect:
  MOV R0, 42
  OUT R0
  ; Missing HLT - execution out of bounds error
```

---

## Quick Reference

### All 21 Instructions (Quick List)

**Data Transfer (3):** MOV, LDR, STR

**Arithmetic (6):** ADD, SUB, MOL, DIV, INC, DEC

**Logical (3):** AND, OR, NOT

**Control Flow (5):** JMP, JZ, JNZ, JS, CMP

**Stack (4):** PUSH, POP, CALL, RET

**I/O and System (2):** OUT, HLT

### Register Limits

- **General Registers:** R0, R1, R2, R3 (16-bit signed)
- **Range per Register:** -32,768 to 32,767
- **Memory Cells:** 0-255 (16-bit signed each)
- **Stack Pointer:** Starts at 256, grows downward

### Common Programming Patterns

**Loop Structure:**
```
  LOOP:
    ; body
    DEC/CMP/condition
    JNZ/JZ LOOP
```

**Function Call:**
```
  CALL FUNCTION_NAME
  ; after call
  
  FUNCTION_NAME:
    ; function body
    RET
```

**Stack Save:**
```
  PUSH R0       ; Save R0
  ; use R0 for something
  POP R0        ; Restore R0
```

---

## Conclusion

MicroASM is a comprehensive educational simulator for learning assembly language programming and CPU architecture. With 21 instructions, a complete set of addressing modes, stack operations, and conditional logic, it provides a realistic environment for understanding low-level programming concepts.

For detailed examples and interactive learning, use the built-in simulator with the STEP execution mode to trace program behavior.

