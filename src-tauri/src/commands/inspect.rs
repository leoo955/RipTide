/*
 * Commande Tauri d'inspection d'URL pour récupérer les métadonnées.
 * Utilise yt-dlp pour extraire les informations YouTube fiablement.
 */
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoResolution {
    pub label: String,
    pub height: u32,
    pub container: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoMetadata {
    pub url: String,
    pub title: String,
    pub duration_sec: u64,
    pub thumbnail_url: String,
    pub author: String,
    pub resolutions: Vec<VideoResolution>,
}

#[tauri::command]
pub async fn inspect_url(app: tauri::AppHandle, url: String) -> Result<VideoMetadata, String> {
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err("ERR_INVALID_URL".into());
    }

    if url.contains("youtube.com") || url.contains("youtu.be") {
        use std::process::Stdio;
        let output =
            std::process::Command::new(&crate::commands::setup::get_binaries_paths(&app).0)
                .args([
                    "--ignore-config",
                    "--no-playlist",
                    "--dump-single-json",
                    "--socket-timeout",
                    "10",
                ])
                .arg(&url)
                .stdout(Stdio::piped())
                .output()
                .map_err(|_| "ERR_YTDLP_MISSING: installez yt-dlp".to_string())?;

        if !output.status.success() {
            let details = String::from_utf8_lossy(&output.stderr);
            let details = details.trim();
            return Err(if details.is_empty() {
                "ERR_YTDLP: impossible d'extraire les métadonnées".into()
            } else {
                format!("ERR_YTDLP: {details}")
            });
        }

        let json_str = String::from_utf8_lossy(&output.stdout);
        if let Ok(info) = serde_json::from_str::<serde_json::Value>(&json_str) {
            let title = info["title"].as_str().unwrap_or("Sans titre").to_string();
            let duration_sec = info["duration"].as_u64().unwrap_or(0);
            let thumbnail_url = info["thumbnail"].as_str().unwrap_or("").to_string();
            let uploader = info["uploader"].as_str().unwrap_or("YouTube").to_string();

            return Ok(VideoMetadata {
                url,
                title,
                duration_sec,
                thumbnail_url,
                author: uploader,
                resolutions: vec![
                    VideoResolution {
                        label: "Qualité Max".into(),
                        height: 1080,
                        container: "mp4".into(),
                    },
                    VideoResolution {
                        label: "Basse Qualité".into(),
                        height: 360,
                        container: "mp4".into(),
                    },
                    VideoResolution {
                        label: "Audio Seulement".into(),
                        height: 0,
                        container: "mp3".into(),
                    },
                ],
            });
        }
        return Err("ERR_YTDLP_JSON: réponse invalide".into());
    }

    Err("ERR_URL_NOT_SUPPORTED_YET".into())
}
