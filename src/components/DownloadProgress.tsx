/*
 * Télémétrie de téléchargement - DA Riptide
 */
import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export interface ProgressPayload {
  percentage: number;
  speed_mbps: number;
  bytes_received: number;
  total_bytes: number;
  eta_sec: number;
}

interface DownloadProgressProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function DownloadProgress({ onCancel, onSuccess }: DownloadProgressProps) {
  const [progress, setProgress] = useState<ProgressPayload | null>(null);

  useEffect(() => {
    const unlisten = listen<ProgressPayload>("download-progress", (event) => {
      setProgress(event.payload);
      if (event.payload.percentage >= 100) {
        onSuccess();
      }
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, [onSuccess]);

  const handleCancel = async () => {
    try {
      await invoke("cancel_download");
      onCancel();
    } catch (e) {
      console.error("Failed to cancel", e);
    }
  };

  if (!progress) return null;

  const formatBytes = (bytes: number) => {
    if (bytes >= 1_073_741_824) {
      return (bytes / 1_073_741_824).toFixed(2) + " Go";
    }
    return (bytes / 1_048_576).toFixed(1) + " Mo";
  };

  const formatEta = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="flex flex-col gap-4 relative w-full">
      <div className="flex justify-between items-end">
        <span className="text-sm font-light tracking-widest text-white uppercase">
          Téléchargement...
        </span>
        <span className="text-xs text-neutral-400 font-mono tracking-wider">
          {progress.speed_mbps.toFixed(2)} Mo/s
        </span>
      </div>

      <div className="h-3 w-full bg-black border border-white/20 rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full foam-progress transition-all duration-300 ease-out" 
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs tracking-wider">
        <span className="text-neutral-400">
          <strong className="text-white font-normal">{formatBytes(progress.bytes_received)}</strong> / {formatBytes(progress.total_bytes)}
          {progress.eta_sec > 0 && ` • ~${formatEta(progress.eta_sec)}`}
        </span>
        
        {progress.percentage < 100 && (
          <button 
            onClick={handleCancel}
            className="text-white hover:text-red-400 font-semibold tracking-widest uppercase transition-colors"
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}

