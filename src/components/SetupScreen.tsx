
interface SetupScreenProps {
  progress: { step: string; percentage: number } | null;
}

export default function SetupScreen({ progress }: SetupScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
      {/* Background dark waves */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
        <div className="wave-layer wave-1"></div>
        <div className="wave-layer wave-2" style={{ animationDelay: '-2s' }}></div>
        <div className="wave-layer wave-3" style={{ animationDelay: '-4s' }}></div>
      </div>

      <div className="z-10 flex flex-col items-center justify-center w-full max-w-md p-8 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800">
        <h2 className="text-2xl font-black tracking-tight mb-2">Installation Requise</h2>
        <p className="text-zinc-400 text-center text-sm mb-8">
          RipTide a besoin de moteurs externes (yt-dlp et ffmpeg) pour fonctionner.
          Nous les téléchargeons automatiquement pour vous.
        </p>

        <div className="w-full">
          <div className="flex justify-between text-xs font-medium text-zinc-300 mb-2">
            <span>{progress?.step || 'Initialisation...'}</span>
            <span>{Math.round(progress?.percentage || 0)}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${Math.max(0, Math.min(100, progress?.percentage || 0))}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
