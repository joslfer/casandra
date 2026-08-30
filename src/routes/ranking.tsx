import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSesion } from "@/hooks/useSesion";
import { haceTexto, useMercado } from "@/hooks/useMercado";
import { PantallaLogin } from "@/components/PantallaLogin";
import { PantallaSeleccionClase } from "@/components/PantallaSeleccionClase";
import { LoaderApp } from "@/components/LoaderApp"; // <-- Importamos tu loader reutilizable
import logoCopyfly from "@/images/copyflylogo.png";
const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

function Moneda({ className = "" }: { className?: string }) {
  return <span className={`h-3.5 w-3.5 rounded-full bg-moneda ${className}`} />;
}

export const Route = createFileRoute('/ranking')({
  component: PaginaRanking,
})

function IconoReloj({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
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
        <span className="absolute h-5 w-5 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-ink/20"></span>
        <IconoReloj className="relative z-10 text-ink/50" />
      </span>
      {textoLimpio}
    </span>
  );
}

function PaginaRanking() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);

  const [rankingFijo, setRankingFijo] = useState<any[]>([]);
  const [actividadFija, setActividadFija] = useState<any[]>([]);

  const rankingActual = mercado.leerRanking();
  const actividadActual = mercado.leerApuestas(); 
  const miNombre = mercado.miNombre;

  // -----------------------------------------------------
  // BLOQUEO DEL SWIPE-TO-GO-BACK DE IOS
  // -----------------------------------------------------
  useEffect(() => {
    const bloquearSwipeIOS = (e: TouchEvent) => {
      // Si el toque empieza en los primeros 25 píxeles del borde izquierdo
      if (e.touches[0].clientX < 25) {
        e.preventDefault();
      }
    };
    
    // Necesitamos { passive: false } para que preventDefault() funcione
    document.addEventListener("touchstart", bloquearSwipeIOS, { passive: false });
    
    return () => {
      document.removeEventListener("touchstart", bloquearSwipeIOS);
    };
  }, []);

  useEffect(() => {
    if (rankingFijo.length === 0 && rankingActual.length > 0) {
      setRankingFijo(rankingActual);
    }
  }, [rankingActual, rankingFijo.length]);

  useEffect(() => {
    if (actividadFija.length === 0 && actividadActual.length > 0) {
      setActividadFija(actividadActual);
    }
  }, [actividadActual, actividadFija.length]);

  // Si está cargando, mostramos el Loader
  if (cargando) {
    return (
      <div className="min-h-screen bg-lienzo flex items-center justify-center">
        <LoaderApp />
      </div>
    );
  }

  if (!usuario) {
    return <PantallaLogin entrarConGoogle={entrarConGoogle} />;
  }

  // Si el perfil no ha cargado aún, mostramos el Loader
  if (!mercado.perfilCargado) {
    return (
      <div className="min-h-screen bg-lienzo flex items-center justify-center">
        <LoaderApp />
      </div>
    );
  }

  if (!mercado.perfil.claseId) {
    return <PantallaSeleccionClase clases={mercado.leerClases()} onElegir={mercado.elegirClase} />;
  }

  const listaCombinada = rankingFijo.map((r) => {
    const ultimaActividad = actividadFija.find(a => a.usuario === r.usuario);
    return {
      ...r,
      cuando: ultimaActividad ? haceTexto(ultimaActividad.cuando) : null
    };
  });

  return (
    <div className="min-h-screen bg-lienzo pb-28" style={fuenteApple}>
      <header 
        className="fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur" 
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-14 max-w-[520px] items-center px-5">
          <Link 
            to="/" 
            className="flex items-center text-[17px] font-medium tracking-tight text-ink transition-opacity hover:opacity-70 active:opacity-40 touch-manipulation"
          >
            ← Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-[calc(4.5rem+env(safe-area-inset-top))]">
        
        <div></div>

        <h1 className="text-[28px] font-bold tracking-tight text-ink">
          Gente que más acierta
        </h1>
    
        <p className="mt-1.5 text-[15px] leading-relaxed text-sutil"></p>

        <ul className="mt-6 text-[17px] text-ink">
          {listaCombinada.map((r: any, i: number) => {
            const esMiFila = r.usuario === miNombre;
            const esSiguienteMiFila = i < listaCombinada.length - 1 && listaCombinada[i + 1].usuario === miNombre;
            const mostrarBorde = !esMiFila && !esSiguienteMiFila && i !== listaCombinada.length - 1;

            return (
            <li 
              key={i} 
              className={`flex items-center justify-between gap-3 py-3.5 ${
                esMiFila ? "my-1 -mx-3 rounded-xl bg-black/[0.04] px-3" : ""
              } ${mostrarBorde ? "border-b border-linea" : ""}`}
            >
              
              <div className="flex min-w-0 items-center gap-4">
                <span className={`w-11 shrink-0 pr-1 font-mono text-[39px] font-bold leading-none tracking-tighter text-right ${
                  i === 0 ? "bg-gradient-to-b from-amber-400 to-amber-600 bg-clip-text text-transparent" :
                  i === 1 ? "bg-gradient-to-b from-amber-300 to-amber-500 bg-clip-text text-transparent" :
                  i === 2 ? "bg-gradient-to-b from-amber-200 to-amber-400 bg-clip-text text-transparent" :
                  "text-sutil/40"
                }`}>
                  {i + 1}
                </span>
                
                <div className="flex min-w-0 items-baseline gap-2.5">
                  <span className="truncate text-[17px] font-medium">
                    {r.usuario}
                  </span>
                  
                  {r.cuando && <Actividad texto={r.cuando} />}
                </div>
              </div>

              <span className="flex shrink-0 items-center gap-1.5 font-mono text-[17px] font-medium tabular-nums">
                {r.tokens} <Moneda className="h-4 w-4 align-[-2px]" />
              </span>

            </li>
          )})}
          
          {listaCombinada.length === 0 && (
            <p className="py-8 text-center text-[15px] text-sutil">Cargando...</p>
          )}
        </ul>

        {/* NUEVA SECCIÓN: RECOMPENSAS */}
        <div className="mt-14 border-t border-linea pt-10">
          <h2 className="text-[28px] font-bold tracking-tight text-ink">
            Recompensas
          </h2>
          {/* Aquí he puesto texto normal (17px) y color normal (text-ink) */}
          <p className="mt-3 text-[17px] leading-relaxed text-ink">
          </p>
        </div>

        {/* ---------------------------------------------------- */}
        {/* NUEVO ANUNCIO DE REFERIDOS */}
        {/* ---------------------------------------------------- */}
        <div className="mt-7 w-full">
          <div className="w-full rounded-lg border border-dashed border-ink/20 bg-gradient-to-br from-purple-500/[0.04] via-transparent to-purple-500/[0.04] px-4 pt-3 pb-1.5 text-center">
            <div className="text-[16px] leading-snug text-ink/80">
              Si usas <strong className="font-semibold text-purple-500">Copyfly</strong> para imprimir fotocopias el 5% del precio de tu pedido hace que los tokens suban de valor.<br />
              
              <span className="mt-1 block font-medium bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent">
                De momento 1 token = 0€
              </span>
              
              <a 
                href="https://copyfly.es?r=9hb34pUoy3eTpKz5YGFE" 
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-1 font-medium text-ink transition-colors active:opacity-70"
              >
              <img 
                src={logoCopyfly} 
                alt="Logo Copyfly" 
                className="h-13 w-auto object-contain opacity-90" 
              />
                <span className="underline decoration-sutil/50 underline-offset-4 group-hover:decoration-ink/80">
                  copyfly.es?r=9hb34pUoy3eTpKz5YGFE
                </span>
              </a>
            </div>
          </div>
        </div>
        {/* ---------------------------------------------------- */}
        {/* ---------------------------------------------------- */}
        <br></br>
        <div className="mt-8 px-2 text-[16px] leading-relaxed text-ink/90">
          <p>
            Las recompensas de esta app dependen totalmente de que la gente que participe use los partners. Sigue siendo toalmente gratis para todos los usuarios. Si tienes mejores ideas para financiar premios, adelante.
          </p>
        </div>
{/* ---------------------------------------------------- */}
        {/* DISCLAIMER LEGAL DISCRETO */}
        {/* ---------------------------------------------------- */}
        <div className="mt-12 mb-8 px-4 text-center text-[13px] leading-relaxed text-sutil/70">
        <p>
          Nota: Esta app es un proyecto estudiantil 100% gratuito. Los tokens son solo puntos 
          de juego (no dinero real ni activos financieros) y la equivalencia mostrada es una 
          estimación no vinculante. El bote promocional se repartirá cuando acumulemos el mínimo 
          de 20€ mediante los enlaces. Al no haber un sistema automático para sacar dinero, 
          el reparto definitivo se validará al final del juego y coordinaremos la entrega de los 
          premios personalmente con cada ganador.
        </p>
        </div>
        {/* ---------------------------------------------------- */}

      </main>
    </div>
  );
}