/**
 * Source de vérité des deux listes déroulantes.
 * `brief` est injecté dans le prompt : c'est ce qui donne sa personnalité à chaque
 * combinaison catégorie × type. Ajouter une entrée ici suffit, le reste suit.
 */

export type Option = {
  id: string;
  label: string;
  brief: string;
};

export const CATEGORIES: Option[] = [
  {
    id: "tech",
    label: "Tech",
    brief:
      "logiciel, matériel, web, IA, cybersécurité, infrastructure, culture des métiers du numérique",
  },
  {
    id: "maths",
    label: "Mathématiques",
    brief:
      "algèbre, analyse, probabilités, géométrie, théorie des nombres, mathématiques appliquées",
  },
  {
    id: "litterature",
    label: "Littérature",
    brief:
      "romans, poésie, essais, courants littéraires, auteurs, histoire de l'édition, critique",
  },
  {
    id: "sciences",
    label: "Sciences",
    brief: "physique, biologie, chimie, astronomie, médecine, sciences de la Terre",
  },
  {
    id: "histoire",
    label: "Histoire",
    brief:
      "événements, civilisations, biographies, historiographie, archéologie, géopolitique passée",
  },
  {
    id: "economie",
    label: "Économie",
    brief:
      "macroéconomie, marchés, entreprises, finance personnelle, travail, histoire économique",
  },
  {
    id: "art",
    label: "Art & Design",
    brief:
      "peinture, architecture, design graphique, typographie, cinéma, musique, photographie",
  },
  {
    id: "loisir",
    label: "Loisirs",
    brief:
      "cuisine, jeux, sport, voyage, jardinage, bricolage, artisanat, collections",
  },
];

export const TYPES: Option[] = [
  {
    id: "nouveaute",
    label: "Une nouveauté",
    brief:
      "Ce qui vient de bouger dans le domaine. Privilégie les faits des 12 derniers mois, situe la nouveauté par rapport à ce qui existait avant, et dis pourquoi ça compte.",
  },
  {
    id: "cours",
    label: "Un cours",
    brief:
      "Une leçon courte et progressive sur une notion précise : définition, intuition, un exemple travaillé de bout en bout, les pièges classiques, puis un exercice avec sa correction.",
  },
  {
    id: "idee",
    label: "Une idée",
    brief:
      "Un concept, un modèle mental ou une thèse que l'on peut retourner dans sa tête. Expose l'idée, son origine, ses conséquences, et l'objection la plus sérieuse qu'on lui oppose.",
  },
  {
    id: "commerce",
    label: "Un commerce",
    brief:
      "Un modèle économique réel : ce qui est vendu, à qui, comment l'argent rentre, quelle est la structure de coûts, pourquoi ça tient (ou pas). Des ordres de grandeur chiffrés.",
  },
  {
    id: "anecdote",
    label: "Une anecdote",
    brief:
      "Une histoire vraie, précise et datée, avec ses personnages. Elle doit se raconter à table et se terminer sur ce qu'elle nous apprend.",
  },
  {
    id: "debat",
    label: "Un débat",
    brief:
      "Une controverse ouverte du domaine. Présente honnêtement les deux camps avec leurs meilleurs arguments, ce sur quoi tout le monde s'accorde, et ce qui départagerait.",
  },
  {
    id: "projet",
    label: "Un mini-projet",
    brief:
      "Quelque chose à faire soi-même en une soirée : le matériel ou prérequis, les étapes, le résultat attendu, et comment aller plus loin.",
  },
  {
    id: "portrait",
    label: "Un portrait",
    brief:
      "Une personne qui a marqué le domaine : son parcours, sa contribution réelle, ce qu'on lui attribue à tort, et ce qu'il en reste aujourd'hui.",
  },
];

const byId = (list: Option[]) => new Map(list.map((o) => [o.id, o]));

const CATEGORY_MAP = byId(CATEGORIES);
const TYPE_MAP = byId(TYPES);

export const getCategory = (id: string) => CATEGORY_MAP.get(id);
export const getType = (id: string) => TYPE_MAP.get(id);

export const categoryLabel = (id: string) => CATEGORY_MAP.get(id)?.label ?? id;
export const typeLabel = (id: string) => TYPE_MAP.get(id)?.label ?? id;
