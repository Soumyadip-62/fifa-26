import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="companion-footer">
        <div>
          <Link href="/" className="text-sm font-semibold text-foreground">
            NinetyPlus
          </Link>
          <p className="mt-1 text-[11px]">
            Four competitions. One matchday home.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/live">Live matches</Link>
          <Link href="/standings">Standings</Link>
          <Link href="/stadiums">Stadiums</Link>
        </nav>
        <span className="text-[10px] text-muted-foreground">
          Made for your matchday.
        </span>
      </div>
    </footer>
  );
}
