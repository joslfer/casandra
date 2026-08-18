import { Link } from "@tanstack/react-router";
import { useSesion } from "@/hooks/useSesion";
import { useMercado } from "@/hooks/useMercado";
import { createFileRoute } from "@tanstack/react-router";

const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

function Moneda({ className = "" }: { className?: string }) {
  return <span className={`inline-block h-3.5 w-3.5 rounded-full bg-moneda ${className}`} />;
}

function ResueltasComponent() {
  const { usuario, cargando } = useSesion();
  const mercado = useMercado(usuario);

  if (cargando) {
    return <div className="min-h-screen bg-lienzo" />;
  }

  const preguntas = mercado.leerPreguntas({ estado: "todas" }) || [];
  const asignaturas = mercado.leerAsignaturas() || [];

  const resueltasUsuario = preguntas.filter(
    (p) => p.resultado !== null && (p.misSi > 0 || p.misNo > 0)
  );

  const gruposPorAsignatura = asignaturas.map((asig) => {
    const preguntasAsig = resueltasUsuario.filter((p) => p.asignaturaId === asig.id);
    return {
      asignatura: asig,
      preguntas: preguntasAsig,
    };
  }).filter((g) => g.preguntas.length > 0);

  return (
    <div className="min-h-screen bg-lienzo pb-28" style={fuenteApple}>
      <header className="fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-5">
          <Link to="/" className="text-[15px] font-semibold tracking-tight text-ink hover:opacity-70">
            ← Volver
          </Link>
          <span className="text-[15px] font-semibold tracking-tight">Apuestas resueltas</span>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-[calc(5rem+env(safe-area-inset-bottom))]">
        {resueltasUsuario.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="text-[14px] text-ink/70">No tienes apuestas resueltas todavía.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {gruposPorAsignatura.map(({ asignatura, preguntas: preguntasAsig }) => (
              <section key={asignatura.id} className="space-y-4">
                <h2 className="font-mono text-[14px] font-bold uppercase tracking-wider text-ink">
                  {asignatura.nombre}
                </h2>

                <div className="space-y-4">
                  {preguntasAsig.map((p) => {
                    const esSi = p.misSi > 0;
                    const apuestaUsuario = esSi ? p.misSi : p.misNo;
                    const ladoApostado = esSi ? "sí" : "no";
                    
                    const haGanado = (p.resultado === true && esSi) || (p.resultado === false && !esSi);
                    
                    const poolGanador = p.resultado ? p.poolSi : p.poolNo;
                    const poolPerdedor = p.resultado ? p.poolNo : p.poolSi;
                    const poolTotal = p.poolSi + p.poolNo;

                    let tokensRecuperados = 0;
                    if (haGanado && poolGanador > 0) {
                      const proporcion = apuestaUsuario / poolGanador;
                      tokensRecuperados = Math.round(apuestaUsuario + proporcion * poolPerdedor);
                    }

                    const cantidadFinal = haGanado ? tokensRecuperados : apuestaUsuario;

                    return (
                      <article 
                        key={p.id} 
                        className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all ${
                          haGanado 
                            ? "bg-verde/[0.04] border-verde/30" 
                            : "bg-rojo/[0.04] border-rojo/30"
                        }`}
                      >
                        <h3 className="text-[16px] font-medium leading-snug text-ink">{p.titulo}</h3>

                        <div className="mt-3 pt-3 border-t border-dashed border-borde space-y-2 text-[14px] leading-relaxed text-ink">
                          <p>
                            Apostaste <strong className="font-semibold text-ink">{apuestaUsuario}</strong> a que {ladoApostado} entraba y{" "}
                            <span className={`font-semibold inline-flex items-center gap-1 ${haGanado ? "text-verde" : "text-rojo"}`}>
                              <span>{haGanado ? `ganaste ${cantidadFinal}` : `perdiste ${cantidadFinal}`}</span>
                              <Moneda className="h-3 w-3 translate-y-[1px]" />
                            </span>.
                          </p>
                          <p className="text-[13px] font-mono text-ink/75">
                            Pool en juego: {poolTotal} tokens (SÍ: {p.poolSi} · NO: {p.poolNo})
                          </p>
                        </div>
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

export const Route = createFileRoute("/resueltas")({
  component: ResueltasComponent,
});