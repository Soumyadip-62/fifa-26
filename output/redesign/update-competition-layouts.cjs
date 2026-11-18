const fs = require('node:fs');
const root = 'apps/web/src/features/competitions/';
function update(file, hero) {
  let text = fs.readFileSync(root + file, 'utf8');
  const start = text.indexOf('<section className="relative min-h-[min(620px,62svh)]');
  const end = text.indexOf('</section>', start) + '</section>'.length;
  if (start < 0 || end <= start) throw new Error('Competition hero was not found in ' + file);
  text = text.slice(0, start) + hero + text.slice(end);
  text = 'import { CompetitionHero } from "@/components/football/CompetitionHero";\n' + text;
  text = text.replaceAll('<SectionHeader', '<SectionHeader as="h2"');
  for (const line of text.split('\n')) {
    if (/^import .*\b(Image|SeasonSelect|CompetitionBadge)\b/.test(line)) text = text.replace(line + '\n', '');
  }
  fs.writeFileSync(root + file, text);
}
update('PremierLeaguePage.tsx', `<CompetitionHero competition={competition} season={season} imageUrl={leagueId === "bundesliga" ? "/assets/images/banners/bundesliga-banner.webp" : leagueId === "ucl" ? "/assets/images/banners/ucl-banner.jpg" : leagueId === "la-liga" ? "/assets/images/banners/la-liga-banner.jpg" : "/assets/images/banners/pl-banner.png"} metrics={[
  { label: "Season", value: competition.season },
  { label: "Teams", value: <Suspense fallback="…"><LeagueCount data={data} kind="teams" /></Suspense> },
  { label: "Round", value: competition.currentMatchday == null ? "—" : competition.currentMatchday },
  { label: "Fixtures", value: <Suspense fallback="…"><LeagueCount data={data} kind="matches" /></Suspense> },
]} />`);
update('CompetitionPage.tsx', `<CompetitionHero competition={data.competition} season={season} imageUrl={images.banners.worldCupTrophy} metrics={[
  { label: "Season", value: data.competition.season },
  { label: "Teams", value: data.teams.length },
  { label: "Fixtures", value: data.matches.length },
  { label: "Format", value: "Groups + knockout" },
]} />`);
let worldCup = fs.readFileSync(root + 'CompetitionPage.tsx', 'utf8');
const oldMetrics = worldCup.indexOf('<div className="grid grid-cols-2 gap-5 sm:grid-cols-4">');
const nextSection = worldCup.indexOf('<section', oldMetrics);
if (oldMetrics >= 0 && nextSection > oldMetrics) worldCup = worldCup.slice(0, oldMetrics) + worldCup.slice(nextSection);
worldCup = worldCup.replace(/import \{ BarChart3, CalendarDays, Shield, Trophy \} from "lucide-react";\r?\n/, '');
fs.writeFileSync(root + 'CompetitionPage.tsx', worldCup);
let clubs = fs.readFileSync(root + 'PremierLeaguePage.tsx', 'utf8');
clubs = clubs.replace(/import \{ BarChart3, CalendarDays, Shield, Trophy \} from "lucide-react";\r?\n/, '');
fs.writeFileSync(root + 'PremierLeaguePage.tsx', clubs);
for (const file of ['apps/web/src/features/news/CompetitionNews.tsx', root + 'StoredBracket.tsx']) {
  const before = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, before.replaceAll('<SectionHeader', '<SectionHeader as="h2"'));
}
console.log('Rebuilt compact competition headers and corrected section heading levels.');
