import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "../auth/session";

// cache() de React : déduplique l'appel au sein d'une même requête (1 seule lecture BDD, même appelé 5 fois)
export const requireSession = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
});