// Minimal, dependency-free i18n. Indonesian is the shipped default; English
// is fully wired as a second real language; Arabic is architecture-ready
// (dictionary + RTL CSS support) with a partial dictionary rather than a
// fully translated app — translating every page into 3 languages is out of
// scope for this pass, and is disclosed as such in the final report.
export type Locale = "id" | "en" | "ar";
export const LOCALES: Locale[] = ["id", "en", "ar"];
export const RTL_LOCALES: Locale[] = ["ar"];
export const LOCALE_COOKIE = "sl_locale";
export const DEFAULT_LOCALE: Locale = "id";

const dict = {
  id: {
    nav_home: "Beranda",
    nav_explore: "Jelajah",
    nav_booking: "Booking",
    nav_segadeals: "SegaDeals",
    nav_favorite: "Favorit",
    nav_messages: "Pesan",
    nav_notifications: "Notifikasi",
    nav_account: "Akun",
    nav_login: "Masuk",
    nav_register: "Daftar",
    nav_dashboard: "Dashboard",
    action_save: "Simpan",
    action_cancel: "Batal",
    action_create: "Buat",
    action_edit: "Ubah",
    action_delete: "Hapus",
    action_publish: "Publikasikan",
    action_view_detail: "Lihat detail",
    state_loading: "Memuat…",
    state_empty_title: "Belum ada data",
    state_error_title: "Terjadi kesalahan",
    state_unauthorized: "Anda tidak memiliki akses ke halaman ini",
    state_forbidden_subscription: "Fitur ini tidak tersedia pada paket langganan Anda",
    status_pending: "Menunggu",
    status_active: "Aktif",
    status_suspended: "Ditangguhkan",
    status_published: "Terbit",
    status_draft: "Draf",
  },
  en: {
    nav_home: "Home",
    nav_explore: "Explore",
    nav_booking: "Bookings",
    nav_segadeals: "SegaDeals",
    nav_favorite: "Wishlist",
    nav_messages: "Messages",
    nav_notifications: "Notifications",
    nav_account: "Account",
    nav_login: "Log in",
    nav_register: "Sign up",
    nav_dashboard: "Dashboard",
    action_save: "Save",
    action_cancel: "Cancel",
    action_create: "Create",
    action_edit: "Edit",
    action_delete: "Delete",
    action_publish: "Publish",
    action_view_detail: "View detail",
    state_loading: "Loading…",
    state_empty_title: "Nothing here yet",
    state_error_title: "Something went wrong",
    state_unauthorized: "You don't have access to this page",
    state_forbidden_subscription: "This feature isn't included in your plan",
    status_pending: "Pending",
    status_active: "Active",
    status_suspended: "Suspended",
    status_published: "Published",
    status_draft: "Draft",
  },
  ar: {
    nav_home: "الرئيسية",
    nav_explore: "استكشف",
    nav_booking: "الحجوزات",
    nav_segadeals: "SegaDeals",
    nav_favorite: "المفضلة",
    nav_messages: "الرسائل",
    nav_notifications: "الإشعارات",
    nav_account: "الحساب",
    nav_login: "تسجيل الدخول",
    nav_register: "إنشاء حساب",
    nav_dashboard: "لوحة التحكم",
    action_save: "حفظ",
    action_cancel: "إلغاء",
    action_create: "إنشاء",
    action_edit: "تعديل",
    action_delete: "حذف",
    action_publish: "نشر",
    action_view_detail: "عرض التفاصيل",
    state_loading: "جارٍ التحميل…",
    state_empty_title: "لا توجد بيانات بعد",
    state_error_title: "حدث خطأ",
    state_unauthorized: "ليس لديك صلاحية الوصول لهذه الصفحة",
    state_forbidden_subscription: "هذه الميزة غير متوفرة في باقتك",
    status_pending: "قيد الانتظار",
    status_active: "نشط",
    status_suspended: "موقوف",
    status_published: "منشور",
    status_draft: "مسودة",
  },
} as const;

export type DictKey = keyof (typeof dict)["id"];

export function t(locale: Locale, key: DictKey): string {
  return dict[locale]?.[key] ?? dict.id[key] ?? key;
}

export function dir(locale: Locale): "rtl" | "ltr" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}
