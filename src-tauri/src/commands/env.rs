use std::process::Command;

#[tauri::command]
pub fn check_environment() -> Result<bool, String> {
    let output = Command::new("ffmpeg").arg("-version").output();

    match output {
        Ok(out) if out.status.success() => Ok(true),
        _ => Ok(false),
    }
}
