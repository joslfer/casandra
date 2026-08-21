import { useState } from "react";
import { useHaptic } from "@/hooks/useHaptic";
import { Link } from "@tanstack/react-router";

const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

interface PantallaLoginProps {
  entrarConGoogle: () => Promise<any> | any;
}

export function PantallaLogin({ entrarConGoogle }: PantallaLoginProps) {
  const [error, setError] = useState<string | null>(null);
  const haptic = useHaptic();

  const handleLogin = async () => {
    haptic();
    const mensajeError = await entrarConGoogle();
    if (mensajeError && typeof mensajeError === "string") {
      setError(mensajeError);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-lienzo" style={fuenteApple}>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[340px] flex flex-col">
          
          <h1 className="text-[32px] font-bold tracking-tight text-ink text-left">Casandra</h1>
          
          {/* ========================================== */}
          {/*           ZONA DE TEXTOS (PÁRRAFOS)          */}
          {/* ========================================== */}
          <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-ink/80 text-left">
            
            {/* PÁRRAFO 1 */}
            <p>
                Consulta qué preguntas pueden caer según la opinión agregada de todo el mundo.
            </p>
            
            {/* PÁRRAFO 2 */}
            <p>
              Si tienes algo que añadir, apuesta tokens simbólicos como este {" "}
              <span className="inline-block h-[14px] w-[14px] rounded-full bg-moneda align-[-1px] shadow-sm" />
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
            className="mt-12 w-full touch-manipulation rounded-xl bg-ink py-4 text-[16px] font-medium text-white shadow-sm transition-transform active:scale-[0.98]"
          >
            Entrar con Google · @usal.es
          </button>

          {/* ========================================== */}
          {/*           POLÍTICA DE PRIVACIDAD             */}
          {/* ========================================== */}
          <p className="mt-4 text-center text-[12px] leading-relaxed text-sutil">
            Al entrar con Google, aceptas la{" "}
        <Link to="/privacidad" className="underline hover:text-ink">
              Política de privacidad
        </Link>
            .
          </p>

          {error && <p className="mt-4 text-[16px] text-rojo text-center">{error}</p>}

        </div>
      </main>
    </div>
  );
}