/**
 * CAPA DE DATOS CONECTADA A SUPABASE
 * ----------------------------------
 */
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useHaptic } from "@/hooks/useHaptic";
import { useSesion } from "@/hooks/useSesion";
import { Settings, ClipboardList, Lock, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PantallaLogin } from "@/components/PantallaLogin";
import { PantallaSeleccionClase } from "@/components/PantallaSeleccionClase";
import { LoaderApp } from "@/components/LoaderApp"; 

import {
  probabilidad,
  multiplicador,
  useMercado,
  RECOMPENSA_CREAR_PREGUNTA,
  calcularEstadisticas,
  haceTexto,
  type Lado,
  type Pregunta,
} from "@/hooks/useMercado";

// Activa/desactiva el aviso de recompensa en el botón de proponer pregunta.
const BOTON_INCENTIVADO = true;

// Respeta la preferencia del sistema "reducir movimiento" en las animaciones hechas con JS.
const reducirMovimiento = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// ============================================================================
// SPINNER ESTILO NATIVO IOS (12 barritas)
// ============================================================================
function IosSpinner({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x="11"
          y="2.5"
          width="2.2"
          height="5.5"
          rx="1.1"
          fill="currentColor"
          opacity={0.3 + (0.7 * i) / 11}
          transform={`rotate(${i * 30} 12 12)`}
        />
      ))}
    </svg>
  );
}

// ============================================================================
// COMPONENTES MINI RANKING
// ============================================================================
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

function MiniRanking({ rankingFijo, miNombre, actividadActual }: { rankingFijo: any[], miNombre: string, actividadActual: any[] }) {
  // Limite de 10 días en milisegundos
  const LIMITE_10_DIAS = 10 * 24 * 60 * 60 * 1000;
  const ahora = Date.now();
  const LIMITE_RANKING = 15; // Mostramos solo los 15 primeros para no saturar

  const listaCombinada = rankingFijo.slice(0, LIMITE_RANKING).map((r) => {
    const ultimaActividad = actividadActual.find((a: any) => a.usuario === r.usuario);
    let textoActividad = null;

    if (ultimaActividad && ultimaActividad.cuando) {
      const tiempoTranscurrido = ahora - ultimaActividad.cuando;
      if (tiempoTranscurrido <= LIMITE_10_DIAS) {
        textoActividad = haceTexto(ultimaActividad.cuando);
      }
    }

    return { ...r, cuando: textoActividad };
  });

  if (listaCombinada.length === 0) return null;

  return (
    <div className="mt-8 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 style={fuenteApple} className="text-[19px] font-bold text-ink">Clasificación</h3>
        <Link to="/ranking" style={fuenteApple} className="text-[15px] font-medium text-sutil hover:text-ink">
          Ver todos →
        </Link>
      </div>
      
      <ul style={fuenteApple} className="text-[17px] text-ink">
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
      </ul>
    </div>
  );
}


function Moneda({ className = "" }: { className?: string }) {
  return <span className={`h-3.5 w-3.5 rounded-full bg-moneda ${className}`} />;
}

// Icono estilo el de compartir de Apple/iOS (square.and.arrow.up):
function IconoCompartirApple({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

// Triangulito de toggle estilo Notion
function IconoTriangulo({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5l8 7-8 7V5z" />
    </svg>
  );
}

const mono = "font-mono text-[11px] uppercase tracking-widest";
const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

// Rebote (squash & stretch) para las pestañas de asignatura al pulsarlas.
function reboteTag(el: HTMLElement | null) {
  if (!el || reducirMovimiento()) return;
  el.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(0.88)", offset: 0.25 },
      { transform: "scale(1.08)", offset: 0.6 },
      { transform: "scale(0.98)", offset: 0.85 },
      { transform: "scale(1)" },
    ],
    { duration: 340, easing: "cubic-bezier(0.22, 0.9, 0.32, 1)" }
  );
}

function aValorInputLocal(ts: number): string {
  const d = new Date(ts);
  const pad2 = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function CountdownExamen({
  fechaExamen,
  asignaturaId,
  onEditar,
}: {
  fechaExamen: number;
  asignaturaId: string;
  onEditar: (asignaturaId: string, fecha: Date | null) => Promise<boolean>;
}) {
  const [restanteMs, setRestanteMs] = useState(() => fechaExamen - Date.now());
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [editando, setEditando] = useState(false);
  const [valorInput, setValorInput] = useState(() => aValorInputLocal(fechaExamen));
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setRestanteMs(fechaExamen - Date.now());
    const id = setInterval(() => {
      setRestanteMs(fechaExamen - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [fechaExamen]);

  useEffect(() => {
    setValorInput(aValorInputLocal(fechaExamen));
  }, [fechaExamen]);

  if (restanteMs <= 0) return null;

  const totalSeg = Math.floor(restanteMs / 1000);
  const dias = Math.floor(totalSeg / 86400);
  const horas = Math.floor((totalSeg % 86400) / 3600);
  const min = Math.floor((totalSeg % 3600) / 60);

  const fechaFormateada = new Date(fechaExamen).toLocaleString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const cerrarPopup = () => {
    setMostrarInfo(false);
    setEditando(false);
  };

  const guardarFecha = async () => {
    if (!valorInput) return;
    setGuardando(true);
    const ok = await onEditar(asignaturaId, new Date(valorInput));
    setGuardando(false);
    if (ok) {
      setEditando(false);
      setMostrarInfo(false);
    }
  };

  return (
    <article className="relative flex w-full flex-col items-center py-6">
      <div className="flex w-full items-baseline justify-center">
        <span className="flex items-baseline gap-1">
          <span className="inline-block min-w-[1.4ch] text-right font-mono text-[26px] font-medium leading-none tabular-nums text-ink">{dias}</span>
          <span className="text-[18px] font-normal leading-none text-sutil">días</span>
        </span>
        <span className="mx-2 font-mono text-[18px] font-medium leading-none text-ink">:</span>
        <span className="flex items-baseline gap-1">
          <span className="inline-block min-w-[2ch] text-right font-mono text-[26px] font-medium leading-none tabular-nums text-ink">{horas}</span>
          <span className="text-[18px] font-normal leading-none text-sutil">horas</span>
        </span>
        <span className="mx-2 font-mono text-[18px] font-medium leading-none text-ink">:</span>
        <span className="flex items-baseline gap-1">
          <span className="inline-block min-w-[2ch] text-right font-mono text-[26px] font-medium leading-none tabular-nums text-ink">{min}</span>
          <span className="text-[18px] font-normal leading-none text-sutil">min</span>
        </span>
      </div>

      <button
        onClick={() => setMostrarInfo(true)}
        className="mt-2.5 touch-manipulation text-center text-[12px] text-sutil underline decoration-sutil/40 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink/40 active:opacity-70"
      >
        fecha informativa, puedes corregirla si está mal
      </button>

      {mostrarInfo && createPortal(
        <div onClick={cerrarPopup} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm">
          <div
            onClick={(e) => e.stopPropagation()}
            style={fuenteApple}
            className="w-full max-w-[320px] rounded-lg border border-borde bg-white p-5 text-left text-ink"
          >
            {!editando ? (
              <>
                <p className="text-[17px] leading-relaxed text-sutil">Fecha programada</p>
                <p className="mt-1 text-[17px] leading-relaxed">{fechaFormateada}</p>
                <p className="mt-4 text-[17px] leading-relaxed text-sutil">Esta fecha es informativa y puede estar equivocada.</p>
                <div className="mt-5 flex gap-2">
                  <button onClick={cerrarPopup} className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2.5 text-[17px] font-medium text-ink active:bg-black/5">
                    Cancelar
                  </button>
                  <button onClick={() => setEditando(true)} className="flex-1 touch-manipulation rounded-lg bg-ink py-2.5 text-[17px] font-medium text-white active:opacity-70">
                    Corregir
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[17px] leading-relaxed text-sutil">Corregir fecha</p>
                <p className="mt-1 text-[17px] leading-relaxed text-sutil">Cualquiera puede corregir esta fecha si está mal.</p>
                <input
                  type="datetime-local"
                  value={valorInput}
                  onChange={(e) => setValorInput(e.target.value)}
                  disabled={guardando}
                  style={{ fontSize: "17px" }}
                  className="mt-4 w-full rounded-lg border border-borde bg-white px-3 py-2.5 text-left text-[17px] text-ink outline-none focus:border-ink/40 disabled:opacity-50 select-text"
                />
                <div className="mt-5 flex gap-2">
                  <button onClick={() => setEditando(false)} disabled={guardando} className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2.5 text-[17px] font-medium text-ink active:bg-black/5 disabled:opacity-50">
                    Cancelar
                  </button>
                  <button onClick={guardarFecha} disabled={guardando || !valorInput} className="flex-1 touch-manipulation rounded-lg bg-ink py-2.5 text-[17px] font-medium text-white active:opacity-70 disabled:opacity-50">
                    {guardando ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </article>
  );
}

// ============================================================================
// PUNTO DE APUESTA: entra con un pequeño "pop" cuando se crea después de la carga
// inicial y sale con un "pop" inverso escalonado (tu-tu-tu-tut) cuando se retira
// ============================================================================
const DURACION_SALIDA_PUNTO = 110;

function Punto({
  colorClase,
  animar,
  saliendo = false,
  retardoSalida = 0,
}: {
  colorClase: string;
  animar: boolean;
  saliendo?: boolean;
  retardoSalida?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const animSalidaRef = useRef<Animation | null>(null);

  // Entrada: solo al crearse, y nunca en la carga inicial
  useEffect(() => {
    if (!animar || reducirMovimiento()) return;
    ref.current?.animate(
      [
        { opacity: 0, transform: "scale(0)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 320, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salida escalonada. Si el punto vuelve a ser "vivo" antes de desaparecer, se cancela.
  useEffect(() => {
    if (saliendo) {
      const sinMov = reducirMovimiento();
      animSalidaRef.current =
        ref.current?.animate(
          [
            { opacity: 1, transform: "scale(1)" },
            { opacity: 0, transform: "scale(0)" },
          ],
          {
            duration: sinMov ? 1 : DURACION_SALIDA_PUNTO,
            delay: sinMov ? 0 : retardoSalida,
            easing: "ease-in",
            fill: "forwards",
          }
        ) ?? null;
    } else if (animSalidaRef.current) {
      animSalidaRef.current.cancel();
      animSalidaRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saliendo]);

  return <span ref={ref} className={`block h-2 w-2 shrink-0 rounded-full ${colorClase}`} />;
}

// Mantiene montados los puntos que sobran durante su animación de salida y los
// quita todos juntos cuando termina. Al subir el número, los puntos aparecen al instante.
function useConteoConSalida(objetivo: number) {
  const [mostrados, setMostrados] = useState(objetivo);
  const sobrantes = Math.max(0, mostrados - objetivo);
  // Con muchos puntos el "tu-tu-tu" se acelera para que la salida no dure más de ~0,5 s
  const paso = sobrantes > 0 ? Math.min(45, Math.floor(450 / sobrantes)) : 45;

  useEffect(() => {
    if (mostrados < objetivo) {
      setMostrados(objetivo);
      return;
    }
    if (mostrados === objetivo) return;
    const id = setTimeout(
      () => setMostrados(objetivo),
      (sobrantes - 1) * paso + DURACION_SALIDA_PUNTO + 30
    );
    return () => clearTimeout(id);
  }, [objetivo, mostrados, sobrantes, paso]);

  return { total: Math.max(mostrados, objetivo), paso };
}

function EscalaPuntos({ si, no, misSi, misNo }: { si: number; no: number; misSi: number; misNo: number; }) {
  const safeSi = si || 0;
  const safeNo = no || 0;
  const safeMisSi = misSi || 0;
  const safeMisNo = misNo || 0;

  const otrosNo = Math.max(0, safeNo - safeMisNo);
  const otrosSi = Math.max(0, safeSi - safeMisSi);

  const gNoOtros = useConteoConSalida(otrosNo);
  const gNoMios = useConteoConSalida(safeMisNo);
  const gSiOtros = useConteoConSalida(otrosSi);
  const gSiMios = useConteoConSalida(safeMisSi);

  // Hay puntos en pantalla si hay apuestas o si alguno todavía se está yendo
  const hayPuntos = gNoOtros.total + gNoMios.total + gSiOtros.total + gSiMios.total > 0;

  const interiorRef = useRef<HTMLDivElement>(null);
  const [alto, setAlto] = useState<number | null>(null);
  const [listo, setListo] = useState(false);
  // Los puntos creados antes de este momento no animan (carga inicial)
  const montadoRef = useRef(false);

  useEffect(() => {
    const el = interiorRef.current;
    if (!el) return;
    const medir = () => setAlto(Math.max(16, el.offsetHeight));
    medir();
    const raf = requestAnimationFrame(() => {
      montadoRef.current = true;
      setListo(true);
    });
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(medir);
      observer.observe(el);
    }
    return () => {
      cancelAnimationFrame(raf);
      if (observer) observer.disconnect();
    };
  }, []);

  const animar = montadoRef.current;

  return (
    <div
      className={`mt-2.5 w-full overflow-hidden ${listo ? "transition-[height] duration-300 ease-out" : ""}`}
      style={{ height: alto === null ? "auto" : `${alto}px` }}
    >
      <div ref={interiorRef} className="flex min-h-[16px] w-full items-center">
        {!hayPuntos ? (
          <p className="font-mono text-[11px] leading-none text-sutil">esperando apuestas</p>
        ) : (
          <div className="flex w-full gap-4 items-start" aria-hidden="true">
            <div className="flex flex-1 flex-wrap content-start items-start justify-start gap-1">
              {Array.from({ length: gNoOtros.total }).map((_, i) => (
                <Punto
                  key={`no-o-${i}`}
                  colorClase="bg-rojo"
                  animar={animar}
                  saliendo={i >= otrosNo}
                  retardoSalida={(gNoOtros.total - 1 - i) * gNoOtros.paso}
                />
              ))}
              {Array.from({ length: gNoMios.total }).map((_, i) => (
                <Punto
                  key={`no-m-${i}`}
                  colorClase="bg-moneda"
                  animar={animar}
                  saliendo={i >= safeMisNo}
                  retardoSalida={(gNoMios.total - 1 - i) * gNoMios.paso}
                />
              ))}
            </div>
            <div className="flex flex-1 flex-wrap flex-row-reverse content-start items-start gap-1">
              {Array.from({ length: gSiOtros.total }).map((_, i) => (
                <Punto
                  key={`si-o-${i}`}
                  colorClase="bg-verde"
                  animar={animar}
                  saliendo={i >= otrosSi}
                  retardoSalida={(gSiOtros.total - 1 - i) * gSiOtros.paso}
                />
              ))}
              {Array.from({ length: gSiMios.total }).map((_, i) => (
                <Punto
                  key={`si-m-${i}`}
                  colorClase="bg-moneda"
                  animar={animar}
                  saliendo={i >= safeMisSi}
                  retardoSalida={(gSiMios.total - 1 - i) * gSiMios.paso}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// NÚMERO SIMPLE CON PEQUEÑO FUNDIDO AL CAMBIAR
// ============================================================================




function NumeroRodante({ valor, className = "" }) {
  const valorRedondeado = Math.round(valor);

  const [numero, setNumero] = useState(valorRedondeado);
  const [maxLen, setMaxLen] = useState(
    String(valorRedondeado).length
  );

  const interiorRef = useRef<HTMLSpanElement>(null);
  const animacionRef = useRef<Animation | null>(null);
  const objetivoRef = useRef(valorRedondeado);

  useEffect(() => {
    const nuevoNumero = Math.round(valor);

    setMaxLen((prev) =>
      Math.max(prev, String(nuevoNumero).length)
    );

    if (nuevoNumero === objetivoRef.current) return;

    const el = interiorRef.current;

    if (!el) {
      objetivoRef.current = nuevoNumero;
      setNumero(nuevoNumero);
      return;
    }

    const transformActual = getComputedStyle(el).transform;

    animacionRef.current?.cancel();
    animacionRef.current = null;

    objetivoRef.current = nuevoNumero;
    setNumero(nuevoNumero);

    const animacion = el.animate(
      [
        {
          transform: transformActual === "none"
            ? "translateY(0) scale(1, 1)"
            : transformActual,
        },
        {
          transform: "translateY(-35%) scale(0.85, 1.25)",
          offset: 0.4,
        },
        {
          transform: "translateY(15%) scale(1.15, 0.85)",
          offset: 0.7,
        },
        {
          transform: "translateY(0) scale(1, 1)",
        },
      ],
      {
        duration: 250,
        easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }
    );

    animacionRef.current = animacion;

    animacion.onfinish = () => {
      if (animacionRef.current !== animacion) return;
      animacionRef.current = null;
    };
  }, [valor]);

  useEffect(() => {
    return () => {
      animacionRef.current?.cancel();
    };
  }, []);

  return (
    <span
      className={`relative inline-block font-mono tracking-tight tabular-nums whitespace-nowrap align-baseline ${className}`}
      style={{
        minWidth: `${maxLen}ch`,
        height: "1.2em",
        verticalAlign: "-0.15em",
      }}
    >
      <span className="invisible pointer-events-none select-none block">
        {numero}
      </span>

      {/* Clipping window with extra vertical space */}
      <span
        className="absolute inset-x-0 overflow-hidden pointer-events-none"
        style={{
          top: "-0.20em",
          bottom: "-0.20em",
        }}
      >
        <span
          ref={interiorRef}
          className="absolute inset-0 flex items-center justify-center will-change-transform"
        >
          {numero}
        </span>
      </span>
    </span>
  );
}





// ============================================================================
// CODIGO ANTIGUO COMENTADO: SALDO GIGANTE Y WIDGET DE RIVALIDAD (NO BORRAR)
// ============================================================================
/*
function SaldoAnimado({ valor }: { valor: number }) {
  return (
    <NumeroRodante 
      valor={valor} 
      className="text-[64px] text-ink -translate-y-[0px]" 
    />
  );
}

function BotonRankingDinamico({ rankingFijo, miNombre }: { rankingFijo: any[]; miNombre: string }) {
  if (rankingFijo.length === 0) return null;

  const miIndice = rankingFijo.findIndex((r) => r.usuario === miNombre);
  if (miIndice === -1) return null;

  const miPosicion = miIndice + 1;
  const yo = rankingFijo[miIndice];
  const todosCero = rankingFijo.every((r) => r.tokens === 0);

  // Buscar al que está justo encima
  const personasEncima = rankingFijo.filter((r) => r.tokens > yo.tokens);
  const maxScoreEncima = personasEncima.length > 0 ? Math.max(...personasEncima.map((r) => r.tokens)) : null;
  const elDeArriba = maxScoreEncima !== null ? personasEncima.find((r) => r.tokens === maxScoreEncima) : null;
  const faltan = elDeArriba ? elDeArriba.tokens - yo.tokens + 1 : 0;

  if (todosCero) {
    return (
      <div className="mt-3 flex w-full justify-center px-4">
        <Link to="/ranking" className="text-[14px] text-sutil hover:text-ink">Nadie ha sumado tokens todavía →</Link>
      </div>
    );
  }

  return (
    <div className="mt-4 flex w-full justify-center px-5">
      <Link 
        to="/ranking" 
        style={fuenteApple}
        className="group relative flex w-full max-w-[340px] items-center justify-between overflow-hidden rounded-xl border border-borde bg-white p-3 shadow-sm transition-all active:scale-[0.98] active:bg-black/5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-full bg-ink text-white">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 leading-none">Rank</span>
            <span className="font-mono text-[17px] font-bold leading-none mt-0.5">#{miPosicion}</span>
          </div>
          <div className="flex flex-col text-left">
            {miPosicion === 1 ? (
              <>
                <span className="text-[14px] font-bold text-ink">¡Vas en cabeza! 👑</span>
                <span className="text-[12px] font-medium text-sutil">Nadie tiene más tokens que tú</span>
              </>
            ) : (
              <>
                <span className="text-[14px] font-bold text-ink">Supera a {elDeArriba?.usuario}</span>
                <span className="text-[13px] font-medium text-sutil flex items-center gap-1">
                  Estás a {faltan} <Moneda className="!h-3 !w-3 -mt-0.5 opacity-60" /> de alcanzarle
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-sutil transition-transform group-hover:translate-x-1 pr-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </Link>
    </div>
  );
}
*/

// ============================================================================
// NUEVO COMPONENTE: FRASE SIMPLE DE PARTICIPACIÓN
// ============================================================================
function ParticipacionInfo({ rankingFijo }: { rankingFijo: any[] }) {
  if (!rankingFijo || rankingFijo.length === 0) return null;

  // Filtramos ESTRICTAMENTE a los que tienen tokens apostados ahora mismo
  // (es decir, apuestas activas, que vienen del 'apostadoAbierto' de Supabase),
  // y los ordenamos de más apostado a menos para destacar a los "peces gordos".
  const participantesActivos = [...rankingFijo]
    .filter(r => r.apostado > 0)
    .sort((a, b) => b.apostado - a.apostado);
  
  if (participantesActivos.length === 0) {
    return (
      <div className="mt-8 mb-4 flex w-full justify-center px-4">
         <span style={fuenteApple} className="text-[17px] text-ink/90 leading-snug">
            Nadie ha apostado todavía.
         </span>
      </div>
    );
  }

// Cogemos hasta 10 nombres para la frase
  const nombres = participantesActivos.slice(0, 10).map(r => r.usuario);
  const resto = participantesActivos.length - 10;
  let frase = "";
  
  if (participantesActivos.length === 1) {
    frase = `${nombres[0]} ya ha apostado en la clase.`;
  } else if (resto > 0) {
    // Si hay más de 10, ponemos los 10 con comas y el "y X más" al final
    frase = `${nombres.join(", ")}... y ${resto} más han apostado.`;
  } else {
    // Si son entre 2 y 10, los separamos por comas y ponemos "y" en el último
    const ultimo = nombres.pop();
    frase = `${nombres.join(", ")} y ${ultimo} ya han apostado en la clase.`;
  }

  return (
    <div className="mt-8 mb-4 flex w-full justify-center px-4">
      <span style={fuenteApple} className="text-[19px] text-ink/90 leading-snug text-center max-w-[340px] break-words">
        {frase}
      </span>
    </div>
  );
}

function FilaPregunta({
  pregunta,
  onApostar,
  onRetirar,
  bloqueado,
  sinTokens,
  ocultarBorde,
}) {
  const prob = probabilidad(pregunta);
  const totalApuestas = (pregunta.poolSi || 0) + (pregunta.poolNo || 0);
  const tieneApuestas = totalApuestas > 0;
  
  const mostrarProb = tieneApuestas; 
  const positivo = prob >= 50;
  const tengoApuesta = (pregunta.misSi || 0) + (pregunta.misNo || 0) > 0;

  const juice = (el: HTMLElement | null) => {
    if (!el || reducirMovimiento()) return;
    el.getAnimations().forEach(a => a.cancel());
    el.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.88)", offset: 0.3 },
        { transform: "scale(1.04)", offset: 0.7 },
        { transform: "scale(1)" },
      ],
      { duration: 200, easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" }
    );
  };

  const handleApostar = (lado: Lado, el: HTMLButtonElement | null) => {
    if (bloqueado) return;
    juice(el);
    onApostar(lado);

    // Efecto de partícula flotante que escapa del pulgar
    if (el && !reducirMovimiento() && !sinTokens) {
      const rect = el.getBoundingClientRect();
          const span = document.createElement("span");
          
          // Calculamos el nuevo total sumando 1 al valor actual
          const nuevoTotal = (lado === "si" ? (pregunta.misSi || 0) : (pregunta.misNo || 0)) + 1;
          span.textContent = String(nuevoTotal);
      // Usamos 'fixed' para que flote libre sobre toda la interfaz
      span.className = `fixed z-50 pointer-events-none font-mono text-[22px] font-bold drop-shadow-md ${lado === "si" ? "text-verde" : "text-rojo"}`;
      
      // Lo posicionamos en la parte superior central del botón, con una ligerísima variación aleatoria
      const randomX = (Math.random() - 0.5) * 15; 
      span.style.left = `${rect.left + rect.width / 2 + randomX}px`;
      span.style.top = `${rect.top - 5}px`;
      span.style.transform = "translate(-50%, -50%)";
      
      document.body.appendChild(span);

      // Animación: entra haciendo "pop", sube y se desvanece
      span.animate([
        { opacity: 0, transform: "translate(-50%, -50%) scale(0.5)" },
        { opacity: 1, transform: "translate(-50%, -80%) scale(1.1)", offset: 0.15 },
        { opacity: 0, transform: "translate(-50%, -250%) scale(0.9)" }
      ], {
        duration: 650,
        easing: "cubic-bezier(0.2, 1, 0.3, 1)"
      }).onfinish = () => span.remove();
    }
  };

  const visuallyBlocked = bloqueado;

  return (
    <article className={`py-6 w-full ${ocultarBorde ? "" : "border-b border-linea"}`}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="min-w-0 flex-1 break-words text-[19px] font-medium leading-snug text-ink">{pregunta.titulo}</h2>
        
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`flex h-[1.15em] shrink-0 items-center font-mono text-[30px] leading-none tabular-nums transition-colors duration-500 ${!tieneApuestas ? "text-sutil" : positivo ? "text-verde" : "text-rojo"}`}
          >
            {mostrarProb ? (
              <>
                <NumeroRodante valor={Math.round(prob)} />
                <span>%</span>
              </>
            ) : (
              "--%"
            )}
          </span>
          <span className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-sutil">
            {pregunta.mecanismo === "lmsr" ? "LMSR" : "PM"}
          </span>
        </div>
      </div>

      <EscalaPuntos si={pregunta.poolSi} no={pregunta.poolNo} misSi={pregunta.misSi} misNo={pregunta.misNo} />

      <div className="mt-3 flex gap-2">
        <button
          data-apuesta
          onClick={(e) => handleApostar("no", e.currentTarget)}
          disabled={visuallyBlocked}
          style={fuenteApple}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border py-1.5 touch-manipulation min-h-[46px] transition-[transform,background-color,border-color,color,opacity] duration-150 ease-out ${visuallyBlocked ? "opacity-40" : "active:scale-[0.93]"} ${(pregunta.misNo || 0) > 0 ? "border-rojo bg-rojo text-white" : sinTokens ? "border-linea bg-black/5 text-sutil" : "border-borde bg-white text-ink hover:border-ink/30"}`}
        >
          <div className="flex items-center gap-1 text-[14px] font-medium pointer-events-none">
            <span>NO</span>
            {(pregunta.misNo || 0) > 0 && <span className="font-mono text-[16px] font-semibold tabular-nums">· <NumeroRodante valor={pregunta.misNo} modo="salto" /></span>}
          </div>

        </button>
        <button
          data-apuesta
          onClick={(e) => handleApostar("si", e.currentTarget)}
          disabled={visuallyBlocked}
          style={fuenteApple}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border py-1.5 touch-manipulation min-h-[46px] transition-[transform,background-color,border-color,color,opacity] duration-150 ease-out ${visuallyBlocked ? "opacity-40" : "active:scale-[0.93]"} ${(pregunta.misSi || 0) > 0 ? "border-verde bg-verde text-white" : sinTokens ? "border-linea bg-black/5 text-sutil" : "border-borde bg-white text-ink hover:border-ink/30"}`}
        >
          <div className="flex items-center gap-1 text-[14px] font-medium pointer-events-none">
            <span>SÍ</span>
            {(pregunta.misSi || 0) > 0 && <span className="font-mono text-[16px] font-semibold tabular-nums">· <NumeroRodante valor={pregunta.misSi} modo="salto" /></span>}
          </div>

        </button>
      </div>

      {/* Botón de retirar: siempre montado y colapsado con grid-rows para que entre y salga con fluidez */}
      <div
        aria-hidden={!tengoApuesta}
        className={`grid ease-out ${tengoApuesta ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        style={{
          transitionProperty: "grid-template-rows, opacity",
          transitionDuration: tengoApuesta ? "260ms, 160ms" : "260ms, 120ms",
          transitionDelay: tengoApuesta ? "0ms, 180ms" : "100ms, 0ms",
        }}
      >
        <div className="overflow-hidden">
          <div className="pt-2">
            <button
              onClick={onRetirar}
              disabled={visuallyBlocked || !tengoApuesta}
              tabIndex={tengoApuesta ? 0 : -1}
              style={fuenteApple}
              className={`flex h-[36px] w-full touch-manipulation items-center justify-center rounded-lg border border-borde bg-white text-[13px] font-medium text-sutil hover:border-ink/30 hover:text-ink transition-transform duration-150 active:bg-black/5 ${visuallyBlocked ? "opacity-40" : "active:scale-95"}`}
            >
              Retirar predicción
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Asignaturas({
  asignaturas,
  asigId,
  setAsigActiva,
  preguntas,
  saldo,
}) {
  const [abierto, setAbierto] = useState(false);
  const activa = asignaturas.find((a) => a.id === asigId) || asignaturas[0];

  if (!activa) return null;

  return (
    <div className="relative flex w-full flex-col items-center justify-center px-5 pb-2 pt-6 z-30">      <button
        onClick={() => asignaturas.length > 1 && setAbierto(!abierto)}
        style={fuenteApple}
        className={`group flex touch-manipulation items-center justify-center gap-3 transition-transform max-w-full ${
          asignaturas.length > 1 ? "active:scale-[0.98]" : "cursor-default"
        }`}
      >
        {/* TÍTULO GIGANTE TIPO PORTADA CON DEGRADADO */}
        <div className="flex items-center justify-center gap-2 min-w-0 max-w-full">
          <h1 
            className={`bg-gradient-to-br from-ink via-ink/80 to-sutil/50 bg-clip-text text-transparent font-extrabold tracking-tighter leading-[1.05] pb-1 break-words text-center ${
              activa.nombre.length <= 12 
                ? "text-[clamp(46px,12vw,72px)]" 
                : activa.nombre.length <= 22 
                  ? "text-[clamp(34px,8vw,52px)]" 
                  : "text-[clamp(26px,6vw,38px)]"
            }`}
          >
            {activa.nombre}
          </h1>
          {activa.cerrada && <Lock className="h-7 w-7 text-sutil/40 shrink-0 -mt-1" />}
        </div>

        {/* TOGGLE A LA DERECHA */}
        {asignaturas.length > 1 && (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/5 text-ink transition-colors group-hover:bg-black/10 mt-1">
            <svg 
              className={`h-4 w-4 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`} 
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        )}
      </button>

      {/* MENÚ DESPLEGABLE ELEGANTE */}
      {abierto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)} />

          <div className="absolute top-[90px] z-50 flex max-h-[300px] w-[260px] flex-col overflow-y-auto rounded-2xl border border-borde bg-white/95 p-1.5 shadow-xl shadow-black/[0.08] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            {asignaturas.map((a) => {
              const esActiva = a.id === asigId;
              const sinApostar = preguntas.filter(
                (p) => p.asignaturaId === a.id && p.resultado === null && !p.archivada && (p.misSi || 0) + (p.misNo || 0) === 0
              ).length;

              return (
                <button
                  key={a.id}
                  onClick={() => {
                    setAsigActiva(a.id);
                    setAbierto(false);
                  }}
                  style={fuenteApple}
                  className={`flex w-full touch-manipulation items-center justify-between rounded-xl px-3 py-3 text-left transition-colors ${
                    esActiva ? "bg-black/5 font-semibold text-ink" : "font-medium text-sutil hover:bg-black/[0.03] hover:text-ink"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-[15px]">{a.nombre}</span>
                    {a.cerrada && <Lock className="h-3 w-3 shrink-0 opacity-50" />}
                  </div>

                  {sinApostar > 0 && saldo > 0 && (
                    <span className="ml-3 flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-ink px-1.5 text-[11px] font-bold text-white">
                      {sinApostar}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function PantallaNuevaPregunta({
  asignaturas,
  asigInicial,
  onCerrar,
  onCrear,
}) {
  const [titulo, setTitulo] = useState("");
  const [asigId, setAsigId] = useState(asigInicial);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    if (!titulo.trim()) { setError("Escribe un enunciado"); return; }
    try {
      setCargando(true);
      setError(null);
      await onCrear(titulo, asigId);
      onCerrar();
    } catch (err) {
      console.error("Error al crear pregunta:", err);
      setError("No se pudo publicar. Revisa tu conexión o permisos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-lienzo" style={{ height: "100dvh" }}>
      <header className="flex shrink-0 items-center justify-between border-b border-linea px-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)", paddingBottom: "0.75rem" }}>
        <button onClick={onCerrar} disabled={cargando} style={fuenteApple} className="touch-manipulation px-1 py-1 text-[17px] text-ink disabled:opacity-40">Cancelar</button>
        <span style={fuenteApple} className="text-[15px] font-semibold text-ink">Nueva pregunta</span>
        <button onClick={enviar} disabled={cargando || !titulo.trim()} style={fuenteApple} className="touch-manipulation px-1 py-1 text-[17px] font-semibold text-ink disabled:opacity-30">{cargando ? "..." : "Publicar"}</button>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-6" style={{ WebkitOverflowScrolling: "touch" }}>
        <h1 style={fuenteApple} className="text-[15px] font-semibold text-ink">Cuanto más específica mejor, frases largas.</h1>
        <textarea
          value={titulo}
          onChange={(e) => { setTitulo(e.target.value); if (error) setError(null); }}
          disabled={cargando}
          autoFocus
          rows={4}
          placeholder="¿Qué pregunta quieres proponer para todos?"
          style={{ fontSize: "16px" }}
          className="mt-3 w-full resize-none rounded-md border border-borde bg-white px-3 py-2.5 text-ink outline-none focus:border-ink/40 disabled:opacity-50 select-text"
        />
        <p style={fuenteApple} className="mt-5 text-[13px] font-medium text-sutil">Examen</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {asignaturas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAsigId(a.id)}
              style={fuenteApple}
              disabled={cargando}
              className={`touch-manipulation whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors active:opacity-70 ${a.id === asigId ? "border-ink bg-ink text-white" : "border-borde bg-white text-ink hover:border-ink/30"}`}
            >
              {a.nombre}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 text-[13px] text-rojo">{error}</p>}
      </div>
    </div>
  );
}

// ============================================================================
// TOGGLE ESTILO NOTION (triangulito) PARA LA EXPLICACIÓN
// ============================================================================
function ToggleInfo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="mt-4 w-full text-left">
      <button
        onClick={() => setAbierto((v) => !v)}
        style={fuenteApple}
        className="flex touch-manipulation items-center gap-1.5 text-[16px] leading-relaxed text-sutil transition-colors hover:text-ink active:opacity-60"
      >
        <IconoTriangulo
          className={`h-3 w-3 shrink-0 transition-transform duration-200 ${abierto ? "rotate-90" : ""}`}
        />
        {titulo}
      </button>

      {abierto && <div className="mt-3">{children}</div>}
    </div>
  );
}

// ============================================================================
// MARKET PAGE CON PULL TO REFRESH NATIVO Y STICKY HEADER
// ============================================================================
export function MarketPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const haptic = useHaptic();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [prediccionEstado, setPrediccionEstado] = useState<"idle" | "copiado" | "vacio">("idle");
  const [scrolled, setScrolled] = useState(false); // ESTADO PARA EL STICKY HEADER

  const preguntas = mercado.leerPreguntas({ estado: "todas" }) || [];
  const asignaturas = mercado.leerAsignaturas() || [];

  const rankingFijo = (mercado.leerRanking() || []).filter((r: any) => !r.pausado);
  // Snapshot de la frase de participación: se fija una vez y solo se renueva al recargar o crear pregunta
  const [rankingParticipacion, setRankingParticipacion] = useState<any[] | null>(null);

  const animRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  // ESTADOS PULL TO REFRESH
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  
  const pullStartY = useRef(0);
  const pullStartX = useRef(0);
  const isVerticalSwipe = useRef<boolean | null>(null);

  const REFRESH_THRESHOLD = 75;
  const SPINNER_OFFSET = 55;
  const SPRING_CONFIG = "0.4s cubic-bezier(0.3, 0.7, 0, 1)";

  const handleMainTouchStart = (e: React.TouchEvent) => {
    const scrollTop = mainContainerRef.current?.scrollTop ?? 0;
    if (scrollTop <= 10 && !isRefreshing) {
      pullStartY.current = e.touches[0].clientY;
      pullStartX.current = e.touches[0].clientX;
      isVerticalSwipe.current = null;
      setIsPulling(true);
    }
  };

  const handleMainTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = currentY - pullStartY.current;
    const diffX = currentX - pullStartX.current;

    if (isVerticalSwipe.current === null && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
      isVerticalSwipe.current = Math.abs(diffY) > Math.abs(diffX);
    }

    if (isVerticalSwipe.current === false) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    const scrollTop = mainContainerRef.current?.scrollTop ?? 0;

    if (diffY > 0 && scrollTop <= 10) {
      const distance = diffY * (1 - Math.min(diffY / 600, 0.75));
      setPullDistance(distance);
    } else if (diffY < 0) {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  const handleMainTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);

    if (pullDistance >= REFRESH_THRESHOLD && !isRefreshing) {
      haptic();
      setIsRefreshing(true);
      setPullDistance(SPINNER_OFFSET); 

      try {
        if (typeof mercado.recargar === 'function') {
          await mercado.recargar();
          setOrdenSnapshot({});
          setRankingParticipacion(null);
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } finally {
        mainContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  // CONTROL DEL HEADER STICKY AL HACER SCROLL
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrolled(scrollTop > 120);
  };

  // Fija el snapshot de la frase de participación la primera vez que hay datos
  useEffect(() => {
    if (rankingParticipacion === null && rankingFijo.length > 0) {
      setRankingParticipacion(rankingFijo);
    }
  }, [rankingParticipacion, rankingFijo]);

  const asignaturasOrdenadas = [...asignaturas].sort((a, b) => {
    if (a.fechaExamen == null && b.fechaExamen == null) return 0;
    if (a.fechaExamen == null) return 1;
    if (b.fechaExamen == null) return -1;
    return a.fechaExamen - b.fechaExamen;
  });

  const [asigActiva, setAsigActiva] = useState<string>("");
  const asigId = asigActiva || (asignaturasOrdenadas[0]?.id || "");

  const [ordenSnapshot, setOrdenSnapshot] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setOrdenSnapshot((prev) => {
      const nuevoOrden = { ...prev };
      let huboCambios = false;

      asignaturasOrdenadas.forEach((a) => {
        if (!nuevoOrden[a.id]) {
          nuevoOrden[a.id] = preguntas
            .filter((p) => p.asignaturaId === a.id && p.resultado === null && !p.archivada)
            .sort((p1, p2) => {
              const difProb = Math.round(probabilidad(p2)) - Math.round(probabilidad(p1));
              if (difProb !== 0) return difProb;
              const vol1 = (p1.poolSi || 0) + (p1.poolNo || 0);
              const vol2 = (p2.poolSi || 0) + (p2.poolNo || 0);
              return vol2 - vol1;
            })
            .map((p) => p.id);
          huboCambios = true;
        }
      });
      return huboCambios ? nuevoOrden : prev;
    });
  }, [asignaturasOrdenadas, preguntas]);

  const [alturaContenedor, setAlturaContenedor] = useState<number | 'auto'>('auto');
  // La altura del contenedor solo se anima al cambiar de asignatura; cuando cambia por los
  // puntos o el botón de retirar sigue a la altura real sin retraso (esos ya se animan por dentro)
  const [animarAltura, setAnimarAltura] = useState(false);
  const timerAlturaRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const activeSlide = container.querySelector(`[data-id="${asigId}"]`) as HTMLElement;
    if (!activeSlide) return;

    const updateHeight = () => {
      const height = activeSlide.getBoundingClientRect().height;
      if (height > 0) {
        setAlturaContenedor(height);
      }
    };

    updateHeight();

    let observer: ResizeObserver | null = null;
    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      observer = new ResizeObserver(updateHeight);
      observer.observe(activeSlide);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [asigId, ordenSnapshot]);

  useEffect(() => {
    const bloquearSwipeIOS = (e: TouchEvent) => {
      if (e.touches[0].clientX < 25) e.preventDefault();
    };
    document.addEventListener("touchstart", bloquearSwipeIOS, { passive: false });
    return () => document.removeEventListener("touchstart", bloquearSwipeIOS);
  }, []);

  const detenerAnimacion = () => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.scrollSnapType = ''; 
        scrollContainerRef.current.style.overflowX = ''; 
      }
      isProgrammaticScroll.current = false;
    }
  };

  const scrollToAsig = (id: string) => {
    haptic();
    setAsigActiva(id); 

    setAnimarAltura(true);
    if (timerAlturaRef.current) clearTimeout(timerAlturaRef.current);
    timerAlturaRef.current = setTimeout(() => setAnimarAltura(false), 400);

    const container = scrollContainerRef.current;
    if (!container) return;

    const slide = container.querySelector(`[data-id="${id}"]`);
    if (slide) {
      detenerAnimacion();
      isProgrammaticScroll.current = true;

      container.style.scrollSnapType = 'none';
      container.style.overflowX = 'hidden'; 

      const containerRect = container.getBoundingClientRect();
      const slideRect = slide.getBoundingClientRect();
      const startLeft = container.scrollLeft;
      const targetLeft = startLeft + (slideRect.left - containerRect.left);
      const distance = targetLeft - startLeft;

      let startTime: number | null = null;
      const duration = 60; 

      const animarScroll = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        const ease = 1 - Math.pow(1 - progress, 3);
        container.scrollLeft = startLeft + distance * ease;

        if (progress < 1) {
          animRef.current = requestAnimationFrame(animarScroll);
        } else {
          animRef.current = null;
          container.style.overflowX = ''; 
          container.style.scrollSnapType = ''; 
          setTimeout(() => { isProgrammaticScroll.current = false; }, 10);
        }
      };

      animRef.current = requestAnimationFrame(animarScroll);
    }
  };

  const compartirApp = async () => {
    haptic();
    const url = window.location.hostname === "localhost"
      ? "https://casndra.vercel.app"
      : window.location.origin;
    const datosCompartir = {
      title: "Casandra",
      text: "Prueba Casandra, consulta la opinión general sobre qué va a caer en el examen y participa.",
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(datosCompartir);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch (err) {}
  };

  const copiarPrediccion = async () => {
    haptic();

    const asig = asignaturas.find((a) => a.id === asigId);
    if (!asig) return;

    const idsOrden = ordenSnapshot[asigId] || [];
    const lista = idsOrden
      .map((id) => preguntas.find((p) => p.id === id))
      .filter(
        (p): p is Pregunta =>
          !!p && p.resultado === null && !p.archivada && (p.poolSi || 0) + (p.poolNo || 0) > 0
      );

    if (lista.length === 0) {
      setPrediccionEstado("vacio");
      setTimeout(() => setPrediccionEstado("idle"), 2000);
      return;
    }

    const construirTexto = async (): Promise<string> => {
      let cabecera = `*${asig.nombre.toUpperCase()}*`;
      if (asig.fechaExamen && asig.fechaExamen > Date.now()) {
        const totalMin = Math.floor((asig.fechaExamen - Date.now()) / 60000);
        const dias = Math.floor(totalMin / 1440);
        const horas = Math.floor((totalMin % 1440) / 60);
        const min = totalMin % 60;
        const partes: string[] = [];
        if (dias > 0) partes.push(`${dias} ${dias === 1 ? "día" : "días"}`);
        if (dias > 0 || horas > 0) partes.push(`${horas} h`);
        partes.push(`${min} min`);
        cabecera += ` · faltan ${partes.join(" ")}`;
      }

      const bloques = lista.map((p) => {
        const prob = probabilidad(p);
        const llenos = Math.max(0, Math.min(10, Math.round(prob / 10)));
        const barra = (prob >= 50 ? "🟩" : "🟥").repeat(llenos) + "⬜".repeat(10 - llenos);
        return `${barra} *${prob}%*\n${p.titulo}`;
      });

      let estadistica = "";
      const rankingActual = (mercado.leerRanking() || []).filter((r: any) => !r.pausado);
      const stats = calcularEstadisticas(rankingActual);

      if (stats.opinionesAgregadas > 0) {
        estadistica = `Opiniones agregadas overall: ${stats.opinionesAgregadas.toFixed(1)}`;
      }

      return [
        cabecera,
        "Probabilidad de que entre, según la clase",
        "",
        bloques.join("\n\n"),
        "",
        ...(estadistica ? [estadistica] : []),
        "Participar o proponer preguntas: https://casndra.vercel.app/"
      ].join("\n");
    };

    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": construirTexto().then((t) => new Blob([t], { type: "text/plain" })),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(await construirTexto());
      }
      setPrediccionEstado("copiado");
      setTimeout(() => setPrediccionEstado("idle"), 2000);
    } catch (err) {
      console.error("No se pudo copiar la predicción:", err);
    }
  };
  
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

  const asigActivaObj = asignaturas.find((a) => a.id === asigId);
  const asigCerrada = asigActivaObj?.cerrada === true;
  const hayAsignaturasAbiertas = asignaturas.some((a) => !a.cerrada);

  const intentarApostar = (id: string, lado: Lado) => {
    haptic(); 
    if ((mercado.saldo || 0) < 1) {
      document.body.animate([
        { transform: "translateX(0)" }, { transform: "translateX(-7px)" },
        { transform: "translateX(6px)" }, { transform: "translateX(-4px)" }, { transform: "translateX(0)" }
      ], { duration: 280, easing: "ease-in-out" });
      return;
    }
    mercado.apostar(id, lado); 
  };

  const retirarPregunta = (id: string) => {
    haptic(); 
    mercado.retirar(id);
  };

  const pullProgress = Math.min(pullDistance / (REFRESH_THRESHOLD * 0.7), 1);

  const esModerador = !!(mercado.perfil as any)?.mod || !!usuario.esAdmin;

  return (
    <div
      ref={mainContainerRef}
      onScroll={handleScroll}
      onTouchStart={handleMainTouchStart}
      onTouchMove={handleMainTouchMove}
      onTouchEnd={handleMainTouchEnd}
      className="h-[100dvh] w-full overflow-x-hidden overflow-y-auto overscroll-y-none bg-lienzo select-none relative"
      style={{ ...fuenteApple, WebkitOverflowScrolling: "touch", paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }}
      onClickCapture={(event) => {
        const target = event.target as Element;
        if (target.id === "haptic-checkbox" || target.id === "haptic-label") return;
        if (target.closest('input[type="text"], input:not([type]), textarea')) return;
        if (target.closest("a, input, select, button")) haptic();
      }}
    >
      <style>{`
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }

        html, body {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          overscroll-behavior: none;
        }
      `}</style>

      {/* HEADER TOP-BAR STICKY */}
      <header 
        className={`sticky top-0 z-40 bg-lienzo/100 backdrop-blur-md transition-shadow duration-200 ${scrolled ? "border-b border-borde/50 shadow-sm" : ""}`} 
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-14 w-full max-w-[520px] items-center justify-between px-5">
          {scrolled ? (
            <div key="header-scrolled" className="flex w-full items-center justify-center gap-1.5 animate-in fade-in duration-200">
              <span style={fuenteApple} className="text-[18px] font-medium text-ink">
                Te quedan
              </span>
              <NumeroRodante 
                valor={mercado.saldo || 0} 
                className="text-[18px] font-semibold text-ink" 
              />
              <span style={fuenteApple} className="text-[18px] font-medium text-ink">
              tokens
              </span>
              <Moneda className="!h-[18px] !w-[18px] shrink-0" />
              
            <Link to="/ranking" className="ml-1.5 pl-2.5 border-l border-borde flex items-center gap-1.5 touch-manipulation text-ink active:opacity-60">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80">
                              <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                            </svg>
                            <span className="font-mono text-[19px] font-bold">
                              #{rankingFijo.findIndex(r => r.usuario === mercado.miNombre) !== -1 ? rankingFijo.findIndex(r => r.usuario === mercado.miNombre) + 1 : "-"}
                            </span>
                          </Link>
            </div>
          ) : (
            <div key="header-top" className="flex w-full items-center justify-between animate-in fade-in duration-200">
              <span style={fuenteApple} className="text-[17px] font-bold tracking-tight">Probabilidad fiable?</span>
              <div className="flex items-center gap-2">
                {usuario.esAdmin && (
                  <Link to={"/admin" as never} style={fuenteApple} className="mr-1 flex touch-manipulation items-center rounded-md bg-ink px-2.5 py-1 text-[12px] font-semibold text-white transition-transform active:scale-95">
                    Admin
                  </Link>
                )}
                {esModerador && (
                  <Link to={"/mod" as never} style={fuenteApple} className="mr-1 flex touch-manipulation items-center rounded-md border border-borde bg-white px-2.5 py-1 text-[12px] font-semibold text-ink transition-transform active:scale-95 active:bg-black/5">
                    Mod
                  </Link>
                )}
                <Link to="/resueltas" className="flex touch-manipulation items-center justify-center p-2 text-ink opacity-100">
                  <ClipboardList className="h-[20px] w-[20px] shrink-0" strokeWidth={2} />
                </Link>
                <Link to="/profile" className="flex touch-manipulation items-center justify-center p-2 text-ink opacity-100">
                  <Settings className="h-[20px] w-[20px] shrink-0" strokeWidth={2} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ZONA AISLADA PARA EL PULL TO REFRESH */}
      <div className="relative w-full">
        
        {/* INDICADOR PULL TO REFRESH NATIVO IOS */}
        <div 
          className="absolute left-0 top-0 z-10 flex w-full justify-center pointer-events-none items-center"
          style={{
            height: `${pullDistance}px`,
            transition: isPulling ? 'none' : `height ${SPRING_CONFIG}`
          }}
        >
          <div
            className="flex items-center justify-center text-sutil"
            style={{
              width: "42px",
              height: "42px",
              opacity: pullProgress,
              transition: isPulling ? 'none' : `all ${SPRING_CONFIG}`
            }}
          >
            <IosSpinner 
              className="h-7 w-7" 
              style={!isRefreshing 
                ? { transform: `rotate(${pullDistance * 3}deg)` } 
                : { animation: "spin 1s steps(12, end) infinite" }
              }
            />
          </div>
        </div>

        {/* ENVOLTORIO PRINCIPAL QUE BAJA AL TIRAR */}
        <div 
          style={{
            transform: `translateY(${pullDistance}px)`,
            transition: isPulling ? 'none' : `transform ${SPRING_CONFIG}`
          }}
        >
          {/* HEADER PRINCIPAL (INFORMACIÓN DE PARTICIPANTES) */}
          <div className="mx-auto w-full max-w-[520px]">
            {!mercado.pausado && (
              <ParticipacionInfo rankingFijo={rankingParticipacion || []} />
            )}

            <Asignaturas 
              asignaturas={asignaturasOrdenadas}
              asigId={asigId} 
              setAsigActiva={scrollToAsig}
              preguntas={preguntas} 
              saldo={mercado.saldo || 0}
            />
          </div>

          {/* CONTENEDOR DESLIZABLE HORIZONTAL */}
          <div 
            ref={scrollContainerRef}
            onWheel={detenerAnimacion}
            style={{
              height: alturaContenedor === 'auto' ? 'auto' : `${alturaContenedor}px`,
              transition: animarAltura ? "height 300ms ease-out" : "none",
            }}
            className="flex items-start w-full overflow-x-hidden overflow-y-hidden snap-x snap-mandatory overscroll-x-contain mx-auto max-w-[520px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {asignaturasOrdenadas.map((asig) => {
              const idsOrden = ordenSnapshot[asig.id] || [];
              const preguntasAsignatura = idsOrden
                .map((id) => preguntas.find((p) => p.id === id))
                .filter((p): p is Pregunta => !!p && p.asignaturaId === asig.id && p.resultado === null && !p.archivada);

              return (
                <div key={asig.id} data-id={asig.id} className="snap-slide w-full shrink-0 snap-start px-5 flex flex-col">
                  {asig.fechaExamen && (
                    <CountdownExamen fechaExamen={asig.fechaExamen} asignaturaId={asig.id} onEditar={mercado.editarFechaExamenPublica} />
                  )}

                  {preguntasAsignatura.length === 0 ? (
                    <p className="text-center text-sutil text-[14px] mt-10 mb-4">No hay preguntas abiertas.</p>
                  ) : (
                    preguntasAsignatura.map((p, index) => (
                      <FilaPregunta
                        key={p.id}
                        pregunta={p}
                        bloqueado={mercado.pausado || asig.cerrada} 
                        sinTokens={(mercado.saldo || 0) < 1}
                        ocultarBorde={index === preguntasAsignatura.length - 1}
                        onApostar={(lado) => intentarApostar(p.id, lado)}
                        onRetirar={() => retirarPregunta(p.id)}
                      />
                    ))
                  )}

                  {!asig.cerrada && hayAsignaturasAbiertas && (
                    <div className="mt-4 flex flex-col items-center justify-center w-full">
                      <div className="mb-12 flex flex-col items-center gap-2">
                        <button
                          onClick={() => setModalAbierto(true)}
                          style={fuenteApple}
                          className="flex flex-col touch-manipulation items-center gap-0.5 rounded-2xl bg-ink px-6 py-3 text-white shadow-sm transition-transform hover:opacity-90 active:scale-95"
                        >
                          <span className="flex items-center gap-2 text-[17px] font-medium">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 5v14"></path>
                              <path d="M5 12h14"></path>
                            </svg>
                            Proponer pregunta
                          </span>
                          {BOTON_INCENTIVADO && RECOMPENSA_CREAR_PREGUNTA > 0 && (
                            <span className="text-[15px] font-medium text-white/80">
                              Estipendio de {RECOMPENSA_CREAR_PREGUNTA} token por colaborar
                            </span>
                          )}
                        </button>
                      </div>

                      <article className="w-full text-left mb-28">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                          <button
                            onClick={compartirApp}
                            style={fuenteApple}
                            className="flex touch-manipulation items-center gap-1.5 text-[16px] leading-relaxed text-sutil transition-colors hover:text-ink active:opacity-60"
                          >
                            <IconoCompartirApple className="h-4 w-4" />
                            {copiado ? "enlace copiado" : "compartir la app"}
                          </button>
                          <button
                            onClick={copiarPrediccion}
                            style={fuenteApple}
                            className="flex touch-manipulation items-center gap-1.5 text-[16px] leading-relaxed text-sutil transition-colors hover:text-ink active:opacity-60"
                          >
                            <Copy className="h-4 w-4" />
                            {prediccionEstado === "copiado"
                              ? "predicción copiada"
                              : prediccionEstado === "vacio"
                                ? "aún no hay predicciones"
                                : "copiar predicción"}
                          </button>
                        </div>

                        <ToggleInfo titulo="¿No entiendes cómo funciona? Lee esto.">
                          <div className="space-y-4 text-[16px] leading-relaxed text-ink">
                            <p>
                              Próximamente habrá aquí un artículo explicativo. 
                            </p>
                          </div>
                        </ToggleInfo>
                        
                        <MiniRanking 
                          rankingFijo={rankingFijo} 
                          miNombre={mercado.miNombre} 
                          actividadActual={mercado.leerActividadUsuarios?.() || mercado.leerApuestas()} 
                        />
                      </article>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {modalAbierto && (
        <PantallaNuevaPregunta
          asignaturas={asignaturas.filter(a => !a.cerrada)}
          asigInicial={asigCerrada ? "" : asigId}
          onCerrar={() => setModalAbierto(false)}
          onCrear={async (t, id) => { 
            await mercado.crearPregunta(t, id);
            
            if (typeof mercado.recargar === 'function') {
              await mercado.recargar();
            }

            setOrdenSnapshot({});
            setRankingParticipacion(null);
          }}
        />
      )}

      <input type="checkbox" id="haptic-checkbox" ref={(el) => { if (el) el.setAttribute("switch", ""); }} style={{ position: "fixed", top: "0", left: "0", opacity: "0", pointerEvents: "none", width: "1px", height: "1px" }} tabIndex={-1} aria-hidden="true" />
      <label htmlFor="haptic-checkbox" id="haptic-label" style={{ position: "fixed", top: "0", left: "0", opacity: "0", pointerEvents: "none", width: "1px", height: "1px" }} aria-hidden="true"></label>
    </div>
  );
}