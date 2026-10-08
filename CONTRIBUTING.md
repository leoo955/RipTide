# Guide de Contribution (Community Guidelines)

Merci de l'intérêt que vous portez à **RipTide** ! 🌊 
Nous sommes ravis de vous accueillir dans la communauté. Voici les lignes directrices pour participer sainement au projet.

## 🛠 Philosophie du Projet

Ce projet respecte activement les **principes "Antislop"** pour la qualité du code :
1. **Qualité avant la quantité :** Le code doit être modulaire, propre et réfléchi.
2. **Commentaires utiles uniquement :** Évitez le bruit visuel (ne commentez pas ce que fait le code de manière évidente). Expliquez toujours le *pourquoi* (les décisions techniques) et non le *comment*.
3. **Séparation des responsabilités :** Gardez l'interface React légère. Les opérations système lourdes (téléchargement, parsing, ffmpeg) doivent impérativement être gérées par le backend Rust.

## 🚀 Comment Contribuer ?

### 1. Signaler un Bug ou Proposer une Idée
- Vérifiez d'abord dans les Issues du dépôt si le sujet n'a pas déjà été abordé.
- Ouvrez une nouvelle Issue en décrivant le problème de façon claire, en incluant votre système d'exploitation et la version utilisée.

### 2. Soumettre une Pull Request (PR)
1. Forkez le dépôt et créez une branche dédiée (`git checkout -b feature/ma-super-fonctionnalite`).
2. Respectez la structure du projet :
   - `src-tauri/` : pour la logique système (Rust).
   - `src/` : pour l'interface utilisateur (React).
3. Testez votre code localement avec la commande de développement.
4. Faites des commits avec des messages clairs (ex: `feat(ui): ajout du mode clair`).
5. Ouvrez une Pull Request et décrivez précisément vos changements.

## 💻 Environnement de Développement

Pré-requis :
- **Rust** (stable)
- **Node.js** & **pnpm**
- **FFmpeg** et **yt-dlp** (accessibles dans votre PATH)

```bash
# Installer les dépendances
pnpm install

# Lancer le mode développement
pnpm tauri dev
```

---
En participant à ce projet, vous acceptez de respecter notre [Code de Conduite](CODE_OF_CONDUCT.md).
