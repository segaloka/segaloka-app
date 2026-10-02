"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/layout/Icon";

type ServiceType =
  | "umrah"
  | "haji"
  | "halal_tour"
  | "tour_domestik"
  | "tour_internasional"
  | "segadeals";

type OpenPanel = "origin" | "destination" | "date" | null;

const SERVICES = [
  { type: "umrah", label: "Umrah", description: "Reguler, Plus & VIP", icon: "building" },
  { type: "haji", label: "Haji", description: "Pilihan perjalanan Haji", icon: "booking" },
  { type: "halal_tour", label: "Halal Tour", description: "Wisata ramah muslim", icon: "globe" },
  { type: "tour_domestik", label: "Tour Domestik", description: "Jelajahi Indonesia", icon: "route" },
  { type: "tour_internasional", label: "Tour Internasional", description: "Jelajahi dunia", icon: "plane" },
  { type: "segadeals", label: "SegaDeals", description: "Minta Travel menawar", icon: "handshake" },
] as const;

const ORIGINS = [
  "Jakarta",
  "Denpasar-Bali",
  "Surabaya",
  "Medan",
  "Kuala Lumpur",
  "Makassar",
  "Singapore",
  "Yogyakarta",
  "Balikpapan",
  "Batam",
];

const DESTINATIONS: Record<ServiceType, string[]> = {
  umrah: ["Makkah & Madinah", "Makkah, Madinah & Thaif"],
  haji: ["Makkah, Madinah & Masyair"],
  halal_tour: ["Turki", "Jepang", "Korea Selatan", "Malaysia", "Singapura"],
  tour_domestik: ["Bali", "Lombok", "Labuan Bajo", "Yogyakarta", "Raja Ampat"],
  tour_internasional: ["Jepang", "Korea Selatan", "Turki", "Malaysia", "Singapura"],
  segadeals: ["Makkah & Madinah", "Turki", "Jepang", "Korea Selatan", "Bali", "Lombok", "Labuan Bajo"],
};

const SEARCH_FORM: Record<
  ServiceType,
  { destinationLabel: string; destinationPlaceholder: string; dateLabel: string; actionLabel: string }
> = {
  umrah: { destinationLabel: "Tujuan Umrah", destinationPlaceholder: "Pilih tujuan Umrah", dateLabel: "Tanggal", actionLabel: "Cari" },
  haji: { destinationLabel: "Program Haji", destinationPlaceholder: "Pilih program Haji", dateLabel: "Rencana Berangkat", actionLabel: "Cari" },
  halal_tour: { destinationLabel: "Destinasi", destinationPlaceholder: "Pilih destinasi Halal Tour", dateLabel: "Tanggal", actionLabel: "Cari" },
  tour_domestik: { destinationLabel: "Destinasi", destinationPlaceholder: "Pilih destinasi Indonesia", dateLabel: "Tanggal", actionLabel: "Cari" },
  tour_internasional: { destinationLabel: "Destinasi", destinationPlaceholder: "Pilih destinasi internasional", dateLabel: "Tanggal", actionLabel: "Cari" },
  segadeals: { destinationLabel: "Destinasi", destinationPlaceholder: "Pilih tujuan perjalanan", dateLabel: "Rencana Tanggal", actionLabel: "Buat Permintaan" },
};

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromISODate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatShortDate(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(fromISODate(value));
}

function monthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayIndex = (first.getDay() + 6) % 7;
  const start = addDays(first, -mondayIndex);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function CalendarMonth({
  month,
  from,
  to,
  minimumDate,
  onSelect,
}: {
  month: Date;
  from: string;
  to: string;
  minimumDate: Date;
  onSelect: (value: string) => void;
}) {
  const days = monthDays(month);

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-4 text-center font-display text-sm font-extrabold text-[#343941]">
        {MONTHS_ID[month.getMonth()]} {month.getFullYear()}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className={`pb-2 text-center text-[11px] font-semibold ${
              day === "Min" ? "text-[#ff4c4c]" : "text-[#343941]"
            }`}
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const value = toISODate(day);
          const currentMonth = day.getMonth() === month.getMonth();
          const disabled = day < minimumDate;
          const selectedStart = from === value;
          const selectedEnd = to === value;
          const inRange =
            Boolean(from && to) &&
            day >= fromISODate(from) &&
            day <= fromISODate(to);
          const sunday = day.getDay() === 0;

          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(value)}
              className={`relative flex h-11 items-center justify-center text-xs font-semibold transition ${
                !currentMonth ? "text-transparent" : sunday ? "text-[#ff4c4c]" : "text-[#343941]"
              } ${disabled ? "cursor-not-allowed opacity-30" : "hover:bg-[#edf5ff]"} ${
                inRange && currentMonth ? "bg-[#e9f2ff]" : ""
              }`}
              aria-label={formatShortDate(value)}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-md ${
                  selectedStart || selectedEnd
                    ? "bg-primary text-white"
                    : ""
                }`}
              >
                {currentMonth ? day.getDate() : ""}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MarketplaceSearch() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [service, setService] = useState<ServiceType>("umrah");
  const [origin, setOrigin] = useState("Jakarta");
  const [destination, setDestination] = useState("");
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState("");
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [showSegaDealsInfo, setShowSegaDealsInfo] = useState(false);

  const form = SEARCH_FORM[service];
  const minimumDate = startOfToday();

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenPanel(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const filteredOrigins = useMemo(
    () => ORIGINS.filter((item) => item.toLowerCase().includes(originQuery.toLowerCase())),
    [originQuery],
  );

  const filteredDestinations = useMemo(
    () =>
      DESTINATIONS[service].filter((item) =>
        item.toLowerCase().includes(destinationQuery.toLowerCase()),
      ),
    [destinationQuery, service],
  );

  const handleServiceClick = (nextService: ServiceType) => {
    setService(nextService);
    setDestination("");
    setDestinationQuery("");
    setOpenPanel(null);

    if (nextService === "segadeals") {
      setShowSegaDealsInfo(true);
    }
  };

  const handleSearch = () => {
    if (service === "segadeals") {
      const params = new URLSearchParams();

      params.set("origin", origin);
      if (destination) params.set("destination", destination);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      params.set("travelers", String(travelers));
      if (budget) params.set("budget", budget);

      router.push(`/akun/segadeals/baru?${params.toString()}`);
      return;
    }

    const route =
      service === "tour_domestik" || service === "tour_internasional"
        ? "tour"
        : service;

    const params = new URLSearchParams();

    params.set("origin", origin);
    if (destination) params.set("destination", destination);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    params.set("travelers", String(travelers));

    if (service === "tour_domestik") {
      params.set("scope", "domestic");
    }

    if (service === "tour_internasional") {
      params.set("scope", "international");
    }

    router.push(`/paket/${route}?${params.toString()}`);
  };

  const handleDateSelect = (value: string) => {
    if (!dateFrom || (dateFrom && dateTo)) {
      setDateFrom(value);
      setDateTo("");
      return;
    }

    if (value < dateFrom) {
      setDateFrom(value);
      setDateTo(dateFrom);
    } else {
      setDateTo(value);
      setOpenPanel(null);
    }
  };

  const dateSummary = dateFrom
    ? dateTo
      ? `${formatShortDate(dateFrom)} – ${formatShortDate(dateTo)}`
      : formatShortDate(dateFrom)
    : "Pilih tanggal";

  return (
    <div ref={rootRef} className="relative pt-5 sm:pt-6">
      {showSegaDealsInfo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071a33]/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="segadeals-info-title"
          onClick={() => setShowSegaDealsInfo(false)}
        >
          <div
            className="max-h-[calc(100dvh-24px)] w-full max-w-[520px] overflow-y-auto rounded-[18px] border border-[#dce6f1] bg-white shadow-[0_28px_80px_rgba(7,26,51,0.24)] sm:rounded-[24px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-4 sm:p-7">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <span className="inline-flex rounded-full bg-[#eaf3ff] px-3 py-1 text-[10px] font-extrabold tracking-[0.08em] text-primary">
                    APA ITU SEGADEALS
                  </span>
                  <h2 id="segadeals-info-title" className="mt-3 font-display text-lg font-extrabold leading-tight tracking-[-0.025em] text-[#10223f] sm:text-[22px]">
                    Sampaikan kebutuhan perjalanan Anda, biarkan Travel memberikan penawaran.
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Tutup penjelasan SegaDeals"
                  onClick={() => setShowSegaDealsInfo(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dce5ef] text-lg font-medium text-[#65758b] transition hover:bg-[#f5f8fc]"
                >
                  ×
                </button>
              </div>
              <p className="mt-3 text-[13px] leading-5 text-[#617188] sm:mt-4 sm:text-sm sm:leading-6">
                SegaDeals membantu Anda menyampaikan kota keberangkatan, destinasi, jumlah traveler, budget dan rencana tanggal perjalanan. Travel dalam ekosistem Segaloka kemudian dapat memberikan penawaran yang sesuai dengan kebutuhan Anda.
              </p>
              <div className="mt-5 rounded-2xl bg-[#f5f9ff] p-4">
                <p className="text-xs font-bold leading-5 text-[#314764]">
                  Anda dapat membandingkan penawaran yang masuk sebelum menentukan Travel dan paket yang paling sesuai.
                </p>
              </div>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowSegaDealsInfo(false)} className="min-h-11 rounded-xl border border-[#d8e2ee] px-5 text-xs font-extrabold text-[#52647e] transition hover:bg-[#f7f9fc]">
                  Nanti Saja
                </button>
                <button type="button" onClick={() => { setShowSegaDealsInfo(false); handleSearch(); }} className="min-h-11 rounded-xl bg-primary px-5 text-xs font-extrabold text-white transition hover:opacity-90">
                  Mulai Buat Permintaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openPanel === "date" && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#071a33]/10 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[calc(100dvh-24px)] w-full max-w-[820px] overflow-y-auto rounded-[18px] border border-[#dfe5ec] bg-white p-3.5 shadow-[0_24px_70px_rgba(16,34,63,0.20)] sm:rounded-[22px] sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-extrabold tracking-[-0.02em] text-[#343941] sm:text-[22px]">
                Atur Tanggal
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Bulan sebelumnya"
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}
                  disabled={calendarMonth <= new Date(minimumDate.getFullYear(), minimumDate.getMonth(), 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#5b6068] transition hover:bg-[#f3f5f8] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Bulan berikutnya"
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#5b6068] transition hover:bg-[#f3f5f8]"
                >
                  ›
                </button>
                <button
                  type="button"
                  aria-label="Tutup kalender"
                  onClick={() => setOpenPanel(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-[#5b6068] transition hover:bg-[#f3f5f8]"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:mt-6 md:grid-cols-2 md:gap-6">
              <CalendarMonth
                month={calendarMonth}
                from={dateFrom}
                to={dateTo}
                minimumDate={minimumDate}
                onSelect={handleDateSelect}
              />
              <CalendarMonth
                month={addMonths(calendarMonth, 1)}
                from={dateFrom}
                to={dateTo}
                minimumDate={minimumDate}
                onSelect={handleDateSelect}
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-[#edf0f4] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-[#7b8491]">
                {dateFrom && !dateTo
                  ? "Pilih tanggal selesai."
                  : "Pilih tanggal keberangkatan dan tanggal selesai."}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="h-9 rounded-lg border border-[#dce4ee] px-3 text-xs font-bold text-[#52647e] transition hover:bg-[#f7f9fc]"
                >
                  Hapus tanggal
                </button>
                <button
                  type="button"
                  onClick={() => setOpenPanel(null)}
                  className="h-9 rounded-lg bg-primary px-4 text-xs font-extrabold text-white"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute left-1/2 top-0 z-20 w-[calc(100%-16px)] -translate-x-1/2 sm:w-max sm:max-w-[calc(100%-32px)]">
        <div className="overflow-x-auto rounded-[18px] border border-[#dce4ee] bg-white shadow-[0_8px_22px_rgba(16,34,63,0.14)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:rounded-full">
          <div className="flex min-w-max items-center gap-0.5 px-1 py-1 sm:gap-1 sm:px-2 sm:py-1.5">
            {SERVICES.map((item) => {
              const active = service === item.type;

              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleServiceClick(item.type)}
                  className={`group flex h-9 shrink-0 items-center gap-1 rounded-full px-1.5 transition sm:h-11 sm:gap-2 sm:px-3 ${
                    active ? "bg-[#eaf3ff] text-primary" : "text-[#52647e] hover:bg-[#f5f8fc]"
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${active ? "bg-white text-primary" : "bg-[#eef4fb] text-primary"}`}>
                    <Icon name={item.icon} size={16} />
                  </span>
                  <span className={`whitespace-nowrap text-[11px] font-extrabold sm:text-xs ${active ? "text-primary" : "text-[#52647e]"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-[18px] border border-[#dce4ee] bg-white px-2.5 pb-3 pt-[52px] shadow-[0_18px_50px_rgba(16,34,63,0.14)] sm:rounded-[22px] sm:px-4 sm:pb-4 sm:pt-[64px]">
        <div
          className={`grid gap-2.5 ${
            service === "segadeals"
              ? "md:grid-cols-2 xl:grid-cols-[minmax(190px,1.05fr)_minmax(240px,1.35fr)_142px_158px_174px_176px]"
              : "md:grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_minmax(220px,1.25fr)_150px_170px_112px] xl:grid-cols-[minmax(220px,1.15fr)_minmax(300px,1.6fr)_180px_200px_112px]"
          }`}
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenPanel(openPanel === "origin" ? null : "origin")}
              className="flex min-h-[62px] w-full cursor-pointer items-center gap-3 rounded-xl border border-[#dfe7f0] bg-[#fbfdff] px-3.5 text-left transition hover:border-[#c8d8ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-expanded={openPanel === "origin"}
              aria-haspopup="dialog"
            >
            <span className="shrink-0 text-primary"><Icon name="route" size={17} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold text-[#8b9aae]">Dari</span>
              <span className="mt-0.5 block truncate text-[13px] font-extrabold text-[#10223f]">{origin}</span>
            </span>

            </button>

            {openPanel === "origin" && (
              <div
                className="fixed inset-x-3 top-[96px] z-[80] max-h-[calc(100dvh-112px)] overflow-y-auto rounded-2xl border border-[#e0e5eb] bg-white p-4 shadow-[0_24px_60px_rgba(16,34,63,0.18)] sm:absolute sm:inset-x-auto sm:left-0 sm:top-[calc(100%+10px)] sm:max-h-none sm:w-[min(460px,calc(100vw-32px))] sm:overflow-visible sm:p-5"
                onClick={(event) => event.stopPropagation()}
              >
                <h3 className="font-display text-[21px] font-extrabold text-[#343941]">Pilih Kota atau Bandara</h3>
                <div className="mt-4 flex items-center gap-3 rounded-full bg-[#f5f7fb] px-4 py-3">
                  <span className="text-[#9aa6b8]"><Icon name="search" size={18} /></span>
                  <input
                    autoFocus
                    value={originQuery}
                    onChange={(event) => setOriginQuery(event.target.value)}
                    placeholder="Masukkan nama kota atau bandara."
                    className="w-full bg-transparent text-sm font-medium text-[#5e718c] outline-none placeholder:text-[#8d9ab0]"
                  />
                </div>
                <p className="mt-5 font-display text-lg font-extrabold text-[#343941] sm:mt-6 sm:text-[21px]">Destinasi Populer</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {filteredOrigins.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setOrigin(item);
                        setOpenPanel(null);
                        setOriginQuery("");
                      }}
                      className="rounded-full border border-[#d8e0ea] px-3 py-2 text-sm font-medium text-[#414852] transition hover:border-primary hover:bg-[#f5f9ff]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative min-w-0">
            <button
              type="button"
              onClick={() => setOpenPanel(openPanel === "destination" ? null : "destination")}
            className="relative flex min-h-[62px] w-full min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-[#dfe7f0] bg-[#fbfdff] px-3.5 text-left transition hover:border-[#c8d8ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-expanded={openPanel === "destination"}
          >
            <span className="shrink-0 text-primary"><Icon name="globe" size={17} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold text-[#8b9aae]">{form.destinationLabel}</span>
              <span className={`mt-0.5 block truncate text-[13px] font-extrabold ${destination ? "text-[#10223f]" : "text-[#65758b]"}`}>
                {destination || form.destinationPlaceholder}
              </span>
            </span>

            </button>

            {openPanel === "destination" && (
              <div
                className="fixed inset-x-3 top-[96px] z-[80] max-h-[calc(100dvh-112px)] overflow-y-auto rounded-2xl border border-[#e0e5eb] bg-white p-4 shadow-[0_24px_60px_rgba(16,34,63,0.18)] sm:absolute sm:inset-x-auto sm:left-0 sm:top-[calc(100%+10px)] sm:max-h-none sm:w-[min(460px,calc(100vw-32px))] sm:overflow-visible sm:p-5"
                onClick={(event) => event.stopPropagation()}
              >
                <h3 className="font-display text-[21px] font-extrabold text-[#343941]">Pilih Destinasi</h3>
                <div className="mt-4 flex items-center gap-3 rounded-full bg-[#f5f7fb] px-4 py-3">
                  <span className="text-[#9aa6b8]"><Icon name="search" size={18} /></span>
                  <input
                    autoFocus
                    value={destinationQuery}
                    onChange={(event) => setDestinationQuery(event.target.value)}
                    placeholder="Masukkan nama kota atau destinasi."
                    className="w-full bg-transparent text-sm font-medium text-[#5e718c] outline-none placeholder:text-[#8d9ab0]"
                  />
                </div>
                <p className="mt-5 font-display text-lg font-extrabold text-[#343941] sm:mt-6 sm:text-[21px]">Destinasi Populer</p>
                <div className="mt-4 flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                  {filteredDestinations.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setDestination(item);
                        setOpenPanel(null);
                        setDestinationQuery("");
                      }}
                      className="rounded-full border border-[#d8e0ea] px-3 py-2 text-sm font-medium text-[#414852] transition hover:border-primary hover:bg-[#f5f9ff]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {service === "segadeals" && (
            <button
              type="button"
              onClick={() => setOpenPanel(openPanel === "date" ? null : "date")}
              className="relative order-5 flex min-h-[62px] cursor-pointer items-center gap-3 rounded-xl border border-[#dfe7f0] bg-[#fbfdff] px-3.5 text-left transition hover:border-[#c8d8ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-expanded={openPanel === "date"}
            >
              <span className="shrink-0 text-primary"><Icon name="booking" size={17} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold text-[#8b9aae]">{form.dateLabel}</span>
                <span className={`mt-0.5 block truncate text-[13px] font-extrabold ${dateFrom ? "text-[#10223f]" : "text-[#65758b]"}`}>{dateSummary}</span>
              </span>
            </button>
          )}

          <div className={`flex min-h-[62px] items-center gap-3 rounded-xl border border-[#dfe7f0] bg-[#fbfdff] px-3.5 ${service === "segadeals" ? "order-3" : ""}`}>
            <span className="shrink-0 text-primary"><Icon name="user" size={17} /></span>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold text-[#8b9aae]">Traveler</span>
              <div className="mt-1 flex items-center justify-between gap-2">
                <button type="button" aria-label="Kurangi traveler" onClick={() => setTravelers((value) => Math.max(1, value - 1))} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d8e2ee] bg-white text-base font-bold text-primary transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">-</button>
                <span className="whitespace-nowrap text-[13px] font-extrabold text-[#10223f]">{travelers} orang</span>
                <button type="button" aria-label="Tambah traveler" onClick={() => setTravelers((value) => Math.min(20, value + 1))} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d8e2ee] bg-white text-base font-bold text-primary transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">+</button>
              </div>
            </div>
          </div>

          {service === "segadeals" && (
            <label className="order-4 flex min-h-[62px] cursor-text items-center gap-3 rounded-xl border border-[#dfe7f0] bg-[#fbfdff] px-3.5 transition hover:border-[#c8d8ea]">
              <span className="shrink-0 text-[15px] font-extrabold text-primary">Rp</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold text-[#8b9aae]">Budget</span>
                <input
                  aria-label="Budget SegaDeals"
                  type="text"
                  inputMode="numeric"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value.replace(/\D/g, ""))}
                  placeholder="Contoh Rp30.000.000"
                  className="mt-0.5 w-full bg-transparent text-[13px] font-extrabold text-[#10223f] outline-none placeholder:font-medium placeholder:text-[#9aa7b8]"
                />
              </span>
            </label>
          )}

          {service !== "segadeals" && (
            <button
              type="button"
              onClick={() => setOpenPanel(openPanel === "date" ? null : "date")}
              className="relative flex min-h-[62px] cursor-pointer items-center gap-3 rounded-xl border border-[#dfe7f0] bg-[#fbfdff] px-3.5 text-left transition hover:border-[#c8d8ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-expanded={openPanel === "date"}
            >
              <span className="shrink-0 text-primary"><Icon name="booking" size={17} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold text-[#8b9aae]">{form.dateLabel}</span>
                <span className={`mt-0.5 block truncate text-[13px] font-extrabold ${dateFrom ? "text-[#10223f]" : "text-[#65758b]"}`}>{dateSummary}</span>
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSearch}
            className={`inline-flex min-h-[62px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-4 text-xs font-extrabold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${service === "segadeals" ? "order-6" : ""}`}
          >
            <Icon name="search" size={16} />
            {form.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
