/*
 * Module de séparation audio (Bientôt).
 */
export function VocalRemover() {
  return (
    <section className="w-full max-w-2xl z-10 flex flex-col gap-6 animate-float" style={{ animationDuration: '8s' }}>
      <header className="flex flex-col gap-1 items-center text-center mb-2 animate-emerge">
        <h1 className="text-3xl font-light tracking-widest uppercase text-white drop-shadow-lg">Acapella</h1>
        <p className="text-xs text-neutral-400 tracking-wider">Séparation de voix et instruments</p>
      </header>

      <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-xl p-8 text-center animate-emerge anim-delay-100 flex flex-col items-center justify-center min-h-[300px]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <h3 className="text-lg text-white mb-2">Module en construction</h3>
        <p className="text-sm text-neutral-500 max-w-md">L'isolation vocale par IA est en cours de développement.</p>
      </div>
    </section>
  );
}
