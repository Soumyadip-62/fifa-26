import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { QueryProvider } from "./QueryProvider";

export type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-bg flex min-h-svh flex-col">
      <QueryProvider>
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </QueryProvider>
    </div>
  );
}
