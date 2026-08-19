import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useHaptic } from "@/hooks/useHaptic";
import { useSesion } from "@/hooks/useSesion";
import { Settings, ClipboardList } from "lucide-react";
import {
  haceTexto,
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
        <p className="font-mono text-[11px] leading-none text-sutil">nadie ha apostado todavía</p>
      </div>
    );
  }

  const otrosNo = Math.max(0, safeNo - safeMisNo);
  const otrosSi = Math.max(0, safeSi - safeMisSi);

  // 1 token = 1 punto real. Nada de ratios ni compresiones.
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

  const btnBase =
    "flex flex-1 h-[42px] touch-manipulation items-center justify-center gap-2 rounded-lg border px-3 text-[14px] font-medium disabled:opacity-40";

  return (
    <article 
      className={`py-6 ${ocultarBorde ? "" : "border-b border-linea"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[19px] font-medium leading-snug text-ink">{pregunta.titulo}</h2>
        <span
          className={`font-mono text-[30px] leading-none tabular-nums ${
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
          onClick={() => onApostar("no")}
          disabled={bloqueado}
          style={fuenteApple}
          className={`${btnBase} ${
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
          onClick={() => onApostar("si")}
          disabled={bloqueado}
          style={fuenteApple}
          className={`${btnBase} ${
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
          disabled={bloqueado}
          style={fuenteApple}
          className="mt-2 flex h-[36px] w-full touch-manipulation items-center justify-center rounded-lg border border-borde bg-white text-[13px] font-medium text-sutil transition-colors hover:border-ink/30 hover:text-ink active:bg-black/5 disabled:opacity-40"
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
  asignaturas: Array<{ id: string; nombre: string }>;
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
            className={`relative touch-manipulation whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors active:opacity-70 ${
              a.id === asigId
                ? "border-ink bg-ink text-white"
                : "border-borde bg-white text-ink hover:border-ink/30"
            }`}
          >
            {a.nombre}
            
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
  asignaturas: Array<{ id: string; nombre: string }>;
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

export function MarketPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const haptic = useHaptic();

  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const preguntas = mercado.leerPreguntas({ estado: "todas" }) || [];
  const asignaturas = mercado.leerAsignaturas() || [];
  
  const rankingActual = (mercado as any).leerRanking?.() || [];
  const actividadActual = (mercado as any).leerApuestas?.() || []; 

  const [rankingFijo, setRankingFijo] = useState<any[]>([]);
  const [actividadFija, setActividadFija] = useState<any[]>([]);

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
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-lienzo px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Casandra</h1>
        <p className="mt-2 max-w-xs text-center text-[14px] leading-relaxed text-sutil">
          Mercado de predicción académico. Apuesta tokens a si una pregunta entra en el examen.
        </p>
        <button
          onClick={async () => {
            haptic();
            setError(await entrarConGoogle());
          }}
          style={fuenteApple}
          className="mt-8 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
        >
          Entrar con Google
        </button>
        {error && <p className="mt-3 text-[12px] text-rojo">{error}</p>}
      </main>
    );
  }

  const mapaPreguntas = new Map(preguntas.map((p) => [p.id, p]));
  const abiertas = ordenAbiertasIds
    .map((id) => mapaPreguntas.get(id))
    .filter((p): p is Pregunta => Boolean(p));

  const intentarApostar = (id: string, lado: Lado) => {
    haptic(); // VIBRA AL APOSTAR
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
    haptic(); // VIBRA AL RETIRAR
    mercado.retirar(id);
  };

  return (
    <div
      className="min-h-screen bg-lienzo pb-28"
      style={fuenteApple}
      onClickCapture={(event) => {
        const target = event.target as Element;
        // Solo para componentes menores que no tengan la vibración manual ya programada
        if (target.closest("a, input, select, textarea")) haptic();
      }}
    >
<header style={{ paddingTop: "env(safe-area-inset-top)" }}>
  <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-5">
    <span
      style={fuenteApple}
      className="text-[15px] font-semibold tracking-tight"
    >
      Adivina preguntas
    </span>
    
    <div className="flex items-center gap-2">
      {usuario.esAdmin && (
        <Link to={"/admin" as never} className={`${mono} mr-2`}>
          Admin
        </Link>
      )}

      <Link
        to="/resueltas"
        className="flex items-center justify-center p-2 text-ink transition-opacity hover:opacity-70 active:opacity-40 touch-manipulation"
        aria-label="Apuestas resueltas"
      >
        <ClipboardList className="h-[20px] w-[20px] shrink-0" strokeWidth={2} />
      </Link>

      <Link
        to="/profile"
        className="flex items-center justify-center p-2 text-ink transition-opacity hover:opacity-70 active:opacity-40 touch-manipulation"
        aria-label="Perfil"
      >
        <Settings className="h-[20px] w-[20px] shrink-0" strokeWidth={2} />
      </Link>
    </div>
  </div>
</header>

      <main className="mx-auto max-w-[520px] px-5">
        {!mercado.pausado && (
          <div className="my-10 flex flex-col items-center justify-center">
            <div className="flex items-center gap-3">
              <Moneda className="h-8 w-8" />
              <span className="font-mono text-[64px] leading-none tabular-nums tracking-tight text-ink">
                {mercado.saldo || 0}
              </span>
            </div>

            <span style={fuenteApple} className="mt-4 text-[13px] font-medium uppercase tracking-widest text-sutil">
              Tokens disponibles
            </span>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-6 px-1 items-start">
          <div className="flex flex-col">
            <h3 style={fuenteApple} className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-sutil shrink-0">
              Ranking
            </h3>
            <ul className="space-y-3 text-[13px] text-ink" style={fuenteApple}>
              {rankingFijo.slice(0, 4).map((r: any, i: number) => (
                <li key={i} className="flex items-center justify-between gap-2 h-[22px]">
                  <span className="truncate font-medium">{r.usuario}</span>
                  <span className="flex shrink-0 items-center gap-1 font-mono tabular-nums text-[13px]">
                    {r.tokens} <Moneda className="h-2.5 w-2.5" />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            <h3 style={fuenteApple} className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-sutil shrink-0">
              Actividad
            </h3>
            <ul className="space-y-3 text-[13px] text-ink" style={fuenteApple}>
              {actividadFija.slice(0, 4).map((a: any, i: number) => (
                <li 
                  key={a.id || i} 
                  className="flex items-center justify-between gap-2 h-[22px] px-2 rounded-md bg-amber-50/50 border border-amber-200/40 shadow-[0_0_8px_rgba(251,191,36,0.15)]"
                >
                  <span className="truncate font-medium">{a.usuario}</span>
                  <span className="shrink-0 text-[11px] text-sutil">
                    {haceTexto(a.cuando)}
                  </span>
                </li>
              ))}
              
              {/* Placeholders discretos para mantener la simetría */}
              {Array.from({ length: Math.max(0, 4 - (actividadFija?.length || 0)) }).map((_, i) => (
                <li 
                  key={`placeholder-act-${i}`} 
                  className="flex items-center h-[22px] px-2"
                >
                  <span className="font-mono text-[14px] font-bold tracking-[0.2em] text-sutil/30">...</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 px-1">
          <p className="text-[14px] font-normal leading-relaxed text-ink" style={fuenteApple}>
            <svg className="inline-block mr-1.5 h-4 w-4 shrink-0 text-ink align-[-2px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
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
            haptic(); // VIBRA AL CAMBIAR DE ASIGNATURA
            setAsigActiva(id);
          }} 
          preguntas={preguntas} 
          saldo={mercado.saldo || 0}
        />

        {abiertas.map((p, index) => (
          <FilaPregunta
            key={p.id}
            pregunta={p}
            bloqueado={mercado.pausado}
            sinTokens={(mercado.saldo || 0) < 1}
            ocultarBorde={index === abiertas.length - 1}
            onApostar={(lado) => intentarApostar(p.id, lado)}
            onRetirar={() => retirarPregunta(p.id)}
          />
        ))}

        <div className="mt-8 mb-12 flex justify-center">
          <button
            onClick={() => {
              haptic();
              setModalAbierto(true);
            }}
            style={fuenteApple}
            className="flex touch-manipulation items-center gap-2 rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-white shadow-sm transition-transform active:scale-95 hover:opacity-90"
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
      </main>

      {modalAbierto && (
        <ModalNuevaPregunta
          asignaturas={asignaturas}
          asigInicial={asigId}
          onCerrar={() => setModalAbierto(false)}
          onCrear={async (t, id) => { await mercado.crearPregunta(t, id); }}
        />
      )}

      {/* 🟢 LA PIEZA CLAVE DE APPLE: ref con setAttribute("switch") y fixed para no hacer scroll */}
      <input 
        type="checkbox" 
        id="haptic-checkbox" 
        ref={(el) => {
          // Engaña a iOS inyectando el atributo no estándar sin que TypeScript se queje
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