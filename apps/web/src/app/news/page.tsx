import { NewsPage } from "@/features/news/NewsPage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "FIFA World Cup 2026 News & Updates",
  description:
    "Read FIFA World Cup 2026 news, tournament updates, team stories, fixture alerts, and competition headlines.",
  path: "/news",
});

export default function Page() {
  return <NewsPage />;
}
