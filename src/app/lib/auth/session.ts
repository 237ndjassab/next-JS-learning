
import "server-only"; // erreur de build si ce fichier est importé côté client
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../prisma";

const COOKIE_NAME = "session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 jours

// SHA-256 suffit ici : le token est déjà aléatoire à 256 bits (contrairement à un mot de passe humain)
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  // 32 octets aléatoires cryptographiquement sûrs, encodés en base64url (compatible cookie)
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: { id: hashToken(token), userId, expiresAt },
  });

  const cookieStore = await cookies(); // asynchrone depuis Next 15
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,                                  // illisible en JS (tu l'as expliqué)
    secure: process.env.NODE_ENV === "production",   // HTTPS imposé en prod, désactivé en dev local (http)
    sameSite: "lax",                                 // cookie non envoyé sur les POST cross-site : défense CSRF
    path: "/",
    expires: expiresAt,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: hashToken(token) },
    include: { user: { select: { id: true, name: true, email: true, role: true } } }, // jamais passwordHash
  });

  if (!session || session.expiresAt < new Date()) return null; // inconnue ou expirée
  return session;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    // deleteMany ne lève pas d'erreur si la ligne n'existe plus (idempotent)
    await prisma.session.deleteMany({ where: { id: hashToken(token) } });
  }
  cookieStore.delete(COOKIE_NAME);
}