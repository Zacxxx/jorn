Plan final pour l’implémentation de l’AOE
1. Extension des types et données
Modifier le type Spell dans types.ts pour ajouter la propriété aoe (booléen ou enum/type de portée).
Ajouter une propriété de portée configurable (ex : tous les ennemis, groupe, etc.) si besoin pour l’évolution future.
Rendre le mana cost et le coût de crafting dépendant de la portée (AOE plus cher).
2. Logique de ciblage et sélection
Analyser la logique actuelle de sélection de cible dans targeting.tsx et CombatView.tsx :
Identifier les fonctions qui gèrent la sélection simple.
Prévoir une logique qui, si le spell est AOE, sélectionne automatiquement tous les ennemis.
S’assurer que la sélection simple reste inchangée pour les spells single-target.
Créer la sélection multiple sans casser la sélection simple :
Refactoriser le code pour séparer la logique de sélection selon le type de spell.
3. Battle UI et feedback utilisateur
Mettre à jour l’UI de sélection des cibles dans battle-ui, EnemyBattleDisplay.tsx, EnemyDisplay.tsx :
Lorsqu’un spell AOE est sélectionné, highlight tous les ennemis avec une couleur différente.
Afficher un tag “AOE” ou “Single” sur les spells dans le spellbook, l’UI de crafting, et en combat.
Adapter la sélection dans l’UI pour qu’un clic sur un spell AOE cible automatiquement tous les ennemis.
4. Crafting et Spellbook
Permettre la sélection du tag AOE lors du crafting :
Ajouter une option/tag dans l’interface de crafting pour choisir AOE (et ajuster le coût).
Afficher le tag dans le spellbook (SpellbookDisplay.tsx).
5. Génération LLM (geminiService)
Adapter le prompt de génération pour que le LLM puisse générer des sorts AOE :
Si l’utilisateur demande explicitement un sort AOE (via mots-clés), générer un sort AOE.
Sinon, générer AOE ou single selon le contexte.
Mettre à jour la documentation ou les exemples de prompts pour les utilisateurs.
6. Combat Log et feedback visuel
Mettre à jour CombatLogDisplay.tsx pour afficher clairement qu’un sort AOE a touché plusieurs cibles.
Prévoir une animation ou un feedback visuel spécifique lors de l’utilisation d’un sort AOE (highlight, effet de zone, etc.).
Étapes concrètes à suivre
Modifier le type Spell dans types.ts pour inclure aoe.
Adapter la logique de ciblage dans targeting.tsx et CombatView.tsx pour gérer la sélection multiple.
Mettre à jour l’UI de sélection et d’affichage des cibles.
Adapter le spellbook et l’UI de crafting pour permettre la création de sorts AOE.
Mettre à jour le service Gemini pour la génération de sorts AOE.
Adapter le combat log et les feedbacks visuels.