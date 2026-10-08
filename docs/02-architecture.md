# Architecture Technique & Contrats IPC — RipTide

## 1. Vue d'ensemble du pipeline

```text
[UI React / TS]
       │
       │  (1) invoke("inspect_url", { url })
       ▼
[Tauri IPC Layer]
       │
       ▼
[Extraction Engine (Rust)]
       │  - Requête HTTP HEAD / GET
       │  - Résolution des flux DASH / HLS / Direct
       │
       ▼
[UI React / TS] ◄── Retourne VideoMetadata
       │
       │  (2) invoke("start_download", { downloadPayload })
       ▼
[Download Manager (Tokio Task)]
       ├── Stream Flux Vidéo (.temp.video)
       ├── Stream Flux Audio (.temp.audio)
       │      │
       │      └── app_handle.emit("download-progress", ProgressPayload) ──► [UI React]
       │
       ▼ (Les deux streams sont terminés)
[Muxing Engine (Rust Child Process)]
       │  - spawn("ffmpeg -i video -i audio -c copy output.mp4")
       │
       ▼
[File System Cleanup]
       ├── Suppression des fichiers .temp
       └── Notification de succès à l'UI