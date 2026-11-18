"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  MapPin,
  Users,
  Wrench,
  DollarSign,
  Calendar,
  Globe,
  Clock,
  Sparkles,
  ExternalLink,
  Info,
} from "lucide-react";
import { images } from "@/assets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
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
      <DrawerContent className="inset-y-0 left-auto right-0 mt-0 h-full max-h-none w-[min(100vw,34rem)] max-w-none rounded-l-[32px] rounded-r-none rounded-t-none border-l border-border bg-card dark:bg-card backdrop-blur-2xl shadow-2xl dark:border-border">
        <div className="scrollbar-hide grid h-full w-full content-start gap-6 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          {/* HEADER DESIGN */}
          <div className="relative flex items-start justify-between gap-6 border-b border-border pb-4 dark:border-border">
            <div className="min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                Tournament Venue
              </span>
              <DrawerTitle className="font-heading truncate text-2xl font-black tracking-tight text-foreground dark:text-white sm:text-3xl">
                {venueName}
              </DrawerTitle>
              <DrawerDescription className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground mt-0.5">
                {venue?.strLocation || "Official Stadium Profile"}
              </DrawerDescription>
            </div>

            <DrawerClose asChild>
              <Button
                aria-label="Close venue details"
                className="h-9 w-9 p-0 rounded-full border border-border dark:border-border text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-white hover:bg-secondary dark:hover:bg-secondary transition-colors"
                size="sm"
                variant="ghost"
              >
                <X className="h-4.5 w-4.5" />
              </Button>
            </DrawerClose>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                Fetching venue profile...
              </p>
            </div>
          ) : venue ? (
            <div className="grid gap-6">
              {/* STADIUM PORTRAIT BANNER */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-secondary dark:border-border dark:bg-zinc-850 shadow-none">
                <Image
                  src={stadiumImage}
                  alt={`${venue.strVenue} photo`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 500px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {venue.intCapacity && (
                  <Badge className="absolute bottom-4 left-4 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-[10px] rounded-full px-3 py-1 flex items-center gap-1.5 shadow-md">
                    <Users className="h-3 w-3" /> Capacity:{" "}
                    {Number(venue.intCapacity).toLocaleString()}
                  </Badge>
                )}
              </div>

              {/* STAT TILES */}
              <div className="grid gap-3 sm:grid-cols-2">
                {venue.strLocation && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3 dark:border-border dark:bg-zinc-850/20 shadow-none">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-card border border-border dark:bg-zinc-850 dark:border-border shadow-none">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground dark:text-muted-foreground block">
                        Location
                      </span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-secondary-foreground block truncate">
                        {venue.strLocation}, {venue.strCountry}
                      </span>
                    </div>
                  </div>
                )}

                {venue.strTimezone && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3 dark:border-border dark:bg-zinc-850/20 shadow-none">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-card border border-border dark:bg-zinc-850 dark:border-border shadow-none">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground dark:text-muted-foreground block">
                        Timezone
                      </span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-secondary-foreground block truncate">
                        {venue.strTimezone}
                      </span>
                    </div>
                  </div>
                )}

                {getTextValue(venue.strArchitect) && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3 dark:border-border dark:bg-zinc-850/20 shadow-none">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-card border border-border dark:bg-zinc-850 dark:border-border shadow-none">
                      <Wrench className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground dark:text-muted-foreground block">
                        Architect
                      </span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-secondary-foreground block truncate">
                        {venue.strArchitect}
                      </span>
                    </div>
                  </div>
                )}

                {getTextValue(venue.strCost) && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3 dark:border-border dark:bg-zinc-850/20 shadow-none">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-card border border-border dark:bg-zinc-850 dark:border-border shadow-none">
                      <DollarSign className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground dark:text-muted-foreground block">
                        Construction Cost
                      </span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-secondary-foreground block truncate">
                        {venue.strCost}
                      </span>
                    </div>
                  </div>
                )}

                {getTextValue(venue.intFormedYear) && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3 dark:border-border dark:bg-zinc-850/20 shadow-none">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-card border border-border dark:bg-zinc-850 dark:border-border shadow-none">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground dark:text-muted-foreground block">
                        Opened
                      </span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-secondary-foreground block truncate">
                        {venue.intFormedYear}
                      </span>
                    </div>
                  </div>
                )}

                {getTextValue(venue.strWebsite) && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3 dark:border-border dark:bg-zinc-850/20 shadow-none">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-card border border-border dark:bg-zinc-850 dark:border-border shadow-none">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 font-sans">
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground dark:text-muted-foreground block">
                        Official Site
                      </span>
                      <a
                        href={
                          venue.strWebsite?.startsWith("http")
                            ? venue.strWebsite
                            : `https://${venue.strWebsite}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-primary hover:underline dark:text-primary block truncate flex items-center gap-1"
                      >
                        {venue.strWebsite} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              {venue.strDescriptionEN ? (
                <div className="grid gap-2 border-t border-border pt-5 dark:border-border">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-muted-foreground">
                    History & Overview
                  </h3>
                  <ReadMoreText
                    className="text-xs leading-relaxed text-zinc-650 dark:text-secondary-foreground"
                    maxLength={360}
                    text={venue.strDescriptionEN}
                  />
                </div>
              ) : null}

              {/* FAN ART GALLERY */}
              {fanArts.length > 0 && (
                <div className="grid gap-3 border-t border-border pt-5 dark:border-border">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-muted-foreground">
                    Gallery & Media
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {fanArts.map((artUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-secondary dark:border-border dark:bg-zinc-850 shadow-none"
                      >
                        <Image
                          src={artUrl}
                          alt={`${venue.strVenue} Media ${idx + 1}`}
                          fill
                          sizes="180px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                          <span className="rounded-full bg-white/20 px-3 py-0.5 text-[9px] font-bold text-white backdrop-blur-md inline-flex items-center gap-1">
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
              <Info className="h-9 w-9 text-muted-foreground dark:text-zinc-650" />
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                Could not find details for venue &ldquo;{venueName}&rdquo;.
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
