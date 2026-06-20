import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { TabBar } from "./TabBar";
import { QueryProvider } from "./QueryProvider";
import { DynamicIsland } from "./DynamicIsland";

export type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-bg flex min-h-svh flex-col">
      <QueryProvider>
        <Header />
        <main className="flex-1 pt-16 pb-24 md:pt-16 lg:pb-0">{children}</main>
        <TabBar />
        <Footer />
      </QueryProvider>
    </div>
  );
}
