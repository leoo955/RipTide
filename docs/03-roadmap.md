Feuille de Route & Jalons de Développement — RipTide

## Phase 1 : Initialisation & Vérification Système
- [ ] Initialiser le projet avec `create-tauri-app` (Rust + React + Vite + Tailwind CSS).
- [ ] Implémenter la commande `check_environment` dans `src-tauri/src/commands/env.rs`.
- [ ] Créer le composant d'état système dans l'UI (bannière discrète si `ffmpeg` est détecté ou manquant).

## Phase 2 : Moteur d'Inspection (Metadata Pipeline)
- [ ] Écrire le module de parsing d'URL et de résolution des métadonnées distantes.
- [ ] Implémenter la commande `inspect_url` avec sérialisation JSON propre.
- [ ] Développer l'interface : champ d'entrée d'URL, loader avec skeleton et carte de prévisualisation (miniature, durée formatée, titre).

## Phase 3 : Moteur de Streaming & Télémétrie
- [ ] Configurer `reqwest` avec flux asynchrone (`tokio::io`) par morceaux de 64 Ko.
- [ ] Calculer les statistiques de débit instantané sur fenêtre glissante (1 seconde).
- [ ] Connecter le canal d'événements Tauri `download-progress`.
- [ ] Développer le composant UI de jauge de progression, débit (Mo/s) et estimation de fin (ETA).

## Phase 4 : Pipeline Multiplexage & Sortie Fichiers
- [ ] Intégrer l'appel `tokio::process::Command` pour invoquer `ffmpeg` en sous-processus.
- [ ] Gérer le sélecteur natif de dossier de destination via la boîte de dialogue système de Tauri (`tauri-plugin-dialog`).
- [ ] Implémenter la commande `cancel_download` avec suppression propre des fichiers temporaires résiduels.

## Phase 5 : Finition, CI/CD & GitHub Packaging
- [ ] Rédiger le `README.md` principal avec captures d'écran, diagramme d'architecture et badges de version.
- [ ] Mettre en place le workflow GitHub Actions pour vérifier le linting (`cargo clippy`, `eslint`) et tester la compilation multi-OS.