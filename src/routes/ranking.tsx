import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSesion } from "@/hooks/useSesion";
import { haceTexto, useMercado } from "@/hooks/useMercado";
import { PantallaLogin } from "@/components/PantallaLogin";

const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

function Moneda({ className = "" }: { className?: string }) {
  return <span className={`h-3.5 w-3.5 rounded-full bg-moneda ${className}`} />;
}

export const Route = createFileRoute('/ranking')({
  component: PaginaRanking,
})

function PaginaRanking() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);

  const [rankingFijo, setRankingFijo] = useState<any[]>([]);
  const [actividadFija, setActividadFija] = useState<any[]>([]);

  const rankingActual = mercado.leerRanking();
  const actividadActual = mercado.leerApuestas(); 
  const miNombre = mercado.miNombre;

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

  if (cargando) {
    return <div className="min-h-screen bg-lienzo" />;
  }

  if (!usuario) {
    return <PantallaLogin entrarConGoogle={entrarConGoogle} />;
  }

  // Combinamos ranking con la última actividad conocida del usuario
  const listaCombinada = rankingFijo.map((r) => {
    const ultimaActividad = actividadFija.find(a => a.usuario === r.usuario);
    return {
      ...r,
      cuando: ultimaActividad ? haceTexto(ultimaActividad.cuando) : null
    };
  });

  return (
    <div className="min-h-screen bg-lienzo pb-28" style={fuenteApple}>
      {/* Cabecera nativa */}
      <header 
        className="fixed inset-x-0 top-0 z-20 bg-lienzo/95 backdrop-blur border-b border-linea" 
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
        
        {/* ========================================= */}
        {/* ESPACIO RESERVAD TU HEADER          */}
        {/* ========================================= */}

        <div>
        
        </div>

          <h1 className="text-[28px] font-bold tracking-tight text-ink">
            Clasificaicón 
          </h1>
    
        <p className="mt-1.5 text-[15px] text-sutil leading-relaxed">
  
          </p>
        
        <ul className="text-[17px] text-ink">
          {listaCombinada.map((r: any, i: number) => {
            const esMiFila = r.usuario === miNombre;
            // Verificamos si la fila SIGUIENTE es la del usuario, para quitarle el borde a ESTA fila
            const esSiguienteMiFila = i < listaCombinada.length - 1 && listaCombinada[i + 1].usuario === miNombre;
            // Solo mostramos el borde si no es mi fila, no es la de justo encima, y no es la última
            const mostrarBorde = !esMiFila && !esSiguienteMiFila && i !== listaCombinada.length - 1;

            return (
            <li 
              key={i} 
              className={`flex items-center justify-between gap-3 py-3.5 ${
                esMiFila ? "bg-black/[0.04] -mx-3 px-3 rounded-xl my-1" : ""
              } ${mostrarBorde ? "border-b border-linea" : ""}`}
            >
              
              <div className="flex items-center gap-4 min-w-0">
                {/* 
                  Números tochos con degradado de amarillo a menos amarillo para los 3 primeros. 
                  El resto mantiene el gris sutil.
                */}
                <span className={`font-mono text-[39px] font-bold w-9 text-right shrink-0 tracking-tighter leading-none ${
                  i === 0 ? "text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-amber-600" :
                  i === 1 ? "text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-500" :
                  i === 2 ? "text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-400" :
                  "text-sutil/40"
                }`}>
                  {i + 1}
                </span>
                
                <div className="flex items-baseline gap-2.5 min-w-0">
                  <span className="truncate text-[17px] font-medium">
                    {r.usuario}
                  </span>
                  
                  {/* Aura mágica trasera recuperada (glow sin aspecto de botón) */}
                  {r.cuando && (
                    <span className="relative shrink-0 text-[14px] font-medium text-ink">
                      <span 
                        className="absolute left-1/2 top-1/2 -z-10 h-5 w-full -translate-x-1/2 -translate-y-1/2 scale-125 rounded-full bg-amber-400/50 blur-[6px]" 
                        aria-hidden="true" 
                      />
                      {r.cuando}
                    </span>
                  )}
                </div>
              </div>

              <span className="flex shrink-0 items-center gap-1.5 font-mono tabular-nums text-[17px] font-medium">
                {r.tokens} <Moneda className="h-4 w-4 align-[-2px]" />
              </span>

            </li>
          )})}
          
          {listaCombinada.length === 0 && (
            <p className="text-center text-[15px] text-sutil py-8">Cargando...</p>
          )}
        </ul>

      </main>
    </div>
  );
}