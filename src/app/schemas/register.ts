import * as z from "zod";
export const registerSchema = z.object({
  nom: z.string().min(2, "le nom d'utilisateur est requis").max(50),
  email: z.email("l'email est obligatoire"),
  passwd: z.string().min(2,"le mot de passe est obligatoire"),
});
