-- Aggiungere nuova policy per permettere agli insegnanti di vedere TUTTI gli studenti
-- Questo risolve il problema "chicken-and-egg" dove gli insegnanti non potevano
-- aggiungere studenti alle classi perché potevano vedere solo studenti già nelle loro classi

CREATE POLICY "Teachers can view all students"
  ON public.profiles FOR SELECT
  USING (
    -- L'utente corrente deve essere un insegnante
    has_role(auth.uid(), 'teacher'::app_role)
    AND
    -- Il profilo che sta guardando deve essere uno studente
    has_role(profiles.id, 'student'::app_role)
  );