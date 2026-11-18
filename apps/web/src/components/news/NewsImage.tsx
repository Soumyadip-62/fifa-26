"use client";

import Image from "next/image";
import { useState } from "react";

export function NewsImage({
  src,
  sizes,
  priority = false,
  className = "object-cover",
}: {
  src: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <Image
      src={failed === src ? "/assets/images/blogs/default-news.svg" : src}
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(src)}
    />
  );
}
