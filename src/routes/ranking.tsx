import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSesion } from "@/hooks/useSesion";
import { haceTexto, useMercado, calcularEstadisticas } from "@/hooks/useMercado";
import { PantallaLogin } from "@/components/PantallaLogin";
import { PantallaSeleccionClase } from "@/components/PantallaSeleccionClase";
import { LoaderApp } from "@/components/LoaderApp";
import logoCopyfly from "@/images/copyflylogo.png";

const fuenteApple = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const MOSTRAR_ADS = false;

function Moneda({ className = "" }: { className?: string }) {
  return (
    <span className={`h-3.5 w-3.5 rounded-full bg-moneda ${className}`} /> 
  ); 
}  

function IconoReloj({ className = "" }: { className?: string }) { 
  return ( 
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function Actividad({ texto }: { texto: string }) {
  const textoLimpio = texto.replace(/^hace\s+/i, "");
  return (
    <span className="flex shrink-0 items-center gap-1.5 text-[17px] font-medium text-sutil">
      <span className="relative flex items-center justify-center">
        <span className="absolute h-5 w-5 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-ink/20" />
        <IconoReloj className="relative z-10 text-ink/50" />
      </span>
      {textoLimpio}
    </span>
  );
}

export const Route = createFileRoute("/ranking")({
  component: PaginaRanking,
});

function PaginaRanking() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const [rankingFijo, setRankingFijo] = useState<any[]>([]);

  const rankingActual = mercado.leerRanking();
  
  // NOTA: Para que esto sea "entrar a la app" y no solo apostar, el backend y 
  // tu hook `useMercado` deben estar trackeando la última conexión. 
  const actividadActual = mercado.leerActividadUsuarios?.() || mercado.leerApuestas(); 
  const miNombre = mercado.miNombre;

  useEffect(() => {
    const bloquearSwipeIOS = (e: TouchEvent) => {
      if (e.touches[0].clientX < 25) e.preventDefault();
    };
    document.addEventListener("touchstart", bloquearSwipeIOS, { passive: false });
    return () => document.removeEventListener("touchstart", bloquearSwipeIOS);
  }, []);

  useEffect(() => {
    if (rankingFijo.length === 0 && rankingActual.length > 0) {
      setRankingFijo(rankingActual);
    }
  }, [rankingActual, rankingFijo.length]);

  if (cargando || !mercado.perfilCargado) {
    return (
      <div className="min-h-screen bg-lienzo flex items-center justify-center">
        <LoaderApp />
      </div>
    );
  }

  if (!usuario) return <PantallaLogin entrarConGoogle={entrarConGoogle} />;
  if (!mercado.perfil.claseId) return <PantallaSeleccionClase clases={mercado.leerClases()} onElegir={mercado.elegirClase} />;

  // Limite de 10 días en milisegundos
  const LIMITE_10_DIAS = 10 * 24 * 60 * 60 * 1000;
  const ahora = Date.now();

  const listaCombinada = rankingFijo.map((r) => {
    const ultimaActividad = actividadActual.find((a: any) => a.usuario === r.usuario);
    let textoActividad = null;

    if (ultimaActividad && ultimaActividad.cuando) {
      const tiempoTranscurrido = ahora - ultimaActividad.cuando;
      // Solo mostramos si la actividad fue hace menos de 10 días
      if (tiempoTranscurrido <= LIMITE_10_DIAS) {
        textoActividad = haceTexto(ultimaActividad.cuando);
      }
    }

    return {
      ...r,
      cuando: textoActividad,
    };
  });

  const stats = calcularEstadisticas(rankingActual);
  const wau = mercado.leerWAU();

  const bloqueEstadisticas = (
    <div className="mt-8">
      <table className="w-full text-[17px] text-ink">
        <tbody className="divide-y divide-linea">
          <tr>
            <td className="py-3 pr-3">Opiniones agregadas</td>
            <td className="py-3 text-right font-mono font-medium tabular-nums">{stats.opinionesAgregadas.toFixed(1)}</td>
          </tr>
          <tr>
            <td className="py-3 pr-3">Usuarios activos semanales (WAU)</td>
            <td className="py-3 text-right font-mono font-medium tabular-nums">{wau}</td>
          </tr>
          <tr>
            <td className="py-3 pr-3">Participantes que han apostado</td>
            <td className="py-3 text-right font-mono font-medium tabular-nums">{stats.participantes}/{stats.usuariosTotales}</td>
          </tr>
          <tr>
            <td className="py-3 pr-3">Tokens en uso</td>
            <td className="py-3 text-right font-mono font-medium tabular-nums">{stats.tokensApostados}</td>
          </tr>
          <tr>
            <td className="py-3 pr-3">Porcentaje de tokens en uso</td>
            <td className="py-3 text-right font-mono font-medium tabular-nums">{stats.pctSobreTotal}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-lienzo pb-28" style={fuenteApple}>
      <header className="fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-14 max-w-[520px] items-center px-5">
          <Link to="/" className="flex items-center text-[17px] font-medium tracking-tight text-ink transition-opacity hover:opacity-70 active:opacity-40 touch-manipulation">
            ← Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-[calc(4.5rem+env(safe-area-inset-top))]">
        <h1 className="text-[28px] font-bold tracking-tight text-ink">Gente que más acierta</h1>
        <p className="mt-1.5 text-[17px] leading-relaxed text-ink">Recuerda que también puedes obtener tokens proponiendo preguntas. La lista tiene la fracción de usados / disponibles.</p>

        <ul className="mt-6 text-[17px] text-ink">
          {listaCombinada.map((r: any, i: number) => {
            const esMiFila = r.usuario === miNombre;
            const esSiguienteMiFila = i < listaCombinada.length - 1 && listaCombinada[i + 1].usuario === miNombre;
            const mostrarBorde = !esMiFila && !esSiguienteMiFila && i !== listaCombinada.length - 1;

            return (
              <li key={i} className={`flex items-center justify-between gap-3 py-3.5 ${esMiFila ? "my-1 -mx-3 rounded-xl bg-black/[0.04] px-3" : ""} ${mostrarBorde ? "border-b border-linea" : ""}`}>
                <div className="flex min-w-0 items-center gap-4">
                  <span className={`w-11 shrink-0 pr-1 text-right font-mono text-[39px] font-bold leading-none tracking-tighter ${i === 0 ? "bg-gradient-to-b from-amber-400 to-amber-600 bg-clip-text text-transparent" : i === 1 ? "bg-gradient-to-b from-amber-300 to-amber-500 bg-clip-text text-transparent" : i === 2 ? "bg-gradient-to-b from-amber-200 to-amber-400 bg-clip-text text-transparent" : "text-sutil/40"}`}>
                    {i + 1}
                  </span>
                  <div className="flex min-w-0 items-baseline gap-2.5">
                    <span className="truncate text-[17px] font-medium">{r.usuario}</span>
                    {r.cuando && <Actividad texto={r.cuando} />}
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 font-mono text-[17px] font-medium tabular-nums">
                  {r.apostado > 0 && <span className="text-sutil/60">{r.apostado}/</span>}
                  {r.tokens}
                  <Moneda className="h-4 w-4 align-[-2px]" />
                </span>
              </li>
            );
          })}
          {listaCombinada.length === 0 && <p className="py-8 text-center text-[15px] text-sutil">Cargando...</p>}
        </ul>

        {MOSTRAR_ADS ? (
          <>
            <div className="mt-7 w-full">
              <div className="w-full rounded-lg border border-dashed border-ink/20 bg-gradient-to-br from-purple-500/[0.04] via-transparent to-purple-500/[0.04] px-4 pt-3 pb-1.5 text-center">
                <div className="text-[16px] leading-snug text-ink/80">
                  Si usas <strong className="font-semibold text-purple-500">Copyfly</strong> para imprimir fotocopias el 5% del precio de tu pedido hace que los tokens suban de valor.<br />
                  <span className="mt-1 block font-medium bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent">De momento 1 token = 0€</span>
                  <a href="https://copyfly.es?r=9hb34pUoy3eTpKz5YGFE" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-1 font-medium text-ink transition-colors active:opacity-70">
                    <img src={logoCopyfly} alt="Logo Copyfly" className="h-13 w-auto object-contain opacity-90" />
                    <span className="underline decoration-sutil/50 underline-offset-4 group-hover:decoration-ink/80">copyfly.es?r=9hb34pUoy3eTpKz5YGFE</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-8 px-2 text-[16px] leading-relaxed text-ink/90">
              <p>Las recompensas de esta app dependen totalmente de que la gente que participe use los partners. Sigue siendo totalmente gratis para todos los usuarios. Si tienes mejores ideas para financiar premios, adelante.</p>
            </div>
            {bloqueEstadisticas}
            <div className="mt-12 mb-8 px-4 text-center text-[13px] leading-relaxed text-sutil/70">
              <p>Nota: Esta app es un proyecto estudiantil 100% gratuito. Los tokens son solo puntos de juego (no dinero real ni activos financieros) y la equivalencia mostrada es una estimación no vinculante. El bote promocional se repartirá cuando acumulemos el mínimo de 20€ mediante los enlaces. Al no haber un sistema automático para sacar dinero, el reparto definitivo se validará al final del juego y coordinaremos la entrega de los premios personalmente con cada ganador.</p>
            </div>
          </>
        ) : (
          <>
            {bloqueEstadisticas}
            <div className="mt-7 px-2 text-[16px] leading-relaxed text-ink/90">
              <p>Casandra es una simple herramienta de simulación completamente gratis. Los tokens son ficticios y no tienen valor económico. No se ofrecen ni gestionan premios de dinero real. Cualquier acuerdo que los usuarios decidan organizar basándose en estas puntuaciones es ajeno a esta plataforma y recae bajo su propia responsabilidad.</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}