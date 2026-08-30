import { useState, useEffect } from "react";

interface SplashScreenProps {
  onComplete?: () => void;
  onFinish?: () => void;
}

export const SplashScreen = ({ onComplete, onFinish }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  const handleComplete = () => {
    onComplete?.();
    onFinish?.();
  };

  useEffect(() => {
    // 2.0s animation runtime + 0.5s smooth fade out
    const timer = setTimeout(() => setFadeOut(true), 2000);
    const completeTimer = setTimeout(() => handleComplete(), 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F8F9FA] dark:bg-[#090D16] transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Animated Interlocking DU SVG Logo */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Loop 1: Outer D Shape */}
          <path
            d="M 40 30 H 100 C 135 30 155 52 155 85 C 155 118 135 140 100 140 H 70 V 170 H 40 Z"
            stroke="#0C2340"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-draw-path dark:stroke-indigo-400"
          />
          {/* Loop 2: Interlocking U Shape */}
          <path
            d="M 95 75 V 125 C 95 150 115 165 140 165 C 165 165 180 150 180 125 V 30"
            stroke="#4A90E2"
            strokeWidth="22"
            strokeLinecap="round"
            className="animate-draw-path-delay dark:stroke-emerald-400"
          />
        </svg>
      </div>

      <h1 className="mt-6 text-2xl font-black tracking-wider text-[#0C2340] dark:text-white animate-fade-in">
        DivvyUp
      </h1>
      <p className="mt-1 text-xs font-medium text-[#6C757D] dark:text-slate-400 animate-fade-in">
        Restoring your session...
      </p>

      {/* Tailwind & Keyframe Animations */}
      <style>{`
        @keyframes draw {
          0% { stroke-dasharray: 600; stroke-dashoffset: 600; opacity: 0; }
          30% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        .animate-draw-path {
          stroke-dasharray: 600;
          animation: draw 1.3s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        .animate-draw-path-delay {
          stroke-dasharray: 600;
          animation: draw 1.3s cubic-bezier(0.65, 0, 0.35, 1) 0.3s forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};
