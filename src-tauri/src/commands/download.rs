/*
 * Moteur de téléchargement asynchrone et de multiplexage.
 * Supporte le téléchargement modulaire (Vidéo/Audio), le choix de la qualité,
 * et le multiplexage dynamique (MP4 ou MP3).
 */
use crate::types::{DownloadPayload, DownloadState, ProgressPayload};
use reqwest::Client;
use std::sync::atomic::Ordering;
use std::time::Instant;
use tauri::{AppHandle, Emitter, State};
use tokio::fs;
use tokio::io::AsyncWriteExt;
use tokio::process::Command;

#[tauri::command]
pub async fn cancel_download(state: State<'_, DownloadState>) -> Result<(), String> {
    state.is_cancelled.store(true, Ordering::Relaxed);
    Ok(())
}

fn emit_progress(
    app: &AppHandle,
    bytes_received: u64,
    total_bytes: &mut u64,
    last_emit_time: &mut Instant,
    last_bytes_received: &mut u64,
) {
    let now = Instant::now();
    if now.duration_since(*last_emit_time).as_millis() > 500 {
        let window = now.duration_since(*last_emit_time).as_secs_f64();
        let bytes_in_window = bytes_received.saturating_sub(*last_bytes_received);
        let speed = (bytes_in_window as f64 / window) / 1_048_576.0;

        if bytes_received > *total_bytes {
            *total_bytes = bytes_received + 10_000_000;
        }

        let percentage = (bytes_received as f64 / *total_bytes as f64) * 100.0;
        let eta_sec = if speed > 0.0 {
            ((*total_bytes).saturating_sub(bytes_received) as f64 / (speed * 1_048_576.0)) as u64
        } else {
            0
        };

        let _ = app.emit(
            "download-progress",
            ProgressPayload {
                percentage,
                speed_mbps: speed,
                bytes_received,
                total_bytes: *total_bytes,
                eta_sec,
            },
        );

        *last_emit_time = now;
        *last_bytes_received = bytes_received;
    }
}

async fn run_ytdlp(
    app: &AppHandle,
    state: &State<'_, DownloadState>,
    url: &str,
    output_file: &std::path::Path,
    is_audio_only: bool,
    is_low_quality: bool,
    output_format: &str,
) -> Result<(), String> {
    let output_path = output_file.to_string_lossy().into_owned();
    let format = if is_audio_only {
        "bestaudio/best".to_string()
    } else if is_low_quality {
        "bestvideo[height<=360]+bestaudio/best[height<=360]".to_string()
    } else {
        "bestvideo[height<=1080]+bestaudio/best[height<=1080]".to_string()
    };

    let mut command = Command::new(&crate::commands::setup::get_binaries_paths(app).0);
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
    command.arg(url);

    let mut child = command
        .spawn()
        .map_err(|_| "ERR_YTDLP_MISSING".to_string())?;

    let _ = app.emit(
        "download-progress",
        ProgressPayload {
            percentage: 0.0,
            speed_mbps: 0.0,
            bytes_received: 0,
            total_bytes: 100_000_000,
            eta_sec: 0,
        },
    );

    loop {
        if state.is_cancelled.load(Ordering::Relaxed) {
            let _ = child.kill().await;
            let _ = fs::remove_file(output_file).await;
            return Err("DOWNLOAD_CANCELLED".into());
        }
        if let Some(status) = child.try_wait().map_err(|e| e.to_string())? {
            if !status.success() {
                return Err("ERR_YTDLP_EXIT".into());
            }
            break;
        }
        tokio::time::sleep(std::time::Duration::from_millis(250)).await;
    }

    if !output_file.exists() {
        return Err("ERR_YTDLP_OUTPUT".into());
    }
    Ok(())
}

async fn run_http_test(
    app: &AppHandle,
    state: &State<'_, DownloadState>,
    is_audio_only: bool,
    temp_video: &str,
    temp_audio: &str,
) -> Result<(), String> {
    let test_url = "https://github.com/tauri-apps/tauri/archive/refs/tags/tauri-v2.0.0.zip";
    let client = Client::new();
    let mut response = client
        .get(test_url)
        .header("User-Agent", "RipTide")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err("ERR_MEDIA_NOT_FOUND".into());
    }

    let mut total_bytes = response.content_length().unwrap_or(10_000_000);
    let mut bytes_received = 0u64;
    let mut last_emit = Instant::now();
    let mut last_bytes = 0u64;

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
            app,
            bytes_received,
            &mut total_bytes,
            &mut last_emit,
            &mut last_bytes,
        );
    }

    if !is_audio_only {
        let _ = fs::copy(temp_video, temp_audio).await;
    }
    Ok(())
}

async fn run_ffmpeg_mux(
    app: &AppHandle,
    is_audio_only: bool,
    temp_video: &str,
    temp_audio: &str,
    output_file: &std::path::Path,
) -> Result<(), String> {
    let status = if is_audio_only {
        Command::new(&crate::commands::setup::get_binaries_paths(app).1)
            .args(["-y", "-i", temp_audio, "-q:a", "0", "-map", "0:a:0"])
            .arg(output_file)
            .status()
            .await
    } else {
        Command::new(&crate::commands::setup::get_binaries_paths(app).1)
            .args([
                "-y", "-i", temp_video, "-i", temp_audio, "-map", "0:v:0", "-map", "1:a:0", "-c",
                "copy",
            ])
            .arg(output_file)
            .status()
            .await
    };

    let _ = fs::remove_file(temp_video).await;
    let _ = fs::remove_file(temp_audio).await;

    if !status.map_err(|_| "ERR_FFMPEG_MISSING")?.success() {
        return Err("ERR_MUX_FAILED".into());
    }
    Ok(())
}

#[tauri::command]
pub async fn start_download(
    app: AppHandle,
    payload: DownloadPayload,
    state: State<'_, DownloadState>,
) -> Result<(), String> {
    state.is_cancelled.store(false, Ordering::Relaxed);

    let is_audio_only = payload.resolution_label.contains("Audio");
    let is_low_quality = payload.resolution_label.contains("Basse");
    let output_format = if is_audio_only { "mp3" } else { "mp4" };

    let mut safe_title = payload
        .video_title
        .as_deref()
        .unwrap_or("riptide_output")
        .replace(
            |c: char| !c.is_alphanumeric() && c != ' ' && c != '-' && c != '_',
            "",
        )
        .trim()
        .to_string();
    if safe_title.is_empty() {
        safe_title = "riptide_output".to_string();
    }

    let output_file = std::path::Path::new(&payload.destination)
        .join(format!("{}.{}", safe_title, output_format));
    let temp_video = ".temp.video";
    let temp_audio = ".temp.audio";

    let _ = fs::remove_file(temp_video).await;
    let _ = fs::remove_file(temp_audio).await;

    if payload.url.contains("youtube.com") || payload.url.contains("youtu.be") {
        run_ytdlp(
            &app,
            &state,
            &payload.url,
            &output_file,
            is_audio_only,
            is_low_quality,
            output_format,
        )
        .await?;
    } else {
        run_http_test(&app, &state, is_audio_only, temp_video, temp_audio).await?;
        run_ffmpeg_mux(&app, is_audio_only, temp_video, temp_audio, &output_file).await?;
    }

    let _ = app.emit(
        "download-progress",
        ProgressPayload {
            percentage: 100.0,
            speed_mbps: 0.0,
            bytes_received: 0,
            total_bytes: 0,
            eta_sec: 0,
        },
    );

    Ok(())
}
