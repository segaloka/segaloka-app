import { DashboardShell, type NavGroup } from "@/components/layout/DashboardShell";
import { getProfile, getSessionUser } from "@/lib/auth";

const nav: NavGroup[] = [
  {
    group: "Traveler",
    items: [
      { href: "/akun", label: "Beranda", icon: "dashboard" },
      { href: "/akun/booking", label: "Booking", icon: "package" },
      { href: "/akun/segadeals", label: "SegaDeals", icon: "handshake" },
      { href: "/akun/favorit", label: "Favorit", icon: "heart" },
      { href: "/akun/notifikasi", label: "Notifikasi", icon: "bell" },
      { href: "/akun/profil", label: "Profil", icon: "users" },
    ],
  },
];

export default async function AkunLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const profile = await getProfile();

  return (
    <DashboardShell
      brandLabel="Segaloka"
      brandHref="/akun"
      nav={nav}
      userLabel={profile?.full_name || user?.email || "Traveler"}
      userSub={user?.email ?? undefined}
    >
      {children}
    </DashboardShell>
  );
}
