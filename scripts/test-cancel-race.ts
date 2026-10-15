import { prisma } from "@/app/lib/prisma";
import { cancelOrder, placeOrder } from "@/app/lib/service/order.service";



async function main() {
  // 1) Préparation : un produit avec assez de stock et un client existant
  const product = await prisma.product.findFirstOrThrow({
    where: { stock: { gte: 2 } },
  });
  const customer = await prisma.user.findFirstOrThrow();
  const stockBefore = product.stock;

  // 2) On passe une commande de 2 articles (le stock descend de 2)
  const order = await placeOrder(customer.id, [
    { productId: product.id, quantity: 2 },
  ]);

  // 3) Deux annulations lancées EN MÊME TEMPS (sans await entre les deux)
  const results = await Promise.allSettled([
    cancelOrder(order.id, product.merchantId),
    cancelOrder(order.id, product.merchantId),
  ]);

  // 4) Afficher le résultat de chaque tentative
  results.forEach((r, i) => {
    console.log(
      `Annulation #${i + 1} :`,
      r.status === "fulfilled" ? "✅ réussie" : `❌ ${r.reason.message}`,
    );
  });

  // 5) Vérifier l'état final du stock
  const after = await prisma.product.findUniqueOrThrow({
    where: { id: product.id },
  });
  console.log({ stockBefore, stockAfter: after.stock });
  console.log(
    after.stock === stockBefore ? "✅ Stock cohérent" : "🔴 STOCK CORROMPU",
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



//   Lancer le script
// bash
// npx tsx --env-file=.env scripts/test-cancel-race.ts

// Explication des mots-clés :

// tsx : exécute un fichier TypeScript directement, sans compilation préalable
// --env-file=.env : charge ton DATABASE_URL (tsx ne lit pas .env tout seul)
// findFirstOrThrow : renvoie le premier enregistrement qui correspond, ou lève une erreur s’il n’y en a pas
// Promise.allSettled([...]) : lance toutes les promesses en parallèle et attend qu’elles soient toutes terminées, qu’elles réussissent ou non. Contrairement à Promise.all, il ne s’arrête pas à la première erreur
// Pas de await entre les deux appels : c’est ce qui crée la concurrence. Avec await devant chacun, ils s’exécuteraient l’un après l’autre et le test ne prouverait rien
// r.status === "fulfilled" / r.reason : chaque résultat est soit { status: "fulfilled", value }, soit { status: "rejected", reason }
// $disconnect() : ferme la connexion à la base, sinon le script ne se termine pas
// Résultat attendu avec ta nouvelle version
// Annulation #1 : ✅ réussie
// Annulation #2 : ❌ Cette commande est déjà annulée
// { stockBefore: 10, stockAfter: 10 }
// ✅ Stock cohérent