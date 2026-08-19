// src/screens/ResueltasScreen.tsx
import { Link } from "@tanstack/react-router";
import { useSesion } from "@/hooks/useSesion";
import { useMercado } from "@/hooks/useMercado";

const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

export function ResueltasScreen() {
  const { usuario, cargando } = useSesion();
  const mercado = useMercado(usuario);

  if (cargando) {
    return <div className="min-h-screen bg-lienzo" />;
  }

  const preguntas = mercado.leerPreguntas({ estado: "todas" }) || [];
  const resueltasUsuario = preguntas.filter((p) => p.resultado !== null && ((p.misSi || 0) > 0 || (p.misNo || 0) > 0));

  return (
    <div className="min-h-screen bg-lienzo pb-28" style={fuenteApple}>
      <header className="fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-5">
          <Link to="/" className="text-[15px] font-semibold tracking-tight text-ink hover:opacity-70">
            ← Volver al mercado
          </Link>
          <span className="text-[15px] font-semibold tracking-tight">Apuestas resueltas</span>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-[calc(5rem+env(safe-area-inset-top))]">
        {resueltasUsuario.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="text-[14px] text-sutil">No tienes apuestas en preguntas resueltas todavía.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resueltasUsuario.map((p) => {
              const misSi = p.misSi || 0;
              const misNo = p.misNo || 0;
              const poolSi = p.poolSi || 0;
              const poolNo = p.poolNo || 0;

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

              return (
                <article key={p.id} className="rounded-2xl border border-borde bg-white p-5 shadow-sm">
                  
                  {/* Etiqueta izquierda y Título */}
                  <div className="flex items-start gap-3">
                    <span 
                      className={`shrink-0 font-mono text-[14px] font-bold tracking-widest uppercase mt-[2px] ${
                        p.resultado === true 
                          ? "text-verde" 
                          : "text-rojo"
                      }`}
                    >
                      {p.resultado === true ? "ENTRÓ" : "NO ENTRÓ"}
                    </span>
                    <h2 className="text-[16px] font-medium leading-snug text-ink">{p.titulo}</h2>
                  </div>

                  {/* Resumen de la apuesta */}
                  <div className="mt-5 flex items-center justify-between border-t border-linea pt-4 text-[13px]">
                    <span className="text-sutil">
                      Apostaste: <strong className="text-ink">{misSi > 0 ? "SÍ" : "NO"}</strong>
                    </span>
                    <span className={`font-mono font-semibold ${haGanado ? "text-verde" : "text-rojo"}`}>
                      {haGanado ? `+${beneficio} tokens` : `-${apuestaUsuario} tokens`}
                    </span>
                  </div>
                  
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}