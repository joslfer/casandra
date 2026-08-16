import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSesion } from "@/hooks/useSesion";
import {
  haceTexto,
  probabilidad,
  useMercado,
  type Lado,
  type Pregunta,
  type Mercado,
} from "@/hooks/useMercado";

function Moneda({ className = "" }: { className?: string }) {
  return <span className={`h-3.5 w-3.5 rounded-full bg-moneda ${className}`} />;
}

type FiltroPreguntas = "feed" | "archivadas";

const mono = "font-mono text-[11px] uppercase tracking-widest";
const helvetica = { fontFamily: "Helvetica, Arial, sans-serif" };

function Hero({ mercado }: { mercado: Mercado }) {
  const { nombres } = mercado.resumen();

  return (
    <section className="relative mt-5 border-b border-linea pb-4">
      {nombres.length > 0 && (
        <p className="mt-3 truncate text-[11.5px] text-sutil">{nombres.join(" · ")}</p>
      )}
    </section>
  );
}

const MAX_PUNTOS = 60;

function EscalaPuntos({ si, no }: { si: number; no: number }) {
  const total = si + no;

  if (total === 0) {
    return <p className="mt-2.5 font-mono text-[11px] text-sutil">sin apuestas todavía</p>;
  }

  const escala = total > MAX_PUNTOS ? MAX_PUNTOS / total : 1;
  const puntosSi = Math.max(si > 0 ? 1 : 0, Math.round(si * escala));
  const puntosNo = Math.max(no > 0 ? 1 : 0, Math.round(no * escala));

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-1" aria-hidden>
      {Array.from({ length: puntosSi }).map((_, i) => (
        <span key={`si-${i}`} className="h-2 w-2 rounded-full bg-verde" />
      ))}
      {Array.from({ length: puntosNo }).map((_, i) => (
        <span key={`no-${i}`} className="h-2 w-2 rounded-full bg-rojo" />
      ))}
    </div>
  );
}

function FilaPregunta({
  pregunta,
  onApostar,
  onRetirar,
  bloqueado,
}: {
  pregunta: Pregunta;
  onApostar: (lado: Lado) => void;
  onRetirar: () => void;
  bloqueado?: boolean;
}) {
  const prob = probabilidad(pregunta);
  const positivo = prob >= 50;
  const apostado = pregunta.misSi + pregunta.misNo;
  const cerrada = pregunta.resultado !== null;

  const btnBase =
    "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[14px] font-normal transition-colors disabled:opacity-40";

  return (
    <article className="border-b border-linea py-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[19px] font-medium leading-snug text-ink">{pregunta.titulo}</h2>
        <span
          className={`font-mono text-[30px] leading-none tabular-nums ${
            positivo ? "text-verde" : "text-rojo"
          }`}
        >
          {prob}
        </span>
      </div>

      <EscalaPuntos si={pregunta.poolSi} no={pregunta.poolNo} />

      {cerrada ? (
        <p className="mt-3 font-mono text-[12px] uppercase tracking-widest text-sutil">
          Resuelta · {pregunta.resultado ? "entró" : "no entró"}
        </p>
      ) : (
        <>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onApostar("no")}
              disabled={bloqueado}
              style={helvetica}
              className={`${btnBase} ${
                pregunta.misNo > 0
                  ? "border-rojo bg-rojo text-white"
                  : "border-borde bg-white text-ink hover:border-ink/30"
              }`}
            >
              <span>NO</span>
            </button>
            <button
              onClick={() => onApostar("si")}
              disabled={bloqueado}
              style={helvetica}
              className={`${btnBase} ${
                pregunta.misSi > 0
                  ? "border-verde bg-verde text-white"
                  : "border-borde bg-white text-ink hover:border-ink/30"
              }`}
            >
              <span>SÍ</span>
            </button>
          </div>

          {apostado > 0 && (
            <button
              onClick={onRetirar}
              style={helvetica}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-borde bg-transparent py-2 font-mono text-[12px] uppercase tracking-widest text-sutil transition-colors hover:text-ink"
            >
              Retirar <Moneda /> {apostado}
            </button>
          )}
        </>
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
    <div className="flex flex-wrap gap-2 pt-4">
      {asignaturas.map((a) => (
        <button
          key={a.id}
          onClick={() => setAsigActiva(a.id)}
          style={helvetica}
          className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-normal transition-colors ${
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
  onCrear: (titulo: string, asignaturaId: string) => boolean;
}) {
  const [titulo, setTitulo] = useState("");
  const [asigId, setAsigId] = useState(asigInicial);
  const [error, setError] = useState<string | null>(null);

  const enviar = () => {
    if (!titulo.trim()) {
      setError("Escribe un enunciado para la pregunta");
      return;
    }
    if (!asigId) {
      setError("Elige una asignatura");
      return;
    }
    const ok = onCrear(titulo, asigId);
    if (!ok) {
      setError("No se pudo publicar. Prueba de nuevo.");
      return;
    }
    onCerrar();
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
          placeholder="¿Entra la demostración de X en el examen?"
          className="mt-3 w-full rounded-lg border border-borde bg-white px-3 py-2.5 text-[14px] text-ink outline-none focus:border-ink/40"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {asignaturas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAsigId(a.id)}
              style={helvetica}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-normal transition-colors ${
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
            style={helvetica}
            className="flex-1 rounded-full border border-borde bg-white py-2.5 text-[13px] text-ink transition-colors hover:border-ink/30"
          >
            Cancelar
          </button>
          <button
            onClick={enviar}
            style={helvetica}
            className="flex-1 rounded-full bg-ink py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
}

export function MarketPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const [filtroPreguntas, setFiltroPreguntas] = useState<FiltroPreguntas>("feed");
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

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
          onClick={async () => setError(await entrarConGoogle())}
          style={helvetica}
          className="mt-8 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
        >
          Entrar con Google
        </button>
        {error && <p className="mt-3 text-[12px] text-rojo">{error}</p>}
      </main>
    );
  }

  const abiertas = mercado.leerPreguntas({ asignaturaId: asigId, estado: "abiertas" });
  const archivadas = mercado.leerPreguntas({ asignaturaId: asigId, estado: "archivadas" });
  const preguntasVisibles = filtroPreguntas === "feed" ? abiertas : archivadas;

  return (
    <div className="min-h-screen bg-lienzo pb-28">
      <header className="fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-5">
          <button onClick={() => setFiltroPreguntas("feed")} className="text-[15px] font-semibold tracking-tight">
            Casandra
          </button>
          <div className="flex items-center gap-3">
            <Link to="/profile" className={mono}>
              Perfil
            </Link>
            {usuario.esAdmin && (
              <Link to={"/admin" as never} className={mono}>
                Admin
              </Link>
            )}
            <span className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-white">
              <Moneda />
              <span className="font-mono text-[13px] tabular-nums">{mercado.saldo}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-14">
        {mercado.pausado && (
          <p className="mt-4 rounded-lg border border-borde bg-white px-3 py-2 text-[12px] text-sutil">
            Tu cuenta está pausada por el administrador.
          </p>
        )}

        {!mercado.pausado && mercado.saldo < 1 && (
          <p className="mt-4 rounded-lg border border-borde bg-white px-3 py-2 text-[12px] text-sutil">
            Sin tokens. Retira alguna posición o espera a que se resuelva una pregunta.
          </p>
        )}

        <Hero mercado={mercado} />

        <ul className="mt-4 space-y-2 text-center text-[14px] font-normal leading-relaxed text-sutil">
          {mercado.leerApuestas().map((a) => (
            <li key={a.id} className="mx-auto max-w-[32rem]">
              <span className="rounded-full px-1.5 py-0.5 text-ink [text-shadow:0_0_10px_rgba(245,193,59,0.55)]">
                {a.usuario}
              </span>{" "}
              apostó{" "}
              <span className="inline-flex items-center gap-1 font-mono tabular-nums text-ink">
                <Moneda />
                {a.tokens}
              </span>{" "}
              {a.tokens === 1 ? "token" : "tokens"} {haceTexto(a.cuando)}
            </li>
          ))}
        </ul>

        <Asignaturas asignaturas={asignaturas} asigId={asigId} setAsigActiva={setAsigActiva} />

        {preguntasVisibles.map((p) => (
          <FilaPregunta
            key={p.id}
            pregunta={p}
            bloqueado={mercado.pausado || mercado.saldo < 1}
            onApostar={(lado) => mercado.apostar(p.id, lado)}
            onRetirar={() => mercado.retirar(p.id)}
          />
        ))}

        {preguntasVisibles.length === 0 && <p className={`mt-6 ${mono} text-sutil`}>sin preguntas aquí</p>}

        {filtroPreguntas === "feed" && (
          <button
            onClick={() => mercado.simular()}
            className={`mt-6 ${mono} text-sutil transition-colors hover:text-ink`}
          >
            simular apuesta de otro alumno →
          </button>
        )}

        <button
          onClick={() => setFiltroPreguntas(filtroPreguntas === "feed" ? "archivadas" : "feed")}
          style={helvetica}
          className={`mt-8 w-full rounded-full border border-linea py-3 text-[13px] font-normal tracking-normal text-ink transition-colors hover:bg-white`}
        >
          {filtroPreguntas === "feed" ? "Archivadas" : "Abiertas"}
        </button>
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
          onCrear={(titulo, asignaturaId) => !!mercado.crearPregunta(titulo, asignaturaId)}
        />
      )}
    </div>
  );
}