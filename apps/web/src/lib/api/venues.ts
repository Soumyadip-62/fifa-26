import { apiUrl } from "@/lib/api/config";

export interface Venue {
  idVenue: string;
  strVenue: string;
  strVenueAlternate?: string | null;
  strSport?: string | null;
  strDescriptionEN?: string | null;
  strArchitect?: string | null;
  intCapacity?: string | null;
  strCost?: string | null;
  strCountry?: string | null;
  strLocation?: string | null;
  strTimezone?: string | null;
  intFormedYear?: string | null;
  strFanart1?: string | null;
  strFanart2?: string | null;
  strFanart3?: string | null;
  strFanart4?: string | null;
  strThumb?: string | null;
  strLogo?: string | null;
  strMap?: string | null;
  strWebsite?: string | null;
  strFacebook?: string | null;
  strInstagram?: string | null;
  strTwitter?: string | null;
  strYoutube?: string | null;
}

export async function searchVenueByName(name: string): Promise<Venue[]> {
  try {
    const response = await fetch(apiUrl(`/venues/search?v=${encodeURIComponent(name)}`));
    if (!response.ok) {
      throw new Error("Failed to search venues");
    }
    const data = await response.json();
    return (data.venues || []) as Venue[];
  } catch {
    return [];
  }
}

export async function getVenueById(id: string): Promise<Venue | null> {
  try {
    const response = await fetch(apiUrl(`/venues/${encodeURIComponent(id)}`));
    if (!response.ok) {
      throw new Error("Failed to lookup venue");
    }
    const data = await response.json();
    const venues = (data.venues || []) as Venue[];
    return venues[0] ?? null;
  } catch {
    return null;
  }
}
