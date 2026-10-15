import * as z from "zod";
import { OrderStatus } from "../../../generated/prisma/enums";

export const createOrderSchema = z
  .object({
      productId: z.string(),
      quantity: z.number().min(1, "la quantité doit être un nombre positif"),
      unitPriceCents: z.number().min(0, "le prix unitaire doit être un nombre positif"),
    })
  .strict();

export const updateOrderSchema = z
  .object({ client: z.string(), statut: z.enum(OrderStatus), total: z.number() })
  .partial() // tous les champs deviennent optionnels (c'est un PATCH)
  .strict(); // un champ inconnu (merchantId, id…) est rejeté

  
