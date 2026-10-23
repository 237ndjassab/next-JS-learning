"use server";

import { redirect } from "next/navigation";
import { destroySession } from "@/app/lib/auth/session";

export async function logout(): Promise<void> {
  await destroySession(); // supprime la ligne en BDD, puis le cookie
  redirect("/login");
}