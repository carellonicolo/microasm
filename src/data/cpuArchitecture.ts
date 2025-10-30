export interface InstructionDetail {
  opcode: string;
  syntax: string;
  description: string;
  example: string;
  flags: string;
  cycles: number;
  dataFlow: string[];
}

export interface InstructionCategory {
  category: string;
  instructions: InstructionDetail[];
}

export const CPU_INSTRUCTIONS: InstructionCategory[] = [
  {
    category: 'Trasferimento Dati',
    instructions: [
      {
        opcode: 'MOV',
        syntax: 'MOV Rdest, src',
        description: 'Copia il valore sorgente nel registro destinazione',
        example: 'MOV R0, 42 ; R0 = 42',
        flags: 'Nessuno',
        cycles: 1,
        dataFlow: [
          'Se src è immediato: Data Bus ← src',
          'Se src è registro: Data Bus ← Rsrc',
          'Se src è memoria: Address Bus ← addr, Data Bus ← Memory[addr]',
          'Rdest ← Data Bus'
        ]
      },
      {
        opcode: 'LDR',
        syntax: 'LDR Rdest, [addr]',
        description: 'Carica il valore dalla memoria nel registro',
        example: 'LDR R0, [100] ; R0 = Memory[100]',
        flags: 'Nessuno',
        cycles: 2,
        dataFlow: [
          'Address Bus ← addr',
          'Control Bus ← READ',
          'Data Bus ← Memory[addr]',
          'Rdest ← Data Bus'
        ]
      },
      {
        opcode: 'STR',
        syntax: 'STR Rsrc, [addr]',
        description: 'Memorizza il valore del registro in memoria',
        example: 'STR R0, [100] ; Memory[100] = R0',
        flags: 'Nessuno',
        cycles: 2,
        dataFlow: [
          'Address Bus ← addr',
          'Data Bus ← Rsrc',
          'Control Bus ← WRITE',
          'Memory[addr] ← Data Bus'
        ]
      }
    ]
  },
  {
    category: 'Aritmetica',
    instructions: [
      {
        opcode: 'ADD',
        syntax: 'ADD Rdest, src',
        description: 'Somma src a Rdest e memorizza il risultato in Rdest',
        example: 'ADD R0, R1 ; R0 = R0 + R1',
        flags: 'ZF, SF',
        cycles: 1,
        dataFlow: [
          'Data Bus ← Rdest',
          'ALU Input A ← Data Bus',
          'Data Bus ← src',
          'ALU Input B ← Data Bus',
          'ALU Operation ← ADD',
          'Rdest ← ALU Output',
          'Flags ← ALU Flags'
        ]
      },
      {
        opcode: 'SUB',
        syntax: 'SUB Rdest, src',
        description: 'Sottrae src da Rdest e memorizza il risultato in Rdest',
        example: 'SUB R0, 5 ; R0 = R0 - 5',
        flags: 'ZF, SF',
        cycles: 1,
        dataFlow: [
          'Data Bus ← Rdest',
          'ALU Input A ← Data Bus',
          'Data Bus ← src',
          'ALU Input B ← Data Bus',
          'ALU Operation ← SUB',
          'Rdest ← ALU Output',
          'Flags ← ALU Flags'
        ]
      },
      {
        opcode: 'INC',
        syntax: 'INC Rdest',
        description: 'Incrementa Rdest di 1',
        example: 'INC R0 ; R0 = R0 + 1',
        flags: 'ZF, SF',
        cycles: 1,
        dataFlow: [
          'Data Bus ← Rdest',
          'ALU Input A ← Data Bus',
          'ALU Input B ← 1',
          'ALU Operation ← ADD',
          'Rdest ← ALU Output'
        ]
      },
      {
        opcode: 'DEC',
        syntax: 'DEC Rdest',
        description: 'Decrementa Rdest di 1',
        example: 'DEC R0 ; R0 = R0 - 1',
        flags: 'ZF, SF',
        cycles: 1,
        dataFlow: [
          'Data Bus ← Rdest',
          'ALU Input A ← Data Bus',
          'ALU Input B ← 1',
          'ALU Operation ← SUB',
          'Rdest ← ALU Output'
        ]
      },
      {
        opcode: 'MOL',
        syntax: 'MOL Rdest, src',
        description: 'Moltiplica Rdest per src (implementazione semplificata)',
        example: 'MOL R0, R1 ; R0 = R0 * R1',
        flags: 'ZF, SF',
        cycles: 3,
        dataFlow: [
          'ALU Input A ← Rdest',
          'ALU Input B ← src',
          'ALU Operation ← MUL',
          'Rdest ← ALU Output'
        ]
      }
    ]
  },
  {
    category: 'Logica',
    instructions: [
      {
        opcode: 'AND',
        syntax: 'AND Rdest, src',
        description: 'AND logico bit a bit tra Rdest e src',
        example: 'AND R0, R1 ; R0 = R0 & R1',
        flags: 'ZF, SF',
        cycles: 1,
        dataFlow: [
          'ALU Input A ← Rdest',
          'ALU Input B ← src',
          'ALU Operation ← AND',
          'Rdest ← ALU Output'
        ]
      },
      {
        opcode: 'OR',
        syntax: 'OR Rdest, src',
        description: 'OR logico bit a bit tra Rdest e src',
        example: 'OR R0, R1 ; R0 = R0 | R1',
        flags: 'ZF, SF',
        cycles: 1,
        dataFlow: [
          'ALU Input A ← Rdest',
          'ALU Input B ← src',
          'ALU Operation ← OR',
          'Rdest ← ALU Output'
        ]
      },
      {
        opcode: 'XOR',
        syntax: 'XOR Rdest, src',
        description: 'XOR logico bit a bit tra Rdest e src',
        example: 'XOR R0, R1 ; R0 = R0 ^ R1',
        flags: 'ZF, SF',
        cycles: 1,
        dataFlow: [
          'ALU Input A ← Rdest',
          'ALU Input B ← src',
          'ALU Operation ← XOR',
          'Rdest ← ALU Output'
        ]
      },
      {
        opcode: 'NOT',
        syntax: 'NOT Rdest',
        description: 'NOT logico bit a bit di Rdest',
        example: 'NOT R0 ; R0 = ~R0',
        flags: 'ZF, SF',
        cycles: 1,
        dataFlow: [
          'ALU Input A ← Rdest',
          'ALU Operation ← NOT',
          'Rdest ← ALU Output'
        ]
      }
    ]
  },
  {
    category: 'Controllo di Flusso',
    instructions: [
      {
        opcode: 'JMP',
        syntax: 'JMP label',
        description: 'Salta incondizionatamente all\'etichetta specificata',
        example: 'JMP LOOP ; PC = indirizzo di LOOP',
        flags: 'Nessuno',
        cycles: 1,
        dataFlow: [
          'Address Bus ← label_address',
          'PC ← Address Bus'
        ]
      },
      {
        opcode: 'JZ',
        syntax: 'JZ label',
        description: 'Salta se Zero Flag è settato (risultato = 0)',
        example: 'JZ END ; se ZF=1 allora PC = END',
        flags: 'Legge ZF',
        cycles: 1,
        dataFlow: [
          'Control Unit ← ZF',
          'Se ZF=1: Address Bus ← label_address, PC ← Address Bus',
          'Se ZF=0: PC = PC + 1'
        ]
      },
      {
        opcode: 'JNZ',
        syntax: 'JNZ label',
        description: 'Salta se Zero Flag non è settato (risultato ≠ 0)',
        example: 'JNZ LOOP ; se ZF=0 allora PC = LOOP',
        flags: 'Legge ZF',
        cycles: 1,
        dataFlow: [
          'Control Unit ← ZF',
          'Se ZF=0: PC ← label_address',
          'Se ZF=1: PC = PC + 1'
        ]
      },
      {
        opcode: 'CMP',
        syntax: 'CMP Ra, Rb',
        description: 'Confronta Ra con Rb (esegue Ra - Rb e aggiorna i flag)',
        example: 'CMP R0, R1 ; imposta flag in base a R0-R1',
        flags: 'ZF, SF',
        cycles: 1,
        dataFlow: [
          'ALU Input A ← Ra',
          'ALU Input B ← Rb',
          'ALU Operation ← SUB',
          'Flags ← ALU Flags (risultato scartato)'
        ]
      }
    ]
  },
  {
    category: 'Stack',
    instructions: [
      {
        opcode: 'PUSH',
        syntax: 'PUSH src',
        description: 'Inserisce un valore nello stack (decrementa SP, poi scrive)',
        example: 'PUSH R0 ; SP--, Memory[SP] = R0',
        flags: 'Nessuno',
        cycles: 2,
        dataFlow: [
          'ALU Input A ← SP',
          'ALU Input B ← 1',
          'ALU Operation ← SUB',
          'SP ← ALU Output',
          'Address Bus ← SP',
          'Data Bus ← src',
          'Control Bus ← WRITE',
          'Memory[SP] ← Data Bus'
        ]
      },
      {
        opcode: 'POP',
        syntax: 'POP Rdest',
        description: 'Estrae un valore dallo stack (legge, poi incrementa SP)',
        example: 'POP R0 ; R0 = Memory[SP], SP++',
        flags: 'Nessuno',
        cycles: 2,
        dataFlow: [
          'Address Bus ← SP',
          'Control Bus ← READ',
          'Data Bus ← Memory[SP]',
          'Rdest ← Data Bus',
          'ALU Input A ← SP',
          'ALU Input B ← 1',
          'ALU Operation ← ADD',
          'SP ← ALU Output'
        ]
      },
      {
        opcode: 'CALL',
        syntax: 'CALL label',
        description: 'Chiama una subroutine (push PC+1, poi salta)',
        example: 'CALL FUNC ; push(PC+1), PC = FUNC',
        flags: 'Nessuno',
        cycles: 3,
        dataFlow: [
          'SP ← SP - 1',
          'Memory[SP] ← PC + 1 (indirizzo di ritorno)',
          'PC ← label_address'
        ]
      },
      {
        opcode: 'RET',
        syntax: 'RET',
        description: 'Ritorna da una subroutine (pop PC)',
        example: 'RET ; PC = pop(), torna al chiamante',
        flags: 'Nessuno',
        cycles: 2,
        dataFlow: [
          'PC ← Memory[SP] (indirizzo di ritorno)',
          'SP ← SP + 1'
        ]
      }
    ]
  },
  {
    category: 'I/O e Sistema',
    instructions: [
      {
        opcode: 'OUT',
        syntax: 'OUT src',
        description: 'Stampa il valore di src nel log di output',
        example: 'OUT R0 ; stampa il valore di R0',
        flags: 'Nessuno',
        cycles: 1,
        dataFlow: [
          'Data Bus ← src',
          'Output Device ← Data Bus'
        ]
      },
      {
        opcode: 'HLT',
        syntax: 'HLT',
        description: 'Ferma l\'esecuzione del programma',
        example: 'HLT ; termina',
        flags: 'Nessuno',
        cycles: 1,
        dataFlow: [
          'Control Unit ← HALT signal',
          'Execution stops'
        ]
      }
    ]
  }
];

export interface BusStep {
  phase: string;
  desc: string;
  activeBuses: ('data' | 'address' | 'control')[];
  state?: Record<string, number | boolean | string>;
}

export interface BusExample {
  instruction: string;
  title: string;
  steps: BusStep[];
}

export const BUS_EXAMPLES: Record<string, BusExample> = {
  MOV_IMMEDIATE: {
    instruction: 'MOV R0, 42',
    title: 'Trasferimento Immediato',
    steps: [
      {
        phase: 'Fetch',
        desc: 'PC → Address Bus, Memory[PC] → Data Bus → IR',
        activeBuses: ['address', 'data', 'control'],
        state: { PC: 0 }
      },
      {
        phase: 'Decode',
        desc: 'IR analizzato: Opcode=MOV, Rdest=R0, src=42',
        activeBuses: [],
        state: {}
      },
      {
        phase: 'Execute',
        desc: '42 → Data Bus → R0',
        activeBuses: ['data'],
        state: { R0: 42 }
      },
      {
        phase: 'Update PC',
        desc: 'PC = PC + 1',
        activeBuses: [],
        state: { PC: 1 }
      }
    ]
  },
  LDR_MEMORY: {
    instruction: 'LDR R0, [100]',
    title: 'Lettura da Memoria',
    steps: [
      {
        phase: 'Fetch',
        desc: 'Fetch istruzione da Memory[PC]',
        activeBuses: ['address', 'data', 'control'],
        state: { PC: 0 }
      },
      {
        phase: 'Decode',
        desc: 'Decodifica: LDR R0, [100]',
        activeBuses: [],
        state: {}
      },
      {
        phase: 'Execute - Addr',
        desc: '100 → Address Bus',
        activeBuses: ['address'],
        state: {}
      },
      {
        phase: 'Execute - Read',
        desc: 'Control Bus = READ, Memory[100] → Data Bus',
        activeBuses: ['data', 'control'],
        state: {}
      },
      {
        phase: 'Execute - Store',
        desc: 'Data Bus → R0',
        activeBuses: ['data'],
        state: { R0: 'Memory[100]' }
      },
      {
        phase: 'Update PC',
        desc: 'PC = PC + 1',
        activeBuses: [],
        state: { PC: 1 }
      }
    ]
  },
  PUSH: {
    instruction: 'PUSH R0',
    title: 'Push sullo Stack',
    steps: [
      {
        phase: 'Fetch',
        desc: 'Fetch istruzione da Memory[PC]',
        activeBuses: ['address', 'data', 'control'],
        state: { PC: 0, SP: 256 }
      },
      {
        phase: 'Decode',
        desc: 'Decodifica: PUSH R0',
        activeBuses: [],
        state: {}
      },
      {
        phase: 'Execute - Dec SP',
        desc: 'SP = SP - 1 (ALU)',
        activeBuses: [],
        state: { SP: 255 }
      },
      {
        phase: 'Execute - Addr',
        desc: 'SP → Address Bus (255)',
        activeBuses: ['address'],
        state: {}
      },
      {
        phase: 'Execute - Write',
        desc: 'R0 → Data Bus, Control Bus = WRITE',
        activeBuses: ['data', 'control'],
        state: {}
      },
      {
        phase: 'Execute - Store',
        desc: 'Data Bus → Memory[255]',
        activeBuses: ['data'],
        state: { 'Memory[255]': 'R0' }
      },
      {
        phase: 'Update PC',
        desc: 'PC = PC + 1',
        activeBuses: [],
        state: { PC: 1 }
      }
    ]
  },
  POP: {
    instruction: 'POP R1',
    title: 'Pop dallo Stack',
    steps: [
      {
        phase: 'Fetch',
        desc: 'Fetch istruzione da Memory[PC]',
        activeBuses: ['address', 'data', 'control'],
        state: { PC: 1, SP: 255 }
      },
      {
        phase: 'Decode',
        desc: 'Decodifica: POP R1',
        activeBuses: [],
        state: {}
      },
      {
        phase: 'Execute - Addr',
        desc: 'SP → Address Bus (255)',
        activeBuses: ['address'],
        state: {}
      },
      {
        phase: 'Execute - Read',
        desc: 'Control Bus = READ, Memory[255] → Data Bus',
        activeBuses: ['data', 'control'],
        state: {}
      },
      {
        phase: 'Execute - Store',
        desc: 'Data Bus → R1',
        activeBuses: ['data'],
        state: { R1: 'Memory[255]' }
      },
      {
        phase: 'Execute - Inc SP',
        desc: 'SP = SP + 1 (ALU)',
        activeBuses: [],
        state: { SP: 256 }
      },
      {
        phase: 'Update PC',
        desc: 'PC = PC + 1',
        activeBuses: [],
        state: { PC: 2 }
      }
    ]
  },
  ADD: {
    instruction: 'ADD R0, R1',
    title: 'Addizione ALU',
    steps: [
      {
        phase: 'Fetch',
        desc: 'Fetch istruzione da Memory[PC]',
        activeBuses: ['address', 'data', 'control'],
        state: { PC: 2, R0: 10, R1: 5 }
      },
      {
        phase: 'Decode',
        desc: 'Decodifica: ADD R0, R1',
        activeBuses: [],
        state: {}
      },
      {
        phase: 'Execute - Load A',
        desc: 'R0 → Data Bus → ALU Input A',
        activeBuses: ['data'],
        state: { 'ALU A': 10 }
      },
      {
        phase: 'Execute - Load B',
        desc: 'R1 → Data Bus → ALU Input B',
        activeBuses: ['data'],
        state: { 'ALU B': 5 }
      },
      {
        phase: 'Execute - ALU Op',
        desc: 'ALU esegue A + B = 15',
        activeBuses: [],
        state: { 'ALU Out': 15 }
      },
      {
        phase: 'Execute - Store',
        desc: 'ALU Output → Data Bus → R0',
        activeBuses: ['data'],
        state: { R0: 15 }
      },
      {
        phase: 'Execute - Flags',
        desc: 'Aggiorna ZF=0, SF=0',
        activeBuses: [],
        state: { ZF: 0, SF: 0 }
      },
      {
        phase: 'Update PC',
        desc: 'PC = PC + 1',
        activeBuses: [],
        state: { PC: 3 }
      }
    ]
  },
  JZ: {
    instruction: 'JZ LOOP',
    title: 'Salto Condizionato',
    steps: [
      {
        phase: 'Fetch',
        desc: 'Fetch istruzione da Memory[PC]',
        activeBuses: ['address', 'data', 'control'],
        state: { PC: 3, ZF: 1 }
      },
      {
        phase: 'Decode',
        desc: 'Decodifica: JZ LOOP (addr=10)',
        activeBuses: [],
        state: {}
      },
      {
        phase: 'Execute - Check',
        desc: 'Control Unit legge ZF = 1 (condizione vera)',
        activeBuses: [],
        state: {}
      },
      {
        phase: 'Execute - Jump',
        desc: 'Indirizzo LOOP (10) → Address Bus → PC',
        activeBuses: ['address'],
        state: { PC: 10 }
      }
    ]
  }
};
