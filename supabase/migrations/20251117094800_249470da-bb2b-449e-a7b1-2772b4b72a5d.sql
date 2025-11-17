-- Step 1: Aggiornare la funzione handle_new_user() per gestire Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_first_name text;
  v_last_name text;
  v_full_name text;
  v_name_parts text[];
BEGIN
  -- Tenta di estrarre first_name e last_name dai metadati (registrazione email/password)
  v_first_name := NEW.raw_user_meta_data->>'first_name';
  v_last_name := NEW.raw_user_meta_data->>'last_name';
  
  -- Se non ci sono, prova con Google OAuth (name o full_name)
  IF v_first_name IS NULL OR v_last_name IS NULL THEN
    v_full_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    );
    
    IF v_full_name IS NOT NULL THEN
      -- Splitta il nome completo in parti
      v_name_parts := string_to_array(trim(v_full_name), ' ');
      
      -- Gestione edge cases
      IF array_length(v_name_parts, 1) = 1 THEN
        -- Nome singolo (es: "Madonna")
        v_first_name := v_name_parts[1];
        v_last_name := '';
      ELSIF array_length(v_name_parts, 1) = 2 THEN
        -- Nome e cognome standard (es: "NICOLÒ CARELLO")
        v_first_name := v_name_parts[1];
        v_last_name := v_name_parts[2];
      ELSE
        -- Nomi multipli (es: "Juan Pablo García")
        -- Prende il primo come nome e tutto il resto come cognome
        v_first_name := v_name_parts[1];
        v_last_name := array_to_string(v_name_parts[2:array_length(v_name_parts, 1)], ' ');
      END IF;
    END IF;
  END IF;
  
  -- Fallback finale se tutto il resto fallisce
  v_first_name := COALESCE(v_first_name, 'Utente');
  v_last_name := COALESCE(v_last_name, 'Sconosciuto');
  
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    v_first_name,
    v_last_name,
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$function$;

-- Step 2: Aggiornare il profilo esistente dell'utente Google OAuth
DO $$
DECLARE
  v_user_id uuid := 'a71e8490-148c-4ba0-b934-cdb52e9edbfb';
  v_full_name text;
  v_name_parts text[];
  v_first_name text;
  v_last_name text;
BEGIN
  -- Leggi il nome completo da auth.users
  SELECT 
    COALESCE(
      raw_user_meta_data->>'full_name',
      raw_user_meta_data->>'name'
    )
  INTO v_full_name
  FROM auth.users
  WHERE id = v_user_id;
  
  -- Se troviamo il nome completo, splittalo
  IF v_full_name IS NOT NULL THEN
    v_name_parts := string_to_array(trim(v_full_name), ' ');
    
    IF array_length(v_name_parts, 1) = 1 THEN
      v_first_name := v_name_parts[1];
      v_last_name := '';
    ELSIF array_length(v_name_parts, 1) = 2 THEN
      v_first_name := v_name_parts[1];
      v_last_name := v_name_parts[2];
    ELSE
      v_first_name := v_name_parts[1];
      v_last_name := array_to_string(v_name_parts[2:array_length(v_name_parts, 1)], ' ');
    END IF;
    
    -- Aggiorna il profilo
    UPDATE public.profiles
    SET 
      first_name = v_first_name,
      last_name = v_last_name,
      updated_at = now()
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Profilo aggiornato per utente %: % %', v_user_id, v_first_name, v_last_name;
  ELSE
    RAISE NOTICE 'Nessun nome completo trovato per utente %', v_user_id;
  END IF;
END $$;