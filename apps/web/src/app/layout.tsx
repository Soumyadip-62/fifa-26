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
  applicationName: "NinetyPlus",
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "NinetyPlus | Scores, Fixtures and Stats",
    template: "%s | NinetyPlus",
  },
  description:
    "Follow major football competitions, live scores, fixtures, tables, teams, players and news.",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: "NinetyPlus | Scores, Fixtures and Stats",
    description:
      "Follow major football competitions, live scores, fixtures, tables, teams, players and news.",
    url: absoluteUrl("/"),
    siteName: "NinetyPlus",
    images: [
      {
        url: absoluteUrl("/assets/images/banners/pl-banner.png"),
        width: 1200,
        height: 630,
        alt: "NinetyPlus football scores and fixtures",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NinetyPlus | Scores, Fixtures and Stats",
    description:
      "Follow major football competitions, live scores, fixtures, tables, teams, players and news.",
    images: [absoluteUrl("/assets/images/banners/pl-banner.png")],
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
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
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
