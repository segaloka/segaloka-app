import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-strong px-6 py-14 text-center">
      {icon ?? (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-muted">
          <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      )}
      <div>
        <p className="font-display text-base font-semibold text-text-primary">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-danger/30 bg-danger-tint px-6 py-10 text-center">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-danger">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="font-semibold text-danger">{title}</p>
      {description && <p className="text-sm text-text-secondary">{description}</p>}
    </div>
  );
}

export function ForbiddenState({ reason }: { reason?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 py-14 text-center">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-muted">
        <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 10V7a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      <p className="font-semibold text-text-primary">Akses dibatasi</p>
      <p className="max-w-sm text-sm text-text-secondary">
        {reason ?? "Anda tidak memiliki izin atau langganan yang sesuai untuk melihat halaman ini."}
      </p>
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded-md bg-border/60" />
      ))}
    </div>
  );
}
