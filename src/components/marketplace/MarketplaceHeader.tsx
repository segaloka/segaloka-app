"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/layout/Icon";

const NAV = [
  ["Umrah", "/paket/umrah"],
  ["Haji", "/paket/haji"],
  ["Halal Tour", "/paket/halal_tour"],
  ["Tour", "/paket/tour"],
  ["SegaDeals", "/segadeals"],
] as const;

const LANGUAGES = [
  ["id", "Bahasa Indonesia"],
  ["en", "English"],
  ["ar", "العربية"],
] as const;

const CURRENCIES = [
  ["IDR", "Indonesian Rupiah"],
  ["USD", "United States Dollar"],
  ["MYR", "Malaysian Ringgit"],
  ["SGD", "Singapore Dollar"],
  ["SAR", "Saudi Riyal"],
] as const;

const COPY = {
  id:{login:"Masuk",register:"Daftar",aria:"Bahasa dan mata uang",title:"Bahasa & Mata Uang",subtitle:"Atur preferensi tampilan Segaloka.",language:"Bahasa",languageHint:"Pilihan disimpan di perangkat ini dan diterapkan pada tampilan Segaloka yang sudah mendukung i18n.",currency:"Mata Uang",currencyHint:"Harga tetap bersumber dari data transaksi asli. Konversi mata uang belum diaktifkan sampai sumber kurs production dikonfigurasi.",save:"Simpan"},
  en:{login:"Sign in",register:"Register",aria:"Language and currency",title:"Language & Currency",subtitle:"Set your Segaloka display preferences.",language:"Language",languageHint:"Your selection is saved on this device and applied to Segaloka screens that support i18n.",currency:"Currency",currencyHint:"Prices continue to use original transaction data. Currency conversion remains disabled until a production exchange-rate source is configured.",save:"Save"},
  ar:{login:"تسجيل الدخول",register:"إنشاء حساب",aria:"اللغة والعملة",title:"اللغة والعملة",subtitle:"اضبط تفضيلات عرض Segaloka.",language:"اللغة",languageHint:"يتم حفظ اختيارك على هذا الجهاز وتطبيقه على صفحات Segaloka التي تدعم تعدد اللغات.",currency:"العملة",currencyHint:"تظل الأسعار مستندة إلى بيانات المعاملات الأصلية. تحويل العملات غير مفعّل حتى يتم إعداد مصدر أسعار صرف للإنتاج.",save:"حفظ"}
} as const;

export function MarketplaceHeader({ initialLanguage = "id", initialCurrency = "IDR" }: { initialLanguage?: string; initialCurrency?: string }) {
  const safeInitialLanguage = LANGUAGES.some(([code]) => code === initialLanguage) ? initialLanguage : "id";
  const safeInitialCurrency = CURRENCIES.some(([code]) => code === initialCurrency) ? initialCurrency : "IDR";
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(safeInitialLanguage);
  const [currency, setCurrency] = useState(safeInitialCurrency);

  useEffect(() => {
    const storedLanguage = localStorage.getItem("segaloka-language");
    const storedCurrency = localStorage.getItem("segaloka-currency");
    if (storedLanguage && LANGUAGES.some(([code]) => code === storedLanguage)) setLanguage(storedLanguage);
    if (storedCurrency && CURRENCIES.some(([code]) => code === storedCurrency)) setCurrency(storedCurrency);
  }, []);

  const t = COPY[language === "en" || language === "ar" ? language : "id"];

  const savePreferences = () => {
    localStorage.setItem("segaloka-language", language);
    localStorage.setItem("segaloka-currency", currency);
    document.cookie = `segaloka-language=${language}; path=/; max-age=31536000; samesite=lax`;
    document.cookie = `segaloka-currency=${currency}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#e4eaf1] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[58px] max-w-[1180px] items-center gap-2 px-3 sm:h-[62px] sm:gap-5 sm:px-4">
          <Link href="/" className="flex shrink-0 items-center" aria-label="Segaloka">
            <img
              src="/brand/segaloka-logo.png"
              alt="Segaloka"
              className="h-9 w-auto max-w-[128px] object-contain sm:h-11 sm:max-w-none"
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
            {NAV.map(([label, href]) => (
              <Link key={label} href={href} className="text-sm font-bold text-[#52647e] transition hover:text-primary">
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-extrabold text-[#40546f] hover:bg-[#f2f6fb] md:flex"
            >
              <Icon name="globe" size={14} />
              {language.toUpperCase()} · {currency}
            </button>
            <Link href="/login" className="hidden px-2.5 py-2 text-xs font-extrabold text-[#10223f] md:inline-flex">{t.login}</Link>
            <Link href="/register" className="hidden rounded-lg bg-primary px-4 py-2 text-xs font-extrabold text-white md:inline-flex">{t.register}</Link>
            <button type="button" onClick={() => setOpen(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe7f0] bg-white text-primary md:hidden" aria-label={t.aria}>
              <Icon name="globe" size={14} />
            </button>
          </div>
        </div>


      </header>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07182d]/55 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <div dir={language === "ar" ? "rtl" : "ltr"} lang={language} className="max-h-[88vh] w-full max-w-[760px] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5ebf2] px-5 py-4">
              <div>
                <p className="text-sm font-extrabold text-[#10223f]">{t.title}</p>
                <p className="mt-0.5 text-xs text-[#748297]">{t.subtitle}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f5f9] text-[#40546f]">×</button>
            </div>

            <div className="grid md:grid-cols-2">
              <div className="border-b border-[#e5ebf2] p-5 md:border-b-0 md:border-r">
                <p className="text-sm font-extrabold text-[#10223f]">{t.language}</p>
                <div className="mt-3 grid gap-2">
                  {LANGUAGES.map(([code, label]) => (
                    <label key={code} className="flex cursor-pointer items-center justify-between rounded-xl border border-[#e1e8f0] px-3.5 py-3">
                      <span className="text-sm font-bold text-[#40546f]">{label}</span>
                      <input type="radio" name="language" value={code} checked={language === code} onChange={() => setLanguage(code)} />
                    </label>
                  ))}
                </div>
                <p className="mt-5 text-xs leading-4 text-[#8a98aa]">{t.languageHint}</p>
              </div>

              <div className="p-5">
                <p className="text-sm font-extrabold text-[#10223f]">{t.currency}</p>
                <div className="mt-3 grid gap-2">
                  {CURRENCIES.map(([code, label]) => (
                    <label key={code} className="flex cursor-pointer items-center justify-between rounded-xl border border-[#e1e8f0] px-3.5 py-3">
                      <span>
                        <span className="text-sm font-extrabold text-primary">{code}</span>
                        <span className="ml-2 text-xs text-[#52647e]">{label}</span>
                      </span>
                      <input type="radio" name="currency" value={code} checked={currency === code} onChange={() => setCurrency(code)} />
                    </label>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-[#eef6ff] p-3 text-xs leading-4 text-[#52647e]">
                  {t.currencyHint}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#e5ebf2] px-5 py-4">
              <button type="button" onClick={savePreferences} className="rounded-lg bg-primary px-6 py-2.5 text-xs font-extrabold text-white">{t.save}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
