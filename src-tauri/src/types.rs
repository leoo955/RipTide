/*
 * Types partagés pour l'application RipTide.
 */
use serde::{Deserialize, Serialize};
use std::sync::atomic::AtomicBool;
use std::sync::Arc;

pub struct DownloadState {
    pub is_cancelled: Arc<AtomicBool>,
}

#[derive(Debug, Deserialize)]
pub struct DownloadPayload {
    pub url: String,
    pub resolution_label: String,
    #[serde(default = "default_output_format")]
    pub output_format: String,
    pub destination: String,
    pub video_title: Option<String>,
}

fn default_output_format() -> String {
    "mp4".into()
}

#[derive(Debug, Clone, Serialize)]
pub struct ProgressPayload {
    pub percentage: f64,
    pub speed_mbps: f64,
    pub bytes_received: u64,
    pub total_bytes: u64,
    pub eta_sec: u64,
}
