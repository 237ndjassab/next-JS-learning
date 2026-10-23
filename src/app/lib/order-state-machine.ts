

// Record<OrderStatus, OrderStatus[]> : TypeScript EXIGE une clé
// pour chaque valeur de l'enum. Si tu ajoutes un statut au schéma Prisma,

import { OrderStatus } from "../../../generated/prisma/enums";
import { ServiceError } from "./service/error/ServiceError";

// la compilation échoue tant que tu ne l'as pas géré ici.
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["ASSIGNED", "CANCELLED"],
  // READY: ["ASSIGNED", "DELIVERED"],
  ASSIGNED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_DELIVERY", "CANCELLED"],
  IN_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new ServiceError(`Transition interdite : ${from} → ${to}`, 409);
  }
}