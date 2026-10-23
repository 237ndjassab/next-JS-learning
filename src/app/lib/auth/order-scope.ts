
import type { Prisma } from "../../../../generated/prisma/client";
import type { Role } from "../../../../generated/prisma/enums";
import { ServiceError } from "../service/error/ServiceError";

export type Actor = { userId: string; role: Role };

export function orderScopeFor(actor: Actor): Prisma.OrderWhereInput {
  switch (actor.role) {
    case "ADMIN":
      return {}; // pas de filtre : voit tout
    case "MERCHANT":
      // ⚠️ adapte le nom du champ à ton schéma (ex: ownerId / userId)
      return { merchant: { ownerId: actor.userId } };
    case "DRIVER":
      return { delivery: { driverId: actor.userId } };
    case "CUSTOMER":
      return { customerId: actor.userId };
    default: {
      // Vérification d'exhaustivité : si tu ajoutes un rôle à l'enum,
      // TypeScript refuse de compiler tant que tu ne l'as pas géré ici.
      const _exhaustive: never = actor.role;
      throw new ServiceError("Forbidden", 403);
    }
  }
}