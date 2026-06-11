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
      return <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "Club":
      return <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "National team":
      return <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "Born":
      return <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "Birthplace":
      return <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "Height":
      return <Ruler className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "Weight":
      return <Weight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "Preferred side":
      return <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    default:
      return <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
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
      <DrawerContent className="inset-y-0 left-auto right-0 mt-0 h-full max-h-none w-[min(100vw,36rem)] max-w-none rounded-l-2xl rounded-r-none rounded-t-none border-l border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="scrollbar-hide grid h-full w-full content-start gap-6 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          
          {/* HEADER DESIGN */}
          <div className="relative flex items-start justify-between gap-6 border-b border-neutral-100 pb-4 dark:border-neutral-800">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Squad Member
              </span>
              <DrawerTitle className="font-heading truncate text-2xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                {player.name}
              </DrawerTitle>
              <DrawerDescription className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
                {player.position || "Player Profile"}
              </DrawerDescription>
            </div>
            
            <DrawerClose asChild>
              <Button
                aria-label="Close player details"
                className="h-10 w-10 p-0 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                size="sm"
                variant="ghost"
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>

          <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-start">
            {/* PORTRAIT CARD */}
            <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900 shadow-md">
              <div className="relative h-full w-full overflow-hidden rounded-lg bg-neutral-900">
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
                  <Badge variant="secondary" className="font-bold text-xs bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100 px-2.5 py-1">
                    No. {shirtNumber}
                  </Badge>
                ) : null}
                {getTextValue(player.strStatus) ? (
                  <Badge variant="success" className="font-bold text-xs px-2.5 py-1">
                    {getTextValue(player.strStatus)}
                  </Badge>
                ) : null}
                {getTextValue(player.strNationality) ? (
                  <Badge variant="outline" className="font-bold text-xs px-2.5 py-1 border-emerald-500/20 text-emerald-600 dark:border-emerald-400/20 dark:text-emerald-400">
                    {getTextValue(player.strNationality)}
                  </Badge>
                ) : null}
              </div>

              {/* STAT GRID DETAILS */}
              {details.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {details.map((detail) => (
                    <div 
                      className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 dark:border-neutral-900 dark:bg-neutral-900/30 shadow-sm"
                      key={detail.label}
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white border border-neutral-100 dark:bg-neutral-950 dark:border-neutral-800 shadow-sm">
                        {getDetailIcon(detail.label)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                          {detail.label}
                        </span>
                        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block truncate">
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
            <div className="grid gap-2 border-t border-neutral-100 pt-5 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Biography
              </h3>
              <ReadMoreText
                className="text-sm leading-7 text-neutral-600 dark:text-neutral-300"
                maxLength={360}
                text={description}
              />
            </div>
          ) : null}

          {/* SOCIAL LINKS */}
          {socialLinks.length ? (
            <div className="grid gap-3 border-t border-neutral-100 pt-5 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Official Channels
              </h3>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-700 transition-all hover:-translate-y-0.5 hover:border-emerald-500 hover:text-emerald-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-emerald-400 dark:hover:text-emerald-400 shadow-sm"
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
