import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/utils";

export function FieldWrap({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
      {error ? (
        <span className="flex items-center gap-1 text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

const inputBase =
  "h-10 rounded-md border bg-surface px-3 text-sm text-text-primary outline-none placeholder:text-muted focus:border-primary disabled:bg-bg disabled:text-muted";

export function Input({ error, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return <input className={cx(inputBase, error ? "border-danger" : "border-border-strong", className)} {...props} />;
}

export function Textarea({ error, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={cx(inputBase, "h-auto min-h-[96px] py-2", error ? "border-danger" : "border-border-strong", className)}
      {...props}
    />
  );
}

export function Select({ error, className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select className={cx(inputBase, error ? "border-danger" : "border-border-strong", className)} {...props}>
      {children}
    </select>
  );
}
