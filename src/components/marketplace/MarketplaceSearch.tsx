"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/layout/Icon";

type ServiceType = "umrah" | "haji" | "halal_tour" | "tour_domestik" | "tour_internasional" | "segadeals";

const SERVICES = [
  { type: "umrah", label: "Umrah", description: "Reguler, Plus & VIP", icon: "building" },
  { type: "haji", label: "Haji", description: "Pilihan perjalanan Haji", icon: "booking" },
  { type: "halal_tour", label: "Halal Tour", description: "Wisata ramah muslim", icon: "globe" },
  { type: "tour_domestik", label: "Tour Domestik", description: "Jelajahi Indonesia", icon: "route" },
  { type: "tour_internasional", label: "Tour Internasional", description: "Jelajahi dunia", icon: "plane" },
  { type: "segadeals", label: "SegaDeals", description: "Minta Travel menawar", icon: "handshake" },
] as const;

const DESTINATIONS: Record<ServiceType, string[]> = {
  umrah: [
    "Makkah & Madinah",
    "Makkah, Madinah & Thaif",
  ],
  haji: [
    "Makkah, Madinah & Masyair",
  ],
  halal_tour: [
    "Turki",
    "Jepang",
    "Korea Selatan",
    "Malaysia",
    "Singapura",
  ],
  tour_domestik: [
    "Bali",
    "Lombok",
    "Labuan Bajo",
    "Yogyakarta",
    "Raja Ampat",
  ],
  tour_internasional: [
    "Jepang",
    "Korea Selatan",
    "Turki",
    "Malaysia",
    "Singapura",
  ],
  segadeals: [
    "Makkah & Madinah",
    "Turki",
    "Jepang",
    "Korea Selatan",
    "Bali",
    "Lombok",
    "Labuan Bajo",
  ],
};

const SEARCH_FORM: Record<
  ServiceType,
  {
    destinationLabel: string;
    destinationPlaceholder: string;
    dateLabel: string;
    actionLabel: string;
  }
> = {
  umrah: {
    destinationLabel: "Tujuan Umrah",
    destinationPlaceholder: "Pilih tujuan Umrah",
    dateLabel: "Tanggal",
    actionLabel: "Cari",
  },
  haji: {
    destinationLabel: "Program Haji",
    destinationPlaceholder: "Pilih program Haji",
    dateLabel: "Rencana Berangkat",
    actionLabel: "Cari",
  },
  halal_tour: {
    destinationLabel: "Destinasi",
    destinationPlaceholder: "Pilih destinasi Halal Tour",
    dateLabel: "Tanggal",
    actionLabel: "Cari",
  },
  tour_domestik: {
    destinationLabel: "Destinasi",
    destinationPlaceholder: "Pilih destinasi Indonesia",
    dateLabel: "Tanggal",
    actionLabel: "Cari",
  },
  tour_internasional: {
    destinationLabel: "Destinasi",
    destinationPlaceholder: "Pilih destinasi internasional",
    dateLabel: "Tanggal",
    actionLabel: "Cari",
  },
  segadeals: {
    destinationLabel: "Destinasi",
    destinationPlaceholder: "Pilih tujuan perjalanan",
    dateLabel: "Rencana Tanggal",
    actionLabel: "Buat Permintaan",
  },
};

export function MarketplaceSearch() {
  const router = useRouter();
  const [service, setService] = useState<ServiceType>("umrah");
  const [origin, setOrigin] = useState("Jakarta");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState("");
  const [showSegaDealsInfo, setShowSegaDealsInfo] = useState(false);
  const form = SEARCH_FORM[service];

  const handleSearch = () => {
    if (service === "segadeals") {
      return;
    }

    const route = service === "tour_domestik" || service === "tour_internasional" ? "tour" : service;
    router.push(`/paket/${route}`);
  };

  return (
    <div className="relative pt-7">
      {showSegaDealsInfo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071a33]/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="segadeals-info-title"
          onClick={() => setShowSegaDealsInfo(false)}
        >
          <div
            className="w-full max-w-[520px] overflow-hidden rounded-[24px] border border-[#dce6f1] bg-white shadow-[0_28px_80px_rgba(7,26,51,0.24)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <span className="inline-flex rounded-full bg-[#eaf3ff] px-3 py-1 text-[10px] font-extrabold tracking-[0.08em] text-primary">
                    APA ITU SEGADEALS
                  </span>
    
                  <h2
                    id="segadeals-info-title"
                    className="mt-3 font-display text-[22px] font-extrabold leading-tight tracking-[-0.025em] text-[#10223f]"
                  >
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
    
              <p className="mt-4 text-sm leading-6 text-[#617188]">
                SegaDeals membantu Anda menyampaikan kota keberangkatan,
                destinasi, jumlah traveler, budget dan rencana tanggal perjalanan.
                Travel dalam ekosistem Segaloka kemudian dapat memberikan
                penawaran yang sesuai dengan kebutuhan Anda.
              </p>
    
              <div className="mt-5 rounded-2xl bg-[#f5f9ff] p-4">
                <p className="text-xs font-bold leading-5 text-[#314764]">
                  Anda dapat membandingkan penawaran yang masuk sebelum
                  menentukan Travel dan paket yang paling sesuai.
                </p>
              </div>
    
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowSegaDealsInfo(false)}
                  className="min-h-11 rounded-xl border border-[#d8e2ee] px-5 text-xs font-extrabold text-[#52647e] transition hover:bg-[#f7f9fc]"
                >
                  Nanti Saja
                </button>
    
                <button
                  type="button"
                  onClick={() => setShowSegaDealsInfo(false)}
                  className="min-h-11 rounded-xl bg-primary px-5 text-xs font-extrabold text-white transition hover:opacity-90"
                >
                  Mulai Buat Permintaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="absolute left-1/2 top-0 z-20 w-max max-w-[calc(100%-32px)] -translate-x-1/2">
        <div className="overflow-x-auto rounded-full border border-[#dce4ee] bg-white shadow-[0_8px_22px_rgba(16,34,63,0.14)]">
          <div className="flex min-w-max items-center gap-1 px-2 py-1.5">
            {SERVICES.map((item) => {
              const active = service === item.type;

              const handleServiceClick = () => {
                setService(item.type);
                setDestination("");

                if (item.type === "segadeals") {
                  setShowSegaDealsInfo(true);
                }
              };

              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={handleServiceClick}
                  className={`group flex h-11 shrink-0 items-center gap-2 rounded-full px-3 transition ${
                    active
                      ? "bg-[#eaf3ff] text-primary"
                      : "text-[#52647e] hover:bg-[#f5f8fc]"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      active
                        ? "bg-white text-primary"
                        : "bg-[#eef4fb] text-primary"
                    }`}
                  >
                    <Icon name={item.icon} size={16} />
                  </span>

                  <span
                    className={`whitespace-nowrap text-xs font-extrabold ${
                      active ? "text-primary" : "text-[#52647e]"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-[22px] border border-[#dce4ee] bg-white px-4 pb-5 pt-[76px] shadow-[0_18px_50px_rgba(16,34,63,0.14)] sm:px-5">
        <div className={`grid gap-2.5 ${service === "segadeals" ? "md:grid-cols-[0.9fr_1fr_0.78fr_0.9fr_0.9fr_auto]" : "md:grid-cols-[1fr_1.1fr_0.9fr_0.78fr_auto]"}`}>
          <label className="flex min-h-[62px] cursor-pointer items-center gap-3 rounded-xl border border-[#dfe7f0] bg-[#fbfdff] px-3.5 transition focus-within:border-primary hover:border-[#c8d8ea]">
            <span className="shrink-0 text-primary">
              <Icon name="route" size={17} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold text-[#8b9aae]">
                Dari
              </span>

              <select
                value={origin}
                onChange={(event) => setOrigin(event.target.value)}
                className="mt-0.5 w-full cursor-pointer appearance-none bg-transparent text-[13px] font-extrabold text-[#10223f] outline-none"
              >
                <option value="Jakarta">Jakarta</option>
                <option value="Makassar">Makassar</option>
                <option value="Surabaya">Surabaya</option>
                <option value="Medan">Medan</option>
                <option value="Bandung">Bandung</option>
              </select>
            </span>
          </label>

          <label className="flex min-h-[62px] cursor-pointer items-center gap-3 rounded-xl border border-[#dfe7f0] bg-[#fbfdff] px-3.5 transition focus-within:border-primary hover:border-[#c8d8ea]">
            <span className="shrink-0 text-primary">
              <Icon name="globe" size={17} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold text-[#8b9aae]">
                {form.destinationLabel}
              </span>

              <select
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                className="mt-0.5 w-full cursor-pointer appearance-none bg-transparent text-[13px] font-extrabold text-[#10223f] outline-none"
              >
                <option value="">{form.destinationPlaceholder}</option>
                {DESTINATIONS[service].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className={`flex min-h-[62px] cursor-pointer items-center gap-3 rounded-xl border border-[#dfe7f0] bg-[#fbfdff] px-3.5 transition focus-within:border-primary hover:border-[#c8d8ea] ${service === "segadeals" ? "md:order-5" : ""}`}>
            <span className="shrink-0 text-primary">
              <Icon name="booking" size={17} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold text-[#8b9aae]">
                {form.dateLabel}
              </span>

              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-0.5 w-full bg-transparent text-[13px] font-extrabold text-[#10223f] outline-none"
              />
            </span>
          </label>

          <div className={`flex min-h-[62px] items-center gap-3 rounded-xl border border-[#dfe7f0] bg-[#fbfdff] px-3.5 ${service === "segadeals" ? "md:order-3" : ""}`}>
            <span className="shrink-0 text-primary">
              <Icon name="user" size={17} />
            </span>

            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold text-[#8b9aae]">
                Traveler
              </span>

              <div className="mt-1 flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-label="Kurangi traveler"
                  onClick={() => setTravelers((value) => Math.max(1, value - 1))}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d8e2ee] bg-white text-sm font-bold text-primary transition hover:border-primary"
                >
                  -
                </button>

                <span className="whitespace-nowrap text-[13px] font-extrabold text-[#10223f]">
                  {travelers} orang
                </span>

                <button
                  type="button"
                  aria-label="Tambah traveler"
                  onClick={() => setTravelers((value) => Math.min(20, value + 1))}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d8e2ee] bg-white text-sm font-bold text-primary transition hover:border-primary"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {service === "segadeals" && (
            <label className="flex min-h-[62px] cursor-pointer items-center gap-3 rounded-xl border border-[#dfe7f0] bg-[#fbfdff] px-3.5 transition focus-within:border-primary hover:border-[#c8d8ea] md:order-4">
              <span className="shrink-0 text-primary">
                <span className="text-[15px] font-extrabold">Rp</span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold text-[#8b9aae]">
                  Budget
                </span>

                <input
                  aria-label="Budget SegaDeals"
                  type="text"
                  inputMode="numeric"
                  value={budget}
                  onChange={(event) =>
                    setBudget(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Contoh Rp30.000.000"
                  className="mt-0.5 w-full bg-transparent text-[13px] font-extrabold text-[#10223f] outline-none placeholder:font-medium placeholder:text-[#9aa7b8]"
                />
              </span>
            </label>
          )}
          <button
            type="button"
            onClick={handleSearch}
            className={`inline-flex min-h-[62px] items-center justify-center gap-2 rounded-xl bg-primary px-7 text-xs font-extrabold text-white shadow-sm transition hover:opacity-90 ${service === "segadeals" ? "md:order-6" : ""}`}
          >
            <Icon name="search" size={16} />
            {form.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
