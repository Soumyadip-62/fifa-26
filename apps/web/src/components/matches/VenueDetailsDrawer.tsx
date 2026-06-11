"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, MapPin, Users, Wrench, DollarSign, Calendar, Globe, Clock, Sparkles, ExternalLink, Info } from "lucide-react";
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
import { searchVenueByName } from "@/lib/api/venues";

export type VenueDetailsDrawerProps = {
  children?: ReactNode;
  venueName: string;
};

function getTextValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function VenueDetailsDrawer({
  children,
  venueName,
}: VenueDetailsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: venues, isLoading } = useQuery({
    queryKey: ["venueSearch", venueName],
    queryFn: () => searchVenueByName(venueName),
    enabled: isOpen && !!venueName,
  });

  const venue = venues && venues.length > 0 ? venues[0] : null;

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

  const fanArts = venue
    ? ([
        venue.strFanart1,
        venue.strFanart2,
        venue.strFanart3,
        venue.strFanart4,
      ].filter(Boolean) as string[])
    : [];

  const stadiumImage = venue?.strThumb || images.banners.sfStadium;

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      {children ? <DrawerTrigger asChild>{children}</DrawerTrigger> : null}
      <DrawerContent className="inset-y-0 left-auto right-0 mt-0 h-full max-h-none w-[min(100vw,36rem)] max-w-none rounded-l-2xl rounded-r-none rounded-t-none border-l border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="scrollbar-hide grid h-full w-full content-start gap-6 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          
          {/* HEADER DESIGN */}
          <div className="relative flex items-start justify-between gap-6 border-b border-neutral-100 pb-4 dark:border-neutral-800">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Tournament Venue
              </span>
              <DrawerTitle className="font-heading truncate text-2xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                {venueName}
              </DrawerTitle>
              <DrawerDescription className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
                {venue?.strLocation || "Official Stadium Profile"}
              </DrawerDescription>
            </div>
            
            <DrawerClose asChild>
              <Button
                aria-label="Close venue details"
                className="h-10 w-10 p-0 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                size="sm"
                variant="ghost"
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Fetching venue profile...</p>
            </div>
          ) : venue ? (
            <div className="grid gap-6">
              {/* STADIUM PORTRAIT BANNER */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 shadow-md">
                <Image
                  src={stadiumImage}
                  alt={`${venue.strVenue} photo`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 500px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
                {venue.intCapacity && (
                  <Badge className="absolute bottom-4 left-4 bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1 flex items-center gap-1.5 shadow-md">
                    <Users className="h-3.5 w-3.5" /> Capacity: {Number(venue.intCapacity).toLocaleString()}
                  </Badge>
                )}
              </div>

              {/* STAT TILES */}
              <div className="grid gap-3 sm:grid-cols-2">
                {venue.strLocation && (
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 dark:border-neutral-900 dark:bg-neutral-900/30 shadow-sm">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white border border-neutral-100 dark:bg-neutral-950 dark:border-neutral-800 shadow-sm">
                      <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                        Location
                      </span>
                      <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block truncate">
                        {venue.strLocation}, {venue.strCountry}
                      </span>
                    </div>
                  </div>
                )}

                {venue.strTimezone && (
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 dark:border-neutral-900 dark:bg-neutral-900/30 shadow-sm">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white border border-neutral-100 dark:bg-neutral-950 dark:border-neutral-800 shadow-sm">
                      <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                        Timezone
                      </span>
                      <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block truncate">
                        {venue.strTimezone}
                      </span>
                    </div>
                  </div>
                )}

                {getTextValue(venue.strArchitect) && (
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 dark:border-neutral-900 dark:bg-neutral-900/30 shadow-sm">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white border border-neutral-100 dark:bg-neutral-950 dark:border-neutral-800 shadow-sm">
                      <Wrench className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                        Architect
                      </span>
                      <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block truncate">
                        {venue.strArchitect}
                      </span>
                    </div>
                  </div>
                )}

                {getTextValue(venue.strCost) && (
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 dark:border-neutral-900 dark:bg-neutral-900/30 shadow-sm">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white border border-neutral-100 dark:bg-neutral-950 dark:border-neutral-800 shadow-sm">
                      <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                        Construction Cost
                      </span>
                      <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block truncate">
                        {venue.strCost}
                      </span>
                    </div>
                  </div>
                )}

                {getTextValue(venue.intFormedYear) && (
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 dark:border-neutral-900 dark:bg-neutral-900/30 shadow-sm">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white border border-neutral-100 dark:bg-neutral-950 dark:border-neutral-800 shadow-sm">
                      <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                        Opened
                      </span>
                      <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block truncate">
                        {venue.intFormedYear}
                      </span>
                    </div>
                  </div>
                )}

                {getTextValue(venue.strWebsite) && (
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 dark:border-neutral-900 dark:bg-neutral-900/30 shadow-sm">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white border border-neutral-100 dark:bg-neutral-950 dark:border-neutral-800 shadow-sm">
                      <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
                        Official Site
                      </span>
                      <a
                        href={venue.strWebsite?.startsWith("http") ? venue.strWebsite : `https://${venue.strWebsite}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 block truncate flex items-center gap-1"
                      >
                        {venue.strWebsite} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              {venue.strDescriptionEN ? (
                <div className="grid gap-2 border-t border-neutral-100 pt-5 dark:border-neutral-800">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                    History & Overview
                  </h3>
                  <ReadMoreText
                    className="text-sm leading-7 text-neutral-600 dark:text-neutral-300"
                    maxLength={360}
                    text={venue.strDescriptionEN}
                  />
                </div>
              ) : null}

              {/* FAN ART GALLERY */}
              {fanArts.length > 0 && (
                <div className="grid gap-3 border-t border-neutral-100 pt-5 dark:border-neutral-800">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                    Gallery & Media
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {fanArts.map((artUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-white/10 dark:bg-neutral-900 shadow-sm"
                      >
                        <Image
                          src={artUrl}
                          alt={`${venue.strVenue} Media ${idx + 1}`}
                          fill
                          sizes="180px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                          <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-bold text-white backdrop-blur-md inline-flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5" /> Media
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <Info className="h-10 w-10 text-neutral-400 dark:text-neutral-600" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Could not find details for venue &ldquo;{venueName}&rdquo;.
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
