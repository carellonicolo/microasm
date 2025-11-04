# MicroASM Technical Documentation - Extraction Summary

## Overview
This document summarizes the comprehensive technical reference created for the MicroASM pseudo-assembly language simulator. The complete documentation has been extracted from the codebase and organized into a single reference manual.

## Document Location
- **File:** `MICROASM_TECHNICAL_REFERENCE.md` (55 KB)
- **Location:** `/home/user/microasm/MICROASM_TECHNICAL_REFERENCE.md`

## What Was Extracted

### 1. Complete Instruction Set (22 Instructions)

#### Data Transfer (3 Instructions)
- **MOV** - Move/Copy value between registers, immediates, and memory
- **LDR** - Load from memory into register
- **STR** - Store from register to memory

#### Arithmetic Operations (6 Instructions)
- **ADD** - Addition (Rdest + src)
- **SUB** - Subtraction (Rdest - src)
- **MOL** - Multiplication (Rdest * src) - "MOL" means multiply in Italian
- **DIV** - Division (Rdest / src with floor division)
- **INC** - Increment (Rdest + 1)
- **DEC** - Decrement (Rdest - 1)

#### Logical Operations (3 Instructions)
- **AND** - Bitwise AND (Rdest & src)
- **OR** - Bitwise OR (Rdest | src)
- **NOT** - Bitwise NOT (~Rdest)
- *Note: XOR is documented but NOT implemented in the executor*

#### Control Flow (6 Instructions)
- **JMP** - Unconditional jump to label
- **JZ** - Jump if Zero (conditional on ZF flag)
- **JNZ** - Jump if Not Zero (opposite of JZ)
- **JS** - Jump if Sign/Negative (conditional on SF flag)
- **JNS** - Jump if Not Sign (conditional on SF flag, jumps if result ≥ 0)
- **CMP** - Compare two operands (non-destructive)

#### Stack Operations (4 Instructions)
- **PUSH** - Push value onto stack
- **POP** - Pop value from stack
- **CALL** - Call subroutine (push return address, jump)
- **RET** - Return from subroutine (pop return address)

#### I/O and System (2 Instructions)
- **OUT** - Output value to output log
- **HLT** - Halt program execution

### 2. CPU Architecture

#### General-Purpose Registers
- **4 Registers:** R0, R1, R2, R3
- **Size:** 16-bit signed integer
- **Range:** -32,768 to 32,767
- **Purpose:** Store values, perform calculations

#### Special-Purpose Registers
- **PC (Program Counter):** Points to current instruction (0 to instruction_count-1)
- **SP (Stack Pointer):** Manages stack (0 to 256, initialized to 256)
- **ZF (Zero Flag):** Set to 1 if operation result = 0
- **SF (Sign Flag):** Set to 1 if operation result < 0

#### Memory Architecture
- **Size:** 256 cells (addresses 0-255)
- **Cell Size:** 16-bit signed integer (-32,768 to 32,767)
- **Initial State:** All cells = 0
- **Stack Location:** Top of memory, grows downward from address 256

### 3. Complete Syntax Rules

#### Instruction Format
```
OPCODE operand1, operand2  ; optional comment
```

#### Comment Syntax
- Single-line comments start with `;`
- Can be full-line or inline
- Ignored by assembler

#### Label Syntax
```
LABEL_NAME:
  instruction
  JMP LABEL_NAME
```

#### Case Sensitivity
- Opcodes: Case-insensitive (MOV = mov)
- Registers: Case-insensitive (R0 = r0)
- Labels: Case-insensitive but conventionally uppercase
- Values: Decimal numbers only

### 4. Addressing Modes (4 Modes)

#### Immediate Addressing
```
MOV R0, 42
```
Value directly in instruction

#### Register Addressing
```
MOV R0, R1
```
Value from register

#### Direct Memory Addressing
```
MOV R0, [100]
```
Literal address 0-255

#### Indirect Memory Addressing
```
MOV R1, 50
MOV R0, [R1]
```
Address from register value

### 5. Operand Types

#### Registers
- R0, R1, R2, R3 (case-insensitive)

#### Immediates (Literal Values)
- Range: -32,768 to 32,767
- Format: Decimal only
- Examples: 42, -100, 0

#### Direct Memory Addresses
- Range: 0-255
- Syntax: [0], [100], [255]

#### Indirect Memory Addresses
- Syntax: [R0], [R1], [R2], [R3]
- Register value must be 0-255 at runtime

#### Labels (for Jumps/Calls)
- Syntax: Identifier with letters, digits, underscores
- Convention: UPPERCASE

### 6. Flag System

#### Zero Flag (ZF)
- Set to 1 when operation result = 0
- Set to 0 when operation result ≠ 0
- Used by: JZ, JNZ instructions
- Set by: ADD, SUB, MOL, DIV, INC, DEC, AND, OR, NOT, CMP

#### Sign Flag (SF)
- Set to 1 when operation result < 0 (negative)
- Set to 0 when operation result ≥ 0 (zero or positive)
- Used by: JS instruction
- Set by: ADD, SUB, MOL, DIV, INC, DEC, AND, OR, NOT, CMP

#### Flag Persistence
- Flags remain set until modified by an operation
- Data movement instructions (MOV, PUSH, POP) don't affect flags
- Control flow instructions (JMP, JZ, JNZ, JS) read but don't modify flags

### 7. Example Programs (10 Examples)

1. **Simple Addition** - Basic arithmetic
2. **Factorial** - Loop with multiplication and countdown
3. **Loop with Counter** - Counting from 1 to 5
4. **Stack Operations** - PUSH/POP demonstration
5. **Subroutine Call** - CALL/RET with function
6. **Memory Access** - LDR/STR operations
7. **Indirect Addressing** - Using registers as memory pointers
8. **Conditional Logic** - CMP with branching
9. **Bitwise Operations** - AND, OR, NOT examples
10. **Nested Loops** - Multiple levels of loop nesting

### 8. Error Handling

#### Compile-Time Errors
- Invalid instruction
- Undefined label reference
- Missing required operand
- Out of range immediate value
- Invalid memory address (not 0-255)

#### Runtime Errors
- Stack overflow (SP ≤ 0)
- Stack underflow (SP ≥ 256)
- Division by zero
- Arithmetic overflow (result exceeds ±32,767)
- Invalid memory access (register value outside 0-255)
- Execution out of bounds (missing HLT)
- Execution limit exceeded (>100,000 instructions - infinite loop protection)

#### Error Reporting
- Each error includes line number
- Clear error message
- Execution halts immediately on first error

### 9. Data Flow and Bus Operations

#### Three Buses
1. **Data Bus** (16-bit) - Transfer data values
2. **Address Bus** (8-bit) - Specify memory addresses (0-255)
3. **Control Bus** - Signals (READ, WRITE, HALT)

#### Instruction Execution Phases
1. **Fetch** - Load instruction from memory
2. **Decode** - Interpret opcode and operands
3. **Execute** - Perform operation
4. **Update** - Increment PC (unless jump)

#### Examples of Data Flow
- MOV R0, 42: Immediate → Data Bus → R0
- ADD R0, R1: R0 → ALU, R1 → ALU, ALU Output → R0, Flags Updated
- LDR R0, [100]: Address → Address Bus, Memory[100] → Data Bus → R0
- PUSH R0: SP--, R0 → Data Bus → Memory[SP]

## Extracted From

### Source Code Files
- `/src/types/microasm.ts` - Type definitions
- `/src/data/cpuArchitecture.ts` - Instruction definitions and bus examples
- `/src/utils/assembler.ts` - Parser and validation logic
- `/src/utils/executor.ts` - Execution engine
- `/src/utils/formatter.ts` - Display formatting
- `/src/components/DocumentationDialog.tsx` - Built-in documentation
- `/src/pages/Index.tsx` - Example programs

### Documentation Components
- CPU instruction set with detailed specifications
- Register and memory architecture
- Addressing modes and operand types
- Flag behavior and usage
- Bus operations and data flow
- Complete instruction examples
- Error conditions and handling

## Key Discoveries

### 1. XOR Instruction
- **Status:** Documented but NOT implemented
- **Location:** In `cpuArchitecture.ts` for reference
- **Note:** Programs cannot use XOR; will cause "Unknown instruction" error
- **Implemented instruction count:** 20 (not 21)

### 2. Stack Behavior
- **Initial SP:** 256 (empty stack)
- **Growth Direction:** Downward (toward address 0)
- **Push Mechanism:** Pre-decrement (SP--, then write)
- **Pop Mechanism:** Post-increment (read, then SP++)
- **Full Stack:** SP = 0

### 3. Register Clamping
- All arithmetic operations clamp results to 16-bit range
- Overflow errors are reported but values are clamped to ±32,767
- Division uses floor division (rounds toward negative infinity)

### 4. Label Resolution
- Labels point to instruction indices (0-based)
- Labels are case-insensitive but conventionally uppercase
- Labels must be defined before or after (no forward declaration required - validation done in second pass)

### 5. Stack Pointer Initialization
- SP = 256 (not 255) for empty stack
- This allows 256 cells of stack space (addresses 0-255)
- Each PUSH decreases SP by 1
- Each POP increases SP by 1

### 6. Execution Limits
- Maximum 100,000 instructions per program
- Protects against infinite loops
- Provides clear error message if exceeded

## Usage Recommendations

### For Students
1. Read the "Architecture Overview" section first
2. Study the "CPU Architecture" section for register/memory details
3. Review "Complete Instruction Set" for each instruction
4. Practice with "Example Programs" section
5. Use "Error Handling" for debugging

### For Instructors
1. Use syntax rules section for teaching proper syntax
2. Show addressing modes for memory access concepts
3. Demonstrate flag behavior with comparisons
4. Use data flow diagrams for CPU architecture teaching
5. Reference error handling for common student mistakes

### For Developers
1. Review "Complete Instruction Set" for implementation details
2. Check "Error Handling" for all error conditions
3. Study "Data Flow" section for bus operations
4. Reference flag update rules for correct behavior

## Document Statistics

| Category | Count |
|----------|-------|
| Instructions | 22 |
| Registers | 8 (4 general + 4 special) |
| Addressing Modes | 4 |
| Example Programs | 10 |
| Error Types | 8 |
| Memory Cells | 256 |
| Bus Types | 3 |
| Instruction Categories | 6 |

## Completeness Notes

This documentation covers:
- ✓ All 22 instruction definitions
- ✓ All register types and sizes
- ✓ Complete syntax rules
- ✓ All 4 addressing modes
- ✓ Flag behavior and usage
- ✓ 10 complete example programs
- ✓ All error conditions
- ✓ Data flow and bus operations
- ✓ Stack behavior details
- ✓ Memory architecture

This is a comprehensive technical manual suitable for:
- Educational use (students learning assembly)
- Reference material (developers building tools)
- Implementation guide (simulator creators)
- API documentation (programmatic access)

---

**Document Version:** 1.0  
**Created:** 2025-10-30  
**Extracted from:** MicroASM Simulator Codebase  
**Author Information:** Prof. Nicolò Carello  
**Contact:** info@nicolocarello.it
