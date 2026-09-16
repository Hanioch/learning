export type Source = {
  title: string;
  url: string;
};

/** Un texte du site, tel que lu depuis `content/`. */
export type Article = {
  /** Nom du fichier sans extension : sert d'URL. */
  slug: string;
  category: string;
  type: string;
  title: string;
  summary: string;
  /** Le corps en markdown, sans le titre ni le résumé. */
  content: string;
  sources: Source[];
  /** Date de publication au format AAAA-MM-JJ. */
  date: string;
};
