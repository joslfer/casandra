import { useState, useEffect } from "react";
import { useHaptic } from "@/hooks/useHaptic";
import { Link } from "@tanstack/react-router";

const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

interface PantallaLoginProps {
  entrarConGoogle: () => Promise<any> | any;
}

export function PantallaLogin({ entrarConGoogle }: PantallaLoginProps) {
  const [error, setError] = useState<string | null>(null);
  const haptic = useHaptic();

  // Bloquea el scroll de la página mientras esta pantalla está montada.
  useEffect(() => {
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, []);

  const handleLogin = async () => {
    haptic();
    const mensajeError = await entrarConGoogle();
    if (mensajeError && typeof mensajeError === "string") {
      setError(mensajeError);
    }
  };

  return (
    <div
      className="flex flex-col bg-lienzo overflow-hidden relative"
      style={{ ...fuenteApple, height: "100dvh" }}
    >
      
      {/* CSS inyectado para la animación */}
      <style>{`
        .loader-casandra {
          width: 28px;
          aspect-ratio: 1;
          position: relative;
          /* Velocidad lenta de 6 segundos */
          animation: giro-casandra 6s linear infinite;
        }
        .loader-casandra::before,
        .loader-casandra::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          /* Color amarillo plano y sólido */
          background-color: #eab308;
          /* Rebote sincronizado con la velocidad lenta */
          animation: salto-casandra 1.5s cubic-bezier(.5,-500,.5,500) infinite;
        }
        .loader-casandra::after {
          /* Delay ajustado a la mitad de la vibración para alternar */
          animation-delay: -0.45s;
        }
        @keyframes giro-casandra { 
          100% { transform: rotate(360deg) } 
        }
        @keyframes salto-casandra { 
          100% { transform: translate(0.5px) } 
        }
      `}</style>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative z-10 overflow-hidden">
        
        <div className="w-full max-w-[340px] flex flex-col relative pt-4">
          
          {/* ========================================== */}
          {/* ANIMACIÓN DE LOGO (Centrada y más arriba)    */}
          {/* ========================================== */}
          <div className="mb-16 mt-2 flex w-full justify-center">
            {/* Las bolas amarillas planas */}
            <div className="loader-casandra opacity-90"></div>
          </div>
          {/* ========================================== */}

          <h1 className="text-[32px] font-bold tracking-tight text-ink text-left">Casandra, mercado de predicción de preguntas de examen. </h1>
          
          {/* ========================================== */}
          {/*           ZONA DE TEXTOS (PÁRRAFOS)          */}
          {/* ========================================== */}
          <div className="mt-5 space-y-4 text-[18px] leading-relaxed text-ink/80 text-left">
            
            {/* PÁRRAFO 1 */}
            <p>
              Consulta qué caerá según lo que saben muchas personas de clase.
            </p>
            <p>
              Si tienes algo que añadir, apuesta tokens simbólicos como este {" "}
              <span className="inline-block h-[14px] w-[14px] rounded-full bg-moneda align-[-1px] shadow-sm relative z-10" />
              . (ficticios)
            </p>
  

            {/* PÁRRAFO 3 */}
            <p>
              {/* Escribe tu tercer párrafo justo debajo de esta línea */}
            
            </p>

          </div>
          {/* ========================================== */}

          <button
            onClick={handleLogin}
            className="mt-12 w-full touch-manipulation rounded-xl bg-ink py-4 text-[16px] font-medium text-white shadow-sm transition-transform active:scale-[0.98] relative z-10"
          >
            Entra con tu cuenta @usal.es
          </button>

          {/* ========================================== */}
          {/*           POLÍTICA DE PRIVACIDAD             */}
          {/* ========================================== */}
          <p className="mt-4 text-center text-[12px] leading-relaxed text-sutil relative z-10">
            Al entrar con Google, aceptas la{" "}
            <Link to="/privacidad" className="underline hover:text-ink">
              Política de privacidad
            </Link>
            .
          </p>

          {error && <p className="mt-4 text-[16px] text-rojo text-center relative z-10">{error}</p>}

        </div>
      </main>
    </div>
  );
}