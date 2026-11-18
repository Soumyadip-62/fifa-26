const fs = require('node:fs');
const cp = require('node:child_process');
const files = new Set(JSON.parse(fs.readFileSync('output/redesign/token-migration.json', 'utf8')));
for (const file of [
  'app/globals.css', 'app/design-system.css', 'app/layout.tsx', 'app/not-found.tsx',
  'components/layout/PageContext.tsx', 'components/layout/Header.tsx', 'components/layout/TabBar.tsx', 'components/layout/Footer.tsx', 'components/layout/AppShell.tsx',
  'components/common/PlayerAvatar.tsx', 'components/common/Pagination.tsx', 'components/common/StatCard.tsx', 'components/common/SectionHeader.tsx',
  'components/ui/card.tsx', 'components/ui/input.tsx', 'components/ui/button.tsx', 'components/ui/avatar.tsx', 'components/ui/badge.tsx', 'components/ui/skeleton.tsx',
  'components/football/CompetitionHero.tsx', 'components/football/CompetitionBadge.tsx', 'components/football/PlatformMatchCard.tsx',
  'features/home/DashboardScorers.tsx', 'features/home/HomePage.tsx',
]) files.add('apps/web/src/' + file);
const existing = [...files].filter(file => fs.existsSync(file));
cp.execFileSync(process.execPath, ['node_modules/prettier/bin/prettier.cjs', '--write', ...existing], { stdio: 'pipe' });
fs.writeFileSync('output/redesign/changed-presentation-files.json', JSON.stringify(existing, null, 2) + '\n');
console.log('Formatted ' + existing.length + ' changed presentation files.');
