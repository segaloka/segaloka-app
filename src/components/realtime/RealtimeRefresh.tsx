"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const REFRESH_DEBOUNCE_MS = 250;

export function RealtimeRefresh() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("segaloka-domain-events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "domain_events" },
        () => {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => router.refresh(), REFRESH_DEBOUNCE_MS);
        },
      )
      .subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
