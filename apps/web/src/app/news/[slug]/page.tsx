import { NewsDetailsPage } from "@/features/news/NewsDetailsPage";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  return <NewsDetailsPage slug={slug} />;
}
