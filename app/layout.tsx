import type { Metadata } from "next";
import { SiteContentProvider } from "@/hooks/use-site-content";
import { loadSiteContentSafe } from "@/lib/site-content-server";
import "./globals.css";

export const dynamic="force-dynamic";

export const metadata: Metadata = {
  title: "Valete | Rock de Gravataí",
  description: "Site oficial da banda Valete. Rock nacional, pop rock, clássicos dos anos 2000 e muito peso para o seu evento.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialContent=await loadSiteContentSafe();
  return (
    <html lang="pt-BR">
      <body className="antialiased"><SiteContentProvider initialContent={initialContent}>{children}</SiteContentProvider></body>
    </html>
  );
}
