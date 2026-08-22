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

/* --- EASTER EGG COMENTADO TEMPORALMENTE ---
// Easter Egg: Confeti Amarillo nativo (Explosión 360º y súper duradera)
function lanzarConfetiAmarillo(e: React.MouseEvent) {
  const colores = ["#FCD34D", "#FBBF24", "#F59E0B", "#D97706"];
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  // 300 piezas
  for (let i = 0; i < 300; i++) {
    const confeti = document.createElement("div");
    confeti.style.position = "fixed";
    confeti.style.left = `${originX}px`;
    confeti.style.top = `${originY}px`;
    confeti.style.width = `${Math.random() * 8 + 4}px`;
    confeti.style.height = `${Math.random() * 12 + 6}px`;
    confeti.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
    confeti.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    confeti.style.zIndex = "9999";
    confeti.style.pointerEvents = "none";
    document.body.appendChild(confeti);

    const angle = Math.random() * Math.PI * 2; // 360 grados en todas direcciones
    const velocity = Math.random() * 1200 + 400; // Más fuerza para que lleguen a los bordes
    
    // Sin nada de gravedad (pura expansión circular)
    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity; 
    
    const rotation = Math.random() * 1080 - 540; 
    
    // Duración inmensa: flotando entre 4 y 8 segundos
    const duration = Math.random() * 4000 + 4000; 

    confeti.animate(
      [
        { transform: "translate(-50%, -50%) rotate(0deg) scale(1)", opacity: 1 },
        // Cambiado de scale(0) a scale(0.8) para que no encoja y desaparezca antes de tiempo
        { transform: `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) rotate(${rotation}deg) scale(0.8)`, opacity: 0 }
      ],
      {
        duration: duration,
        // Curva suave para que se ralentice lentamente pero no frene de golpe
        easing: "cubic-bezier(0.25, 1, 0.5, 1)", 
        fill: "forwards"
      }
    ).onfinish = () => confeti.remove(); 
  }
}
--------------------------------------------- */

const mono = "font-mono text-[11px] uppercase tracking-widest";
const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

// Convierte un timestamp (ms) al formato que espera <input type="datetime-local">
// ("YYYY-MM-DDTHH:mm"), respetando la hora LOCAL del navegador.
function aValorInputLocal(ts: number): string {
  const d = new Date(ts);
  const pad2 = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// Cuenta atrás días/horas/min/seg hasta `fechaExamen` (timestamp en ms).
// Se recalcula cada segundo. Desaparece sola cuando la fecha ya ha pasado.
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
  const seg = totalSeg % 60;

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
      
      {/* Reloj libre y centrado sin el botón ? solapando */}
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
        {/* Segundos desactivados por ahora. Descomentar estas dos líneas (el separador ':' y el bloque de segundos) para volver a mostrarlos.
        <span className="mx-2 font-mono text-[18px] font-medium leading-none text-ink">:</span>
        <span className="flex items-baseline gap-1">
          <span className="inline-block min-w-[2ch] text-right font-mono text-[26px] font-medium leading-none tabular-nums text-ink">{seg}</span>
          <span className="text-[18px] font-normal leading-none text-sutil">sec</span>
        </span>
        */}
      </div>

      {/* Nuevo texto disclaimer clicable debajo del reloj */}
      <button
        onClick={() => setMostrarInfo(true)}
        className="mt-2.5 touch-manipulation text-center text-[12px] text-sutil underline decoration-sutil/40 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink/40 active:opacity-70"
      >
        fecha informativa, puedes corregirla si está mal
      </button>

      {/* POPUP con el fondo blur, pero con el mismo lenguaje visual que el resto de la app */}
      {mostrarInfo && (
        <div onClick={cerrarPopup} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm">
          <div
            onClick={(e) => e.stopPropagation()}
            style={fuenteApple}
            className="w-full max-w-[320px] rounded-lg border border-borde bg-white p-5 text-left text-ink"
          >
            {!editando ? (
              <>
                <p className="text-[17px] leading-relaxed text-sutil">
                  Fecha programada
                </p>
                <p className="mt-1 text-[17px] leading-relaxed">
                  {fechaFormateada}
                </p>
                <p className="mt-4 text-[17px] leading-relaxed text-sutil">
                  Esta fecha es informativa y puede estar equivocada.
                </p>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={cerrarPopup}
                    className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2.5 text-[17px] font-medium text-ink active:bg-black/5"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setEditando(true)}
                    className="flex-1 touch-manipulation rounded-lg bg-ink py-2.5 text-[17px] font-medium text-white active:opacity-70"
                  >
                    Corregir
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[17px] leading-relaxed text-sutil">
                  Corregir fecha
                </p>
                <p className="mt-1 text-[17px] leading-relaxed text-sutil">
                  Cualquiera puede corregir esta fecha si está mal.
                </p>
                <input
                  type="datetime-local"
                  value={valorInput}
                  onChange={(e) => setValorInput(e.target.value)}
                  disabled={guardando}
                  style={{ fontSize: "17px" }}
                  className="mt-4 w-full rounded-lg border border-borde bg-white px-3 py-2.5 text-left text-[17px] text-ink outline-none focus:border-ink/40 disabled:opacity-50 select-text"
                />
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => setEditando(false)}
                    disabled={guardando}
                    className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2.5 text-[17px] font-medium text-ink active:bg-black/5 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarFecha}
                    disabled={guardando || !valorInput}
                    className="flex-1 touch-manipulation rounded-lg bg-ink py-2.5 text-[17px] font-medium text-white active:opacity-70 disabled:opacity-50"
                  >
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

function EscalaPuntos({
  si,
  no,
  misSi,
  misNo,
}: {
  si: number;
  no: number;
  misSi: number;
  misNo: number;
}) {
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
        
        {/* Lado NO (Izquierda) */}
        <div className="flex flex-1 flex-wrap content-start items-start justify-start gap-1">
          {Array.from({ length: otrosNo }).map((_, i) => (
            <span key={`no-o-${i}`} className="block h-2 w-2 shrink-0 rounded-full bg-rojo" />
          ))}
          {Array.from({ length: safeMisNo }).map((_, i) => (
            <span key={`no-m-${i}`} className="block h-2 w-2 shrink-0 rounded-full bg-moneda" />
          ))}
        </div>

        {/* Lado SÍ (Derecha) */}
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

  // Se añade transition-transform, duration y active:scale para el hundimiento
  const btnBase =
    "flex flex-1 h-[42px] touch-manipulation items-center justify-center gap-2 rounded-lg border px-3 text-[14px] font-medium transition-transform duration-150 active:scale-95";

  return (
    <article 
      className={`py-6 w-full ${ocultarBorde ? "" : "border-b border-linea"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="min-w-0 flex-1 break-words text-[19px] font-medium leading-snug text-ink">
          {pregunta.titulo}
        </h2>
        <span
          className={`shrink-0 font-mono text-[30px] leading-none tabular-nums ${
            !tieneApuestas ? "text-sutil" : positivo ? "text-verde" : "text-rojo"
          }`}
        >
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
          className={`${btnBase} ${bloqueado ? "opacity-40" : ""} ${
            (pregunta.misNo || 0) > 0
              ? "border-rojo bg-rojo text-white"
              : sinTokens
                ? "border-linea bg-black/5 text-sutil"
                : "border-borde bg-white text-ink hover:border-ink/30"
          }`}
        >
          <span>NO</span>
          {(pregunta.misNo || 0) > 0 && (
            <span className="font-mono text-[14px] font-semibold tabular-nums">· {pregunta.misNo}</span>
          )}
        </button>
        <button
          data-apuesta
          onClick={() => handleApostar("si")}
          disabled={bloqueado || cooldown}
          style={fuenteApple}
          className={`${btnBase} ${bloqueado ? "opacity-40" : ""} ${
            (pregunta.misSi || 0) > 0
              ? "border-verde bg-verde text-white"
              : sinTokens
                ? "border-linea bg-black/5 text-sutil"
                : "border-borde bg-white text-ink hover:border-ink/30"
          }`}
        >
          <span>SÍ</span>
          {(pregunta.misSi || 0) > 0 && (
            <span className="font-mono text-[14px] font-semibold tabular-nums">· {pregunta.misSi}</span>
          )}
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
    <div className="flex flex-wrap justify-center gap-2 pb-6 pt-2">
      {asignaturas.map((a) => {
        const sinApostar = preguntas.filter(
          (p) =>
            p.asignaturaId === a.id &&
            p.resultado === null &&
            !p.archivada &&
            (p.misSi || 0) + (p.misNo || 0) === 0
        ).length;

        return (
          <button
            key={a.id}
            onClick={() => setAsigActiva(a.id)}
            style={fuenteApple}
            className={`relative touch-manipulation whitespace-nowrap rounded-full border flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium transition-colors active:opacity-70 ${
              a.id === asigId
                ? "border-ink bg-ink text-white"
                : "border-borde bg-white text-ink hover:border-ink/30"
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
    if (!titulo.trim()) {
      setError("Escribe un enunciado");
      return;
    }

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
    <div
      className="fixed inset-0 z-40 flex flex-col bg-lienzo"
      style={{ height: "100dvh" }}
    >
      {/* Cabecera fija: nunca se mueve, publicar está siempre visible aunque salga el teclado */}
      <header
        className="flex shrink-0 items-center justify-between border-b border-linea px-4"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)",
          paddingBottom: "0.75rem",
        }}
      >
        <button
          onClick={onCerrar}
          disabled={cargando}
          style={fuenteApple}
          className="touch-manipulation px-1 py-1 text-[17px] text-ink disabled:opacity-40"
        >
          Cancelar
        </button>

        <span style={fuenteApple} className="text-[15px] font-semibold text-ink">
          Nueva pregunta
        </span>

        <button
          onClick={enviar}
          disabled={cargando || !titulo.trim()}
          style={fuenteApple}
          className="touch-manipulation px-1 py-1 text-[17px] font-semibold text-ink disabled:opacity-30"
        >
          {cargando ? "..." : "Publicar"}
        </button>
      </header>

      {/* Contenido: única zona que hace scroll, así el header/footer no bailan */}
      <div
        className="flex-1 overflow-y-auto px-5 py-6"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <h1 style={fuenteApple} className="text-[15px] font-semibold text-ink">
          Cuanto más específica mejor, frases largas.
        </h1>

        <textarea
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value);
            if (error) setError(null);
          }}
          disabled={cargando}
          autoFocus
          rows={4}
          placeholder="¿Qué pregunta quieres proponer?"
          style={{ fontSize: "16px" }}
          className="mt-3 w-full resize-none rounded-md border border-borde bg-white px-3 py-2.5 text-ink outline-none focus:border-ink/40 disabled:opacity-50 select-text"
        />

        <p style={fuenteApple} className="mt-5 text-[13px] font-medium text-sutil">
          Asignatura
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {asignaturas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAsigId(a.id)}
              style={fuenteApple}
              disabled={cargando}
              className={`touch-manipulation whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors active:opacity-70 ${
                a.id === asigId
                  ? "border-ink bg-ink text-white"
                  : "border-borde bg-white text-ink hover:border-ink/30"
              }`}
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
  // Ajuste de tipografía elástica: varía de 12px a 15px según el ancho de la pantalla (4.5vw)
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
          
          <span className="block truncate">
            Vas <strong className="font-semibold text-ink">#1</strong>. ¡Mantén la distancia!
          </span>
          <span className="ml-1.5 shrink-0 opacity-50 transition-transform group-hover:translate-x-1 group-hover:opacity-100">→</span>
        </Link>
      </div>
    );
  }

  const diferencia = elDeArriba.tokens - yo.tokens;
  const faltan = diferencia >= 0 ? diferencia + 1 : 1; 

  // 👇 CAMBIA ESTO: Puedes usar "text-[14px]", "text-[15px]", "text-[16px]", etc. 👇
  const TAMANO_LETRA = "text-[16px]";

  return (
    <div className="mt-4 flex w-full justify-center px-4">
      <Link 
        to="/ranking" 
        className={`group relative flex max-w-full items-center ${TAMANO_LETRA} text-ink/90 transition-colors hover:text-ink`}
      >
        <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-amber-400/30 blur-xl" aria-hidden="true" />

        {/* 
          1. Aquí está la magia de los espacios: usamos 'gap-1.5'. 
          Esto añade una separación idéntica y perfecta entre cada bloque, sin usar espacios manuales.
        */}
        <div className="flex min-w-0 shrink items-center overflow-hidden whitespace-nowrap gap-1.5">
          
          {/* Bloque 1: Posición */}
          <span className="shrink-0">
            Vas <strong className="font-semibold text-ink">#{miPosicion}</strong>, te faltan
          </span>
          
          {/* Bloque 2: Tokens y Moneda (alineados perfectamente con items-center) */}
          <span className="shrink-0 inline-flex items-center gap-0.5 font-mono font-bold text-ink">
            {faltan} <Moneda className="h-3.5 w-3.5" />
          </span>
          
          {/* Bloque 3: Texto intermedio */}
          <span className="shrink-0">
            hasta
          </span>
          
          {/* Bloque 4: Nombre del rival (se corta si no cabe) */}
          <strong className="truncate font-medium text-ink">
            {elDeArriba?.usuario}
          </strong>

        </div>
        
        {/* Bloque 5: Flecha */}
        <span className="ml-1.5 shrink-0 opacity-50 transition-transform group-hover:translate-x-1 group-hover:opacity-100">
          →
        </span>
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

  // 1. ORDENAMOS LAS ASIGNATURAS PRIMERO (Examen más próximo primero)
  const asignaturasOrdenadas = [...asignaturas].sort((a, b) => {
    if (a.cerrada !== b.cerrada) return a.cerrada ? 1 : -1;
    if (a.fechaExamen == null && b.fechaExamen == null) return 0;
    if (a.fechaExamen == null) return 1;
    if (b.fechaExamen == null) return -1;
    return a.fechaExamen - b.fechaExamen;
  });

  const [asigActiva, setAsigActiva] = useState<string>("");

  // 2. LA ASIGNATURA POR DEFECTO ES LA PRIMERA DE LA LISTA ORDENADA
  const asigId = asigActiva || (asignaturasOrdenadas[0]?.id || "");

  const asigAnteriorRef = useRef<string>("");
  const [ordenAbiertasIds, setOrdenAbiertasIds] = useState<string[]>([]);

  useEffect(() => {
    const cambioAsignatura = asigAnteriorRef.current !== asigId;
    asigAnteriorRef.current = asigId;

    const abiertasAsig = preguntas.filter(
      (p) => p.asignaturaId === asigId && p.resultado === null && !p.archivada,
    );

    setOrdenAbiertasIds((prev) => {
      if (cambioAsignatura || prev.length === 0) {
        return abiertasAsig.map((p) => p.id);
      }
      const idsActuales = new Set(abiertasAsig.map((p) => p.id));
      const conservados = prev.filter((id) => idsActuales.has(id));
      const nuevos = abiertasAsig.map((p) => p.id).filter((id) => !prev.includes(id));
      if (conservados.length === prev.length && nuevos.length === 0) {
        return prev;
      }
      return [...conservados, ...nuevos];
    });
  }, [asigId, JSON.stringify(preguntas.map((p) => p.id))]);

  if (cargando) {
    return <div className="min-h-screen bg-lienzo" />;
  }

  if (!usuario) {
    return <PantallaLogin entrarConGoogle={entrarConGoogle} />;
  }

  const asigActivaObj = asignaturas.find((a) => a.id === asigId);
  const asigCerrada = asigActivaObj?.cerrada === true;

  const hayAsignaturasAbiertas = asignaturas.some((a) => !a.cerrada);

  const mapaPreguntas = new Map(preguntas.map((p) => [p.id, p]));
  const abiertas = ordenAbiertasIds
    .map((id) => mapaPreguntas.get(id))
    .filter((p): p is Pregunta => Boolean(p));

  const intentarApostar = (id: string, lado: Lado) => {
    haptic(); 
    if ((mercado.saldo || 0) < 1) {
      document.body.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-7px)" },
          { transform: "translateX(6px)" },
          { transform: "translateX(-4px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 280, easing: "ease-in-out" },
      );
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
        if (target.closest("a, input, select")) haptic();
      }}
    >
      <header style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-14 w-full max-w-[520px] items-center justify-between px-5">
          <span
            style={fuenteApple}
            className="text-[15px] font-bold tracking-tight"
          >
            Probabilidad fiable?
          </span>
          
          <div className="flex items-center gap-2">
            {usuario.esAdmin && (
              <Link to={"/admin" as never} className={`${mono} mr-2`}>
                ADMN
              </Link>
            )}

            <Link
              to="/resueltas"
              className="flex touch-manipulation items-center justify-center p-2 text-ink opacity-100"
              aria-label="Apuestas resueltas"
            >
              <ClipboardList className="h-[20px] w-[20px] shrink-0" strokeWidth={2} />
            </Link>

            <Link
              to="/profile"
              className="flex touch-manipulation items-center justify-center p-2 text-ink opacity-100"
              aria-label="Perfil"
            >
              <Settings className="h-[20px] w-[20px] shrink-0" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </header>

<main className="mx-auto w-full max-w-[520px] px-5">
        {!mercado.pausado && (
          <div className="mt-10 mb-4 flex flex-col items-center justify-center">
            <div className="relative z-10 flex items-center gap-3">
              
              <button
                onClick={(e) => {
                  haptic(); 
                  // lanzarConfetiAmarillo(e); // <-- EASTER EGG COMENTADO TEMPORALMENTE
                }}
                style={{ width: "42px", height: "42px" }}
                className="flex shrink-0 items-center justify-center rounded-full touch-manipulation transition-transform hover:scale-110 active:scale-90 focus:outline-none"
              >
                {/* La moneda ahora siempre copiará el tamaño exacto del botón sin deformarse */}
                <Moneda className="!h-full !w-full" />
              </button>
              
              <span className="font-mono text-[64px] leading-none tracking-tight tabular-nums text-ink">
                {mercado.saldo || 0}
              </span>
            </div>
            
            <BotonRankingDinamico 
              rankingFijo={rankingFijo} 
              miNombre={mercado.miNombre} 
            />
          </div>
        )}
        
        {/*
        <div className="mt-8 px-1">
          <p className="text-[14px] font-normal leading-relaxed text-ink" style={fuenteApple}>
            <svg className="mr-1.5 inline-block h-4 w-4 shrink-0 align-[-2px] text-ink" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 11 18-5v12L3 14v-3z"></path>
              <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
            </svg>
            <span className="font-semibold">Nota del editor:</span> Bienvenido! Aquí puedes hacer apuestas sobre lo que va a caer en el próximo examen. Quien acierte se lleva los tokens de los perdedores. Los mercados de predicción funcionan mejor cuantos más participantes, y pueden llegar a ser muy muy precisos. De momento los tokens no tienen valor real pero... quién sabe?
          </p>
        </div>
        */}
        <Asignaturas 
          asignaturas={asignaturasOrdenadas}
          asigId={asigId} 
          setAsigActiva={(id) => {
            haptic(); 
            setAsigActiva(id);
          }} 
          preguntas={preguntas} 
          saldo={mercado.saldo || 0}
        />

        {asigActivaObj?.fechaExamen && (
          <CountdownExamen
            fechaExamen={asigActivaObj.fechaExamen}
            asignaturaId={asigActivaObj.id}
            onEditar={mercado.editarFechaExamenPublica}
          />
        )}

        {abiertas.map((p, index) => (
          <FilaPregunta
            key={p.id}
            pregunta={p}
            bloqueado={mercado.pausado || asigCerrada} 
            sinTokens={(mercado.saldo || 0) < 1}
            ocultarBorde={index === abiertas.length - 1}
            onApostar={(lado) => intentarApostar(p.id, lado)}
            onRetirar={() => retirarPregunta(p.id)}
          />
        ))}

        {hayAsignaturasAbiertas && (
          <div className="mb-12 mt-8 flex justify-center">
            <button
              onClick={() => {
                setModalAbierto(true);
              }}
              style={fuenteApple}
              className="flex touch-manipulation items-center gap-2 rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-white shadow-sm transition-transform hover:opacity-90 active:scale-95"
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 5v14"></path>
                <path d="M5 12h14"></path>
              </svg>
              Proponer pregunta
            </button>
          </div>
        )}
      </main>

      {modalAbierto && (
        <PantallaNuevaPregunta
          asignaturas={asignaturas.filter(a => !a.cerrada)}
          asigInicial={asigCerrada ? "" : asigId}
          onCerrar={() => setModalAbierto(false)}
          onCrear={async (t, id) => { await mercado.crearPregunta(t, id); }}
        />
      )}

      {/* Hack de iOS */}
      <input 
        type="checkbox" 
        id="haptic-checkbox" 
        ref={(el) => {
          if (el) el.setAttribute("switch", "");
        }}
        style={{ position: "fixed", top: "0", left: "0", opacity: "0", pointerEvents: "none", width: "1px", height: "1px" }} 
        tabIndex={-1} 
        aria-hidden="true" 
      />
      <label 
        htmlFor="haptic-checkbox" 
        id="haptic-label" 
        style={{ position: "fixed", top: "0", left: "0", opacity: "0", pointerEvents: "none", width: "1px", height: "1px" }} 
        aria-hidden="true"
      ></label>

    </div>
  );
}