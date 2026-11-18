import Link from "next/link";
import { Compass } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="page-shell">
      <div className="companion-panel grid max-w-xl justify-items-start gap-5 py-10">
        <Compass className="size-9 text-primary" aria-hidden="true" />
        <SectionHeader
          eyebrow="Off the pitch"
          title="Page not found"
          description="This page or football record isn't available. Find your way back to the action."
        />
        <div className="flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants()}>
            Back to home
          </Link>
          <Link
            href="/matches"
            className={buttonVariants({ variant: "outline" })}
          >
            Browse matches
          </Link>
        </div>
      </div>
    </div>
  );
}
