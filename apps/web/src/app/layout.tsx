import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { absoluteUrl } from "@/lib/seo/metadata";
import "./globals.css";
import "./design-system.css";
import "@/features/home/home-dashboard.css";
import "@/features/matches/match-centre.css";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "Football Companion | Scores, Fixtures and Stats",
    template: "%s | Football Companion",
  },
  description:
    "Follow major football competitions, live scores, fixtures, tables, teams, players and news.",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: "Football Companion | Scores, Fixtures and Stats",
    description:
      "Follow major football competitions, live scores, fixtures, tables, teams, players and news.",
    url: absoluteUrl("/"),
    siteName: "Football Companion",
    images: [
      {
        url: absoluteUrl("/assets/images/banners/world-cup26.webp"),
        width: 1200,
        height: 630,
        alt: "Worldcup Companion Banner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Football Companion | Scores, Fixtures and Stats",
    description:
      "Follow major football competitions, live scores, fixtures, tables, teams, players and news.",
    images: [absoluteUrl("/assets/images/banners/world-cup26.webp")],
  },
};

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { MatchProvider } from "Context/MatchContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MatchProvider>
            <AppShell>{children}</AppShell>
          </MatchProvider>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
