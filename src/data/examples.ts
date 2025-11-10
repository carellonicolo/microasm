export const EXAMPLE_PROGRAMS = {
  factorial: `; Esempio: Calcolo fattoriale
MOV R0, 5          ; Numero per calcolare il fattoriale
MOV R1, 1          ; Risultato (inizia con 1)

LOOP:
CMP R0, 0          ; Confronta R0 con 0
JZ END             ; Se R0 = 0, salta a END
MOL R1, R0         ; R1 = R1 * R0
DEC R0             ; R0 = R0 - 1
JMP LOOP           ; Ripeti il loop

END:
OUT R1             ; Stampa il risultato
HLT                ; Termina il programma`,

  stackDemo: `; Esempio: Uso dello Stack
; Mostra come funzionano PUSH e POP

MOV R0, 10         ; R0 = 10
MOV R1, 20         ; R1 = 20
MOV R2, 30         ; R2 = 30

; Salva i valori nello stack
PUSH R0            ; Stack: [10], SP: 256→255
PUSH R1            ; Stack: [10, 20], SP: 255→254
PUSH R2            ; Stack: [10, 20, 30], SP: 254→253

; Ora modifica i registri
MOV R0, 0
MOV R1, 0
MOV R2, 0

; Recupera i valori dallo stack (ordine inverso!)
POP R2             ; R2 = 30, Stack: [10, 20], SP: 253→254
POP R1             ; R1 = 20, Stack: [10], SP: 254→255
POP R0             ; R0 = 10, Stack: [], SP: 255→256

; Stampa i risultati
OUT R0             ; Dovrebbe stampare 10
OUT R1             ; Dovrebbe stampare 20
OUT R2             ; Dovrebbe stampare 30
HLT`,

  subroutine: `; Esempio: Chiamata a Subroutine
; Dimostra l'uso di CALL e RET con lo stack

MOV R0, 5          ; Argomento per la funzione
CALL DOUBLE        ; Chiama la subroutine (pushia PC nello stack)
OUT R0             ; Stampa il risultato (dovrebbe essere 10)
HLT

DOUBLE:
; Subroutine che raddoppia R0
PUSH R1            ; Salva R1 (lo useremo temporaneamente)
MOV R1, R0         ; R1 = R0
ADD R0, R1         ; R0 = R0 + R1 (raddoppia)
POP R1             ; Ripristina R1
RET                ; Torna al chiamante (poppa PC dallo stack)`,

  signCheck: `; Esempio: Test del segno con JNS
; Controlla se un numero è positivo, negativo o zero

MOV R0, 10         ; Cambia questo valore per testare

; Test se zero
CMP R0, 0
JZ IS_ZERO

; Test se positivo (>= 0 e != 0, quindi > 0)
CMP R0, 0
JNS IS_POSITIVE

; Se arriviamo qui, è negativo
IS_NEGATIVE:
MOV R1, -1         ; R1 = -1 (codice per negativo)
JMP END

IS_POSITIVE:
MOV R1, 1          ; R1 = 1 (codice per positivo)
JMP END

IS_ZERO:
MOV R1, 0          ; R1 = 0 (codice per zero)

END:
OUT R1             ; Stampa: -1, 0, o 1
HLT`
};

export const EXAMPLES_METADATA = [
  {
    id: 1,
    title: "Calcolo Fattoriale",
    category: "Aritmetica",
    difficulty: "principiante",
    description: "Calcola il fattoriale di un numero usando un loop. Introduce MOV, CMP, JZ, MOL, DEC, JMP.",
    code: EXAMPLE_PROGRAMS.factorial
  },
  {
    id: 2,
    title: "Uso dello Stack",
    category: "Memoria",
    difficulty: "intermedio",
    description: "Dimostra PUSH e POP per salvare e recuperare valori nello stack. Ordine LIFO (Last In First Out).",
    code: EXAMPLE_PROGRAMS.stackDemo
  },
  {
    id: 3,
    title: "Chiamata Subroutine",
    category: "Subroutine",
    difficulty: "intermedio",
    description: "Usa CALL e RET per creare una funzione riutilizzabile. Dimostra gestione dello stack per return address.",
    code: EXAMPLE_PROGRAMS.subroutine
  },
  {
    id: 4,
    title: "Test del Segno",
    category: "Controllo",
    difficulty: "principiante",
    description: "Verifica se un numero è positivo, negativo o zero usando CMP e JNS (Jump if Not Sign).",
    code: EXAMPLE_PROGRAMS.signCheck
  }
];
