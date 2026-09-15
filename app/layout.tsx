import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valete | Rock de Gravataí",
  description: "Site oficial da banda Valete. Rock nacional, pop rock, clássicos dos anos 2000 e muito peso para o seu evento.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
