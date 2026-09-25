import { cx } from "@/lib/utils";

const map: Record<string, string> = {
  pending: "bg-warning-tint text-warning",
  pending_verification: "bg-warning-tint text-warning",
  invited: "bg-warning-tint text-warning",
  draft: "bg-border text-text-secondary",
  open: "bg-info-tint text-info",
  offered: "bg-info-tint text-info",
  confirmed: "bg-success-tint text-success",
  active: "bg-success-tint text-success",
  published: "bg-success-tint text-success",
  paid: "bg-success-tint text-success",
  won: "bg-success-tint text-success",
  accepted: "bg-success-tint text-success",
  verified: "bg-success-tint text-success",
  suspended: "bg-danger-tint text-danger",
  rejected: "bg-danger-tint text-danger",
  cancelled: "bg-danger-tint text-danger",
  declined: "bg-danger-tint text-danger",
  failed: "bg-danger-tint text-danger",
  lost: "bg-danger-tint text-danger",
  expired: "bg-danger-tint text-danger",
  closed: "bg-border text-text-secondary",
  full: "bg-warning-tint text-warning",
  almost_full: "bg-warning-tint text-warning",
  trialing: "bg-info-tint text-info",
  past_due: "bg-warning-tint text-warning",
};

export function Badge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize", map[status] ?? "bg-border text-text-secondary")}>
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}
