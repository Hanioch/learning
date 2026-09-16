import { getCategory, getType } from "./taxonomy";

/** Le modèle utilisé pour générer. */
export const MODEL = "claude-opus-5";

const SYSTEM = `Tu écris pour un site personnel d'apprentissage. Ton lecteur est curieux, intelligent, mais novice sur le sujet précis que tu traites.

Règles de fond :
- Tu écris en français, dans une langue claire et directe. Pas de jargon non expliqué, pas de formules creuses ("dans un monde en constante évolution"), pas de flatterie.
- Tu t'appuies sur des faits vérifiables. Tu utilises l'outil de recherche web pour les dates, les chiffres, les noms propres et tout ce qui a pu changer récemment — ne te fie pas à ta mémoire pour ça.
- Tu cites tes sources en lien markdown inline, à l'endroit exact où l'information apparaît : [nom de la source](url). Une affirmation chiffrée sans lien est une affirmation à retirer.
- Quand quelque chose est incertain ou débattu, tu le dis au lieu de trancher.
- Tu préfères un exemple concret à une généralité, et un ordre de grandeur à un adjectif.

Format de sortie, strictement :
1. Une première ligne "# " suivie du titre. Un titre précis et concret, pas une question rhétorique, pas plus de 70 caractères.
2. Une deuxième ligne "> " suivie d'un résumé d'UNE phrase (30 mots maximum) qui donne déjà l'information principale.
3. Une ligne vide, puis le corps en markdown : des sections "## " courtes, des paragraphes de 2 à 4 phrases, des listes quand c'est une énumération, du gras uniquement sur les termes clés.
4. Le corps fait entre 600 et 1100 mots. Tu termines par une section "## Pour aller plus loin" avec 2 ou 3 pistes concrètes (lecture, exercice, chose à essayer).

N'écris rien avant le "# " et rien après la dernière section. Pas de préambule, pas de "voici l'article".`;

export function buildPrompt(input: {
  category: string;
  type: string;
  topic?: string | null;
  avoidTitles?: string[];
}) {
  const category = getCategory(input.category);
  const type = getType(input.type);

  if (!category) throw new Error(`Catégorie inconnue : ${input.category}`);
  if (!type) throw new Error(`Type inconnu : ${input.type}`);

  const lines = [
    `Domaine : ${category.label} — ${category.brief}.`,
    ``,
    `Format demandé : ${type.label}.`,
    type.brief,
  ];

  if (input.topic?.trim()) {
    lines.push(
      ``,
      `Sujet imposé par le lecteur : « ${input.topic.trim()} ». Tiens-t'en à ce sujet.`,
    );
  } else {
    lines.push(
      ``,
      `Aucun sujet imposé : choisis toi-même un sujet précis et non évident dans ce domaine. Évite les sujets d'introduction les plus rebattus.`,
    );
  }

  if (input.avoidTitles?.length) {
    lines.push(
      ``,
      `Sujets déjà traités sur le site, à ne pas refaire :`,
      ...input.avoidTitles.slice(0, 25).map((t) => `- ${t}`),
    );
  }

  return { system: SYSTEM, user: lines.join("\n") };
}
