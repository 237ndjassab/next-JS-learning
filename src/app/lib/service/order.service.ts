import { OrderUpdate } from "@/types/commande";
import { OrderStatus } from "../../../../generated/prisma/enums";
import { assertTransition } from "../order-state-machine";
import { prisma } from "../prisma";
import { ServiceError } from "./error/ServiceError";
// import { changeOrderStatus } from "./order-status.service";
import { Actor, orderScopeFor } from "../auth/order-scope";

export type PlaceOrderItem = { productId: string; quantity: number };
//fonction pour recuperer toutes les commandes
export const getOrders = async () => {
  return prisma.order.findMany({
    include: {
      items: true,
    },
  });
};

export const findOrderById = async (
  id: string,
  actor: Actor
) => {
  if (!id) throw new ServiceError("l'id de la commande est obligatoire", 400);
  if (!actor) throw new ServiceError("utilisateur absent", 401);
  if (!actor.userId)
    throw new ServiceError("l'id de l'utilisateur est absent", 400);
  const order = await prisma.order.findFirst({
    where: { id, ...orderScopeFor(actor) },
    include: { items: true },
  });
  if (!order)
    throw new ServiceError(
      "commande pas retrouvé veuillez essayer avec un autre identifiant",
      404,
    );
  return order;
};

//fonction pour recuperer toutes les commandes d'un commerçant
export const getMerchantOrders = async (actor: Actor) => {
  if (!actor) throw new ServiceError("utilisateur absent", 401);
  if (!actor.userId)
    throw new ServiceError("l'id de l'utilisateur est absent", 400);
  return prisma.order.findMany({
    where: { ...orderScopeFor(actor) },
    include: {
      items: true,
    },
  });
};

//fonction pour créer une commande avec des articles
export async function placeOrder(customerId: string, items: PlaceOrderItem[]) {
  if (items.length === 0) {
    throw new ServiceError(
      "Une commande doit contenir au moins un article",
      400,
    );
  }

  // $transaction(callback) : "tx" est un client Prisma lié à UNE transaction.
  // Si le callback throw ➔ ROLLBACK automatique. S'il retourne ➔ COMMIT.
  return prisma.$transaction(async (tx) => {
    const orderItems: {
      productId: string;
      quantity: number;
      unitPriceCents: number;
    }[] = [];
    let merchantId: string | null = null;

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw new ServiceError(`Produit ${item.productId} introuvable`, 404);
      }

      // Une commande = un seul commerçant (règle métier)
      if (merchantId && merchantId !== product.merchantId) {
        throw new ServiceError(
          "Tous les produits doivent venir du même commerçant",
          400,
        );
      }
      merchantId = product.merchantId;

      // 🔑 Vérification + décrément ATOMIQUES en une seule requête SQL :
      // UPDATE products SET stock = stock - $qty WHERE id = $id AND stock >= $qty
      const { count } = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });

      // count = nombre de lignes modifiées. 0 ➔ le stock était insuffisant.
      if (count === 0) {
        throw new ServiceError(`Stock insuffisant pour "${product.name}"`, 409);
      }

      // Prix FIGÉ au moment de l'achat (snapshot) : si le prix change demain,
      // l'historique de la commande reste juste.
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPriceCents: product.priceCents,
      });
    }

    // Création imbriquée : Order + OrderItems en une écriture cohérente
    const order = await tx.order.create({
      data: {
        customerId,
        merchantId: merchantId!,
        status: "PENDING",
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: null,
        toStatus: "PENDING",
        actorId: customerId,
      },
    });
    return order; // status = PENDING, items inclus
  });
}

//fonction pour annuler une commande et restaurer le stock des produits
export const cancelOrder = async (orderId: string, merchantId: string) => {
  return prisma.$transaction(async (tx) => {
    // 1) Verrou logique : UPDATE ... WHERE id=? AND merchantId=? AND status IN (...)
    //    Une seule transaction peut gagner. Les autres voient count = 0.
    const { count } = await tx.order.updateMany({
      where: {
        id: orderId,
        merchantId, // filtre par propriétaire : pas de lecture d'une commande qui n'est pas la sienne
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      data: { status: "CANCELLED" },
    });

    // 2) count = 0 : on diagnostique la CAUSE (lecture seule, aucune écriture n'a eu lieu)
    if (count === 0) {
      const existing = await tx.order.findFirst({
        where: { id: orderId, merchantId },
        select: { status: true },
      });
      if (!existing) {
        // Inexistante OU appartenant à un autre commerçant : même réponse (anti-énumération)
        throw new ServiceError(`Commande ${orderId} introuvable`, 404);
      }
      throw new ServiceError(
        "Seules les commandes en attente ou confirmées peuvent être annulées",
        409,
      );
    }

    // 3) On est le SEUL gagnant : on peut restaurer le stock sans risque de doublon
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: true },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return order; // status = CANCELLED, items inclus
  });
};

// fonction pour changer le statut d'une commande (avec vérification de la transition)
export async function transitionOrder(
  orderId: string,
  to: OrderStatus,
  merchantId: string,
) {
  return prisma.$transaction(async (tx) => {
    // findFirst (et non findUnique) car on filtre sur deux champs :
    // findUnique n'accepte que des clés uniques.
    const order = await tx.order.findFirst({
      where: { id: orderId, merchantId },
    });
    if (!order) throw new ServiceError("Commande introuvable", 404);

    assertTransition(order.status, to);

    // updateMany avec le statut ATTENDU dans le where :
    // l'UPDATE ne réussit que si personne n'a changé le statut entre-temps. c'est a dire que si le statut de la commande a été modifié par un autre processus, le count sera 0 et on throw une erreur.
    //en d'autres termes, on s'assure que le statut de la commande est bien celui qu'on attend avant de le modifier.
    const { count } = await tx.order.updateMany({
      where: { id: orderId, merchantId, status: order.status },
      data: { status: to },
    });
    if (count === 0) throw new ServiceError("Statut modifié entre-temps", 409);

    return tx.order.findUniqueOrThrow({ where: { id: orderId } });
  });
}

// Statuts où modifier la quantité reste cohérent (décision métier à valider).
const QUANTITY_EDITABLE: OrderStatus[] = ["PENDING", "CONFIRMED"];

export const updateOrderById = async (
  id: string,
  changes: OrderUpdate, // avec statut?: OrderStatus
  actor: Actor,
) => {
  if (!actor.userId) throw new ServiceError("utilisateur non authentifié", 401);

  return prisma.$transaction(async (tx) => {
    // 1. Lecture DANS la transaction, filtrée par propriétaire.
    //    Adapte `userId` au champ réel de ton modèle Order.

    const order = await tx.order.findFirst({
      where: { id, ...orderScopeFor(actor) },
      include: { items: true },
    });
    if (!order) throw new ServiceError("Order not found", 404); // 404 = on ne révèle pas l'existence

    const item = order.items[0];
    if (!item) throw new ServiceError("Commande sans article", 422);

    // 2. Changement de quantité + ajustement du stock
    if (changes.quantity !== undefined && changes.quantity !== item.quantity) {
      if (!QUANTITY_EDITABLE.includes(order.status)) {
        throw new ServiceError(
          `Quantité non modifiable au statut ${order.status}`,
          409,
        );
      }
      const delta = changes.quantity - item.quantity; // >0 : on prend du stock, <0 : on en rend
      const { count } = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: delta } }, // productId du ITEM
        data: { stock: { decrement: delta } }, // delta négatif = incrément
      });
      if (count === 0) throw new ServiceError("Stock insuffisant", 409);

      await tx.orderItem.update({
        where: { id: item.id },
        data: { quantity: changes.quantity },
      });
    }

    // 3. Changement de statut, avec verrou optimiste
    // if (changes.statut) {
    //   await changeOrderStatus(
    //     {
    //       orderId: order.id,
    //       to: changes.statut,
    //       actorId: actor.userId,
    //       actorRole: actor.role,
    //     },
    //     tx, // ← la MÊME transaction
    //   );
    // }

    return tx.order.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });
  });
};
