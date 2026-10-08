import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import ToggleTheme from "@/app/components/ui/ToggleTheme";

export const metadata: Metadata = {
  title: { default: "ImpEx", template: "%s | ImpEx" },
  description: "Application d'Import Export",
};

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const themeSet = await cookies();
  const theme = themeSet.get("theme");

  return (
    <html
      lang="fr"
      className={`${dmSans.variable} ${String(theme) == "dark" ? "dark" : ""} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToggleTheme/>
        {children}
      </body>
    </html>
  );
}
