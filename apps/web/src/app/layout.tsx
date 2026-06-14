import type { Metadata } from "next";
import { Orbitron, Poppins } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FIFA 26 Platform",
  description: "Football schedules, teams, news, and history.",
  openGraph: {
    title: "FIFA 26 Platform",
    description: "Football schedules, teams, news, and history.",
    images: [
      {
        url: "/assets/images/banners/world-cup26.png",
        width: 1200,
        height: 630,
        alt: "FIFA 26 Tournament Hub Banner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FIFA 26 Platform",
    description: "Football schedules, teams, news, and history.",
    images: ["/assets/images/banners/world-cup26.png"],
  },
};

import { ThemeProvider } from "@/components/theme/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${orbitron.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell>{children}</AppShell>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
