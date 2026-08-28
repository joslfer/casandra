import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useHaptic } from "@/hooks/useHaptic";
import { useSesion } from "@/hooks/useSesion";
import { Settings, ClipboardList, Lock } from "lucide-react"; // Quitamos Loader2
import { PantallaLogin } from "@/components/PantallaLogin";
import { PantallaSeleccionClase } from "@/components/PantallaSeleccionClase";
import { LoaderApp } from "@/components/LoaderApp"; 
import {
  probabilidad,
  useMercado,
  type Lado,
  type Pregunta,
} from "@/hooks/useMercado";

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
          // Gradiente de opacidad para dar el efecto de cola
          opacity={0.3 + (0.7 * i) / 11}
          transform={`rotate(${i * 30} 12 12)`}
        />
      ))}
    </svg>
  );
}

function Moneda({ className = "" }: { className?: string }) {
  return <span className={`h-3.5 w-3.5 rounded-full bg-moneda ${className}`} />;
}

const mono = "font-mono text-[11px] uppercase tracking-widest";
const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

// Convierte un timestamp (ms) al formato que espera <input type="datetime-local">
function aValorInputLocal(ts: number): string {
  const d = new Date(ts);
  const pad2 = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// Cuenta atrás días/horas/min/seg hasta `fechaExamen`
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

function EscalaPuntos({ si, no, misSi, misNo }: { si: number; no: number; misSi: number; misNo: number; }) {
  const safeSi = si || 0;
  const safeNo = no || 0;
  const safeMisSi = misSi || 0;
  const safeMisNo = misNo || 0;
  
  const total = safeSi + safeNo;

  if (total === 0) {
    return (
      <div className="mt-2.5 flex min-h-[16px] items-center">
        <p className="font-mono text-[11px] leading-none text-sutil">esperando apuestas</p>
      </div>
    );
  }

  const otrosNo = Math.max(0, safeNo - safeMisNo);
  const otrosSi = Math.max(0, safeSi - safeMisSi);

  return (
    <div className="mt-2.5 flex min-h-[16px] w-full items-center">
      <div className="flex w-full gap-4 items-start" aria-hidden="true">
        <div className="flex flex-1 flex-wrap content-start items-start justify-start gap-1">
          {Array.from({ length: otrosNo }).map((_, i) => (
            <span key={`no-o-${i}`} className="block h-2 w-2 shrink-0 rounded-full bg-rojo" />
          ))}
          {Array.from({ length: safeMisNo }).map((_, i) => (
            <span key={`no-m-${i}`} className="block h-2 w-2 shrink-0 rounded-full bg-moneda" />
          ))}
        </div>
        <div className="flex flex-1 flex-wrap flex-row-reverse content-start items-start gap-1">
          {Array.from({ length: otrosSi }).map((_, i) => (
            <span key={`si-o-${i}`} className="block h-2 w-2 shrink-0 rounded-full bg-verde" />
          ))}
          {Array.from({ length: safeMisSi }).map((_, i) => (
            <span key={`si-m-${i}`} className="block h-2 w-2 shrink-0 rounded-full bg-moneda" />
          ))}
        </div>
      </div>
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
}: {
  pregunta: Pregunta;
  onApostar: (lado: Lado) => void;
  onRetirar: () => void;
  bloqueado?: boolean;
  sinTokens?: boolean;
  ocultarBorde?: boolean;
}) {
  const prob = probabilidad(pregunta);
  const totalApuestas = (pregunta.poolSi || 0) + (pregunta.poolNo || 0);
  const tieneApuestas = totalApuestas > 0;
  const positivo = prob >= 50;
  const tengoApuesta = (pregunta.misSi || 0) + (pregunta.misNo || 0) > 0;

  const [cooldown, setCooldown] = useState(false);

  const handleApostar = (lado: Lado) => {
    if (cooldown || bloqueado) return;
    setCooldown(true);
    onApostar(lado);
    setTimeout(() => setCooldown(false), 400);
  };

  const visuallyBlocked = bloqueado && !cooldown;
  const btnBase = "flex flex-1 h-[42px] touch-manipulation items-center justify-center gap-2 rounded-lg border px-3 text-[14px] font-medium transition-all duration-150 ease-out";

  return (
    <article className={`py-6 w-full ${ocultarBorde ? "" : "border-b border-linea"}`}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="min-w-0 flex-1 break-words text-[19px] font-medium leading-snug text-ink">{pregunta.titulo}</h2>
        <span className={`shrink-0 font-mono text-[30px] leading-none tabular-nums ${!tieneApuestas ? "text-sutil" : positivo ? "text-verde" : "text-rojo"}`}>
          {tieneApuestas ? `${prob}%` : "--%"}
        </span>
      </div>

      <EscalaPuntos si={pregunta.poolSi} no={pregunta.poolNo} misSi={pregunta.misSi} misNo={pregunta.misNo} />

      <div className="mt-3 flex gap-2">
        <button
          data-apuesta
          onClick={() => handleApostar("no")}
          disabled={visuallyBlocked}
          style={fuenteApple}
          className={`${btnBase} ${visuallyBlocked ? "opacity-40" : "active:scale-[0.93]"} ${(pregunta.misNo || 0) > 0 ? "border-rojo bg-rojo text-white" : sinTokens ? "border-linea bg-black/5 text-sutil" : "border-borde bg-white text-ink hover:border-ink/30"}`}
        >
          <span>NO</span>
          {(pregunta.misNo || 0) > 0 && <span className="font-mono text-[16px] font-semibold tabular-nums">· {pregunta.misNo}</span>}
        </button>
        <button
          data-apuesta
          onClick={() => handleApostar("si")}
          disabled={visuallyBlocked}
          style={fuenteApple}
          className={`${btnBase} ${visuallyBlocked ? "opacity-40" : "active:scale-[0.93]"} ${(pregunta.misSi || 0) > 0 ? "border-verde bg-verde text-white" : sinTokens ? "border-linea bg-black/5 text-sutil" : "border-borde bg-white text-ink hover:border-ink/30"}`}
        >
          <span>SÍ</span>
          {(pregunta.misSi || 0) > 0 && <span className="font-mono text-[16px] font-semibold tabular-nums">· {pregunta.misSi}</span>}
        </button>
      </div>

      {tengoApuesta && (
        <button
          onClick={onRetirar}
          disabled={visuallyBlocked || cooldown}
          style={fuenteApple}
          className={`mt-2 flex h-[36px] w-full touch-manipulation items-center justify-center rounded-lg border border-borde bg-white text-[13px] font-medium text-sutil hover:border-ink/30 hover:text-ink transition-transform duration-150 active:bg-black/5 ${visuallyBlocked ? "opacity-40" : "active:scale-95"}`}
        >
          Retirar apuesta
        </button>
      )}
    </article>
  );
}

function Asignaturas({
  asignaturas,
  asigId,
  setAsigActiva,
  preguntas,
  saldo,
}: {
  asignaturas: Array<{ id: string; nombre: string; cerrada?: boolean; fechaExamen?: number | null }>;
  asigId: string;
  setAsigActiva: (id: string) => void;
  preguntas: Pregunta[];
  saldo: number;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2 pb-6 pt-2 px-5">
      {asignaturas.map((a) => {
        const sinApostar = preguntas.filter(
          (p) => p.asignaturaId === a.id && p.resultado === null && !p.archivada && (p.misSi || 0) + (p.misNo || 0) === 0
        ).length;

        return (
          <button
            key={a.id}
            onClick={() => setAsigActiva(a.id)}
            style={fuenteApple}
            className={`relative touch-manipulation whitespace-nowrap rounded-full border flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium transition-colors active:opacity-70 ${
              a.id === asigId ? "border-ink bg-ink text-white" : "border-borde bg-white text-ink hover:border-ink/30"
            }`}
          >
            <span>{a.nombre}</span>
            {a.cerrada && <Lock className="h-3 w-3 opacity-60" />}
            {sinApostar > 0 && saldo > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-lienzo">
                {sinApostar}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PantallaNuevaPregunta({
  asignaturas,
  asigInicial,
  onCerrar,
  onCrear,
}: {
  asignaturas: Array<{ id: string; nombre: string; cerrada?: boolean }>;
  asigInicial: string;
  onCerrar: () => void;
  onCrear: (titulo: string, asignaturaId: string) => Promise<any>;
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
          placeholder="¿Qué pregunta quieres proponer?"
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

function BotonRankingDinamico({ rankingFijo, miNombre }: { rankingFijo: any[]; miNombre: string }) {
  if (rankingFijo.length === 0) {
    return (
      <div className="mt-4 flex w-full justify-center px-4">
        <Link to="/ranking" className="text-[17px] text-ink/90 transition-colors hover:text-ink text-left">
          ver clasificación global →
        </Link>
      </div>
    );
  }

  // Buscamos el índice exacto del usuario en la lista ordenada del ranking (que ya incluye el desempate alfabético)
  const miIndice = rankingFijo.findIndex((r) => r.usuario === miNombre);

  if (miIndice === -1) {
    return (
      <div className="mt-4 flex w-full justify-center px-4">
        <Link to="/ranking" className="text-[17px] text-ink/90 transition-colors hover:text-ink text-left">
          ver clasificación global →
        </Link>
      </div>
    );
  }

  // La posición real en la lista es exactamente su índice + 1 (coincidiendo 100% con el ranking)
  const miPosicion = miIndice + 1;
  const yo = rankingFijo[miIndice];

  // Comprobamos si hay empate exacto de tokens con algún otro usuario de la lista
  const empatadosConmigo = rankingFijo.filter(r => r.tokens === yo.tokens && r.usuario !== miNombre);
  const esEmpate = empatadosConmigo.length > 0;
  const compañeroEmpate = empatadosConmigo[0];

  // Jugadores estrictamente por encima para calcular la diferencia de tokens
  const personasEncima = rankingFijo.filter(r => r.tokens > yo.tokens);
  const maxScoreEncima = personasEncima.length > 0 ? Math.max(...personasEncima.map(r => r.tokens)) : null;
  const grupoEncima = maxScoreEncima !== null ? personasEncima.filter(r => r.tokens === maxScoreEncima) : [];
  const elDeArriba = grupoEncima[0];
  
  const faltan = maxScoreEncima !== null ? (maxScoreEncima - yo.tokens) + 1 : 1;
  const todosCero = rankingFijo.every(r => r.tokens === 0);

  return (
    <div className="mt-5 flex w-full justify-center px-4">
      <Link to="/ranking" className="group relative inline-block max-w-[340px] text-left transition-colors">
        <div className="text-[17px] text-ink/90 leading-snug break-words group-hover:text-ink transition-colors">
          {todosCero ? (
            <>Nadie ha sumado tokens todavía</>
          ) : (
            <>
              Vas <strong className="font-semibold text-ink">#{miPosicion}</strong>
              {miPosicion === 1 && !esEmpate ? (
                <>. ¡Gracias por tu precisión!</>
              ) : miPosicion === 1 && esEmpate ? (
                <>, empatado en el primer puesto con <strong className="font-medium text-ink">{compañeroEmpate?.usuario}</strong></>
              ) : esEmpate ? (
                <>, empatado con <strong className="font-medium text-ink">{compañeroEmpate?.usuario}</strong></>
              ) : (
                <>, a <span className="inline-flex items-center gap-0.5 font-mono font-bold text-ink">{faltan} <Moneda className="h-[14px] w-[14px] -mt-0.5" /></span> de <strong className="font-medium text-ink">{elDeArriba?.usuario}</strong></>
              )}
            </>
          )}
          <br />
          <span className="underline decoration-sutil/50 underline-offset-4 group-hover:decoration-ink/80 transition-colors">
            mira la clasificación
          </span> <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </div>
      </Link>
    </div>
  );
}

function SaldoAnimado({ valor }: { valor: number }) {
  const [renderVal, setRenderVal] = useState(valor);
  const [isAnimating, setIsAnimating] = useState(false);
  const floatValRef = useRef(valor);
  const animRef = useRef<number | null>(null);

  const [maxLen, setMaxLen] = useState(() => Math.floor(Math.abs(valor)).toString().length + (valor < 0 ? 1 : 0));

  useEffect(() => {
    const curLen = Math.floor(Math.abs(valor)).toString().length + (valor < 0 ? 1 : 0);
    if (curLen > maxLen) {
      setMaxLen(curLen);
    }
  }, [valor, maxLen]);

  useEffect(() => {
    const startVal = floatValRef.current;
    const endVal = valor;
    if (startVal === endVal) return;

    setIsAnimating(true);
    const duration = 800;
    let startTime: number | null = null;

    const anim = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const ease = 1 - Math.pow(1 - progress, 3);
      const currentFloat = startVal + (endVal - startVal) * ease;
      
      floatValRef.current = currentFloat;
      setRenderVal(currentFloat);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(anim);
      } else {
        setRenderVal(endVal);
        floatValRef.current = endVal;
        setIsAnimating(false);
      }
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(anim);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [valor]);

  const base = Math.floor(renderVal);
  const frac = renderVal - base;
  const items = [base + 2, base + 1, base, base - 1];

  return (
    <span
      className="relative inline-flex flex-col items-end font-mono text-[64px] leading-none tracking-tight text-ink tabular-nums overflow-hidden"
      style={{
        minWidth: `${maxLen}ch`,
        height: "1em",
        boxSizing: "content-box",
        paddingTop: isAnimating ? "0.15em" : "0",
        paddingBottom: isAnimating ? "0.15em" : "0",
        marginTop: isAnimating ? "-0.15em" : "0",
        marginBottom: isAnimating ? "-0.15em" : "0",
        maskImage: isAnimating
          ? "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)"
          : "none",
        WebkitMaskImage: isAnimating
          ? "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)"
          : "none",
      }}
    >
      <span
        className="flex flex-col items-end w-full will-change-transform"
        style={{
          transform: `translateY(-${2 - frac}em)`,
        }}
      >
        {items.map((num) => (
          <span key={num} className="flex h-[1em] w-full items-center justify-end whitespace-nowrap">
            {num}
          </span>
        ))}
      </span>
    </span>
  );
}

// ============================================================================
// MARKET PAGE CON PULL TO REFRESH NATIVO - ESTILO SPINNER CIRCULAR
// ============================================================================
export function MarketPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const haptic = useHaptic();

  const [modalAbierto, setModalAbierto] = useState(false);

  const preguntas = mercado.leerPreguntas({ estado: "todas" }) || [];
  const asignaturas = mercado.leerAsignaturas() || [];

  const [rankingFijo, setRankingFijo] = useState<any[]>([]);

  const animRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  // --- SWIPE MANUAL CON EL DEDO: DESACTIVADO ---
  // Refs que usaban los handlers de swipe táctil entre asignaturas.
  // Se mantienen comentados por si se quiere reactivar el swipe en el futuro.
  // const touchStartX = useRef(0);
  // const touchStartY = useRef(0);
  // const touchStartTime = useRef(0);
  // const startAsigId = useRef<string>("");

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
    if (window.scrollY <= 10 && !isRefreshing) {
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

    if (diffY > 0 && window.scrollY <= 10) {
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
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } finally {
        window.scrollTo({ top: 0, behavior: 'instant' });
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  useEffect(() => {
    const rankingCalculado = mercado.leerRanking();
    if (rankingFijo.length === 0 && rankingCalculado.length > 0) {
      setRankingFijo(rankingCalculado);
    }
  }, [mercado.leerRanking, rankingFijo.length]);

  const asignaturasOrdenadas = [...asignaturas].sort((a, b) => {
    if (a.cerrada !== b.cerrada) return a.cerrada ? 1 : -1;
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
            .sort((p1, p2) => probabilidad(p2) - probabilidad(p1))
            .map((p) => p.id);
          huboCambios = true;
        }
      });
      return huboCambios ? nuevoOrden : prev;
    });
  }, [asignaturasOrdenadas, preguntas]);

  const [alturaContenedor, setAlturaContenedor] = useState<number | 'auto'>('auto');

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

  useEffect(() => {
    document.body.style.overscrollBehaviorY = 'none';
    document.documentElement.style.overscrollBehaviorY = 'none';
    return () => {
      document.body.style.overscrollBehaviorY = '';
      document.documentElement.style.overscrollBehaviorY = '';
    };
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

  // Verificamos si el usuario actual es moderador
  const esModerador = !!(mercado.perfil as any)?.mod || !!usuario.esAdmin;

  return (
    <div
      ref={mainContainerRef}
      onTouchStart={handleMainTouchStart}
      onTouchMove={handleMainTouchMove}
      onTouchEnd={handleMainTouchEnd}
      className="min-h-screen w-full overflow-x-hidden bg-lienzo select-none relative"
      style={{ ...fuenteApple, paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }}
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
      `}</style>

      {/* HEADER TOP-BAR */}
      <header className="relative z-30 bg-lienzo" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-14 w-full max-w-[520px] items-center justify-between px-5">
          <span style={fuenteApple} className="text-[15px] font-bold tracking-tight">Probabilidad fiable?</span>
          <div className="flex items-center gap-2">
            {usuario.esAdmin && <Link to={"/admin" as never} className={`${mono} mr-2`}>ADMN</Link>}
            {esModerador && <Link to={"/mod" as never} className={`${mono} mr-2 text-ink font-bold`}>MOD</Link>}
            <Link to="/resueltas" className="flex touch-manipulation items-center justify-center p-2 text-ink opacity-100">
              <ClipboardList className="h-[20px] w-[20px] shrink-0" strokeWidth={2} />
            </Link>
            <Link to="/profile" className="flex touch-manipulation items-center justify-center p-2 text-ink opacity-100">
              <Settings className="h-[20px] w-[20px] shrink-0" strokeWidth={2} />
            </Link>
          </div>
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
          {/* HEADER PRINCIPAL (SALDO) */}
          <div className="mx-auto w-full max-w-[520px]">
            {!mercado.pausado && (
              <div className="mt-8 mb-4 flex flex-col items-center justify-center w-full">
                <div className="relative z-10 flex w-full items-center justify-center">
                  <div className="flex flex-1 justify-end pr-1.5">
                    <SaldoAnimado valor={mercado.saldo || 0} />
                  </div>
                  <div className="flex flex-1 justify-start pl-1.5">
                    <button
                      style={{ width: "47px", height: "47px" }}
                      className="flex shrink-0 items-center justify-center rounded-full touch-manipulation transition-transform hover:scale-110 active:scale-90 focus:outline-none"
                    >
                      <Moneda className="!h-full !w-full" />
                    </button>
                  </div>
                </div>
                <BotonRankingDinamico rankingFijo={rankingFijo} miNombre={mercado.miNombre} />
              </div>
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
            style={{ height: alturaContenedor === 'auto' ? 'auto' : `${alturaContenedor}px` }}
            className="flex items-start w-full overflow-x-hidden overflow-y-hidden snap-x snap-mandatory overscroll-x-contain mx-auto max-w-[520px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-[height] duration-300 ease-out"
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
                      <div className="mb-12">
                        <button onClick={() => setModalAbierto(true)} style={fuenteApple} className="flex touch-manipulation items-center gap-2 rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-white shadow-sm transition-transform hover:opacity-90 active:scale-95">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14"></path>
                            <path d="M5 12h14"></path>
                          </svg>
                          Proponer pregunta
                        </button>
                      </div>

                      {/* ARTÍCULO INFERIOR CON ANCHO COMPLETO, HEADING Y SEPARACIÓN */}
                      <article className="w-full text-left mb-28">
                        <h2 className="mb-3 text-[24px] font-bold tracking-tight text-ink">No entiendes cómo funciona? Lee esto.</h2>
                        <div className="space-y-4 text-[16px] leading-relaxed text-ink">
                          <p>
                            Imagina que Fulanito cree que va a caer el ciclo del agua en el examen, porque hace mucho que no cae. Él está muy seguro porque estuvo atento en clase. Apuesta 1 token al SÍ. Sus compañeros Menganito y Zitanito creen que no va a entar, entonces apuestan 1 token cada uno al NO. 
                          </p>
                          <p>
                            La probabilidad de que caiga es del 33% porque esa es la fracción de los participantes creen que va a entrar (1/3). La opinión del grupo queda guardada en ese número.
                          </p>
                          <p>
                          Cuando llega el día del examen, Fulanito tiene razón. Como Fulanito acertó, se lleva los 2 tokens de sus amigos. Fulanito tiene ahora 3 tokens. ¡Es rico!
                          </p>
                          <p>
                          El mercado recompensa al que aporta información verdadera. Estas probabilidades más fiables que cualquier persona porque juntan información dispersa.
                          </p>
                          <p>
                            Puedes usarlo para consultar la opinión de tu clase. En un futuro sería muy divertido meter premios.
                          </p>
                        
                          
                        </div>
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
            
            if (id !== asigId) {
              scrollToAsig(id);
            }
            
            setTimeout(() => {
              const elementosTitulo = Array.from(document.querySelectorAll('h2'));
              const tituloNueva = elementosTitulo.find(el => el.textContent === t);
              
              if (tituloNueva) {
                tituloNueva.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                window.scrollTo({
                  top: document.documentElement.scrollHeight,
                  behavior: "smooth"
                });
              }
            }, 300);
          }}
        />
      )}

      {/* Hack de iOS */}
      <input type="checkbox" id="haptic-checkbox" ref={(el) => { if (el) el.setAttribute("switch", ""); }} style={{ position: "fixed", top: "0", left: "0", opacity: "0", pointerEvents: "none", width: "1px", height: "1px" }} tabIndex={-1} aria-hidden="true" />
      <label htmlFor="haptic-checkbox" id="haptic-label" style={{ position: "fixed", top: "0", left: "0", opacity: "0", pointerEvents: "none", width: "1px", height: "1px" }} aria-hidden="true"></label>
    </div>
  );
}