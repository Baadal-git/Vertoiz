"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  AlertTriangle,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  Settings,
  TrendingUp,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { label: "Projects", href: "/dashboard", icon: FolderKanban, enabled: false },
  { label: "Violations", href: "/dashboard", icon: AlertTriangle, enabled: false },
  { label: "Scaling Plans", href: "/dashboard", icon: TrendingUp, enabled: false },
  { label: "API Keys", href: "/dashboard/api-keys", icon: KeyRound, enabled: true },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, enabled: true },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen flex-col justify-between border-r border-border bg-background p-4">
      <div>
        <div className="mb-8 rounded-3xl border border-[#1f1f1f] bg-card p-4">
          <BrandLogo size={28} subtitle="Architecture control center" />
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname.startsWith("/scan")
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return item.enabled ? (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                  active
                    ? "bg-[rgba(37,99,235,0.28)] text-[#2563EB]"
                    : "text-muted-foreground hover:bg-card hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            ) : (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
                  Soon
                </span>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="rounded-3xl border border-[#1f1f1f] bg-card p-4">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Signed in
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white">Developer session</span>
          <div className="[&_img]:grayscale">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 border border-[#1f1f1f]",
                  userButtonTrigger:
                    "rounded-full border border-[#1f1f1f] p-0.5 transition hover:border-[rgba(37,99,235,0.2)] hover:bg-[rgba(37,99,235,0.1)]",
                  userPreviewMainIdentifier: "text-white",
                  userPreviewSecondaryIdentifier: "text-muted-foreground",
                },
              }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
