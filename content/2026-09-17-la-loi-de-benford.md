---
{
  "title": "La loi de Benford : pourquoi le chiffre 1 domine partout",
  "category": "maths",
  "type": "cours",
  "summary": "Dans la plupart des données réelles, un nombre a près de 30 % de chances de commencer par 1 contre 4,6 % par 9 : un déséquilibre exploité pour repérer des fraudes.",
  "date": "2026-09-17",
  "sources": [
    { "title": "Loi de Benford — Wikipédia", "url": "https://fr.wikipedia.org/wiki/Loi_de_Benford" },
    { "title": "Tests d'adéquation à la loi de Newcomb-Benford comme outils de détection de fraudes — ResearchGate", "url": "https://www.researchgate.net/publication/358532291_Tests_d'adequation_a_la_loi_de_Newcomb-Benford_comme_outils_de_detection_de_fraudes" }
  ]
}
---

## Une observation née de tables usées

En 1881, l'astronome américain Simon Newcomb remarque un détail curieux dans les tables de logarithmes de son bureau : les premières pages, celles des nombres commençant par 1, sont beaucoup plus usées et écornées que les dernières, celles des nombres commençant par 9. Il en déduit que les gens consultent bien plus souvent des nombres qui commencent par 1 que par 9, et publie une courte note à ce sujet — qui tombe dans l'oubli.

Près de cinquante ans plus tard, en 1938, l'ingénieur Frank Benford refait la même observation sur ses propres tables, sans connaître les travaux de Newcomb, et pousse l'analyse plus loin en la vérifiant sur des dizaines de jeux de données différents (surfaces de rivières, populations, constantes physiques). C'est son nom qui reste attaché à la loi.

## L'énoncé et l'intuition

La loi de Benford prédit la fréquence du premier chiffre non nul d'un nombre dans un jeu de données. La formule est : la probabilité qu'un nombre commence par le chiffre *c* vaut log₁₀(1 + 1/c). Concrètement, le chiffre 1 apparaît en tête environ 30,1 % du temps, le 2 environ 17,6 %, et ainsi de suite jusqu'au 9, qui ferme la marche à seulement 4,6 %.

L'intuition tient à la croissance multiplicative : pour qu'un nombre passe de « commence par 1 » à « commence par 2 », il suffit d'une augmentation de 100 % (de 100 à 200). Mais pour passer de « commence par 9 » à « recommence par 1 » (donc 900 à 1000), il ne faut qu'une hausse de 11 %. Un nombre qui grandit ou varie sur plusieurs ordres de grandeur passe donc statistiquement plus de temps à commencer par 1 qu'à commencer par 9.

## Un exemple travaillé

Le vulgarisateur Mickaël Launay a testé la loi sur 1 226 prix relevés dans un supermarché. Les fréquences observées pour le premier chiffre — 32 %, 26 %, 15 %, 9 %, 5 %, 4 %, 3 %, 2 %, 4 % pour les chiffres 1 à 9 — collent de très près aux prédictions théoriques (30,1 %, 17,6 %, 12,5 %, 9,7 %, 7,9 %, 6,7 %, 5,8 %, 5,1 %, 4,6 %).

Pourquoi les prix d'un supermarché suivent-ils cette loi ? Parce qu'ils s'étalent sur plusieurs ordres de grandeur — de quelques centimes à plusieurs dizaines d'euros — sans plafond ni règle arbitraire de fixation. C'est exactement la condition nécessaire pour que Benford s'applique.

## Les pièges classiques

La loi ne s'applique pas à n'importe quelle série de nombres. Elle échoue sur des données contraintes artificiellement : les tailles humaines exprimées en centimètres commencent presque toutes par 1 (entre 100 et 199 cm), pas parce que Benford s'applique, mais parce que l'échelle de mesure écrase la variation naturelle. Elle échoue aussi sur des numéros attribués arbitrairement (numéros de téléphone, codes postaux) ou sur des entiers tirés uniformément au hasard entre deux bornes fixes.

Le piège inverse existe aussi : un auditeur pressé peut croire qu'un léger écart à Benford prouve une fraude, alors qu'un jeu de données légitime mais trop petit, ou couvrant une plage de valeurs trop resserrée, peut naturellement s'écarter de la loi sans qu'aucune manipulation n'ait eu lieu. La loi de Benford est un signal d'alerte statistique, pas une preuve.

## Application réelle : la crise grecque

En 2011, des économistes ont appliqué la loi de Benford aux données comptables macroéconomiques transmises par les États membres de la zone euro à Eurostat. Résultat : les chiffres transmis par la Grèce présentaient le plus grand écart à la distribution attendue parmi tous les pays testés, un signal cohérent avec les falsifications de déficit public révélées par ailleurs dans cette période. La méthode n'a pas « prouvé » la fraude à elle seule, mais elle a orienté les vérifications vers le bon endroit.

## Exercice

Prenez les surfaces des 20 pays les plus grands du monde (en km²) et relevez le premier chiffre de chacune. Combien commencent par 1 ? Par 9 ?

**Correction** : sur les 20 plus grands pays (Russie 17 098 246, Canada 9 984 670, Chine 9 596 961, États-Unis 9 833 517, Brésil 8 515 767, Australie 7 692 024, Inde 3 287 263, Argentine 2 780 400, Kazakhstan 2 724 900, Algérie 2 381 741, RD Congo 2 344 858, Arabie saoudite 2 149 690, Mexique 1 964 375, Indonésie 1 904 569, Soudan 1 886 068, Libye 1 759 540, Iran 1 648 195, Mongolie 1 564 110, Pérou 1 285 216, Tchad 1 284 000), neuf commencent par 1 et trois par 9 — un échantillon trop petit pour être statistiquement concluant, mais la tendance (plus de 1 que de 9) va dans le sens attendu.

## Pour aller plus loin

- Tester la loi de Benford sur un jeu de données personnel (relevés bancaires sur un an, factures d'électricité) avec un simple tableur et une formule `GAUCHE()` pour extraire le premier chiffre.
- Lire l'article original de [Frank Benford, « The Law of Anomalous Numbers » (1938)](https://fr.wikipedia.org/wiki/Loi_de_Benford), cité dans la plupart des travaux qui suivent.
- Chercher d'autres affaires judiciaires ou fiscales où la loi de Benford a servi de preuve à charge, pour voir comment les tribunaux évaluent ce type d'indice statistique.
