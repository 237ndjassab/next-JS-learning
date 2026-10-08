import * as z from "zod";

export const LoginSchema = z.object({
  nom: z.string().min(2, "le nom d'utilisateur est requis").max(50),
  passwd: z.string().min(2,"le mot de passe est obligatoire"),
});
