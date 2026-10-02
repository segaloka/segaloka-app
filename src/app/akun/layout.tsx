import { DashboardShell, type NavGroup } from "@/components/layout/DashboardShell";
import { getProfile, getSessionUser } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function AkunLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const storedLanguage = cookieStore.get("segaloka-language")?.value;
  const language = storedLanguage === "en" || storedLanguage === "ar" ? storedLanguage : "id";
  const copy = {
    id:{group:"Traveler",home:"Beranda",booking:"Booking",deals:"SegaDeals",favorites:"Favorit",notifications:"Notifikasi",profile:"Profil",traveler:"Traveler"},
    en:{group:"Traveler",home:"Home",booking:"Bookings",deals:"SegaDeals",favorites:"Favorites",notifications:"Notifications",profile:"Profile",traveler:"Traveler"},
    ar:{group:"المسافر",home:"الرئيسية",booking:"الحجوزات",deals:"SegaDeals",favorites:"المفضلة",notifications:"الإشعارات",profile:"الملف الشخصي",traveler:"المسافر"}
  } as const;
  const t = copy[language];
  const nav: NavGroup[] = [
    {
      group: t.group,
      items: [
        { href: "/akun", label: t.home, icon: "dashboard" },
        { href: "/akun/booking", label: t.booking, icon: "package" },
        { href: "/akun/segadeals", label: t.deals, icon: "handshake" },
        { href: "/akun/favorit", label: t.favorites, icon: "heart" },
        { href: "/akun/notifikasi", label: t.notifications, icon: "bell" },
        { href: "/akun/profil", label: t.profile, icon: "users" },
      ],
    },
  ];

  const user = await getSessionUser();
  const profile = await getProfile();

  return (
    <div lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <DashboardShell
        brandLabel="Segaloka"
        brandHref="/akun"
        nav={nav}
        userLabel={profile?.full_name || user?.email || t.traveler}
        userSub={user?.email ?? undefined}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
