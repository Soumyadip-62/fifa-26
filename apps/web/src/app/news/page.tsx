import { NewsPage } from "@/features/news/NewsPage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Football News & Updates",
  description:
    "Read club football news, team stories, fixture updates and headlines from the Premier League, La Liga, Champions League and Bundesliga.",
  path: "/news",
});

export default function Page() {
  return <NewsPage />;
}
