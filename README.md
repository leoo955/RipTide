# RipTide 🌊

RipTide est une suite d'outils multimédia modulaire, rapide et élégante, construite avec **Tauri (Rust)** et **React (TypeScript)**. 
Son objectif initial est de fournir une interface minimaliste pour télécharger des vidéos et extraire des flux audio/vidéo avec une interface utilisateur de très haute qualité (Direction Artistique "Minecraft Riptide" en mode sombre exclusif).

L'application évolue actuellement vers une suite de création contenant la génération de sous-titres et l'isolation vocale (Acapella).

## Fonctionnalités (MVP)

- **Téléchargement Universel** : Basé sur `yt-dlp` et `ffmpeg` pour extraire depuis (presque) n'importe quelle source.
- **Sélection de Résolution** : Choix dynamique de la qualité vidéo (Max, Basse) ou Audio Seulement (MP3).
- **Interface Minimaliste** : Animations fluides, vagues de fond en CSS pur, et Sidebar dynamique.
- **Support des Fichiers Massifs** : Formattage intelligent pour les vidéos de plus de 24h et les fichiers multi-gigaoctets.
- **Haute Performance** : Backend asynchrone en Rust pur (Tokio), ne bloquant jamais l'interface React.

## Pré-requis

- [Rust](https://www.rust-lang.org/) (Version stable)
- [Node.js](https://nodejs.org/) & `pnpm`
- **FFmpeg** et **yt-dlp** doivent être installés et accessibles dans le `PATH` de votre système.

## Installation & Développement

```bash
# Installer les dépendances frontend
pnpm install

# Lancer l'environnement de développement (Tauri + Vite)
pnpm tauri dev
```

## Structure du Projet

L'application respecte les principes "Antislop" (code modulaire, commentaires utiles uniquement) :
- `src-tauri/` : Backend en Rust (gestion système, exécution CLI, télémétrie)
- `src/` : Frontend React
  - `components/` : Éléments d'interface réutilisables (SplashScreen, VideoCard)
  - `modules/` : Les différents outils de la suite (Downloader, Acapella, Subtitles)
