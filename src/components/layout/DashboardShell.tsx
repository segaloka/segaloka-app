"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";
import { Icon, type IconName } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";
import { LogoutButton } from "./LogoutButton";

export interface NavItem {
  href: string;
  label: string;
  icon?: IconName;
  badge?: number | string;
  /** Sub-menu (e.g. Travel › Semua Travel / Cabang / Legalitas …). */
  children?: NavItem[];
}
export interface NavGroup {
  group: string;
  icon?: IconName;
  items: NavItem[];
}

function flatten(nav: NavGroup[]): string[] {
  const out: string[] = [];
  nav.forEach((g) => g.items.forEach((i) => (i.children?.length ? i.children.forEach((c) => out.push(c.href)) : out.push(i.href))));
  return out;
}

/** The single best-matching href for the current path (longest prefix wins, so "/admin" never swallows "/admin/x"). */
function activeHref(pathname: string, hrefs: string[]): string | null {
  let best: string | null = null;
  for (const h of hrefs) {
    if (pathname === h || pathname.startsWith(h + "/")) {
      if (!best || h.length > best.length) best = h;
    }
  }
  return best;
}

export function DashboardShell({
  brandLabel,
  brandHref,
  brandSub,
  nav,
  userLabel,
  userSub,
  contextSwitcher,
  collapsible = false,
  searchable = false,
  children,
}: {
  brandLabel: string;
  brandHref: string;
  brandSub?: string;
  nav: NavGroup[];
  userLabel: string;
  userSub?: string;
  contextSwitcher?: ReactNode;
  /** Only the group holding the current page is expanded; others fold to one line. For big menus (Super Admin). */
  collapsible?: boolean;
  /** Show a "Filter menu…" box above the nav. */
  searchable?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const current = useMemo(() => activeHref(pathname, flatten(nav)), [pathname, nav]);

  const groupHasActive = (g: NavGroup) => g.items.some((i) => i.href === current || i.children?.some((c) => c.href === current));
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(nav.filter(groupHasActive).map((g) => g.group)));
  const toggleGroup = (name: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  const q = filter.trim().toLowerCase();
  const visibleNav: NavGroup[] = q
    ? nav
        .map((g) => ({
          ...g,
          items: g.items
            .map((i) => {
              const kids = i.children?.filter((c) => c.label.toLowerCase().includes(q));
              if (kids?.length) return { ...i, children: kids };
              return i.label.toLowerCase().includes(q) || g.group.toLowerCase().includes(q) ? i : null;
            })
            .filter(Boolean) as NavItem[],
        }))
        .filter((g) => g.items.length)
    : nav;

  const linkCls = (on: boolean, nested = false) =>
    cx(
      "flex items-center gap-2.5 rounded-md py-2 text-sm font-medium",
      nested ? "pl-8 pr-2.5" : "px-2.5",
      on ? "bg-primary/10 font-semibold text-primary" : "text-text-secondary hover:bg-bg hover:text-text-primary"
    );

  const Badge = ({ v }: { v?: number | string }) =>
    v ? <span className="ms-auto rounded-full bg-secondary px-1.5 text-[11px] font-bold text-secondary-fg">{v}</span> : null;

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-fg">S</div>
        <div className="min-w-0">
          <Link href={brandHref} className="block font-display text-base font-bold text-text-primary">{brandLabel}</Link>
          {brandSub && <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{brandSub}</p>}
        </div>
      </div>
      {contextSwitcher && <div className="border-b border-border p-3">{contextSwitcher}</div>}
      {searchable && (
        <div className="px-3 pt-3">
          <label className="flex h-9 items-center gap-2 rounded-md bg-bg px-2.5 text-muted">
            <Icon name="search" size={15} />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter menu…"
              aria-label="Filter menu"
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-muted"
            />
          </label>
        </div>
      )}
      <nav className={cx("flex-1 overflow-y-auto px-3 py-3", collapsible ? "space-y-1" : "space-y-5")}>
        {visibleNav.map((group) => {
          const open = !collapsible || !!q || openGroups.has(group.group) || groupHasActive(group);
          return (
            <div key={group.group}>
              {collapsible ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.group)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-[11px] font-bold uppercase tracking-wider text-muted hover:text-text-primary"
                >
                  {group.icon && <Icon name={group.icon} size={14} />}
                  <span className="flex-1">{group.group}</span>
                  <Icon name={open ? "chevronDown" : "chevronRight"} size={14} className="flip-rtl" />
                </button>
              ) : (
                <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted">{group.group}</p>
              )}
              {open && (
                <div className="mt-1 space-y-0.5">
                  {group.items.map((item) => {
                    if (item.children?.length) {
                      const kidActive = item.children.some((c) => c.href === current);
                      return (
                        <div key={item.label}>
                          <p className={cx("flex items-center gap-2.5 px-2.5 py-2 text-sm font-semibold", kidActive ? "text-text-primary" : "text-text-secondary")}>
                            {item.icon && <Icon name={item.icon} size={16} />}
                            {item.label}
                          </p>
                          {item.children.map((c) => (
                            <Link key={c.href + c.label} href={c.href} onClick={() => setMobileOpen(false)} className={linkCls(c.href === current, true)} aria-current={c.href === current ? "page" : undefined}>
                              {c.label}
                              <Badge v={c.badge} />
                            </Link>
                          ))}
                        </div>
                      );
                    }
                    const on = item.href === current;
                    return (
                      <Link key={item.href + item.label} href={item.href} onClick={() => setMobileOpen(false)} className={linkCls(on)} aria-current={on ? "page" : undefined}>
                        {item.icon && <Icon name={item.icon} size={16} />}
                        {item.label}
                        <Badge v={item.badge} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-fg">{userLabel.charAt(0).toUpperCase()}</div>
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
      <aside className="hidden w-64 flex-none border-e border-border bg-surface lg:block">
        <div className="sticky top-0 h-screen">{SidebarContent}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-72 bg-surface shadow-modal">{SidebarContent}</div>
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
