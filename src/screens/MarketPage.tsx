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
        <p className="font-mono text-[11px] leading-none text-sutil">sin apuestas</p>
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

  const btnBase =
    "flex flex-1 h-[42px] touch-manipulation items-center justify-center gap-2 rounded-lg border px-3 text-[14px] font-medium";

  return (
    <article 
      className={`py-6 w-full ${ocultarBorde ? "" : "border-b border-linea"}`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* break-words y min-w-0 evitan que textos largos rompan el ancho */}
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
          className={`mt-2 flex h-[36px] w-full touch-manipulation items-center justify-center rounded-lg border border-borde bg-white text-[13px] font-medium text-sutil hover:border-ink/30 hover:text-ink active:bg-black/5 ${bloqueado ? "opacity-40" : ""}`}
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
  asignaturas: Array<{ id: string; nombre: string; cerrada?: boolean }>;
  asigId: string;
  setAsigActiva: (id: string) => void;
  preguntas: Pregunta[];
  saldo: number;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2 py-6">
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

function ModalNuevaPregunta({
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
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onCerrar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-md bg-lienzo p-5 sm:max-w-sm sm:rounded-md"
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
      >
        <h2 className="text-[15px] font-semibold text-ink">Cuanto más específica mejor</h2>

        <input
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value);
            if (error) setError(null);
          }}
          disabled={cargando}
          style={{ fontSize: "16px" }}
          className="mt-3 w-full rounded-md border border-borde bg-white px-3 py-2.5 text-ink outline-none focus:border-ink/40 disabled:opacity-50"
        />

        <div className="mt-3 flex flex-wrap gap-2">
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

        {error && <p className="mt-2 text-[12px] text-rojo">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            onClick={onCerrar}
            disabled={cargando}
            style={fuenteApple}
            className="flex-1 touch-manipulation rounded-md border border-borde bg-white py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-ink/30 active:bg-black/5 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={enviar}
            disabled={cargando}
            style={fuenteApple}
            className="flex-1 touch-manipulation rounded-md bg-ink py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85 active:opacity-70 disabled:opacity-50"
          >
            {cargando ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BotonRankingDinamico({ rankingFijo, miNombre }: { rankingFijo: any[]; miNombre: string }) {
  // 👇 AQUÍ PUEDES MODIFICAR EL TAMAÑO DEL TEXTO PARA TODO EL BOTÓN 👇
  const TAMANO_TEXTO = "text-[15px]"; 

  const miIndice = rankingFijo.findIndex((r) => r.usuario === miNombre);

  if (rankingFijo.length === 0 || miIndice === -1) {
    return (
      <div className="mt-4 flex w-full justify-center px-4">
        <Link to="/ranking" className={`${TAMANO_TEXTO} font-medium text-sutil transition-colors hover:text-ink truncate`}>
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
        <Link to="/ranking" className={`group relative flex max-w-full items-center ${TAMANO_TEXTO} text-ink/90 transition-colors hover:text-ink`}>
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

  return (
    <div className="mt-4 flex w-full justify-center px-4">
      <Link to="/ranking" className={`group relative flex max-w-full items-center ${TAMANO_TEXTO} text-ink/90 transition-colors hover:text-ink`}>
        <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-amber-400/30 blur-xl" aria-hidden="true" />

        {/* El "truncate" fuerza a que se quede en 1 sola línea */}
        <span className="block truncate">
          Vas <strong className="font-semibold text-ink">#{miPosicion}</strong>, te faltan{" "}
          <span className="mx-0.5 inline-flex items-center gap-0.5 font-mono font-bold text-ink">
            {faltan} <Moneda className="h-3.5 w-3.5 align-[-2px]" />
          </span>{" "}
          hasta <strong className="font-medium text-ink">{elDeArriba.usuario}</strong>
        </span>
        
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

  const asignaturasConPreguntas = asignaturas.filter((a) =>
    preguntas.some((p) => p.asignaturaId === a.id && p.resultado === null && !p.archivada)
  );

  const asigUnicaDefault =
    asignaturasConPreguntas.length === 1 ? asignaturasConPreguntas[0].id : "";

  const [asigActiva, setAsigActiva] = useState<string>("");

  useEffect(() => {
    if (!asigActiva && asigUnicaDefault) {
      setAsigActiva(asigUnicaDefault);
    }
  }, [asigActiva, asigUnicaDefault]);

  const asigId = asigActiva || asignaturas[0]?.id || "";

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
      /* AÑADIDO: w-full y overflow-x-hidden para bloquear cualquier scroll horizontal */
      className="min-h-screen w-full overflow-x-hidden bg-lienzo pb-28"
      style={fuenteApple}
      onClickCapture={(event) => {
        const target = event.target as Element;
        if (target.id === "haptic-checkbox" || target.id === "haptic-label") return;
        if (target.closest('input[type="text"], input:not([type]), textarea')) return;
        if (target.closest("a, input, select")) haptic();
      }}
    >
      <header style={{ paddingTop: "env(safe-area-inset-top)" }}>
        {/* AÑADIDO: w-full en el header para que no se exceda */}
        <div className="mx-auto flex h-14 w-full max-w-[520px] items-center justify-between px-5">
          <span
            style={fuenteApple}
            className="text-[15px] font-bold tracking-tight"
          >
            Consulta y opina
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

      {/* AÑADIDO: w-full en el main para asegurar el margen interno */}
      <main className="mx-auto w-full max-w-[520px] px-5">
        {!mercado.pausado && (
          <div className="my-10 flex flex-col items-center justify-center">
            <div className="relative z-10 flex items-center gap-3">
              <Moneda className="h-8 w-8" />
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

        <div className="mt-8 px-1">
          <p className="text-[14px] font-normal leading-relaxed text-ink" style={fuenteApple}>
            <svg className="mr-1.5 inline-block h-4 w-4 shrink-0 align-[-2px] text-ink" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 11 18-5v12L3 14v-3z"></path>
              <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
            </svg>
            <span className="font-semibold">Nota del editor:</span> Bienvenido! Aquí puedes hacer apuestas sobre lo que va a caer en el próximo examen. Quien acierte se lleva los tokens de los perdedores. Los mercados de predicción funcionan mejor cuantos más participantes, y pueden llegar a ser muy muy precisos. De momento los tokens no tienen valor real pero... quién sabe?
          </p>
        </div>
        
        <Asignaturas 
          asignaturas={asignaturas} 
          asigId={asigId} 
          setAsigActiva={(id) => {
            haptic(); 
            setAsigActiva(id);
          }} 
          preguntas={preguntas} 
          saldo={mercado.saldo || 0}
        />

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
        <ModalNuevaPregunta
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