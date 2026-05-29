import type { Metadata } from "next";
import { Michroma, Orbitron } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const michroma = Michroma({
  subsets: ["latin"],
  variable: "--font-michroma",
  weight: "400",
});

export const metadata: Metadata = {
  title: "FIFA 26 Platform",
  description: "Football schedules, teams, news, and history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${michroma.className} ${michroma.variable} ${orbitron.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
