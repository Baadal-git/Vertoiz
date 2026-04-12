import type { ReactNode } from "react";
import { AppNavbar } from "@/components/app-navbar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <AppSidebar />
      <main className="min-w-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <AppNavbar />
        {children}
      </main>
    </div>
  );
}
