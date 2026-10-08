/*
 * Module de génération de sous-titres (Bientôt).
 */
export function SubtitleGenerator() {
  return (
    <section className="w-full max-w-2xl z-10 flex flex-col gap-6 animate-float" style={{ animationDuration: '8s' }}>
      <header className="flex flex-col gap-1 items-center text-center mb-2 animate-emerge">
        <h1 className="text-3xl font-light tracking-widest uppercase text-white drop-shadow-lg">Sous-Titres</h1>
        <p className="text-xs text-neutral-400 tracking-wider">Transcription automatique</p>
      </header>

      <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-xl p-8 text-center animate-emerge anim-delay-100 flex flex-col items-center justify-center min-h-[300px]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg text-white mb-2">Module en construction</h3>
        <p className="text-sm text-neutral-500 max-w-md">L'intégration du modèle de transcription locale arrive très bientôt.</p>
      </div>
    </section>
  );
}
