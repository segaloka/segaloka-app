"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/layout/Icon";

const NAV = [
  ["Umrah", "/paket/umrah"],
  ["Haji", "/paket/haji"],
  ["Halal Tour", "/paket/halal_tour"],
  ["Tour", "/paket/tour"],
  ["SegaDeals", "/akun/segadeals"],
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

export function MarketplaceHeader() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("id");
  const [currency, setCurrency] = useState("IDR");

  useEffect(() => {
    const storedLanguage = localStorage.getItem("segaloka-language");
    const storedCurrency = localStorage.getItem("segaloka-currency");
    if (storedLanguage) setLanguage(storedLanguage);
    if (storedCurrency) setCurrency(storedCurrency);
  }, []);

  const savePreferences = () => {
    localStorage.setItem("segaloka-language", language);
    localStorage.setItem("segaloka-currency", currency);
    setOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#e4eaf1] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[62px] max-w-[1180px] items-center gap-5 px-4">
          <Link href="/" className="flex shrink-0 items-center" aria-label="Segaloka">
            <img
              src="/brand/segaloka-logo.png"
              alt="Segaloka"
              className="h-10 w-auto object-contain"
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
              className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-extrabold text-[#40546f] hover:bg-[#f2f6fb] sm:flex"
            >
              <Icon name="globe" size={14} />
              {language.toUpperCase()} · {currency}
            </button>
            <Link href="/login" className="hidden px-2.5 py-2 text-xs font-extrabold text-[#10223f] sm:inline-flex">Masuk</Link>
            <Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-xs font-extrabold text-white">Daftar</Link>
            <button type="button" onClick={() => setOpen(true)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dfe7f0] text-primary sm:hidden" aria-label="Bahasa dan mata uang">
              <Icon name="globe" size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border-t border-[#eef2f6] lg:hidden">
          <nav className="mx-auto flex min-w-max max-w-[1180px] items-center justify-center gap-5 px-4 py-2.5">
            {NAV.map(([label, href]) => (
              <Link key={label} href={href} className="text-xs font-bold text-[#52647e]">{label}</Link>
            ))}
          </nav>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07182d]/55 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <div className="max-h-[88vh] w-full max-w-[760px] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5ebf2] px-5 py-4">
              <div>
                <p className="text-sm font-extrabold text-[#10223f]">Bahasa & Mata Uang</p>
                <p className="mt-0.5 text-xs text-[#748297]">Atur preferensi tampilan Segaloka.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f5f9] text-[#40546f]">×</button>
            </div>

            <div className="grid md:grid-cols-2">
              <div className="border-b border-[#e5ebf2] p-5 md:border-b-0 md:border-r">
                <p className="text-sm font-extrabold text-[#10223f]">Bahasa</p>
                <div className="mt-3 grid gap-2">
                  {LANGUAGES.map(([code, label]) => (
                    <label key={code} className="flex cursor-pointer items-center justify-between rounded-xl border border-[#e1e8f0] px-3.5 py-3">
                      <span className="text-sm font-bold text-[#40546f]">{label}</span>
                      <input type="radio" name="language" value={code} checked={language === code} onChange={() => setLanguage(code)} />
                    </label>
                  ))}
                </div>
                <p className="mt-5 text-xs leading-4 text-[#8a98aa]">Pilihan disimpan di perangkat ini. Penerjemahan penuh konten akan mengikuti implementasi i18n production.</p>
              </div>

              <div className="p-5">
                <p className="text-sm font-extrabold text-[#10223f]">Mata Uang</p>
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
                  Harga production tetap bersumber dari data transaksi asli. Konversi mata uang belum diaktifkan sampai FX/payment production dikonfigurasi.
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#e5ebf2] px-5 py-4">
              <button type="button" onClick={savePreferences} className="rounded-lg bg-primary px-6 py-2.5 text-xs font-extrabold text-white">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
