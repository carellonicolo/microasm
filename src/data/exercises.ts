export interface Exercise {
  id: number;
  title: string;
  difficulty: 'facile' | 'medio' | 'difficile';
  category: string;
  description: string;
  requirements: string[];
  expectedOutput?: string;
}

export const EXERCISES: Exercise[] = [
  // LIVELLO 1: FONDAMENTI (Esercizi 1-5) ⭐
  {
    id: 1,
    title: "Il Primo Programma",
    difficulty: 'facile',
    category: "Movimento Dati",
    description: "Scrivi un programma che carica il valore 42 nel registro R0 e lo visualizza nell'output.",
    requirements: [
      "Usare l'istruzione MOV per caricare il valore",
      "Usare l'istruzione OUT per visualizzare R0",
      "Terminare con HLT"
    ],
    expectedOutput: "R0 = 42"
  },
  {
    id: 2,
    title: "Somma di Due Numeri",
    difficulty: 'facile',
    category: "Aritmetica Base",
    description: "Calcola la somma di 15 e 27. Memorizza i numeri in R0 e R1, esegui l'addizione in R0 e visualizza il risultato.",
    requirements: [
      "Caricare 15 in R0",
      "Caricare 27 in R1",
      "Sommare R1 a R0",
      "Visualizzare il risultato in R0"
    ],
    expectedOutput: "R0 = 42"
  },
  {
    id: 3,
    title: "Incremento in Loop",
    difficulty: 'facile',
    category: "Controllo Flusso",
    description: "Crea un contatore che parte da 0 e si incrementa fino a 5. Visualizza ogni valore. Usa un'etichetta per il loop.",
    requirements: [
      "Inizializzare un contatore a 0",
      "Usare un'etichetta per creare un loop",
      "Incrementare il contatore ad ogni iterazione",
      "Visualizzare ogni valore",
      "Fermarsi quando il contatore raggiunge 5"
    ],
    expectedOutput: "6 righe di output:\nR0 = 0\nR0 = 1\nR0 = 2\nR0 = 3\nR0 = 4\nR0 = 5"
  },
  {
    id: 4,
    title: "Differenza di Numeri",
    difficulty: 'facile',
    category: "Aritmetica",
    description: "Calcola la differenza tra 100 e 37. Il risultato deve essere positivo.",
    requirements: [
      "Caricare 100 in R0",
      "Sottrarre 37 da R0",
      "Visualizzare il risultato"
    ],
    expectedOutput: "R0 = 63"
  },
  {
    id: 5,
    title: "Uso della Memoria",
    difficulty: 'facile',
    category: "Memoria",
    description: "Salva il valore 99 nella cella di memoria [10], poi caricalo in R0 e visualizzalo.",
    requirements: [
      "Salvare 99 nella memoria all'indirizzo 10",
      "Leggere il valore dalla memoria",
      "Caricare in R0",
      "Visualizzare R0"
    ],
    expectedOutput: "R0 = 99"
  },

  // LIVELLO 2: INTERMEDIO (Esercizi 6-12) ⭐⭐
  {
    id: 6,
    title: "Moltiplicazione per Addizioni Successive",
    difficulty: 'medio',
    category: "Algoritmi Base",
    description: "Calcola 7 × 4 usando solo addizioni ripetute (senza usare MOL). Usa un loop.",
    requirements: [
      "NON usare l'istruzione MOL",
      "Implementare la moltiplicazione tramite addizioni successive",
      "Usare un registro come contatore",
      "Usare un registro come accumulatore",
      "Il risultato finale deve essere 28"
    ],
    expectedOutput: "R0 = 28"
  },
  {
    id: 7,
    title: "Valore Massimo",
    difficulty: 'medio',
    category: "Confronto e Logica",
    description: "Confronta due numeri (R0 = 45, R1 = 38) e salva il maggiore in R2. Visualizza R2.",
    requirements: [
      "Caricare 45 in R0 e 38 in R1",
      "Confrontare i due valori",
      "Salvare il maggiore in R2",
      "Visualizzare R2"
    ],
    expectedOutput: "R2 = 45"
  },
  {
    id: 8,
    title: "Somma di un Array",
    difficulty: 'medio',
    category: "Memoria e Loop",
    description: "Crea un array di 5 numeri in memoria (celle 0-4) con valori: 10, 20, 30, 40, 50. Calcola la somma totale e visualizzala.",
    requirements: [
      "Inizializzare le celle di memoria 0-4 con i valori indicati",
      "Usare un loop per iterare sull'array",
      "Sommare tutti i valori in un accumulatore",
      "Visualizzare il risultato finale"
    ],
    expectedOutput: "R0 = 150"
  },
  {
    id: 9,
    title: "Pari o Dispari",
    difficulty: 'medio',
    category: "Operazioni Logiche",
    description: "Determina se un numero in R0 è pari o dispari. Visualizza 0 se pari, 1 se dispari.",
    requirements: [
      "Usare un numero a scelta in R0 (es. 17)",
      "Determinare se è pari o dispari",
      "Salvare 0 in R0 se pari, 1 se dispari",
      "Visualizzare R0"
    ],
    expectedOutput: "R0 = 1 (per numeri dispari)\nR0 = 0 (per numeri pari)"
  },
  {
    id: 10,
    title: "Stack: Inversione di Valori",
    difficulty: 'medio',
    category: "Stack",
    description: "Carica tre valori (5, 10, 15) in R0, R1, R2. Usa lo stack per scambiarli (R0↔R2). Visualizza i tre registri dopo lo scambio.",
    requirements: [
      "Inizializzare R0=5, R1=10, R2=15",
      "Usare PUSH e POP per scambiare R0 e R2",
      "Non modificare R1",
      "Visualizzare tutti e tre i registri alla fine"
    ],
    expectedOutput: "R0 = 15\nR1 = 10\nR2 = 5"
  },
  {
    id: 11,
    title: "Conta i Numeri Positivi",
    difficulty: 'medio',
    category: "Array e Condizioni",
    description: "In memoria (celle 0-4) ci sono i valori: -5, 10, -3, 7, 0. Conta quanti sono positivi (>0) e visualizza il conteggio.",
    requirements: [
      "Inizializzare le celle di memoria con i valori indicati",
      "Iterare su tutte le celle",
      "Contare solo i valori strettamente positivi (> 0)",
      "Visualizzare il conteggio finale"
    ],
    expectedOutput: "R3 = 2"
  },
  {
    id: 12,
    title: "Divisione per Sottrazioni Successive",
    difficulty: 'medio',
    category: "Algoritmi",
    description: "Calcola 20 ÷ 3 usando solo sottrazioni ripetute (senza usare DIV). Visualizza il quoziente (R0) e il resto (R1).",
    requirements: [
      "NON usare l'istruzione DIV",
      "Implementare la divisione tramite sottrazioni successive",
      "Calcolare sia il quoziente che il resto",
      "Visualizzare entrambi i risultati"
    ],
    expectedOutput: "R0 = 6 (quoziente)\nR1 = 2 (resto)"
  },

  // LIVELLO 3: AVANZATO (Esercizi 13-20) ⭐⭐⭐
  {
    id: 13,
    title: "Fattoriale Iterativo",
    difficulty: 'difficile',
    category: "Algoritmi Avanzati",
    description: "Calcola il fattoriale di 6 (6! = 720). Usa un approccio iterativo con loop.",
    requirements: [
      "Calcolare 6! = 6 × 5 × 4 × 3 × 2 × 1",
      "Usare un approccio iterativo (non ricorsivo)",
      "Il risultato deve essere 720",
      "Visualizzare il risultato"
    ],
    expectedOutput: "R0 = 720"
  },
  {
    id: 14,
    title: "Subroutine: Raddoppio",
    difficulty: 'difficile',
    category: "Subroutine",
    description: "Crea una subroutine 'RADDOPPIA' che raddoppia il valore in R0. Chiamala tre volte partendo da R0=5. Visualizza il risultato finale.",
    requirements: [
      "Creare una subroutine con etichetta RADDOPPIA",
      "La subroutine deve raddoppiare il valore in R0",
      "Usare CALL e RET correttamente",
      "Chiamare la subroutine 3 volte",
      "Partire da R0=5"
    ],
    expectedOutput: "R0 = 40"
  },
  {
    id: 15,
    title: "Sequenza di Fibonacci",
    difficulty: 'difficile',
    category: "Algoritmi Classici",
    description: "Genera i primi 7 numeri della sequenza di Fibonacci (0, 1, 1, 2, 3, 5, 8). Visualizza ciascun numero.",
    requirements: [
      "Generare la sequenza: 0, 1, 1, 2, 3, 5, 8",
      "Visualizzare ogni numero della sequenza",
      "Usare un loop per generare i numeri",
      "Fermarsi dopo il settimo numero"
    ],
    expectedOutput: "7 righe:\nR0 = 0\nR0 = 1\nR0 = 1\nR0 = 2\nR0 = 3\nR0 = 5\nR0 = 8"
  },
  {
    id: 16,
    title: "Ricerca in Array",
    difficulty: 'difficile',
    category: "Ricerca e Memoria",
    description: "Crea un array in memoria (celle 0-6) con valori: 12, 45, 7, 23, 56, 19, 34. Cerca il valore 23 e visualizza la sua posizione (indice).",
    requirements: [
      "Inizializzare l'array in memoria",
      "Cercare il valore 23",
      "Salvare la posizione trovata in un registro",
      "Visualizzare l'indice (dovrebbe essere 3)"
    ],
    expectedOutput: "R2 = 3"
  },
  {
    id: 17,
    title: "Ordinamento: Bubble Sort di 4 Elementi",
    difficulty: 'difficile',
    category: "Algoritmi di Ordinamento",
    description: "Implementa un Bubble Sort semplificato per ordinare 4 numeri in memoria (celle 0-3): 30, 10, 40, 20. Visualizza l'array ordinato.",
    requirements: [
      "Inizializzare le celle 0-3 con: 30, 10, 40, 20",
      "Implementare l'algoritmo Bubble Sort",
      "Ordinare in ordine crescente",
      "Visualizzare tutti e 4 i valori ordinati"
    ],
    expectedOutput: "4 righe:\nR0 = 10\nR0 = 20\nR0 = 30\nR0 = 40"
  },
  {
    id: 18,
    title: "Subroutine Ricorsiva: Potenza",
    difficulty: 'difficile',
    category: "Ricorsione",
    description: "Calcola 2^5 usando una subroutine ricorsiva. Gestisci lo stack correttamente.",
    requirements: [
      "Creare una subroutine ricorsiva per il calcolo della potenza",
      "Calcolare 2^5 = 32",
      "Gestire correttamente lo stack per i parametri e i valori di ritorno",
      "Implementare il caso base (esponente = 0 → ritorna 1)"
    ],
    expectedOutput: "R0 = 32"
  },
  {
    id: 19,
    title: "Numero Primo",
    difficulty: 'difficile',
    category: "Algoritmi Matematici",
    description: "Verifica se un numero in R0 (es. 17) è primo. Visualizza 1 se primo, 0 se non primo.",
    requirements: [
      "Caricare un numero in R0 (es. 17)",
      "Verificare se è primo",
      "Salvare 1 in R0 se primo, 0 se non primo",
      "Visualizzare il risultato"
    ],
    expectedOutput: "R0 = 1 (per 17, che è primo)\nR0 = 0 (per numeri non primi)"
  },
  {
    id: 20,
    title: "MCD - Algoritmo di Euclide",
    difficulty: 'difficile',
    category: "Algoritmi Classici",
    description: "Calcola il MCD (Massimo Comun Divisore) di due numeri (R0 = 48, R1 = 18) usando l'algoritmo di Euclide. Visualizza il risultato.",
    requirements: [
      "Implementare l'algoritmo di Euclide",
      "Calcolare MCD(48, 18)",
      "Il risultato deve essere 6",
      "Visualizzare il risultato"
    ],
    expectedOutput: "R2 = 6"
  }
];

export const generateExerciseTemplate = (exercise: Exercise): string => {
  return `; ========================================
; ESERCIZIO ${exercise.id}: ${exercise.title.toUpperCase()}
; Difficoltà: ${exercise.difficulty.toUpperCase()}
; ========================================
;
; CONSEGNA:
; ${exercise.description}
;
; REQUISITI:
${exercise.requirements.map(req => `; - ${req}`).join('\n')}
;
; OUTPUT ATTESO:
; ${exercise.expectedOutput || 'Vedi descrizione'}
;
; ========================================
; SCRIVI IL TUO CODICE QUI SOTTO:
; ========================================

; Il tuo codice qui...

HLT  ; Non dimenticare di terminare il programma!
`;
};
