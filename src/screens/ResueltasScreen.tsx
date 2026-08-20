import { Link } from "@tanstack/react-router";
import { useSesion } from "@/hooks/useSesion";
import { probabilidad, useMercado } from "@/hooks/useMercado";

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

  if (cargando) {
    return <div className="min-h-screen bg-lienzo" />;
  }

  const preguntas = mercado.leerPreguntas({ estado: "todas" }) || [];
  const asignaturas = mercado.leerAsignaturas() || [];

  const resueltasUsuario = preguntas.filter(
    (p) => p.resultado !== null && ((p.misSi || 0) > 0 || (p.misNo || 0) > 0)
  );

  const gruposPorAsignatura = asignaturas.map((asig) => {
    const preguntasAsig = resueltasUsuario
      .filter((p) => p.asignaturaId === asig.id)
      .sort((a, b) => {
        const fechaA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const fechaB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return fechaB - fechaA;
      });
    return { asignatura: asig, preguntas: preguntasAsig };
  }).filter((g) => g.preguntas.length > 0);

  return (
    <div className="min-h-screen bg-lienzo pb-28" style={fuenteApple}>
      <header className="fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-5">
          <Link to="/" className="text-[15px] font-semibold tracking-tight text-ink hover:opacity-70">
            ← Volver al mercado
          </Link>
          <span className="text-[15px] font-semibold tracking-tight">Comprueba</span>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-[calc(5rem+env(safe-area-inset-top))]">
        {resueltasUsuario.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="text-[14px] text-sutil">No tienes apuestas en preguntas resueltas todavía.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {gruposPorAsignatura.map(({ asignatura, preguntas: preguntasAsig }) => (
              <section key={asignatura.id}>
                
                {/* Título de la asignatura centrado y tipografía grande */}
                <h2 className="text-center text-[18px] font-semibold tracking-tight text-ink mb-3">
                  {asignatura.nombre}
                </h2>

                <div className="flex flex-col">
                  {preguntasAsig.map((p) => {
                    const misSi = p.misSi || 0;
                    const misNo = p.misNo || 0;
                    const poolSi = p.poolSi || 0;
                    const poolNo = p.poolNo || 0;
                    const poolTotal = poolSi + poolNo;
                    const prob = probabilidad(p);

                    const acertoSi = p.resultado === true && misSi > 0;
                    const acertoNo = p.resultado === false && misNo > 0;
                    const haGanado = acertoSi || acertoNo;
                    const apuestaUsuario = misSi > 0 ? misSi : misNo;
                    const poolGanador = p.resultado ? poolSi : poolNo;
                    const poolPerdedor = p.resultado ? poolNo : poolSi;

                    let tokensRecuperados = 0;
                    if (haGanado && poolGanador > 0) {
                      const proporcion = apuestaUsuario / poolGanador;
                      tokensRecuperados = Math.round(apuestaUsuario + proporcion * poolPerdedor);
                    }
                    const beneficio = tokensRecuperados - apuestaUsuario;

                    const ladoStr = misSi > 0 ? "SÍ" : "NO";
                    const accionStr = haGanado 
                      ? `acertaste y ganaste ${beneficio} tokens` 
                      : `no acertaste y perdiste ${apuestaUsuario} tokens`;

                    const colorResultado = p.resultado ? "text-verde" : "text-rojo";
                    const textoResultado = p.resultado ? "ENTRÓ" : "NO ENTRÓ";

                    return (
                      <article key={p.id} className="relative py-4 border-b border-linea/70 last:border-0">
                        
                        {/* Fila 1: Título a la izquierda con icono negro, Etiqueta a la derecha */}
                        <div className="flex items-start justify-between gap-4">
                          
                          <div className="flex items-start gap-2.5 relative z-10">
                            {/* Icono de acierto/fallo en círculo negro sólido */}
                            <div className="mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-ink text-white">
                              {haGanado ? <TicIcon className="w-[11px] h-[11px]" /> : <EquisIcon className="w-[11px] h-[11px]" />}
                            </div>

                            <h3 className="text-[15px] font-medium leading-snug text-ink">{p.titulo}</h3>
                          </div>

                          <span className={`shrink-0 font-mono text-[14px] font-bold tracking-widest uppercase leading-none mt-[2px] relative z-10 ${colorResultado}`}>
                            {textoResultado}
                          </span>
                        </div>

                        {/* Fila 2: Párrafo pegadito al título */}
                        <p className="mt-1 text-[13px] text-ink pr-14 relative z-10">
                          Apostaste {apuestaUsuario} tokens a <strong>{ladoStr}</strong>, <strong>{accionStr}</strong> 
                          <span className="text-sutil ml-1.5 whitespace-nowrap">· pool: {poolTotal}</span>
                        </p>

                        {/* El número de probabilidad más pequeño y ajustado abajo */}
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
      </main>
    </div>
  );
}