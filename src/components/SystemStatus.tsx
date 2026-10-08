/* 
 * Composant de vérification système (FFmpeg).
 * DA Riptide
 */
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export function SystemStatus() {
  const [hasFfmpeg, setHasFfmpeg] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkEnv() {
      try {
        const result = await invoke<boolean>("check_environment");
        setHasFfmpeg(result);
      } catch (e) {
        console.error("Failed to check environment", e);
        setHasFfmpeg(false);
      }
    }
    checkEnv();
  }, []);

  if (hasFfmpeg === true) return null;

  return (
    <div className="backdrop-blur-md bg-white text-black p-4 text-sm rounded-xl shadow-2xl border border-white/50 flex flex-col sm:flex-row items-center gap-4 animate-float">
      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <strong>FFmpeg est introuvable sur votre PC.</strong> Sans ça, l'application ne pourra pas assembler l'image et le son. Veuillez l'installer.
      </div>
    </div>
  );
}
