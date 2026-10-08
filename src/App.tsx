/*
 * RipTide - Composant principal de l'application.
 * Gère l'état global, l'orchestration des composants (Recherche, Vidéo, Téléchargement)
 * et les appels IPC vers le backend Tauri.
 * DA: Noir abyssal, écume blanche, motion design fluide.
 */
import { useState } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { Downloader } from "./modules/Downloader";
import { SubtitleGenerator } from "./modules/SubtitleGenerator";
import { VocalRemover } from "./modules/VocalRemover";

type Module = "download" | "subtitles" | "acapella";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeModule, setActiveModule] = useState<Module>("download");
  const [isExpanded, setIsExpanded] = useState(false);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen flex bg-black text-neutral-100 font-sans relative overflow-hidden">
      <div className="riptide-bg">
        <div className="wave-layer wave-layer-1"></div>
        <div className="wave-layer wave-layer-2"></div>
      </div>


      <nav 
        className={`fixed z-20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-black/60 backdrop-blur-md border-white/5 
          bottom-0 left-0 w-full h-16 border-t flex flex-row items-center justify-around 
          md:top-0 md:bottom-auto md:h-full md:border-t-0 md:border-r md:flex-col md:items-start md:justify-start md:py-6 
          ${isExpanded ? "md:w-48" : "md:w-20"}
        `}
      >
        <div className="hidden md:flex items-center justify-between w-full px-5 mb-8">
          <div className={`text-white font-black tracking-widest uppercase transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0 hidden"}`}>
            RIPTIDE
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/40 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-row md:flex-col gap-2 md:gap-4 w-full md:px-3">
          <button 
            onClick={() => setActiveModule("download")}
            className={`p-3 md:px-4 md:py-3 rounded-xl transition-all flex items-center gap-4 ${activeModule === "download" ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "text-white/40 hover:text-white hover:bg-white/10"}`}
            title="Téléchargement"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isExpanded && <span className="font-semibold text-sm tracking-wide hidden md:block whitespace-nowrap">Télécharger</span>}
          </button>

          <button 
            onClick={() => setActiveModule("subtitles")}
            className={`p-3 md:px-4 md:py-3 rounded-xl transition-all flex items-center gap-4 ${activeModule === "subtitles" ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "text-white/40 hover:text-white hover:bg-white/10"}`}
            title="Sous-titres"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {isExpanded && <span className="font-semibold text-sm tracking-wide hidden md:block whitespace-nowrap">Sous-titres</span>}
          </button>

          <button 
            onClick={() => setActiveModule("acapella")}
            className={`p-3 md:px-4 md:py-3 rounded-xl transition-all flex items-center gap-4 ${activeModule === "acapella" ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "text-white/40 hover:text-white hover:bg-white/10"}`}
            title="Acapella (Séparation)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            {isExpanded && <span className="font-semibold text-sm tracking-wide hidden md:block whitespace-nowrap">Acapella</span>}
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-24 md:pb-12 md:pl-28 relative z-10 overflow-y-auto w-full">
        {activeModule === "download" && <Downloader />}
        {activeModule === "subtitles" && <SubtitleGenerator />}
        {activeModule === "acapella" && <VocalRemover />}
      </main>
    </div>
  );
}

export default App;

