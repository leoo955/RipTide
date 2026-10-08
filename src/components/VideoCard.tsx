/*
 * Composant d'affichage des métadonnées de la vidéo et gestion du téléchargement.
 */
import { VideoMetadata, VideoResolution } from "../types";
import { DownloadProgress } from "./DownloadProgress";

interface VideoCardProps {
  metadata: VideoMetadata;
  isDownloading: boolean;
  downloadSuccess: boolean;
  onDownload: (res: VideoResolution) => void;
  onCancelDownload: () => void;
  onDownloadSuccess: () => void;
  onReset: () => void;
}

export function VideoCard({
  metadata,
  isDownloading,
  downloadSuccess,
  onDownload,
  onCancelDownload,
  onDownloadSuccess,
  onReset
}: VideoCardProps) {

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="backdrop-blur-md bg-black/60 border border-white/20 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 animate-emerge">
      <div className="flex flex-col sm:flex-row border-b border-white/10">
        <div className="relative w-full sm:w-48 aspect-video shrink-0 bg-black">
          <img 
            src={metadata.thumbnail_url} 
            alt={metadata.title}
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity hover:opacity-100 hover:mix-blend-normal transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <span className="absolute bottom-2 right-2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg tracking-widest">
            {formatDuration(metadata.duration_sec)}
          </span>
        </div>
        
        <div className="p-4 sm:p-5 flex flex-col justify-center flex-1 min-w-0">
          <h3 className="text-base font-medium text-white leading-snug line-clamp-2">{metadata.title}</h3>
          <p className="text-xs text-neutral-400 mt-1 truncate">{metadata.author}</p>
        </div>
      </div>
      
      <div className="p-5 sm:p-6 bg-black/40">
        {!isDownloading && !downloadSuccess && (
          <div className="flex flex-col sm:flex-row gap-3">
            {metadata.resolutions.map((res, i) => (
              <button 
                key={i}
                onClick={() => onDownload(res)}
                className="flex-1 bg-transparent hover:bg-white/10 border border-white/30 text-white px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between group"
              >
                <span className="truncate mr-2">{res.label}</span>
                <span className="text-neutral-500 group-hover:text-white/70 transition-colors text-xs">{res.container.toUpperCase()}</span>
              </button>
            ))}
          </div>
        )}

        {isDownloading && (
          <DownloadProgress 
            onCancel={onCancelDownload}
            onSuccess={onDownloadSuccess} 
          />
        )}

        {downloadSuccess && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-float" style={{ animationDuration: '6s' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex flex-col">
                <strong className="text-sm tracking-wide text-white">C'est prêt !</strong>
                <span className="text-xs text-neutral-400">La vidéo a bien été téléchargée.</span>
              </div>
            </div>
            <button 
              onClick={onReset}
              className="border-b-2 border-white hover:text-neutral-400 hover:border-neutral-400 font-semibold uppercase tracking-wider text-xs transition-colors pb-0.5"
            >
              Nouveau téléchargement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

