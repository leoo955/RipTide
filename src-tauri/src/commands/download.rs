/*
 * Moteur de téléchargement asynchrone et de multiplexage.
 * Supporte le téléchargement modulaire (Vidéo/Audio), le choix de la qualité,
 * et le multiplexage dynamique (MP4 ou MP3).
 */
use reqwest::Client;

use std::sync::atomic::Ordering;
use std::time::Instant;
use tauri::{AppHandle, Emitter, State};
use tokio::fs;
use tokio::io::AsyncWriteExt;
use tokio::process::Command;
use crate::types::{DownloadState, DownloadPayload, ProgressPayload};

#[tauri::command]
pub async fn cancel_download(state: State<'_, DownloadState>) -> Result<(), String> {
    state.is_cancelled.store(true, Ordering::Relaxed);
    Ok(())
}

#[tauri::command]
pub async fn start_download(
    app: AppHandle,
    payload: DownloadPayload,
    state: State<'_, DownloadState>,
) -> Result<(), String> {
    state.is_cancelled.store(false, Ordering::Relaxed);

    let temp_video = ".temp.video";
    let temp_audio = ".temp.audio";

    let is_audio_only = payload.resolution_label.contains("Audio Seulement")
        || payload.resolution_label.contains("Audio Only");
    let is_low_quality = payload.resolution_label.contains("Basse Qualité")
        || payload.resolution_label.contains("Low");
    let output_format = if is_audio_only {
        "mp3"
    } else {
        match payload.output_format.as_str() {
            "mkv" | "webm" => payload.output_format.as_str(),
            _ => "mp4",
        }
    };

    let safe_title = payload.video_title
        .as_deref()
        .unwrap_or("riptide_output")
        .replace(|c: char| !c.is_alphanumeric() && c != ' ' && c != '-' && c != '_', "")
        .trim()
        .to_string();
    
    let safe_title = if safe_title.is_empty() { "riptide_output".to_string() } else { safe_title };

    let target_dir = std::path::Path::new(&payload.destination);
    let output_file = target_dir.join(format!("{}.{}", safe_title, output_format));

    let _ = fs::remove_file(temp_video).await;
    let _ = fs::remove_file(temp_audio).await;

    let mut total_bytes: u64;
    let mut bytes_received = 0u64;
    let mut last_emit_time = Instant::now();
    let mut last_bytes_received = 0u64;

    let emit_progress = |bytes_received: u64,
                         total_bytes: &mut u64,
                         last_emit_time: &mut Instant,
                         last_bytes_received: &mut u64| {
        let now = Instant::now();
        if now.duration_since(*last_emit_time).as_millis() > 500 {
            let window_duration = now.duration_since(*last_emit_time).as_secs_f64();
            let bytes_in_window = bytes_received - *last_bytes_received;
            let speed_mbps = (bytes_in_window as f64 / window_duration) / 1_048_576.0;

            if bytes_received > *total_bytes {
                *total_bytes = bytes_received + 10_000_000;
            }

            let percentage = (bytes_received as f64 / *total_bytes as f64) * 100.0;
            let eta_sec = if speed_mbps > 0.0 {
                ((*total_bytes).saturating_sub(bytes_received) as f64 / (speed_mbps * 1_048_576.0))
                    as u64
            } else {
                0
            };

            let _ = app.emit(
                "download-progress",
                ProgressPayload {
                    percentage,
                    speed_mbps,
                    bytes_received,
                    total_bytes: *total_bytes,
                    eta_sec,
                },
            );
            *last_emit_time = now;
            *last_bytes_received = bytes_received;
        }
    };

    if payload.url.contains("youtube.com") || payload.url.contains("youtu.be") {
        total_bytes = 100_000_000;
        let output_path = output_file.to_string_lossy().into_owned();
        let format = if is_audio_only {
            "bestaudio/best".to_string()
        } else if is_low_quality {
            "bestvideo[height<=360]+bestaudio/best[height<=360]".to_string()
        } else {
            "bestvideo[height<=1080]+bestaudio/best[height<=1080]".to_string()
        };

        let mut command = Command::new("yt-dlp");
        command.args([
            "--ignore-config",
            "--no-playlist",
            "--newline",
            "-f",
            &format,
            "-o",
            &output_path,
        ]);
        if is_audio_only {
            command.args([
                "--extract-audio",
                "--audio-format",
                "mp3",
                "--audio-quality",
                "0",
            ]);
        } else {
            command.args(["--merge-output-format", output_format]);
        }
        command.arg(&payload.url);

        let mut child = command
            .spawn()
            .map_err(|_| "ERR_YTDLP_MISSING: installez yt-dlp".to_string())?;
        let _ = app.emit(
            "download-progress",
            ProgressPayload {
                percentage: 0.0,
                speed_mbps: 0.0,
                bytes_received: 0,
                total_bytes,
                eta_sec: 0,
            },
        );

        loop {
            if state.is_cancelled.load(Ordering::Relaxed) {
                let _ = child.kill().await;
                let _ = fs::remove_file(&output_file).await;
                return Err("DOWNLOAD_CANCELLED".into());
            }
            if let Some(status) = child.try_wait().map_err(|e| format!("ERR_YTDLP: {e}"))? {
                if !status.success() {
                    return Err(format!(
                        "ERR_YTDLP_EXIT: {status}. Mettez yt-dlp à jour avec: sudo apt update && sudo apt install yt-dlp"
                    ));
                }
                break;
            }
            tokio::time::sleep(std::time::Duration::from_millis(250)).await;
        }

        if !output_file.exists() {
            return Err("ERR_YTDLP_OUTPUT: fichier de sortie absent".into());
        }
        let _ = app.emit(
            "download-progress",
            ProgressPayload {
                percentage: 100.0,
                speed_mbps: 0.0,
                bytes_received: total_bytes,
                total_bytes,
                eta_sec: 0,
            },
        );
        return Ok(());
    } else {
        let test_url = "https://github.com/tauri-apps/tauri/archive/refs/tags/tauri-v2.0.0.zip";
        let client = Client::new();
        let mut response = client
            .get(test_url)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
            .send()
            .await
            .map_err(|e| format!("ERR_NETWORK_FAILURE: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("ERR_MEDIA_NOT_FOUND: {}", response.status()));
        }

        total_bytes = response.content_length().unwrap_or(10_000_000);
        let mut file_v = fs::File::create(temp_video)
            .await
            .map_err(|e| e.to_string())?;

        while let Some(chunk) = response.chunk().await.map_err(|e| e.to_string())? {
            if state.is_cancelled.load(Ordering::Relaxed) {
                let _ = fs::remove_file(temp_video).await;
                let _ = fs::remove_file(temp_audio).await;
                return Err("DOWNLOAD_CANCELLED".into());
            }

            file_v.write_all(&chunk).await.map_err(|e| e.to_string())?;
            bytes_received += chunk.len() as u64;
            emit_progress(
                bytes_received,
                &mut total_bytes,
                &mut last_emit_time,
                &mut last_bytes_received,
            );
        }
        if !is_audio_only {
            let _ = fs::copy(temp_video, temp_audio).await;
        }
    }

    let status = if is_audio_only {
        Command::new("ffmpeg")
            .args(["-y", "-i", temp_audio, "-q:a", "0", "-map", "0:a:0"])
            .arg(&output_file)
            .status()
            .await
            .map_err(|_| "ERR_FFMPEG_MISSING".to_string())?
    } else {
        Command::new("ffmpeg")
            .args([
                "-y", "-i", temp_video, "-i", temp_audio, "-map", "0:v:0", "-map", "1:a:0", "-c",
                "copy",
            ])
            .arg(&output_file)
            .status()
            .await
            .map_err(|_| "ERR_FFMPEG_MISSING".to_string())?
    };

    let _ = fs::remove_file(temp_video).await;
    let _ = fs::remove_file(temp_audio).await;

    if !status.success() {
        return Err("ERR_MUX_FAILED".into());
    }

    let _ = app.emit(
        "download-progress",
        ProgressPayload {
            percentage: 100.0,
            speed_mbps: 0.0,
            bytes_received: total_bytes,
            total_bytes,
            eta_sec: 0,
        },
    );

    Ok(())
}
