// EXPLICATION

// Les deux versions accomplissent le même objectif (instancier un PrismaClient avec l'adaptateur PostgreSQL @prisma/adapter-pg), mais elles sont différentes pour trois raisons majeures : la gestion de l'environnement Next.js, la sécurité des variables d'environnement, et la structure du projet.

// 1. Le pattern Singleton (Gestion du Hot Reload dans Next.js)
// C'est la différence la plus importante.

// Le code de l'IA (en haut) : Utilise un Singleton via globalThis (globalForPrisma). En mode développement (npm run dev), Next.js rafraîchit les fichiers à chaque modification (Fast Refresh / HMR). Sans ce pattern Singleton, une nouvelle instance de PrismaClient et un nouveau pool de connexions seraient créés à chaque sauvegarde de fichier, ce qui saturerait rapidement les connexions de votre base de données PostgreSQL.

// Le code de la doc (en bas) : Crée directement new PrismaClient({ adapter }) au niveau global du module. C'est parfait pour un script Node.js classique ou un serveur Express, mais problématique dans Next.js en développement.

// 2. La gestion des variables d'environnement (DATABASE_URL)
// Le code de l'IA : Importe DATABASE_URL depuis un fichier local ./env (probablement un fichier de validation comme T3 Env, Zod ou un export modulé). Cela permet de garantissant un typage strict et évite d'exécuter l'application si la variable est manquante.

// Le code de la doc : Lit directement process.env.DATABASE_URL via dotenv/config. C'est l'approche générique minimale pour un exemple de documentation.

// 3. Emplacement des fichiers générés (import)
// En haut : ../../../generated/prisma/client montre un chemin personnalisé configuré dans le schema.prisma (output = "../src/generated/prisma/client").

// En bas : ../generated/prisma/client pointe vers un dossier relatif standard.

// Synthèse
// Le code de la documentation sert d'exemple d'installation minimaliste, tandis que le code généré par l'IA est spécifiquement adapté aux contraintes de développement de Next.js (pour éviter la saturation de connexions).

// Dans un projet Next.js, l'approche de l'IA (le pattern Singleton) est la bonne pratique à conserver.




// lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client";
import { DATABASE_URL } from "./env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: DATABASE_URL }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


// import "dotenv/config";
// import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "../generated/prisma/client";

// const connectionString = `${process.env.DATABASE_URL}`;

// const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient({ adapter });

// export { prisma };



