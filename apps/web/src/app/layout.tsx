import type { Metadata } from "next";
import { Orbitron, Poppins } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { absoluteUrl } from "@/lib/seo/metadata";
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
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "Worldcup Companion | FIFA World Cup 2026 Schedule, Scores & Bracket",
    template: "%s | Worldcup Companion",
  },
  description:
    "Follow FIFA World Cup 2026 fixtures, live scores, points tables, teams, knockout brackets, news, and tournament history.",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: "Worldcup Companion | FIFA World Cup 2026 Schedule, Scores & Bracket",
    description:
      "Follow FIFA World Cup 2026 fixtures, live scores, points tables, teams, knockout brackets, news, and tournament history.",
    url: absoluteUrl("/"),
    siteName: "Worldcup Companion",
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
    title: "Worldcup Companion | FIFA World Cup 2026 Schedule, Scores & Bracket",
    description:
      "Follow FIFA World Cup 2026 fixtures, live scores, points tables, teams, knockout brackets, news, and tournament history.",
    images: [absoluteUrl("/assets/images/banners/world-cup26.webp")],
  },
};

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PushNotificationListener } from "@/components/providers/PushNotificationListener";
import { MatchProvider } from "Context/MatchContext";

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
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MatchProvider>
            <PushNotificationListener />
            <AppShell>{children}</AppShell>
          </MatchProvider>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
