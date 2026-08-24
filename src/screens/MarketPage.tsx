import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useHaptic } from "@/hooks/useHaptic";
import { useSesion } from "@/hooks/useSesion";
import { Settings, ClipboardList, Lock } from "lucide-react";
import { PantallaLogin } from "@/components/PantallaLogin";
import {
  probabilidad,
  useMercado,
  type Lado,
  type Pregunta,
} from "@/hooks/useMercado";

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

      {mostrarInfo && (
        <div onClick={cerrarPopup} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm">
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
        </div>
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
    setTimeout(() => setCooldown(false), 300);
  };

  const btnBase = "flex flex-1 h-[42px] touch-manipulation items-center justify-center gap-2 rounded-lg border px-3 text-[14px] font-medium transition-transform duration-150 active:scale-95";

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
          disabled={bloqueado || cooldown}
          style={fuenteApple}
          className={`${btnBase} ${bloqueado ? "opacity-40" : ""} ${(pregunta.misNo || 0) > 0 ? "border-rojo bg-rojo text-white" : sinTokens ? "border-linea bg-black/5 text-sutil" : "border-borde bg-white text-ink hover:border-ink/30"}`}
        >
          <span>NO</span>
          {(pregunta.misNo || 0) > 0 && <span className="font-mono text-[14px] font-semibold tabular-nums">· {pregunta.misNo}</span>}
        </button>
        <button
          data-apuesta
          onClick={() => handleApostar("si")}
          disabled={bloqueado || cooldown}
          style={fuenteApple}
          className={`${btnBase} ${bloqueado ? "opacity-40" : ""} ${(pregunta.misSi || 0) > 0 ? "border-verde bg-verde text-white" : sinTokens ? "border-linea bg-black/5 text-sutil" : "border-borde bg-white text-ink hover:border-ink/30"}`}
        >
          <span>SÍ</span>
          {(pregunta.misSi || 0) > 0 && <span className="font-mono text-[14px] font-semibold tabular-nums">· {pregunta.misSi}</span>}
        </button>
      </div>

      {tengoApuesta && (
        <button
          onClick={onRetirar}
          disabled={bloqueado || cooldown}
          style={fuenteApple}
          className={`mt-2 flex h-[36px] w-full touch-manipulation items-center justify-center rounded-lg border border-borde bg-white text-[13px] font-medium text-sutil hover:border-ink/30 hover:text-ink transition-transform duration-150 active:scale-95 active:bg-black/5 ${bloqueado ? "opacity-40" : ""}`}
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
        <p style={fuenteApple} className="mt-5 text-[13px] font-medium text-sutil">Asignatura</p>
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
  const CLASE_TEXTO = "text-[clamp(12px,4.5vw,15px)]";
  const miIndice = rankingFijo.findIndex((r) => r.usuario === miNombre);

  if (rankingFijo.length === 0 || miIndice === -1) {
    return (
      <div className="mt-4 flex w-full justify-center px-4">
        <Link to="/ranking" className={`${CLASE_TEXTO} font-medium text-sutil transition-colors hover:text-ink truncate`}>
          Ver Clasificación Global →
        </Link>
      </div>
    );
  }

  const yo = rankingFijo[miIndice];
  const elDeArriba = rankingFijo[miIndice - 1];
  const miPosicion = miIndice + 1;

  if (miIndice === 0) {
    return (
      <div className="mt-4 flex w-full justify-center px-4">
        <Link to="/ranking" className={`group relative flex max-w-full items-center ${CLASE_TEXTO} text-ink/90 transition-colors hover:text-ink`}>
          <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-amber-400/30 blur-xl" aria-hidden="true" />
          <span className="block truncate">Vas <strong className="font-semibold text-ink">#1</strong>. ¡Mantén la distancia!</span>
          <span className="ml-1.5 shrink-0 opacity-50 transition-transform group-hover:translate-x-1 group-hover:opacity-100">→</span>
        </Link>
      </div>
    );
  }

  const diferencia = elDeArriba.tokens - yo.tokens;
  const faltan = diferencia >= 0 ? diferencia + 1 : 1; 
  const TAMANO_LETRA = "text-[16px]";

  return (
    <div className="mt-4 flex w-full justify-center px-4">
      <Link to="/ranking" className={`group relative flex max-w-full items-center ${TAMANO_LETRA} text-ink/90 transition-colors hover:text-ink`}>
        <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-amber-400/30 blur-xl" aria-hidden="true" />
        <div className="flex min-w-0 shrink items-center overflow-hidden whitespace-nowrap gap-1.5">
          <span className="shrink-0">Vas <strong className="font-semibold text-ink">#{miPosicion}</strong>, te faltan</span>
          <span className="shrink-0 inline-flex items-center gap-0.5 font-mono font-bold text-ink">{faltan} <Moneda className="h-3.5 w-3.5" /></span>
          <span className="shrink-0">hasta</span>
          <strong className="truncate font-medium text-ink">{elDeArriba?.usuario}</strong>
        </div>
        <span className="ml-1.5 shrink-0 opacity-50 transition-transform group-hover:translate-x-1 group-hover:opacity-100">→</span>
      </Link>
    </div>
  );
}

export function MarketPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const haptic = useHaptic();

  const [modalAbierto, setModalAbierto] = useState(false);

  const preguntas = mercado.leerPreguntas({ estado: "todas" }) || [];
  const asignaturas = mercado.leerAsignaturas() || [];
  
  const [rankingFijo, setRankingFijo] = useState<any[]>([]);

  useEffect(() => {
    const rankingCalculado = mercado.leerRanking();
    if (rankingFijo.length === 0 && rankingCalculado.length > 0) {
      setRankingFijo(rankingCalculado);
    }
  }, [mercado.leerRanking, rankingFijo.length]);

  // ORDENAMOS ASIGNATURAS
  const asignaturasOrdenadas = [...asignaturas].sort((a, b) => {
    if (a.cerrada !== b.cerrada) return a.cerrada ? 1 : -1;
    if (a.fechaExamen == null && b.fechaExamen == null) return 0;
    if (a.fechaExamen == null) return 1;
    if (b.fechaExamen == null) return -1;
    return a.fechaExamen - b.fechaExamen;
  });

  const [asigActiva, setAsigActiva] = useState<string>("");
  const asigId = asigActiva || (asignaturasOrdenadas[0]?.id || "");

  // REFERENCIA PARA EL SCROLL HORIZONTAL Y EL OBSERVER
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Si no hay asignaturas, no hacemos nada
    if (asignaturasOrdenadas.length === 0 || !scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Buscamos cuál es el feed (asignatura) que más se ve en pantalla
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            if (id && id !== asigActiva) {
              setAsigActiva(id);
            }
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.5, // Tiene que estar al 50% en pantalla para considerarse "activa"
      }
    );

    const slides = scrollContainerRef.current.querySelectorAll(".snap-slide");
    slides.forEach((slide) => observer.observe(slide));

    return () => observer.disconnect();
  }, [asignaturasOrdenadas.length, asigActiva]);

  // FUNCIÓN PARA CUANDO HACES CLIC EN LA PÍLDORA (Hace scroll automático a ese feed)
  const scrollToAsig = (id: string) => {
    haptic();
    setAsigActiva(id);
    const slide = scrollContainerRef.current?.querySelector(`[data-id="${id}"]`);
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  if (cargando) {
    return <div className="min-h-screen bg-lienzo" />;
  }

  if (!usuario) {
    return <PantallaLogin entrarConGoogle={entrarConGoogle} />;
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

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden bg-lienzo pb-28 select-none"
      style={fuenteApple}
      onClickCapture={(event) => {
        const target = event.target as Element;
        if (target.id === "haptic-checkbox" || target.id === "haptic-label") return;
        if (target.closest('input[type="text"], input:not([type]), textarea')) return;
        if (target.closest("a, input, select, button")) haptic();
      }}
    >
      <header style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-14 w-full max-w-[520px] items-center justify-between px-5">
          <span style={fuenteApple} className="text-[15px] font-bold tracking-tight">Probabilidad fiable?</span>
          
          <div className="flex items-center gap-2">
            {usuario.esAdmin && <Link to={"/admin" as never} className={`${mono} mr-2`}>ADMN</Link>}
            <Link to="/resueltas" className="flex touch-manipulation items-center justify-center p-2 text-ink opacity-100" aria-label="Apuestas resueltas">
              <ClipboardList className="h-[20px] w-[20px] shrink-0" strokeWidth={2} />
            </Link>
            <Link to="/profile" className="flex touch-manipulation items-center justify-center p-2 text-ink opacity-100" aria-label="Perfil">
              <Settings className="h-[20px] w-[20px] shrink-0" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </header>

      {/* HEADER PRINCIPAL (SALDO + TABS) FUERA DEL SCROLL HORIZONTAL */}
      <div className="mx-auto w-full max-w-[520px]">
        {!mercado.pausado && (
          <div className="mt-10 mb-4 flex flex-col items-center justify-center">
            <div className="relative z-10 flex items-center gap-3">
              <button
                style={{ width: "42px", height: "42px" }}
                className="flex shrink-0 items-center justify-center rounded-full touch-manipulation transition-transform hover:scale-110 active:scale-90 focus:outline-none"
              >
                <Moneda className="!h-full !w-full" />
              </button>
              <span className="font-mono text-[64px] leading-none tracking-tight tabular-nums text-ink">
                {mercado.saldo || 0}
              </span>
            </div>
            <BotonRankingDinamico rankingFijo={rankingFijo} miNombre={mercado.miNombre} />
          </div>
        )}
        
        <Asignaturas 
          asignaturas={asignaturasOrdenadas}
          asigId={asigId} 
          setAsigActiva={scrollToAsig} // Aquí pasamos nuestra nueva función con auto-scroll
          preguntas={preguntas} 
          saldo={mercado.saldo || 0}
        />
      </div>

{/* CONTENEDOR DESLIZABLE HORIZONTAL */}
<div 
  ref={scrollContainerRef}
  className="flex w-full overflow-x-auto snap-x snap-mandatory overscroll-x-contain mx-auto max-w-[520px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
>
  {asignaturasOrdenadas.map((asig) => {
    // Filtramos las preguntas ABIERTAS de esta asignatura específica
    const preguntasAsignatura = preguntas.filter(
      (p) => p.asignaturaId === asig.id && p.resultado === null && !p.archivada
    );

    return (
      <div 
        key={asig.id} 
        data-id={asig.id} 
        className="snap-slide w-full shrink-0 snap-start px-5 flex flex-col"
      >
        {asig.fechaExamen && (
          <CountdownExamen
            fechaExamen={asig.fechaExamen}
            asignaturaId={asig.id}
            onEditar={mercado.editarFechaExamenPublica}
          />
        )}

              {preguntasAsignatura.length === 0 ? (
                <p className="text-center text-sutil text-[14px] mt-10">No hay preguntas abiertas.</p>
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

              {/* Botón Proponer Pregunta (renderizado al final de la lista de la asignatura activa) */}
              {!asig.cerrada && hayAsignaturasAbiertas && (
                <div className="mb-12 mt-8 flex justify-center">
                  <button
                    onClick={() => setModalAbierto(true)}
                    style={fuenteApple}
                    className="flex touch-manipulation items-center gap-2 rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-white shadow-sm transition-transform hover:opacity-90 active:scale-95"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                    Proponer pregunta
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalAbierto && (
        <PantallaNuevaPregunta
          asignaturas={asignaturas.filter(a => !a.cerrada)}
          asigInicial={asigCerrada ? "" : asigId}
          onCerrar={() => setModalAbierto(false)}
          onCrear={async (t, id) => { await mercado.crearPregunta(t, id); }}
        />
      )}

      {/* Hack de iOS */}
      <input type="checkbox" id="haptic-checkbox" ref={(el) => { if (el) el.setAttribute("switch", ""); }} style={{ position: "fixed", top: "0", left: "0", opacity: "0", pointerEvents: "none", width: "1px", height: "1px" }} tabIndex={-1} aria-hidden="true" />
      <label htmlFor="haptic-checkbox" id="haptic-label" style={{ position: "fixed", top: "0", left: "0", opacity: "0", pointerEvents: "none", width: "1px", height: "1px" }} aria-hidden="true"></label>
    </div>
  );
}