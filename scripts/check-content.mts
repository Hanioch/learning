/**
 * Vérifie que tous les fichiers de `content/` sont exploitables par le site.
 * À lancer avant de committer de nouveaux textes :  npm run check:content
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { CONTENT_DIR, isArticleFile, parseArticleFile } from "../src/lib/content.ts";
import { CATEGORIES, TYPES } from "../src/lib/taxonomy.ts";

const categoryIds = new Set(CATEGORIES.map((c) => c.id));
const typeIds = new Set(TYPES.map((t) => t.id));

const problems: string[] = [];
const seen = new Map<string, string>();

let files: string[] = [];
try {
  files = (await readdir(CONTENT_DIR)).filter(isArticleFile).sort();
} catch {
  console.log("Aucun dossier content/ : rien à vérifier.");
  process.exit(0);
}

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const article = parseArticleFile(slug, await readFile(join(CONTENT_DIR, file), "utf8"));

  if (!article) {
    problems.push(`${file}: illisible (voir le détail ci-dessus).`);
    continue;
  }
  if (!categoryIds.has(article.category)) {
    problems.push(`${file}: catégorie « ${article.category} » absente de src/lib/taxonomy.ts.`);
  }
  if (!typeIds.has(article.type)) {
    problems.push(`${file}: type « ${article.type} » absent de src/lib/taxonomy.ts.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(article.date)) {
    problems.push(`${file}: date « ${article.date} » (attendu AAAA-MM-JJ).`);
  }
  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(slug)) {
    problems.push(`${file}: nom de fichier attendu AAAA-MM-JJ-titre-en-minuscules.md`);
  }
  const duplicate = seen.get(article.title.toLowerCase());
  if (duplicate) {
    problems.push(`${file}: même titre que ${duplicate}.`);
  }
  seen.set(article.title.toLowerCase(), file);

  for (const source of article.sources) {
    if (!/^https?:\/\//.test(source.url)) {
      problems.push(`${file}: source sans URL valide (« ${source.url} »).`);
    }
  }
}

if (problems.length > 0) {
  console.error(`\n${problems.length} problème(s) :`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`${files.length} texte(s) vérifié(s), tout est en ordre.`);
