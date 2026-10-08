"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
export type Theme = "light" | "dark";
export const setTheme = async (theme: Theme) => {
  const cookieStore = await cookies();
  cookieStore.set("theme", theme, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    httpOnly: false,
  });
  revalidatePath("/", "layout")
};
