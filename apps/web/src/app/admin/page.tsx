import { AdminPage } from "@/features/admin/AdminPage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin",
  description: "Private admin tools for managing club football data.",
  path: "/admin",
  noIndex: true,
});

export default function Page() {
  return <AdminPage />;
}
