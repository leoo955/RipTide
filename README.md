# RipTide

Outil de bureau pour télécharger et manipuler des fichiers audio et vidéo. Construit avec Tauri (Rust) et React (TypeScript).

## Ce que fait l'application

- Télécharge des vidéos depuis n'importe quelle URL supportée par `yt-dlp`.
- Convertit directement en MP3 ou assemble la vidéo et l'audio avec `ffmpeg`.
- Propose une interface sombre inspirée du Riptide de Minecraft.
- Les prochains modules prévus intègrent la séparation vocale (Acapella) et la génération de sous-titres locaux.

## Prérequis

Votre machine doit disposer des outils suivants :

- Rust et Cargo
- Node.js et pnpm
- `yt-dlp` et `ffmpeg` accessibles dans le PATH de l'ordinateur.

## Installation

Pour lancer l'environnement de développement local :

```bash
pnpm install
pnpm tauri dev
```

## Structure du code

L'architecture sépare l'interface de l'exécution système :

- `src/` : Le code React. Les outils sont rangés dans `src/modules/` et l'interface commune dans `src/components/`.
- `src-tauri/src/commands/download.rs` : Le code Rust qui pilote l'exécution asynchrone de `yt-dlp` et `ffmpeg`.
