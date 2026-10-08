use std::process::Command;

#[tauri::command]
pub fn check_environment(app: tauri::AppHandle) -> Result<bool, String> {
    let output = Command::new(&crate::commands::setup::get_binaries_paths(&app).1).arg("-version").output();

    match output {
        Ok(out) if out.status.success() => Ok(true),
        _ => Ok(false),
    }
}

