import { StoredBracket } from "@/features/competitions/StoredBracket";
import { SectionHeader } from "@/components/common/SectionHeader";
export default function Page() {
  return (
    <div className="page-shell">
      <SectionHeader eyebrow="The road to the final" title="Knockout stage" description="Follow the World Cup bracket, completed ties and the path through every round." />
      <StoredBracket competitionId="world-cup" />
    </div>
  );
}
