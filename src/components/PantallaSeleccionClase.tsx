import { useState } from "react";
import { useHaptic } from "@/hooks/useHaptic";
import type { Clase } from "@/hooks/useMercado";

const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

interface PantallaSeleccionClaseProps {
  clases: Clase[];
  onElegir: (id: string) => Promise<void>;
}

export function PantallaSeleccionClase({ clases, onElegir }: PantallaSeleccionClaseProps) {
  const [cargandoId, setCargandoId] = useState<string | null>(null);
  const haptic = useHaptic();

  const handleElegir = async (id: string) => {
    haptic();
    setCargandoId(id);
    await onElegir(id);
    setCargandoId(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-lienzo" style={fuenteApple}>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[340px] flex flex-col">
          
          <h1 className="text-[32px] font-bold tracking-tight text-ink text-left">Elige tu clase</h1>
          
          <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-ink/80 text-left">
            <p>
              Para ver las asignaturas, preguntas y el ranking correspondiente a tu grado.
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-3">
            {clases.map((c) => (
              <button
                key={c.id}
                onClick={() => handleElegir(c.id)}
                disabled={!!cargandoId}
                className="w-full touch-manipulation rounded-xl border border-borde bg-white py-4 text-[16px] font-medium text-ink shadow-sm transition-all active:scale-[0.98] active:bg-black/5 disabled:opacity-50 hover:border-ink/30"
              >
                {cargandoId === c.id ? "Guardando..." : c.nombre}
              </button>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}