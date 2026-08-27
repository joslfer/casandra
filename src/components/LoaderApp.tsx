// src/components/LoaderApp.tsx
import React from "react";

export function LoaderApp() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <style>{`
        @keyframes anim-l49-1 {
          58%, 100% { transform: rotate(1turn); }
        }
        @keyframes anim-l49-2 {
          58%, 100% { transform: rotate(-1turn); }
        }
        .loader2-rojo {
          animation: anim-l49-1 0.5s infinite linear;
          transform-origin: -100% 50%;
        }
        .loader2-verde {
          animation: anim-l49-2 0.5s infinite linear;
          animation-delay: -0.35s;
          transform-origin: 200% 50%;
        }
      `}</style>
      
      <div className="grid h-[15px] w-[60px]">
        {/* Puntos base (estáticos) */}
        <div className="col-start-1 row-start-1 flex w-full h-full justify-between">
          <div className="h-[15px] w-[15px] rounded-full bg-rojo"></div>
          <div className="h-[15px] w-[15px] rounded-full bg-verde"></div>
        </div>
        
        {/* Bolas móviles */}
        <div className="col-start-1 row-start-1 h-[15px] w-[15px] m-auto rounded-full bg-rojo loader2-rojo"></div>
        <div className="col-start-1 row-start-1 h-[15px] w-[15px] m-auto rounded-full bg-verde loader2-verde"></div>
      </div>
    </div>
  );
}