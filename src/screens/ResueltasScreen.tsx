import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSesion } from "@/hooks/useSesion";
import { pagoSiGana, probabilidad, useMercado, type Lado } from "@/hooks/useMercado";
import { LoaderApp } from "@/components/LoaderApp";

const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

// Iconos SVG limpios para evitar emojis de sistema
const TicIcon = ({ className }: { className: string }) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const EquisIcon = ({ className }: { className: string }) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export function ResueltasScreen() {
  const { usuario, cargando } = useSesion();
  const mercado = useMercado(usuario);

  // -----------------------------------------------------
  // BLOQUEO DEL SWIPE-TO-GO-BACK DE IOS
  // -----------------------------------------------------
  useEffect(() => {
    const bloquearSwipeIOS = (e: TouchEvent) => {
      if (e.touches[0].clientX < 25) {
        e.preventDefault();
      }
    };
    
    document.addEventListener("touchstart", bloquearSwipeIOS, { passive: false });
    
    return () => {
      document.removeEventListener("touchstart", bloquearSwipeIOS);
    };
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen bg-lienzo flex items-center justify-center">
        <LoaderApp />
      </div>
    );
  }

  // incluirHuerfanas: también devuelve las preguntas en las que apostaste
  // cuya asignatura fue eliminada, para que el registro nunca se pierda.
  const preguntas = mercado.leerPreguntas({ estado: "todas", incluirHuerfanas: true }) || [];
  const asignaturas = mercado.leerAsignaturas() || [];

  const resueltasUsuario = preguntas.filter(
    (p) => p.resultado !== null && ((p.misSi || 0) > 0 || (p.misNo || 0) > 0)
  );

  const ordenarPorFecha = (a: { creadaEn?: number }, b: { creadaEn?: number }) => {
    const fechaA = a.creadaEn || 0;
    const fechaB = b.creadaEn || 0;
    return fechaB - fechaA;
  };

  // Grupos de asignaturas que siguen existiendo
  const gruposActivos = asignaturas.map((asig) => ({
    id: asig.id,
    nombre: asig.nombre,
    preguntas: resueltasUsuario
      .filter((p) => p.asignaturaId === asig.id)
      .sort(ordenarPorFecha),
  }));

  // Grupos de asignaturas eliminadas (se agrupan por el nombre guardado)
  const huerfanas = resueltasUsuario.filter((p) => !p.asignaturaId);
  const nombresHuerfanas = Array.from(
    new Set(huerfanas.map((p) => p.asignaturaNombre || "Asignatura eliminada"))
  );
  const gruposHuerfanos = nombresHuerfanas.map((nombre) => ({
    id: `huerfana:${nombre}`,
    nombre,
    preguntas: huerfanas
      .filter((p) => (p.asignaturaNombre || "Asignatura eliminada") === nombre)
      .sort(ordenarPorFecha),
  }));

  const gruposPorAsignatura = [...gruposActivos, ...gruposHuerfanos]
    .filter((g) => g.preguntas.length > 0)
    .sort((a, b) => {
      // Como las preguntas ya están ordenadas, la de la posición 0 es la más reciente de ese examen
      const masRecienteA = a.preguntas[0]?.creadaEn || 0;
      const masRecienteB = b.preguntas[0]?.creadaEn || 0;
      return masRecienteB - masRecienteA; 
    });

  return (
    <div className="min-h-screen bg-lienzo pb-10 touch-pan-y overscroll-x-none" style={fuenteApple}>
      
      <header className="fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-5">
          <Link to="/" className="text-[15px] font-semibold tracking-tight text-ink hover:opacity-70 touch-manipulation">
            ← Volver al mercado
          </Link>
          <span className="text-[15px] font-semibold tracking-tight">Comprueba</span>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-[calc(5rem+env(safe-area-inset-top))] flex flex-col items-center">
        
        <div className="w-full">
          {resueltasUsuario.length === 0 ? (
            <div className="mt-10 text-center">
              <p className="text-[14px] text-sutil">Cuando se resuelva una apuesta, aparecerá aquí para que puedas comprobar que todo está correcto.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {gruposPorAsignatura.map(({ id, nombre, preguntas: preguntasAsig }) => (
                <section key={id}>
                  
                  <h2 className="text-center text-[18px] font-semibold tracking-tight text-ink mb-3">
                    {nombre}
                  </h2>

                  <div className="flex flex-col">
                    {preguntasAsig.map((p) => {
                      const misSi = p.misSi || 0;
                      const misNo = p.misNo || 0;
                      const poolTotal = (p.poolSi || 0) + (p.poolNo || 0);
                      const prob = probabilidad(p);
                      const esLmsr = p.mecanismo === "lmsr";

                      // Lo apostado en total (por si apostó a ambos lados) y lo cobrado
                      // por el lado ganador. En pari-mutuel es el reparto del bote; en LMSR,
                      // las acciones ganadoras (1 token cada una, redondeado como en el servidor).
                      const ladoGanador: Lado = p.resultado ? "si" : "no";
                      const apostadoTotal = misSi + misNo;
                      const apostoGanador = (p.resultado ? misSi : misNo) > 0;
                      const cobro = apostoGanador ? Math.round(pagoSiGana(p, ladoGanador)) : 0;
                      const beneficio = cobro - apostadoTotal;
                      const haGanado = apostoGanador && beneficio >= 0;

                      const accionStr = haGanado
                        ? `acertaste y ganaste ${beneficio} tokens`
                        : `no acertaste y perdiste ${-beneficio} tokens`;

                      const colorResultado = p.resultado ? "text-verde" : "text-rojo";
                      const textoResultado = p.resultado ? "ENTRÓ" : "NO ENTRÓ";

                      return (
                        <article key={p.id} className="relative py-4 border-b border-linea/70 last:border-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-2.5 relative z-10">
                              <div className="mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-ink text-white">
                                {haGanado ? <TicIcon className="w-[11px] h-[11px]" /> : <EquisIcon className="w-[11px] h-[11px]" />}
                              </div>
                              <h3 className="text-[15px] font-medium leading-snug text-ink">{p.titulo}</h3>
                            </div>
                            <span className={`shrink-0 font-mono text-[14px] font-bold tracking-widest uppercase leading-none mt-[2px] relative z-10 ${colorResultado}`}>
                              {textoResultado}
                            </span>
                          </div>

                          <p className="mt-1 text-[13px] text-ink pr-14 relative z-10">
                            Apostaste{" "}
                            {misSi > 0 && misNo > 0 ? (
                              <>{misSi} tokens a <strong>SÍ</strong> y {misNo} a <strong>NO</strong></>
                            ) : (
                              <>{apostadoTotal} tokens a <strong>{misSi > 0 ? "SÍ" : "NO"}</strong></>
                            )}
                            , <strong>{accionStr}</strong> 
                            <span className="text-sutil ml-1.5 whitespace-nowrap">· {esLmsr ? "apostado" : "pool"}: {poolTotal}</span>
                          </p>

                          <span className="absolute bottom-3.5 right-0 z-0 font-mono text-[24px] font-bold tracking-tighter text-black/15 leading-none pointer-events-none">
                            {prob}%
                          </span>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}