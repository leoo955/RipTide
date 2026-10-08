use reqwest::Client;
use std::env;
use std::fs;
use std::io::Cursor;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Emitter, Manager};
use tokio::io::AsyncWriteExt;
use zip::ZipArchive;

fn get_bin_dir(app: &AppHandle) -> PathBuf {
    let app_data = app.path().app_local_data_dir().unwrap();
    let bin_dir = app_data.join("bin");
    fs::create_dir_all(&bin_dir).unwrap_or(());
    bin_dir
}

#[cfg(target_os = "windows")]
pub fn get_executable_names() -> (&'static str, &'static str) {
    ("yt-dlp.exe", "ffmpeg.exe")
}

#[cfg(not(target_os = "windows"))]
pub fn get_executable_names() -> (&'static str, &'static str) {
    ("yt-dlp", "ffmpeg")
}

pub fn get_binaries_paths(app: &AppHandle) -> (PathBuf, PathBuf) {
    let bin_dir = get_bin_dir(app);
    let (ytdlp, ffmpeg) = get_executable_names();
    (bin_dir.join(ytdlp), bin_dir.join(ffmpeg))
}

#[tauri::command]
pub async fn check_dependencies(app: AppHandle) -> Result<bool, String> {
    let (ytdlp_path, ffmpeg_path) = get_binaries_paths(&app);
    Ok(ytdlp_path.exists() && ffmpeg_path.exists())
}

#[derive(serde::Serialize, Clone)]
struct SetupProgress {
    step: String,
    percentage: f64,
}

#[tauri::command]
pub async fn install_dependencies(app: AppHandle) -> Result<(), String> {
    let client = Client::new();
    let bin_dir = get_bin_dir(&app);
    let (ytdlp_name, ffmpeg_name) = get_executable_names();
    
    let ytdlp_path = bin_dir.join(ytdlp_name);
    let ffmpeg_path = bin_dir.join(ffmpeg_name);

    // 1. Download yt-dlp
    let ytdlp_url = if cfg!(target_os = "windows") {
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
    } else if cfg!(target_os = "macos") {
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos"
    } else {
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp"
    };

    let _ = app.emit("setup-progress", SetupProgress { step: "Téléchargement de yt-dlp...".into(), percentage: 10.0 });
    
    let response = client.get(ytdlp_url).send().await.map_err(|e| e.to_string())?;
    let bytes = response.bytes().await.map_err(|e| e.to_string())?;
    fs::write(&ytdlp_path, &bytes).map_err(|e| e.to_string())?;
    
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(&ytdlp_path).unwrap().permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&ytdlp_path, perms).unwrap();
    }

    let _ = app.emit("setup-progress", SetupProgress { step: "Téléchargement de ffmpeg...".into(), percentage: 40.0 });

    // 2. Download ffmpeg
    let ffmpeg_url = if cfg!(target_os = "windows") {
        "https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v4.4.1/ffmpeg-4.4.1-win-64.zip"
    } else if cfg!(target_os = "macos") {
        "https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v4.4.1/ffmpeg-4.4.1-osx-64.zip"
    } else {
        "https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v4.4.1/ffmpeg-4.4.1-linux-64.zip"
    };

    let response = client.get(ffmpeg_url).send().await.map_err(|e| e.to_string())?;
    let total_size = response.content_length().unwrap_or(80_000_000);
    
    // Pour ffmpeg, on le télécharge d'abord dans un .zip temporaire
    let zip_path = bin_dir.join("ffmpeg.zip");
    
    let mut file = tokio::fs::File::create(&zip_path).await.map_err(|e| e.to_string())?;
    let mut downloaded = 0u64;
    let mut stream = response;

    while let Some(chunk) = stream.chunk().await.map_err(|e| e.to_string())? {
        file.write_all(&chunk).await.map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;
        let p = 40.0 + ((downloaded as f64 / total_size as f64) * 50.0);
        let _ = app.emit("setup-progress", SetupProgress { step: "Téléchargement de ffmpeg...".into(), percentage: p });
    }

    let _ = app.emit("setup-progress", SetupProgress { step: "Extraction de ffmpeg...".into(), percentage: 95.0 });

    // Extraction du ZIP
    let zip_file = fs::File::open(&zip_path).map_err(|e| e.to_string())?;
    let mut archive = ZipArchive::new(zip_file).map_err(|e| e.to_string())?;
    
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };
        
        let file_name = outpath.file_name().unwrap_or_default().to_string_lossy().to_string();
        if file_name.starts_with("ffmpeg") {
            let mut outfile = fs::File::create(&ffmpeg_path).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
            break;
        }
    }
    
    let _ = fs::remove_file(&zip_path);

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if let Ok(metadata) = fs::metadata(&ffmpeg_path) {
            let mut perms = metadata.permissions();
            perms.set_mode(0o755);
            let _ = fs::set_permissions(&ffmpeg_path, perms);
        }
    }

    let _ = app.emit("setup-progress", SetupProgress { step: "Terminé !".into(), percentage: 100.0 });
    
    Ok(())
}
