/*
 * Module de téléchargement de vidéos.
 */
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { SystemStatus } from "../components/SystemStatus";
import { VideoCard } from "../components/VideoCard";
import { SearchForm } from "../components/SearchForm";
import { VideoMetadata, VideoResolution } from "../types";

export function Downloader() {
  const [url, setUrl] = useState("");
  const [isInspecting, setIsInspecting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsInspecting(true);
    setIsDownloading(false);
    setDownloadSuccess(false);
    setError(null);
    setMetadata(null);

    try {
      const data = await invoke<VideoMetadata>("inspect_url", { url });
      setMetadata(data);
    } catch (err) {
      if (err === "ERR_INVALID_URL") {
        setError("Ce lien n'est pas valide.");
      } else {
        setError("Impossible de lire cette vidéo.");
      }
    } finally {
      setIsInspecting(false);
    }
  };

  const handleDownload = async (res: VideoResolution) => {
    if (!metadata) return;

    const selectedPath = await open({
      directory: true,
      multiple: false,
      title: "Choisir un dossier d'enregistrement",
    });

    if (!selectedPath) return;

    setIsDownloading(true);
    setDownloadSuccess(false);
    setError(null);
    
    try {
      await invoke("start_download", {
        payload: {
          url: metadata.url,
          resolution_label: res.label,
          destination: selectedPath,
          video_title: metadata.title,
        }
      });
    } catch (err) {
      if (err === "DOWNLOAD_CANCELLED") {
        setError("Téléchargement annulé.");
      } else {
        setError("Le téléchargement a échoué.");
      }
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setDownloadSuccess(false);
    setMetadata(null);
    setUrl("");
  };

  return (
    <section className="w-full max-w-2xl z-10 flex flex-col gap-6 animate-float" style={{ animationDuration: '8s' }}>
      <header className="flex flex-col gap-1 items-center text-center mb-2 animate-emerge">
        <h1 className="text-3xl font-light tracking-widest uppercase text-white drop-shadow-lg">RipTide</h1>
        <p className="text-xs text-neutral-400 tracking-wider">Téléchargement de vidéos</p>
      </header>

      <div className="animate-emerge anim-delay-100">
        <SystemStatus />
      </div>
      
      <SearchForm 
        url={url}
        isInspecting={isInspecting}
        isDownloading={isDownloading}
        error={error}
        onUrlChange={setUrl}
        onSubmit={handleInspect}
      />

      {isInspecting && (
        <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-xl p-4 sm:p-6 flex gap-6 animate-pulse animate-emerge anim-delay-300">
          <div className="w-32 aspect-video bg-white/5 rounded-lg shrink-0"></div>
          <div className="flex flex-col gap-3 flex-1 pt-1">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-3 bg-white/5 rounded w-1/3"></div>
          </div>
        </div>
      )}

      {metadata && !isInspecting && (
        <VideoCard 
          metadata={metadata}
          isDownloading={isDownloading}
          downloadSuccess={downloadSuccess}
          onDownload={handleDownload}
          onCancelDownload={() => setIsDownloading(false)}
          onDownloadSuccess={() => {
            setIsDownloading(false);
            setDownloadSuccess(true);
          }}
          onReset={handleReset}
        />
      )}
    </section>
  );
}
