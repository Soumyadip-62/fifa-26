"use client";

import { useEffect, useState } from "react";
import { formatDate, formatDateOnly } from "@/lib/utils/formatDate";
import { Skeleton } from "@/components/ui/skeleton";

type FormattedDateTimeProps = {
  date: string;
  dateOnly?: boolean;
  className?: string;
  fallbackWidthClass?: string;
};

export function FormattedDateTime({
  date,
  dateOnly = false,
  className = "",
  fallbackWidthClass = "w-24",
}: FormattedDateTimeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Skeleton
        className={`h-4 ${fallbackWidthClass} bg-secondary dark:bg-secondary inline-block`}
      />
    );
  }

  return (
    <span className={className}>
      {dateOnly ? formatDateOnly(date) : formatDate(date)}
    </span>
  );
}
