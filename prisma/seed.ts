import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "boulangerie@demo.cm" },
    update: {},
    create: {
      email: "boulangerie@demo.cm",
      name: "Aïcha",
      role: "MERCHANT",
      merchant: {
        create: {
          name: "Boulangerie Aïcha",
          products: {
            create: [
              { name: "Pain complet", priceCents: 50000, stock: 40 },
              { name: "Croissant", priceCents: 30000, stock: 25 },
            ],
          },
        },
      },
    },
    include: { merchant: { include: { products: true } } },
  });

  const customer = await prisma.user.upsert({
    where: { email: "client@demo.cm" },
    update: {},
    create: { email: "client@demo.cm", name: "Marie", role: "CUSTOMER" },
  });

  const driver = await prisma.user.upsert({
    where: { email: "livreur@demo.cm" },
    update: {},
    create: { email: "livreur@demo.cm", name: "Paul", role: "DRIVER" },
  });

  // --- SUITE DE L'EXERCICE ---

  // 1. On vérifie qu'on a bien récupéré le marchand et ses produits
  const merchant = owner.merchant;
  if (!merchant || merchant.products.length === 0) {
    throw new Error("Marchand ou produits introuvables");
  }

  const product = merchant.products.find((p) => p.name === "Pain complet");
  if (!product) throw new Error("Produit « Pain complet » introuvable");

  // 2. Création/Upsert de la commande (Order) avec lignes imbriquées (OrderItem)
  const order = await prisma.order.upsert({
    where: { id: "seed-order-1" },
    update: {},
    create: {
      id: "seed-order-1",
      status: "ASSIGNED",
      customer: { connect: { id: customer.id } },
      merchant: { connect: { id: merchant.id } },
      items: {
        create: [
          {
            productId: product.id,
            quantity: 2,
            unitPriceCents: product.priceCents, // Prix figé du produit
          },
        ],
      },
    },
  });

  // 3. Création/Upsert de la livraison (Delivery)
  const delivery = await prisma.delivery.upsert({
    where: { orderId: order.id },
    update: {},
    create: {
      orderId: order.id,
      driverId: driver.id, // On assigne Paul comme livreur
    },
  });

  console.log("Seed OK :", owner.email, customer.email, driver.email);
  console.log("Commande & Livraison créées :", order.id, delivery.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
