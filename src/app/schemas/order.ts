import * as z from "zod";

export const createOrderSchema = z
  .object({
    client: z.string().min(1, "le nom du client est obligatoire"),
    total: z.number().positive("le total doit être un nombre positif"),
  })
  .strict();

export const updateOrderSchema = z
  .object({ client: z.string(), statut: z.string(), total: z.number() })
  .partial() // tous les champs deviennent optionnels (c'est un PATCH)
  .strict(); // un champ inconnu (merchantId, id…) est rejeté

  
