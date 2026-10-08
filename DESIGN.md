# Design Direction — RipTide

## 1. Identité et Personnalité
- **Mots-clés** : Minimaliste, Robuste, Discret.
- **Humeur globale** : Un outil puissant mais qui s'efface devant l'action de l'utilisateur. Une application native de bureau légère, rapide et fiable.

## 2. Palette de Couleurs
Le projet propose deux thèmes fonctionnels, avec un **mode sombre par défaut**.

**Mode Sombre (Défaut)**
- Fond : Noir / Gris très sombre
- Texte : Blanc / Gris clair
- Accent : Rouge (pour souligner les actions importantes, ex: téléchargement, erreurs)

**Mode Clair**
- Fond : Blanc / Gris très clair
- Texte : Noir / Gris foncé
- Accent : Bleu (pour un rendu plus classique et lisible en plein jour)

## 3. Typographie
- **Typographie principale** : Sans-serif épurée et très lisible (ex: Inter ou typographie système native).
- Choix guidé par la robustesse et la lisibilité des métadonnées (titres de vidéos, poids, vitesse de téléchargement).

## 4. Dials Antislop (Liveliness)
> Dial: ENERGY 1 / RHYTHM 2 / MOTION 1

- **ENERGY 1 (Calm)** : L'UI va droit au but, pas de fioritures ou d'écrans d'accueil surchargés. On est là pour télécharger une vidéo.
- **RHYTHM 2 (Balanced)** : Grille cohérente mais avec quelques cassures pour mettre en valeur les éléments importants (le lecteur/preview vidéo vs la liste des téléchargements).
- **MOTION 1 (Static)** : Transitions très subtiles (hover, apparitions des tooltips). C'est un utilitaire système, pas un site vitrine marketing. Pas d'animations inutiles.

## 5. Justifications (R-31)
- *Pourquoi ce layout ?* Pour mettre le champ d'URL en évidence et afficher clairement les téléchargements en cours en dessous.
- *Pourquoi cette palette ?* Contraste maximum pour la lisibilité, et deux accents très différents (Rouge/Bleu) pour marquer visuellement la bascule entre les deux thèmes.
- *Pourquoi si peu d'animation ?* Pour garantir la perception de "légèreté et rapidité" demandée par les spécifications.
