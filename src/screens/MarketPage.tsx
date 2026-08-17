import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useHaptic } from "@/hooks/useHaptic";
import { useSesion } from "@/hooks/useSesion";
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
  const total = si + no;

  if (total === 0) {
    return <p className="mt-2.5 font-mono text-[11px] text-sutil">sin apuestas todavía</p>;
  }

  const otrosNo = Math.max(0, no - misNo);
  const otrosSi = Math.max(0, si - misSi);

  return (
    <div className="mt-2.5 grid grid-cols-2 gap-2" aria-hidden>
      <div className="flex flex-wrap justify-start gap-1">
        {Array.from({ length: otrosNo }).map((_, i) => (
          <span key={`no-o-${i}`} className="h-2 w-2 rounded-full bg-rojo" />
        ))}
        {Array.from({ length: misNo }).map((_, i) => (
          <span key={`no-m-${i}`} className="h-2 w-2 rounded-full bg-moneda" />
        ))}
      </div>
      <div className="flex flex-row-reverse flex-wrap gap-1">
        {Array.from({ length: otrosSi }).map((_, i) => (
          <span key={`si-o-${i}`} className="h-2 w-2 rounded-full bg-verde" />
        ))}
        {Array.from({ length: misSi }).map((_, i) => (
          <span key={`si-m-${i}`} className="h-2 w-2 rounded-full bg-moneda" />
        ))}
      </div>
    </div>
  );
}

function FilaPregunta({
  pregunta,
  onApostar,
  bloqueado,
  sinTokens,
  ocultarBorde,
}: {
  pregunta: Pregunta;
  onApostar: (lado: Lado) => void;
  bloqueado?: boolean;
  sinTokens?: boolean;
  ocultarBorde?: boolean;
}) {
  const prob = probabilidad(pregunta);
  const totalApuestas = pregunta.poolSi + pregunta.poolNo;
  const tieneApuestas = totalApuestas > 0;
  const positivo = prob >= 50;
  const cerrada = pregunta.resultado !== null;

  const btnBase =
    "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[14px] font-medium transition-colors disabled:opacity-40";

  return (
    <article 
      className={`py-6 ${ocultarBorde ? "" : "border-b border-linea"} transition-all duration-500 ease-in-out`}
      style={{ willChange: "transform" }}
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

      {cerrada ? (
        <p className="mt-3 font-mono text-[12px] uppercase tracking-widest text-sutil">
          Resuelta · {pregunta.resultado ? "entró" : "no entró"}
        </p>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            data-apuesta
            onClick={() => onApostar("no")}
            disabled={bloqueado}
            style={fuenteApple}
            className={`${btnBase} ${
              pregunta.misNo > 0
                ? "border-rojo bg-rojo text-white"
                : sinTokens
                  ? "border-linea bg-black/5 text-sutil"
                  : "border-borde bg-white text-ink hover:border-ink/30"
            }`}
          >
            <span>NO</span>
            {pregunta.misNo > 0 && (
              <span className="font-mono text-[12px] tabular-nums">· {pregunta.misNo}</span>
            )}
          </button>
          <button
            data-apuesta
            onClick={() => onApostar("si")}
            disabled={bloqueado}
            style={fuenteApple}
            className={`${btnBase} ${
              pregunta.misSi > 0
                ? "border-verde bg-verde text-white"
                : sinTokens
                  ? "border-linea bg-black/5 text-sutil"
                  : "border-borde bg-white text-ink hover:border-ink/30"
            }`}
          >
            <span>SÍ</span>
            {pregunta.misSi > 0 && (
              <span className="font-mono text-[12px] tabular-nums">· {pregunta.misSi}</span>
            )}
          </button>
        </div>
      )}
    </article>
  );
}

function Asignaturas({
  asignaturas,
  asigId,
  setAsigActiva,
}: {
  asignaturas: Array<{ id: string; nombre: string }>;
  asigId: string;
  setAsigActiva: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2 py-6">
      {asignaturas.map((a) => (
        <button
          key={a.id}
          onClick={() => setAsigActiva(a.id)}
          style={fuenteApple}
          className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
            a.id === asigId
              ? "border-ink bg-ink text-white"
              : "border-borde bg-white text-ink hover:border-ink/30"
          }`}
        >
          {a.nombre}
        </button>
      ))}
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
        className="w-full rounded-t-2xl bg-lienzo p-5 sm:max-w-sm sm:rounded-2xl"
      >
        <h2 className="text-[15px] font-semibold text-ink">Nueva pregunta</h2>

        <input
          autoFocus
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value);
            if (error) setError(null);
          }}
          disabled={cargando}
          className="mt-3 w-full rounded-lg border border-borde bg-white px-3 py-2.5 text-[14px] text-ink outline-none focus:border-ink/40 disabled:opacity-50"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {asignaturas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAsigId(a.id)}
              style={fuenteApple}
              disabled={cargando}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
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
            className="flex-1 rounded-full border border-borde bg-white py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-ink/30 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={enviar}
            disabled={cargando}
            style={fuenteApple}
            className="flex-1 rounded-full bg-ink py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
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
  const [mostrarArchivadas, setMostrarArchivadas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const haptic = useHaptic();

  // Estados de búfer
  const [rankingDisplay, setRankingDisplay] = useState<any[]>([]);
  const [actividadDisplay, setActividadDisplay] = useState<any[]>([]);
  const [preguntasDisplay, setPreguntasDisplay] = useState<Pregunta[]>([]);

  useEffect(() => {
    // 1. Ranking (Rápido, 3s)
    const intervalRanking = setInterval(() => {
      setRankingDisplay((mercado as any).leerRanking?.() || []);
    }, 3000);

    // 2. Actividad (Lento, 60s)
    const intervalActividad = setInterval(() => {
      setActividadDisplay(mercado.leerApuestas() || []);
    }, 60000);

    // 3. Preguntas (Moderado, 5s - para evitar saltos bruscos mientras interactúas)
    const intervalPreguntas = setInterval(() => {
        setPreguntasDisplay(mercado.leerPreguntas({ estado: "todas" }));
    }, 5000);

    // Carga inicial
    setRankingDisplay((mercado as any).leerRanking?.() || []);
    setActividadDisplay(mercado.leerApuestas() || []);
    setPreguntasDisplay(mercado.leerPreguntas({ estado: "todas" }));

    return () => {
      clearInterval(intervalRanking);
      clearInterval(intervalActividad);
      clearInterval(intervalPreguntas);
    };
  }, [mercado]);

  const asignaturas = mercado.leerAsignaturas();
  const [asigActiva, setAsigActiva] = useState<string>("");
  const asigId = asigActiva || asignaturas[0]?.id || "";

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

  // Usamos el búfer de preguntasDisplay en lugar de leer directamente
  const abiertas = preguntasDisplay.filter(p => p.asignaturaId === asigId && p.resultado === null && !p.archivada);
  const archivadas = preguntasDisplay.filter(p => p.asignaturaId === asigId && p.resultado !== null || p.archivada);
  
  const preguntasConApuesta = preguntasDisplay.filter(
    (p) => p.resultado === null && !p.archivada && p.misSi + p.misNo > 0,
  );
  const tieneApuestas = preguntasConApuesta.length > 0;

  const retirarTodo = () => {
    preguntasConApuesta.forEach((p) => mercado.retirar(p.id));
  };

  const intentarApostar = (id: string, lado: Lado) => {
    if (mercado.saldo < 1) {
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

  return (
    <div
      className="min-h-screen bg-lienzo pb-28"
      style={fuenteApple}
      onClickCapture={(event) => {
        const target = event.target as Element;
        if (target.closest("button, a, input, select, textarea")) haptic();
      }}
    >
      <header className="fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-5">
          <span
            style={fuenteApple}
            className="text-[15px] font-semibold tracking-tight"
          >
            Adivina preguntas para ganar
          </span>
          <div className="flex items-center gap-4">
            {usuario.esAdmin && (
              <Link to={"/admin" as never} className={mono}>
                Admin
              </Link>
            )}
            <Link to="/profile" className="text-ink transition-opacity hover:opacity-70" aria-label="Perfil">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-14">
        {!mercado.pausado && (
          <div className="my-10 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="flex items-center gap-3">
                <Moneda className="h-8 w-8" />
                <span className="font-mono text-[64px] leading-none tabular-nums tracking-tight text-ink">
                  {mercado.saldo}
                </span>
              </div>
              
              {tieneApuestas && (
                <button
                  onClick={retirarTodo}
                  disabled={mercado.pausado}
                  style={fuenteApple}
                  className="absolute left-[calc(100%+20px)] w-32 rounded-lg border border-borde bg-white px-3 py-2.5 text-left text-[12px] font-medium leading-tight text-ink shadow-sm transition-colors hover:bg-black/5 disabled:opacity-40"
                >
                  Retirar todo y recuperar tokens.
                </button>
              )}
            </div>
            
            <span style={fuenteApple} className="mt-4 text-[13px] font-medium uppercase tracking-widest text-sutil">
              Tokens disponibles
            </span>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-6 px-1">
          <div className="flex flex-col h-[160px] overflow-hidden">
            <h3 style={fuenteApple} className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-sutil shrink-0">
              Ranking
            </h3>
            <ul className="space-y-2.5 text-[13px] text-ink" style={fuenteApple}>
              {rankingDisplay.slice(0, 4).map((r: any, i: number) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="truncate pr-2 font-medium">{r.usuario}</span>
                  <span className="flex shrink-0 items-center gap-1 font-mono tabular-nums">
                    {r.tokens} <Moneda className="h-2.5 w-2.5" />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col h-[160px] overflow-hidden">
            <h3 style={fuenteApple} className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-sutil shrink-0">
              Actividad
            </h3>
            <ul className="space-y-3 text-[12px] leading-snug text-sutil" style={fuenteApple}>
              {actividadDisplay.slice(0, 4).map((a: any) => (
                <li key={a.id} className="flex flex-col gap-0.5">
                  <div className="truncate">
                    <span className="font-medium text-ink">{a.usuario}</span> apostó{" "}
                    <span className="inline-flex items-center gap-0.5 font-mono text-ink">
                      {a.tokens} <Moneda className="h-2 w-2" />
                    </span>
                  </div>
                  <span className="text-[11px] opacity-80">{haceTexto(a.cuando)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Asignaturas asignaturas={asignaturas} asigId={asigId} setAsigActiva={setAsigActiva} />

        {abiertas.map((p, index) => (
          <FilaPregunta
            key={p.id}
            pregunta={p}
            bloqueado={mercado.pausado}
            sinTokens={mercado.saldo < 1}
            ocultarBorde={index === abiertas.length - 1}
            onApostar={(lado) => intentarApostar(p.id, lado)}
          />
        ))}

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setMostrarArchivadas(!mostrarArchivadas)}
            style={fuenteApple}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-sutil transition-colors hover:text-ink"
          >
            <span>Archivadas</span>
            <svg
              className={`h-3.5 w-3.5 transition-transform duration-200 ${mostrarArchivadas ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {mostrarArchivadas && (
          <div className="mt-4 flex flex-col">
            {archivadas.map((p, index) => (
              <FilaPregunta
                key={p.id}
                pregunta={p}
                bloqueado={mercado.pausado}
                sinTokens={mercado.saldo < 1}
                ocultarBorde={index === abiertas.length - 1}
                onApostar={(lado) => intentarApostar(p.id, lado)}
              />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => setModalAbierto(true)}
        aria-label="Nueva pregunta"
        className="fixed bottom-6 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-[28px] leading-none text-white shadow-lg transition-opacity hover:opacity-90"
      >
        +
      </button>

      {modalAbierto && (
        <ModalNuevaPregunta
          asignaturas={asignaturas}
          asigInicial={asigId}
          onCerrar={() => setModalAbierto(false)}
          onCrear={async (t, id) => { await mercado.crearPregunta(t, id); }}
        />
      )}
    </div>
  );
}