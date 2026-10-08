# Solution : ERR_STREAM_A: Video source empty

## Problème

L'URL YouTube `https://www.youtube.com/watch?v=kRJsTQTuizA` n'avait aucune source vidéo/audio disponible dans `rusty_ytdl`, car :

- YouTube renvoie les métadonnées (titre, durée)
- Mais aucune URL de flux vidéo/audio n'est extraite par `rusty_ytdl` pour cette vidéo
- Toutes les sources retournaient vides (`url=false`)

## Solution Implémentée

Remplacement de `rusty_ytdl` par **`yt-dlp`** pour YouTube, car :

1. **Plus robuste** : `yt-dlp` gère mieux les changements d'API YouTube
2. **Formatage direct** : Génère directement MP3/MP4 au lieu de multiplexer manuellement
3. **Installation standard** : `yt-dlp` est disponible sur la plupart des systèmes Linux

### Fichiers modifiés

#### 1. [`src-tauri/src/commands/download.rs`](/home/leo/Code/RipTide/src-tauri/src/commands/download.rs)

**Avant** : Deux appels `rusty_ytdl` (audio/vidéo), fallback limité, multiplexage FFmpeg complexe

```rust
let video_a = rusty_ytdl::Video::new_with_options(...)?;
let stream_a = video_a.stream().await  // ← Échoue avec "Video source empty"
```

**Après** : Un seul appel `yt-dlp` qui produit le fichier final

```rust
let mut command = Command::new("yt-dlp");
command.args([
    "--no-playlist",
    "-f", format,  // "bestaudio/best" ou "bestvideo+bestaudio"
    "-o", &output_path,
]);
if is_audio_only {
    command.args(["--extract-audio", "--audio-format", "mp3"]);
} else {
    command.args(["--merge-output-format", "mp4"]);
}
let mut child = command.spawn()?;
// Attendre la sortie du process
```

#### 2. [`src-tauri/src/commands/inspect.rs`](/home/leo/Code/RipTide/src-tauri/src/commands/inspect.rs)

**Avant** : `rusty_ytdl::Video::get_info()` avec extraction de formats cassés

**Après** : Appel synchrone `yt-dlp --dump-single-json` pour les métadonnées

```rust
let output = std::process::Command::new("yt-dlp")
    .args(["--dump-single-json", "--socket-timeout", "10"])
    .arg(&url)
    .output()?;
let info = serde_json::from_str::<serde_json::Value>(&String::from_utf8_lossy(&output.stdout))?;
// Extraire title, duration, thumbnail, uploader
```

#### 3. [`src-tauri/Cargo.toml`](/home/leo/Code/RipTide/src-tauri/Cargo.toml)

Ajout de `"time"` aux features `tokio` pour `tokio::time::sleep`.

## Dépendances Requises

```bash
yt-dlp      # Téléchargeur YouTube (remplace rusty_ytdl)
ffmpeg      # Déjà utilisé (pas de changement)
```

Installation :

```bash
sudo apt-get install yt-dlp ffmpeg  # Ubuntu/Debian
brew install yt-dlp ffmpeg           # macOS
```

## Flux de Démarrage

```bash
cd /home/leo/Code/RipTide
pnpm install
pnpm tauri dev
```

## Tests Effectués

1. **URL fournie** : `https://www.youtube.com/watch?v=kRJsTQTuizA`
   - ✅ Métadonnées extraites par `yt-dlp`
   - ✅ Formats vidéo/audio disponibles
   - `rusty_ytdl` aurait échoué avec `Video source empty`

2. **Compilation**
   - ✅ Rust backend : `cargo check` réussi
   - ✅ Frontend : `pnpm build` réussi
   - ✅ Tous les warnings liés aux variables `mut` supprimés

## Architecture Finale

```
App.tsx (React)
  ↓
inspect_url()  → yt-dlp --dump-single-json → JSON metadata
start_download() → yt-dlp --newline -f FORMAT -o OUTPUT
                 ↓
                file.mp4 ou file.mp3
```

## Avantages

| Aspect | Avant (rusty_ytdl) | Après (yt-dlp) |
|--------|------------------|-----------------|
| Formats cassés | Fréquent | Rare (suivi activement) |
| Multiplexage | Manuel + complexe | Intégré |
| Performance | Lent (2 appels) | Rapide (1 appel) |
| Dépendances Rust | rusty_ytdl + regex | Aucune supplémentaire |
| Installation | Compilation Rust | `yt-dlp` précompilé |

## Notes

- `rusty_ytdl` reste dans `Cargo.toml` mais n'est plus utilisé (suppression future possible)
- `serde_json` était déjà disponible dans les dépendances transitives
- Tous les fichiers temporaires sont nettoyés en cas d'annulation ou d'erreur
