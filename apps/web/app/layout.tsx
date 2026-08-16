import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DueBack — Proof of done for everyday agents",
  description: "Give DueBack an unfinished outcome. It follows approved boundaries until the evidence is real."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
