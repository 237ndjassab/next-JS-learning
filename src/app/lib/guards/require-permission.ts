import { ServiceError } from "../service/error/ServiceError";
import { can, Permission } from "../auth/permissions";
import { requireSession } from "./require-session";


export async function requirePermission(permission: Permission) {
  const session = await requireSession(); // lève 401 si non connecté

  if (!can(session.user.role, permission)) {
    throw new ServiceError("Forbidden", 403); // connecté, mais interdit
  }
  return session; // le handler récupère user.id pour l'ownership
}

export async function requireAnyPermission(permissions: readonly Permission[]) {
  const session = await requireSession(); // 401 si non connecté

  // some() : renvoie true dès qu'UN élément du tableau satisfait la condition
  const allowed = permissions.some((p) => can(session.user.role, p));
  if (!allowed) throw new ServiceError("Forbidden", 403);

  return session;
}