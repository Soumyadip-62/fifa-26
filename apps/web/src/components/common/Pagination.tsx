"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  total,
  pageSize,
  onChange,
  label,
  disabled = false,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  label: string;
  disabled?: boolean;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (!total) return null;
  return (
    <nav aria-label={`${label} pagination`} className="directory-pagination">
      <p>
        <strong>
          {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
        </strong>{" "}
        of {total.toLocaleString("en-GB")} {label}
      </p>
      <div>
        <button
          type="button"
          aria-label={`Previous ${label} page`}
          disabled={disabled || page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button
          type="button"
          aria-label={`Next ${label} page`}
          disabled={disabled || page >= pages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
