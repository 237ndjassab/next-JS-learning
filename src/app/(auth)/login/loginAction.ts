// src/app/(auth)/login/actions.ts
"use server"; // toutes les exports de ce fichier deviennent des Server Actions

import { redirect } from "next/navigation";
import { verify } from "@node-rs/argon2";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { createSession } from "@/app/lib/auth/session";

const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

export type LoginState = { error?: string };

// Hash factice : sert à consommer le même temps de calcul quand l'email n'existe pas
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHRzb21lc2FsdA$Zm9vYmFyZm9vYmFyZm9vYmFyZm9vYmFyZm9vYmFy";

export async function login(
  _prevState: LoginState,   // exigé par useActionState, ici ignoré
  formData: FormData,       // objet natif du navigateur, contient les champs du <form>
): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Identifiants invalides" };

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Toujours vérifier un hash, même si l'user n'existe pas : évite l'attaque par mesure de temps
  const valid = await verify(user?.passwordHash ?? DUMMY_HASH, password);

  // Message identique dans les deux cas : on ne révèle pas si l'email existe (énumération de comptes)
  if (!user || !valid) return { error: "Email ou mot de passe incorrect" };

  await createSession(user.id);
  redirect("/dashboard"); // lève une exception interne : ne JAMAIS l'entourer d'un try/catch
}





// "use server";
// import { LoginSchema } from "@/app/schemas/login";
// import * as z from "zod";

// export const LoginAction = async (prevState: any, formData: FormData) => {
//   const validate = LoginSchema.safeParse({
//     nom: formData.get("nom"),
//     passwd: formData.get("passwd"),
//   });
//   if (!validate.success) {
//     const tree = z.treeifyError(validate.error);
//     return {
//       success: false,
//       errors: tree.properties,
//     };
//   }
//   console.log("Validated data: ", validate.data);
//   return {
//     success: true,
//     errors: undefined,
//   };
// };
