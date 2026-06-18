"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ExternalLink, X, Compass, Shield, Award, Calendar, MapPin, Ruler, Weight, Info, User } from "lucide-react";
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
import { ReadMoreText } from "@/components/common/ReadMoreText";
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

function getDetailIcon(label: string) {
  switch (label) {
    case "Nationality":
      return <Compass className="h-4 w-4 text-primary" />;
    case "Club":
      return <Shield className="h-4 w-4 text-primary" />;
    case "National team":
      return <Award className="h-4 w-4 text-primary" />;
    case "Born":
      return <Calendar className="h-4 w-4 text-primary" />;
    case "Birthplace":
      return <MapPin className="h-4 w-4 text-primary" />;
    case "Height":
      return <Ruler className="h-4 w-4 text-primary" />;
    case "Weight":
      return <Weight className="h-4 w-4 text-primary" />;
    case "Preferred side":
      return <User className="h-4 w-4 text-primary" />;
    default:
      return <Info className="h-4 w-4 text-primary" />;
  }
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
      <DrawerContent className="inset-y-0 left-auto right-0 mt-0 h-full max-h-none w-[min(100vw,34rem)] max-w-none rounded-l-[32px] rounded-r-none rounded-t-none border-l border-black/5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl shadow-2xl dark:border-white/10">
        <div className="scrollbar-hide grid h-full w-full content-start gap-6 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          
          {/* HEADER DESIGN */}
          <div className="relative flex items-start justify-between gap-6 border-b border-black/5 pb-4 dark:border-white/5">
            <div className="min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                Squad Member
              </span>
              <DrawerTitle className="font-heading truncate text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                {player.name}
              </DrawerTitle>
              <DrawerDescription className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                {player.position || "Player Profile"}
              </DrawerDescription>
            </div>
            
            <DrawerClose asChild>
              <Button
                aria-label="Close player details"
                className="h-9 w-9 p-0 rounded-full border border-black/5 dark:border-white/10 text-zinc-550 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                size="sm"
                variant="ghost"
              >
                <X className="h-4.5 w-4.5" />
              </Button>
            </DrawerClose>
          </div>

          <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-start">
            {/* PORTRAIT CARD */}
            <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-[24px] border border-black/5 bg-zinc-50 p-2 dark:border-white/5 dark:bg-zinc-850/50 shadow-xs">
              <div className="relative h-full w-full overflow-hidden rounded-[18px] bg-zinc-900">
                <Image
                  src={imageUrl ?? images.placeholders.player}
                  alt={`${player.name} player portrait`}
                  fill
                  sizes="(min-width: 1024px) 180px, 100vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            <div className="grid gap-5">
              {/* BADGES ROW */}
              <div className="flex flex-wrap gap-2">
                {shirtNumber ? (
                  <Badge variant="secondary" className="font-bold text-[10px] bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 px-2.5 py-1 rounded-full border-0 shadow-xs">
                    No. {shirtNumber}
                  </Badge>
                ) : null}
                {getTextValue(player.strStatus) ? (
                  <Badge variant="success" className="font-bold text-[10px] px-2.5 py-1 rounded-full shadow-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                    {getTextValue(player.strStatus)}
                  </Badge>
                ) : null}
                {getTextValue(player.strNationality) ? (
                  <Badge variant="outline" className="font-bold text-[10px] px-2.5 py-1 rounded-full border-black/5 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-850/30 text-zinc-650 dark:text-zinc-400">
                    {getTextValue(player.strNationality)}
                  </Badge>
                ) : null}
              </div>

              {/* STAT GRID DETAILS */}
              {details.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {details.map((detail) => (
                    <div 
                      className="flex items-center gap-3 rounded-[20px] border border-black/5 bg-zinc-50/50 p-3 dark:border-white/5 dark:bg-zinc-850/20 shadow-xs"
                      key={detail.label}
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white border border-black/5 dark:bg-zinc-850 dark:border-white/5 shadow-xs">
                        {getDetailIcon(detail.label)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                          {detail.label}
                        </span>
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block truncate">
                          {detail.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* DESCRIPTION */}
          {description ? (
            <div className="grid gap-2 border-t border-black/5 pt-5 dark:border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Biography
              </h3>
              <ReadMoreText
                className="text-xs leading-relaxed text-zinc-650 dark:text-zinc-300"
                maxLength={360}
                text={description}
              />
            </div>
          ) : null}

          {/* SOCIAL LINKS */}
          {socialLinks.length ? (
            <div className="grid gap-3 border-t border-black/5 pt-5 dark:border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Official Channels
              </h3>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-zinc-50/50 px-4 py-2 text-xs font-bold text-zinc-650 transition-all hover:scale-[1.01] hover:border-primary hover:text-primary dark:border-white/5 dark:bg-zinc-850/30 dark:text-zinc-400 dark:hover:border-primary dark:hover:text-primary shadow-xs"
                    href={getExternalHref(link.href)}
                    key={link.label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PlayerDetailsDrawer;
