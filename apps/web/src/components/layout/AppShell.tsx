import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { TabBar } from "./TabBar";
import { QueryProvider } from "./QueryProvider";
import { PushNotificationListener } from "../providers/PushNotificationListener";
import { FootballRuntime } from "../football/FootballRuntime";
import { PageContext } from "./PageContext";
import { WebsiteTour } from "../onboarding/WebsiteTour";

export type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="companion-app dark app-bg flex min-h-svh flex-col">
      <QueryProvider>
        <FootballRuntime />
        <PushNotificationListener />
        <Header />
        <main
          id="main-content"
          className="app-main min-h-[calc(100svh-4rem)] w-full flex-1 pt-16"
        >
          <PageContext />
          {children}
        </main>
        <TabBar />
        <Footer />
        <WebsiteTour />
      </QueryProvider>
    </div>
  );
}
