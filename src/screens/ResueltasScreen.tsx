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
  const resueltasUsuario = preguntas.filter((p) => p.resultado !== null && (p.misSi > 0 || p.misNo > 0));

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
              const acertoSi = p.resultado === true && p.misSi > 0;
              const acertoNo = p.resultado === false && p.misNo > 0;
              const haGanado = acertoSi || acertoNo;
              const apuestaUsuario = p.misSi > 0 ? p.misSi : p.misNo;
              const poolGanador = p.resultado ? p.poolSi : p.poolNo;
              const poolPerdedor = p.resultado ? p.poolNo : p.poolSi;

              let tokensRecuperados = 0;
              if (haGanado && poolGanador > 0) {
                const proporcion = apuestaUsuario / poolGanador;
                tokensRecuperados = Math.round(apuestaUsuario + proporcion * poolPerdedor);
              }

              const beneficio = tokensRecuperados - apuestaUsuario;

              return (
                <article key={p.id} className="rounded-2xl border border-borde bg-white p-5">
                  <h2 className="text-[16px] font-medium leading-snug text-ink">{p.titulo}</h2>
                  <div className="mt-3 flex items-center justify-between text-[13px]">
                    <span className="text-sutil">
                      Resultado: <strong className="text-ink">{p.resultado ? "Entró (SÍ)" : "No entró (NO)"}</strong>
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