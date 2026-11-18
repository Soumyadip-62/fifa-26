import { NewsDetailsPage } from "@/features/news/NewsDetailsPage";
type Props = { params: Promise<{ slug: string }> };
export default async function Page({ params }: Props) { const { slug } = await params; return <NewsDetailsPage slug={slug} />; }
