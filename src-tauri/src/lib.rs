pub mod commands;
pub mod types;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(types::DownloadState {
            is_cancelled: std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false)),
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::env::check_environment,
            commands::inspect::inspect_url,
            commands::download::start_download,
            commands::download::cancel_download,
            commands::setup::check_dependencies,
            commands::setup::install_dependencies
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
