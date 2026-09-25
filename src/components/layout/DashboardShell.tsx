"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";
import { Icon, type IconName } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";
import { LogoutButton } from "./LogoutButton";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}
export interface NavGroup {
  group: string;
  items: NavItem[];
}

export function DashboardShell({
  brandLabel,
  brandHref,
  nav,
  userLabel,
  userSub,
  contextSwitcher,
  children,
}: {
  brandLabel: string;
  brandHref: string;
  nav: NavGroup[];
  userLabel: string;
  userSub?: string;
  contextSwitcher?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-fg">
          S
        </div>
        <Link href={brandHref} className="font-display text-base font-bold text-text-primary">
          {brandLabel}
        </Link>
      </div>
      {contextSwitcher && <div className="border-b border-border p-3">{contextSwitcher}</div>}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {nav.map((group) => (
          <div key={group.group}>
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted">{group.group}</p>
            <div className="mt-1.5 space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cx(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium",
                      active ? "bg-primary/10 text-primary" : "text-text-secondary hover:bg-bg hover:text-text-primary"
                    )}
                  >
                    <Icon name={item.icon} size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-fg">
            {userLabel.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">{userLabel}</p>
            {userSub && <p className="truncate text-xs text-muted">{userSub}</p>}
          </div>
        </div>
        <LogoutButton />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-64 flex-none border-r border-border bg-surface lg:block">{SidebarContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-surface shadow-modal">{SidebarContent}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface px-4">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
            <Icon name="menu" size={20} />
          </button>
          <div className="flex-1" />
          <ThemeToggle />
          <Link href="/akun/notifikasi" className="relative flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-bg" aria-label="Notifikasi">
            <Icon name="bell" size={17} />
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
