import { Role } from "../../../../generated/prisma/enums";


export const PERMISSIONS = {
  "order:create":     ["CUSTOMER"], // Seul un client peut créer une commande
  "order:read:own":   ["CUSTOMER", "MERCHANT", "DRIVER"], // Un client peut lire ses propres commandes, un commerçant peut lire les commandes de son commerce, un livreur peut lire les commandes qui lui sont assignées
  "order:read:any":   ["ADMIN"], // Un administrateur peut lire toutes les commandes
  "order:manage":     ["MERCHANT", "ADMIN"], // Un commerçant peut gérer les commandes de son commerce, un administrateur peut gérer toutes les commandes
  "order:transition": ["MERCHANT", "DRIVER", "ADMIN"], // Un commerçant peut changer le statut d'une commande de son commerce, un livreur peut changer le statut d'une commande qui lui est assignée, un administrateur peut changer le statut de toutes les commandes
  "order:edit": ["CUSTOMER", "ADMIN"], // Un client peut modifier sa propre commande, un administrateur peut modifier toutes les commandes
  "order:cancel":     ["CUSTOMER", "MERCHANT", "ADMIN"], // Un client peut annuler sa propre commande, un commerçant peut annuler une commande de son commerce, un administrateur peut annuler toutes les commandes
  "product:manage":   ["MERCHANT", "ADMIN"], // Un commerçant peut gérer les produits de son commerce, un administrateur peut gérer tous les produits
  "product:read:any": ["CUSTOMER", "MERCHANT", "DRIVER", "ADMIN"], // Tout le monde peut lire les produits
  "user:manage":      ["ADMIN"], // Un administrateur peut gérer tous les utilisateurs
  "delivery:manage":  ["ADMIN"], // Un administrateur peut gérer toutes les livraisons
  "delivery:read:own": ["DRIVER"], // Un livreur peut lire les livraisons qui lui sont assignées
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}