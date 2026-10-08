# Guide de Contribution & Setup Local — RipTide

## 1. Prérequis Système
* **Node.js :** Version 20 LTS ou supérieure.
* **Package Manager :** `pnpm` (recommandé) ou `npm`.
* **Rust :** Chaîne de compilation stable (`rustup update stable`).
* **Dépendances C/C++ :**
  * *Windows :* Microsoft C++ Build Tools (via Visual Studio Installer).
  * *Linux (Debian/Ubuntu) :* `libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev`.
* **FFmpeg :** Installé et accessible dans votre variable d'environnement `PATH` (`ffmpeg -version`).

## 2. Démarrage Rapide

```bash
# Cloner le dépôt
git clone [https://github.com/](https://github.com/)<votre-user>/RipTide.git
cd RipTide

# Installer les dépendances frontend
pnpm install

# Lancer l'environnement de développement natif
pnpm tauri dev