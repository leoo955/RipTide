/*
 * Formulaire de recherche et d'inspection d'URL.
 */
import React from "react";

interface SearchFormProps {
  url: string;
  isInspecting: boolean;
  isDownloading: boolean;
  error: string | null;
  onUrlChange: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SearchForm({
  url,
  isInspecting,
  isDownloading,
  error,
  onUrlChange,
  onSubmit
}: SearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 backdrop-blur-md bg-black/40 p-4 sm:p-6 border border-white/10 rounded-xl shadow-2xl animate-emerge anim-delay-200">
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          id="url-input"
          type="text" 
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 text-white"
          placeholder="Collez le lien de la vidéo..."
          disabled={isInspecting || isDownloading}
        />
        <button 
          type="submit"
          className="bg-white text-black hover:bg-neutral-200 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider" 
          disabled={!url.trim() || isInspecting || isDownloading}
        >
          {isInspecting ? "Recherche..." : "Rechercher"}
        </button>
      </div>
      {error && <span className="text-sm text-white/70 bg-white/10 px-3 py-2 rounded border border-white/20 mt-1">{error}</span>}
    </form>
  );
}
