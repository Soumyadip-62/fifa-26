import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export type AppImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

export function AppImage({ src, alt, width, height, className, priority }: AppImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      priority={priority}
    />
  );
}
