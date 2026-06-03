"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

export type ReadMoreTextProps = {
  buttonClassName?: string;
  className?: string;
  collapsedLabel?: string;
  expandedLabel?: string;
  maxLength?: number;
  text: string;
};

export function ReadMoreText({
  buttonClassName,
  className,
  collapsedLabel = "Read More",
  expandedLabel = "Show Less",
  maxLength = 260,
  text,
}: ReadMoreTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cleanText = text.trim();
  const shouldTruncate = cleanText.length > maxLength;
  const displayText = useMemo(() => {
    if (!shouldTruncate || isExpanded) {
      return cleanText;
    }

    const preview = cleanText.slice(0, maxLength).trimEnd();
    const lastSpace = preview.lastIndexOf(" ");

    return `${preview.slice(0, lastSpace > 80 ? lastSpace : preview.length)}...`;
  }, [cleanText, isExpanded, maxLength, shouldTruncate]);

  if (!cleanText) {
    return null;
  }

  return (
    <div className="grid gap-2">
      <p className={className}>{displayText}</p>
      {shouldTruncate ? (
        <button
          className={cn(
            "w-fit text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:text-emerald-300 dark:hover:text-emerald-200",
            buttonClassName,
          )}
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          {isExpanded ? expandedLabel : collapsedLabel}
        </button>
      ) : null}
    </div>
  );
}
