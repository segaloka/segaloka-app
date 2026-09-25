import { cx } from "@/lib/utils";

export function StatTile({
  label,
  value,
  delta,
  deltaTone = "neutral",
  hint,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "good" | "bad" | "neutral";
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-text-primary">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {delta && (
          <span
            className={cx(
              "font-semibold",
              deltaTone === "good" && "text-success",
              deltaTone === "bad" && "text-danger",
              deltaTone === "neutral" && "text-muted"
            )}
          >
            {delta}
          </span>
        )}
        {hint && <span className="text-muted">{hint}</span>}
      </div>
    </div>
  );
}
