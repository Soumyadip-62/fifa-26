import type { ReactNode } from "react";

export type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  as?: "h1" | "h2";
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  as: Heading = "h1",
}: SectionHeaderProps) {
  return (
    <header
      className={`section-heading ${Heading === "h2" ? "section-heading--section" : ""}`}
    >
      {eyebrow ? <p className="section-heading-eyebrow">{eyebrow}</p> : null}
      <Heading className="section-heading-title">{title}</Heading>
      {description ? (
        <p className="section-heading-description">{description}</p>
      ) : null}
    </header>
  );
}
