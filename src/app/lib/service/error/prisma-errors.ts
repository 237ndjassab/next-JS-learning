import { Prisma } from "../../../../../generated/prisma/client";
import { ServiceError } from "./ServiceError";



export function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": // violation de contrainte @unique
        throw new ServiceError("Cette ressource existe déjà", 409);
      case "P2003": // violation de clé étrangère
        throw new ServiceError("Référence invalide (ressource liée inexistante)", 400);
      case "P2025": // enregistrement requis introuvable (update/delete)
        throw new ServiceError("Ressource introuvable", 404);
    }
  }
  throw error; // inconnu : on laisse remonter, handleRouteError renverra un 500
}