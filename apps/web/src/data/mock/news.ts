import type { NewsArticle } from "@/types/news";
import { images } from "@/assets";

export const mockNewsArticles: NewsArticle[] = [
  {
    id: "opening-fixtures-confirmed",
    title: "Opening fixtures confirmed for FIFA 26",
    slug: "opening-fixtures-confirmed",
    excerpt: "The first round of fixtures gives fans a clear view of the tournament's opening week.",
    coverImageUrl: images.blogs.fixtures,
    content:
      "The opening fixture list is now available in the platform mock data. This page is structured so the article content can later come from a CMS or backend API without changing the route layer.",
    source: "Platform Desk",
    author: "Editorial Team",
    publishedAt: "2026-05-20T10:00:00.000Z",
    tags: ["fixtures", "tournament"],
  },
  {
    id: "group-stage-watchlist",
    title: "Group stage teams to watch",
    slug: "group-stage-watchlist",
    excerpt: "A simple preview of teams expected to shape the early tournament storylines.",
    coverImageUrl: images.blogs.teamsWatch,
    content:
      "Several teams arrive with balanced squads and strong qualifying runs. The frontend keeps this article typed as NewsArticle so richer editorial fields can be added later.",
    source: "Platform Desk",
    author: "Editorial Team",
    publishedAt: "2026-05-22T12:00:00.000Z",
    tags: ["teams", "preview"],
  },
];
