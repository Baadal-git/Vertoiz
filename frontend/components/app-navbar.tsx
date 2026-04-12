"use client";

import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/settings": "Settings",
};

export function AppNavbar() {
  const pathname = usePathname();
  const title = pathname.startsWith("/scan/") ? "Scan Report" : titles[pathname] ?? "Dashboard";

  return (
    <header className="mb-6 flex items-center justify-between rounded-3xl border border-[#1f1f1f] bg-card px-5 py-4">
      <BrandLogo size={28} subtitle={undefined} />
      <p className="rounded-full border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.1)] px-3 py-1 text-sm uppercase tracking-[0.22em] text-[#2563EB]">
        {title}
      </p>
    </header>
  );
}
