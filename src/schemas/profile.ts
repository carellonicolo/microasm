import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string()
    .min(2, 'Il nome deve contenere almeno 2 caratteri')
    .max(100, 'Il nome non può superare i 100 caratteri')
    .transform(val => val.trim()),
  lastName: z.string()
    .min(2, 'Il cognome deve contenere almeno 2 caratteri')
    .max(100, 'Il cognome non può superare i 100 caratteri')
    .transform(val => val.trim()),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
