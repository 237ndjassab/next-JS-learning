// src/services/order-status.test.ts
//
// Tests d'intégration du service de changement de statut d'une commande.
// On ne teste pas uniquement "est-ce que ça marche ?", mais aussi :
//   1. l'ordre des transitions,
//   2. le refus des transitions interdites,
//   3. les autorisations,
//   4. la concurrence (deux requêtes en même temps).
import { describe, it, expect, beforeEach } from "vitest";

// Client Prisma partagé avec l'application.
// Attention : ces tests touchent une vraie base (idéalement une base de test isolée).
import { prisma } from "../prisma";

// Le code métier que l'on veut valider.
import { changeOrderStatus, getOrderHistory } from "./order-status.service";

/**
 * Fabrique de données de test.
 *
 * Bonne pratique : chaque test doit partir d'un état connu et indépendant.
 * Ici, on crée une commande fraîche plutôt que de réutiliser une commande
 * créée par un autre test : cela évite les effets de bord et rend les tests
 * plus faciles à comprendre et à déboguer.
 *
 * À adapter selon les champs réellement obligatoires dans ton schéma Prisma.
 */
async function createFreshOrder() {
  // ... crée User, Merchant, Product, Order(PENDING) + OrderItem
  // retourne { orderId, merchantId, driverId, customerId }
  // 1. Création d'un utilisateur client
  const customer = await prisma.user.create({
    data: {
      email: `customer_${Date.now()}_${Math.random()}@test.com`,
      name: "Test Customer",
      passwordHash: "dummyhash", // le hash n'a pas d'importance pour ce test
      role: "CUSTOMER",
    },
  });

  // 2. Création d'un utilisateur marchand et de son Merchant (relation ownerId)
  const merchantUser = await prisma.user.create({
    data: {
      email: `merchant_${Date.now()}_${Math.random()}@test.com`,
      name: "Test Merchant User",
      passwordHash: "dummyhash",
      role: "MERCHANT",
    },
  });

  const merchant = await prisma.merchant.create({
    data: {
      name: "Test Restaurant",
      ownerId: merchantUser.id, // Correspond à ton champ ownerId
    },
  });

  // 3. Création d'un utilisateur livreur
  const driver = await prisma.user.create({
    data: {
      email: `driver_${Date.now()}_${Math.random()}@test.com`,
      name: "Test Driver",
      passwordHash: "dummyhash",
      role: "DRIVER",
    },
  });

  // 4. Création d'un produit (prix en centimes)
  const product = await prisma.product.create({
    data: {
      name: "Burger Test",
      priceCents: 1500, // 15.00
      merchantId: merchant.id,
    },
  });

  // 5. Création de la commande PENDING avec son OrderItem (unitPriceCents)
  const order = await prisma.order.create({
    data: {
      status: "PENDING",
      customerId: customer.id,
      merchantId: merchant.id,
      items: {
        create: [
          {
            productId: product.id,
            quantity: 1,
            unitPriceCents: 1500,
          },
        ],
      },
    },
  });

  return {
    orderId: order.id,
    merchantId: merchantUser.id, // L'ID de l'utilisateur (acteur) associé au marchand
    driverId: driver.id,
    customerId: customer.id,
  };
}

/**
 * Remise à zéro avant chaque test.
 *
 * `beforeEach` garantit que chaque `it(...)` démarre avec une base propre.
 * On supprime d'abord l'historique car il dépend des commandes.
 *
 * Point d'attention senior : l'ordre de suppression doit respecter les
 * contraintes de clé étrangère. En général :
 *   historique -> items -> commandes -> produits -> marchands -> utilisateurs.
 */

beforeEach(async () => {
  await prisma.orderStatusHistory.deleteMany(); // 1. d'abord l'historique
  await prisma.orderItem.deleteMany(); // 2. puis les lignes
  await prisma.delivery.deleteMany(); //    (si présent)
  await prisma.order.deleteMany(); // 3. puis les commandes
  await prisma.product.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.user.deleteMany(); // 4. les users en dernier
});

describe("changeOrderStatus", () => {
  /**
   * Cas nominal : une transition légale doit être appliquée
   * ET tracée dans l'historique.
   *
   * On enchaîne volontairement deux transitions pour vérifier que
   * l'historique conserve l'ordre chronologique.
   */
  it("écrit une ligne d'historique par transition, dans l'ordre", async () => {
    // On crée une commande indépendante pour ce test.
    const { orderId, merchantId } = await createFreshOrder();

    // PENDING -> CONFIRMED : transition normalement autorisée pour un marchand.
    await changeOrderStatus({
      orderId,
      to: "CONFIRMED",
      actor: { userId: merchantId, role: "MERCHANT" },
    });

    // CONFIRMED -> PREPARING : deuxième transition légale.
    await changeOrderStatus({
      orderId,
      to: "PREPARING",
      actor: { userId: merchantId, role: "MERCHANT" },
    });

    // On relit l'historique depuis la base, pas depuis une variable en mémoire.
    // Cela vérifie réellement la persistance.
    const history = await getOrderHistory(orderId);

    // On construit une représentation lisible de chaque transition :
    // "PENDING->CONFIRMED", puis "CONFIRMED->PREPARING".
    expect(history.map((h) => `${h.fromStatus}->${h.toStatus}`)).toEqual([
      "PENDING->CONFIRMED",
      "CONFIRMED->PREPARING",
    ]);
  });

  /**
   * Cas d'erreur métier : un marchand ne doit pas pouvoir passer
   * directement de PENDING à DELIVERED.
   *
   * Deux assertions importantes :
   *   - le service rejette bien la requête avec un 409 Conflict ;
   *   - aucune trace n'est écrite dans l'historique.
   *
   * Le deuxième point est essentiel : une transition refusée ne doit
   * jamais laisser de donnée partielle ou trompeuse en base.
   */
  it("refuse une transition illégale ET n'écrit rien", async () => {
    const { orderId, merchantId } = await createFreshOrder();

    await expect(
      changeOrderStatus({
        orderId,
        to: "DELIVERED",
        actor: { userId: merchantId, role: "MERCHANT" },
      }),
      // 409 = Conflict : la requête est compréhensible, mais l'état actuel
      // de la ressource ne permet pas cette opération.
    ).rejects.toMatchObject({ status: 409 });

    // Preuve que le refus n'a pas pollué l'historique.
    expect(await getOrderHistory(orderId)).toHaveLength(0);
  });

  /**
   * Cas d'autorisation : un client ne peut pas confirmer sa propre commande.
   *
   * Ici, on teste le contrôle d'accès, pas la validité de la transition.
   * Même si "PENDING -> CONFIRMED" est une transition légale,
   * l'acteur n'a pas le droit de la déclencher.
   */
  it("refuse un acteur non autorisé (403)", async () => {
    const { orderId, customerId } = await createFreshOrder();

    await expect(
      changeOrderStatus({
        orderId,
        to: "CONFIRMED",
        actor: { userId: customerId, role: "CUSTOMER" },
      }),
      // 403 = Forbidden : l'utilisateur est identifiable, mais n'a pas
      // les droits nécessaires sur cette action.
    ).rejects.toMatchObject({ status: 403 });
  });

  /**
   * Cas de concurrence : deux requêtes tentent exactement la même transition
   * en même temps.
   *
   * Objectif : éviter le double passage d'état et le double historique.
   * C'est un cas classique si deux onglets, deux workers ou deux appels API
   * arrivent presque simultanément.
   *
   * `Promise.allSettled` est utilisé plutôt que `Promise.all` car on s'attend
   * à ce qu'une promesse réussisse et l'autre échoue. `Promise.all` rejetterait
   * dès la première erreur, ce qui compliquerait l'analyse des résultats.
   */
  it("deux requêtes simultanées : une seule gagne, un seul historique", async () => {
    const { orderId, merchantId } = await createFreshOrder();

    // Petite fonction factory : chaque appel représente une requête HTTP
    // indépendante qui tente la même transition.
    const attempt = () =>
      changeOrderStatus({
        orderId,
        to: "CONFIRMED",
        actor: { userId: merchantId, role: "MERCHANT" },
      });

    // Les deux tentatives partent en parallèle.
    const results = await Promise.allSettled([attempt(), attempt()]);

    // Exactement une requête doit réussir.
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);

    // Et il ne doit exister qu'une seule entrée d'historique.
    // C'est la vérification la plus importante : pas de doublon métier.
    expect(await getOrderHistory(orderId)).toHaveLength(1);
  });

  it("renvoie 404 à un livreur non assigné, sans modifier la commande", async () => {
    // Arrange : une commande ASSIGNED dont la livraison appartient à `driverA`
    // `driverB` est un AUTRE user de rôle DRIVER
    const { orderId, driverId } = await createFreshOrder();
    await expect(
      changeOrderStatus({
        orderId,
        to: "PICKED_UP",
        actor: { userId: driverId, role: "DRIVER" },
      }),
    ).rejects.toMatchObject({ status: 404 });

    // Anti faux-vert : un 404 "pour la mauvaise raison" ne suffit pas,
    // on prouve aussi que RIEN n'a bougé.
    const after = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
    });
    expect(after.status).toBe("ASSIGNED");
    expect(await prisma.orderStatusHistory.count({ where: { orderId } })).toBe(
      0,
    );
  });
});
