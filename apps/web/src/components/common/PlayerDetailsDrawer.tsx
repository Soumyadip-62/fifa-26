"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ExternalLink, X } from "lucide-react";
import { images } from "@/assets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import type { Player } from "@/types/team";

export type PlayerDetailsDrawerProps = {
  children?: ReactNode;
  player: Player;
};

function getTextValue(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed || undefined;
}

function getPlayerImageUrl(player: Player) {
  return (
    getTextValue(player.strCutout) ??
    getTextValue(player.strThumb) ??
    getTextValue(player.strRender) ??
    getTextValue(player.strPoster)
  );
}

function getPlayerDetails(player: Player) {
  return [
    ["Nationality", player.strNationality],
    ["Club", player.strTeam],
    ["National team", player.strTeam2],
    ["Born", player.dateBorn],
    ["Birthplace", player.strBirthLocation],
    ["Height", player.strHeight],
    ["Weight", player.strWeight],
    ["Preferred side", player.strSide],
    ["Outfitter", player.strOutfitter],
    ["Agent", player.strAgent],
  ]
    .map(([label, value]) => ({ label, value: getTextValue(value) }))
    .filter((item): item is { label: string; value: string } =>
      Boolean(item.value),
    );
}

function getSocialLinks(player: Player) {
  return [
    ["Website", player.strWebsite],
    ["Facebook", player.strFacebook],
    ["X", player.strTwitter],
    ["Instagram", player.strInstagram],
    ["YouTube", player.strYoutube],
  ]
    .map(([label, href]) => ({ label, href: getTextValue(href) }))
    .filter((item): item is { label: string; href: string } =>
      Boolean(item.href),
    );
}

function getExternalHref(href: string) {
  return /^https?:\/\//i.test(href) ? href : `https://${href}`;
}

const PlayerDetailsDrawer = ({
  children,
  player,
}: PlayerDetailsDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const imageUrl = getPlayerImageUrl(player);
  const details = getPlayerDetails(player);
  const socialLinks = getSocialLinks(player);
  const description = getTextValue(player.strDescriptionEN);
  const shirtNumber = player.shirtNumber ?? getTextValue(player.strNumber);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      {children ? <DrawerTrigger asChild>{children}</DrawerTrigger> : null}
      <DrawerContent className="inset-y-0 left-auto right-0 mt-0 h-full max-h-none w-[min(100vw,34rem)] rounded-l-lg rounded-r-none rounded-t-none">
        <div className="scrollbar-hide grid h-full w-full content-start gap-4 overflow-y-auto px-4 pb-5 sm:gap-5 sm:px-6 sm:pb-6">
          <DrawerHeader className="grid grid-cols-[1fr_auto] items-start gap-4 px-0 pb-0 text-left">
            <div className="min-w-0">
              <DrawerTitle className="truncate text-xl font-black sm:text-2xl">
                {player.name}
              </DrawerTitle>
              <DrawerDescription>
                {player.position || "Player profile"}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button
                aria-label="Close player details"
                className="h-9 w-9 p-0"
                size="sm"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-[180px_1fr] md:items-start">
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-white/10 dark:bg-white/5">
              <Image
                src={imageUrl ?? images.placeholders.player}
                alt={`${player.name} player portrait`}
                width={440}
                height={520}
                className="h-44 w-full object-contain sm:h-56 md:h-auto md:aspect-[4/5] md:object-cover"
              />
            </div>

            <div className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                {shirtNumber ? (
                  <Badge variant="secondary">No. {shirtNumber}</Badge>
                ) : null}
                {getTextValue(player.strStatus) ? (
                  <Badge variant="success">
                    {getTextValue(player.strStatus)}
                  </Badge>
                ) : null}
                {getTextValue(player.strNationality) ? (
                  <Badge variant="outline">
                    {getTextValue(player.strNationality)}
                  </Badge>
                ) : null}
              </div>

              {details.length ? (
                <dl className="grid gap-3 rounded-lg border border-neutral-200/80 p-3 text-sm dark:border-white/10 sm:grid-cols-2 sm:p-4">
                  {details.map((detail) => (
                    <div className="min-w-0" key={detail.label}>
                      <dt className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        {detail.label}
                      </dt>
                      <dd className="mt-1 break-words font-medium text-neutral-900 dark:text-neutral-100">
                        {detail.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {description ? (
                <>
                  <Separator />
                  <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                    {description}
                  </p>
                </>
              ) : null}

              {socialLinks.length ? (
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link) => (
                    <a
                      className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-white/10 dark:text-neutral-200 dark:hover:bg-white/10"
                      href={getExternalHref(link.href)}
                      key={link.label}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PlayerDetailsDrawer;
