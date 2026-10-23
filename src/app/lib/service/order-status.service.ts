import { Prisma } from "../../../../generated/prisma/client";
import { OrderStatus, Role } from "../../../../generated/prisma/enums";
import { Actor, orderScopeFor } from "../auth/order-scope";
import { assertTransition } from "../order-state-machine";
import { prisma } from "../prisma";
import { ServiceError } from "./error/ServiceError";

/**
 * Qui peut faire passer une commande VERS un statut donné.
 * ADMIN est géré à part (il peut tout).
 */
const ACTORS_FOR_TARGET: Partial<Record<OrderStatus, Role[]>> = {
  CONFIRMED: ["MERCHANT"],
  PREPARING: ["MERCHANT"],
  READY: ["MERCHANT"],
  ASSIGNED: ["MERCHANT"],
  PICKED_UP: ["DRIVER"],
  IN_DELIVERY: ["DRIVER"],
  DELIVERED: ["DRIVER"],
  CANCELLED: ["CUSTOMER", "MERCHANT"],
};

export function assertActorCan(role: Role, to: OrderStatus): void {
  if (role === "ADMIN") return;
  const allowed = ACTORS_FOR_TARGET[to] ?? [];
  if (!allowed.includes(role)) {
    throw new ServiceError(`Le rôle ${role} ne peut pas passer à ${to}`, 403);
  }
}

type ChangeStatusInput = {
  orderId: string;
  to: OrderStatus;
  actor: Actor; // remplace actorId + actorRole : un seul objet, impossible de les désynchroniser;
  reason?: string;
};

// Le type d'un client de transaction : tx dans $transaction(async (tx) => ...)
type Db = Prisma.TransactionClient;

async function applyStatusChange(db: Db, input: ChangeStatusInput) {
  const { orderId, to, actor, reason } = input;

  const order = await db.order.findFirst({
    where: { id: orderId, ...orderScopeFor(actor) }, // niveau 3 dans la fonction elle-même
    include: { items: true },
  });
  if (!order) throw new ServiceError("Commande introuvable", 404);

  assertTransition(order.status, to);
  assertActorCan(actor.role, to);

  const { count } = await db.order.updateMany({
    where: { id: orderId, status: order.status },
    data: { status: to },
  });
  if (count === 0) throw new ServiceError("Commande modifiée entre-temps", 409);

  if (to === "CANCELLED") {
    for (const item of order.items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  }

  await db.orderStatusHistory.create({
    data: {
      orderId,
      fromStatus: order.status,
      toStatus: to,
      actorId: actor.userId,
      reason: reason ?? null,
    },
  });

  return { orderId, from: order.status, to };
}

// API publique : utilise la transaction fournie, sinon en ouvre une
export function changeOrderStatus(input: ChangeStatusInput, db?: Db) {
  if (db) return applyStatusChange(db, input);
  return prisma.$transaction((tx) => applyStatusChange(tx, input));
}

export function getOrderHistory(orderId: string) {
  return prisma.orderStatusHistory.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
    include: { actor: { select: { id: true, name: true, role: true } } },
  });
}
