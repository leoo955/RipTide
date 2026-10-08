import { useEffect, useState } from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100);
    const t2 = setTimeout(() => setStage(2), 1500);
    const t3 = setTimeout(() => setStage(3), 3500);
    const t4 = setTimeout(() => onFinish(), 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-1000 ${
        stage === 3 ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        

        <div className={`absolute inset-0 transition-opacity duration-1000 ${stage >= 1 ? 'opacity-30' : 'opacity-0'}`}>
           <div className="wave-layer wave-layer-2" />
        </div>


        <h1 
          className={`absolute text-[15vw] font-black tracking-tighter text-white/10 select-none transition-all duration-[2000ms] cubic-bezier(0.16, 1, 0.3, 1) ${
            stage >= 1 ? "scale-100 blur-0" : "scale-150 blur-xl"
          }`}
        >
          RIPTIDE
        </h1>


        <div 
          className={`absolute flex items-center justify-center transition-all duration-[2000ms] cubic-bezier(0.16, 1, 0.3, 1) ${
            stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
           <h1 
            className="text-[15vw] font-black tracking-tighter text-transparent bg-clip-text select-none"
            style={{
              backgroundImage: 'linear-gradient(to bottom, #ffffff 0%, #333333 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            RIPTIDE
          </h1>
        </div>
        
      </div>
    </div>
  );
}

