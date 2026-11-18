const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve('apps/web/src');
const changed = [];
const bounded = (pattern) => new RegExp(`(?<![\\w/-])${pattern}(?![\\w/-])`, 'g');
function visit(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) {
      if (file === path.join(root, 'features', 'home') || file === path.join(root, 'components', 'ui')) continue;
      visit(file);
      continue;
    }
    if (!file.endsWith('.tsx')) continue;
    const before = fs.readFileSync(file, 'utf8');
    let after = before.replaceAll('bg-zinc-950 text-white dark:bg-white dark:text-black', 'bg-primary text-primary-foreground');
    const replacements = [
      ['bg-white(?:/(?:50|60|70|75|80|85|90|95))?', 'bg-card'],
      ['bg-(?:zinc|neutral)-(?:900|950)(?:/\\d+)?', 'bg-card'],
      ['bg-(?:zinc|neutral)-(?:50|100|200|800)(?:/\\d+)?', 'bg-secondary'],
      ['text-(?:zinc|neutral)-(?:900|950|50|100)(?:/\\d+)?', 'text-foreground'],
      ['text-(?:zinc|neutral)-(?:400|500|550|600|700|750)(?:/\\d+)?', 'text-muted-foreground'],
      ['text-(?:zinc|neutral)-(?:200|300)(?:/\\d+)?', 'text-secondary-foreground'],
      ['border-(?:black|white)/(?:5|10|15|20)', 'border-border'],
      ['border-(?:zinc|neutral)-(?:200|300|700|800)(?:/\\d+)?', 'border-border'],
      ['divide-(?:black|white)/(?:5|10)', 'divide-border'],
      ['gap-(?:8|10|12)', 'gap-5'],
      ['shadow-(?:xs|sm)', 'shadow-none'],
    ];
    for (const [pattern, replacement] of replacements) after = after.replace(bounded(pattern), replacement);
    for (const radius of ['20', '24', '28', '32']) after = after.replaceAll(`rounded-[${radius}px]`, 'rounded-lg');
    after = after.replaceAll('rounded-lg bg-card', 'rounded-lg border border-border bg-card');
    if (after !== before) { fs.writeFileSync(file, after); changed.push(path.relative(process.cwd(), file)); }
  }
}
for (const directory of ['app', 'components', 'features']) visit(path.join(root, directory));
fs.writeFileSync('output/redesign/token-migration.json', JSON.stringify(changed, null, 2) + '\n');
console.log(`Applied shared surface, text, border and spacing tokens to ${changed.length} presentation files.`);
