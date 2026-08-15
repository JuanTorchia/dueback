import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DueBack — Proof, not promises",
  description: "DueBack keeps commercial promises open until the approved evidence is real."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
