"use client";

import { useMemo, useState } from "react";
import { cx } from "@/lib/utils";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  searchableText?: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  rowHref?: (row: T) => string | undefined;
  selectable?: boolean;
  bulkActions?: (selectedIds: string[]) => React.ReactNode;
}

// A reusable, real interactive table: global search, column sort, pagination,
// and optional bulk selection. Client-side over the rows it's given — fine
// for the moderate result sets these dashboards page in, but a dataset in the
// tens of thousands of rows should move filtering/sorting to the server
// query instead of relying on this component alone.
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  searchableText,
  emptyTitle = "Belum ada data",
  emptyDescription,
  pageSize = 10,
  rowHref,
  selectable,
  bulkActions,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!query || !searchableText) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => searchableText(r).toLowerCase().includes(q));
  }, [rows, query, searchableText]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(col.render(a) ?? "");
      const bv = String(col.render(b) ?? "");
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map(getRowId)));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {searchableText ? (
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Cari…"
            className="h-9 w-56 rounded-md border border-border-strong bg-surface px-3 text-sm outline-none focus:border-primary"
          />
        ) : (
          <span />
        )}
        {selectable && selected.size > 0 && bulkActions && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-secondary">{selected.size} dipilih</span>
            {bulkActions(Array.from(selected))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={selected.size === paged.length && paged.length > 0} onChange={toggleAll} />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={cx("px-4 py-3", col.className)}>
                  {col.sortable ? (
                    <button
                      className="inline-flex items-center gap-1 hover:text-text-primary"
                      onClick={() => {
                        if (sortKey === col.key) setSortDir(sortDir === "asc" ? "desc" : "asc");
                        else {
                          setSortKey(col.key);
                          setSortDir("asc");
                        }
                      }}
                    >
                      {col.header}
                      {sortKey === col.key && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => {
              const id = getRowId(row);
              const href = rowHref?.(row);
              return (
                <tr
                  key={id}
                  className={cx("border-b border-border last:border-0 hover:bg-bg", href && "cursor-pointer")}
                  onClick={() => {
                    if (href) window.location.assign(href);
                  }}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(id)}
                        onChange={() => {
                          const next = new Set(selected);
                          next.has(id) ? next.delete(id) : next.add(id);
                          setSelected(next);
                        }}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={cx("px-4 py-3", col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            Halaman {page} dari {totalPages} · {sorted.length} baris
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 rounded-md border border-border-strong px-3 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 rounded-md border border-border-strong px-3 disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
