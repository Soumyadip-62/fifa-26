const fs = require('node:fs');
const path = require('node:path');
function edit(file, transform) { const before = fs.readFileSync(file, 'utf8'); const after = transform(before); if (after !== before) fs.writeFileSync(file, after); }
edit('apps/web/src/features/teams/TeamProfile.tsx', text => text.replace('className="scrollbar-hide flex gap-2 overflow-x-auto"', 'className="filter-tabs scrollbar-hide"').replace('key={item}\n', 'key={item}\n            aria-pressed={tab === item}\n'));
edit('apps/web/src/features/matches/MatchCentre.tsx', text => text.replace('className="scrollbar-hide flex gap-1 overflow-x-auto border-b border-border dark:border-border"', 'className="filter-tabs scrollbar-hide"').replaceAll('text-red-500', 'text-primary').replace(/\["premier-league", "la-liga", "ucl", "bundesliga"\]\.includes\([\s\S]*?\? "Live match · Updates every minute"\s*: "Live match · Demo data"/, '"Live match · Updates every minute"'));
edit('apps/web/src/app/standings/page.tsx', text => text.replace('className="scrollbar-hide flex gap-2 overflow-x-auto"', 'className="filter-tabs scrollbar-hide"').replace('key={item.id}\n', 'key={item.id}\n            aria-current={item.id === id ? "page" : undefined}\n'));
edit('apps/web/src/app/error.tsx', text => text.replace('text-white', 'text-primary-foreground').replace('The backend could not load this page.', 'We could not load this page.'));
edit('apps/web/src/features/statistics/TopScorers.tsx', text => text.replace('latest imported season', 'latest available season'));
const root = 'apps/web/src';
function walk(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) { if (file !== path.join(root, 'features', 'home')) walk(file); continue; }
    if (!file.endsWith('.tsx')) continue;
    edit(file, text => text.replace(/className="([^"]*\bbg-primary\b[^"]*)"/g, (all, classes) => /(?:^|\s)bg-primary(?:\s|$)/.test(classes) ? all.replace(/\btext-white\b/g, 'text-primary-foreground') : all));
  }
}
walk(root);
console.log('Finished shared tab states, live indicators, and primary-action contrast.');
