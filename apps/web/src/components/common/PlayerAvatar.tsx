import Image from "next/image";
import { images } from "@/assets";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type PlayerAvatarProps = {
  name: string;
  imageUrl?: string;
};

export function PlayerAvatar({ name, imageUrl }: PlayerAvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className="h-12 w-12">
      {imageUrl ? (
        <Image src={imageUrl} alt={`${name} headshot`} width={48} height={48} className="h-full w-full object-cover" />
      ) : (
        <Image src={images.placeholders.player} alt="" width={48} height={48} className="h-full w-full object-cover" />
      )}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
