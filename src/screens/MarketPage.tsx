import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSesion } from "@/hooks/useSesion";
import {
  haceTexto,
  probabilidad,
  useMercado,
  volumen,
  type Lado,
  type Pregunta,
  type Mercado,
} from "@/hooks/useMercado";

function Moneda({ className = "" }: { className?: string }) {
  return <span className={`h-3.5 w-3.5 rounded-full bg-moneda ${className}`} />;
}

type FiltroPreguntas = "feed" | "archivadas";

const mono = "font-mono text-[11px] uppercase tracking-widest";

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

function MiniGrafico({ historial }: { historial: number[] }) {
  const proporcionSi = Math.max(0, Math.min(100, historial[historial.length - 1] ?? 50));
  const proporcionNo = 100 - proporcionSi;

  if (historial.length === 0) {
    return <div className="mt-2.5 h-8" aria-hidden />;
  }

  return (
    <div className="mt-2.5 space-y-1.5" aria-hidden>
      <div className="h-2.5 overflow-hidden rounded-full bg-linea">
        <div className="flex h-full w-full">
          <div className="h-full bg-verde" style={{ width: `${proporcionSi}%` }} />
          <div className="h-full bg-rojo" style={{ width: `${proporcionNo}%` }} />
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
  const vol = volumen(pregunta);

  const btnBase =
    "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[14px] font-normal transition-colors disabled:opacity-40";
  const helvetica = { fontFamily: "Helvetica, Arial, sans-serif" };

  return (
    <article className="border-b border-linea py-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[15px] leading-snug text-ink">{pregunta.titulo}</h2>
        <span
          className={`font-mono text-[30px] leading-none tabular-nums ${
            positivo ? "text-verde" : "text-rojo"
          }`}
        >
          {prob}
        </span>
      </div>

      <MiniGrafico historial={pregunta.historial} />

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
              className="mt-2 w-full rounded-lg border border-borde bg-transparent py-2 font-mono text-[12px] uppercase tracking-widest text-sutil transition-colors hover:text-ink"
            >
              Retirar {apostado}
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
    <div className="flex gap-4 overflow-x-auto border-b border-linea pb-2.5 pt-4">
      {asignaturas.map((a) => (
        <button
          key={a.id}
          onClick={() => setAsigActiva(a.id)}
          className={`whitespace-nowrap text-[13px] transition-colors ${
            a.id === asigId ? "text-ink" : "text-sutil hover:text-ink"
          }`}
        >
          {a.nombre}
        </button>
      ))}
    </div>
  );
}

export function MarketPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const [filtroPreguntas, setFiltroPreguntas] = useState<FiltroPreguntas>("feed");
  const [error, setError] = useState<string | null>(null);

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

        <Hero mercado={mercado} />

        <ul className="mt-4 space-y-2 text-center text-[14px] font-normal leading-relaxed text-sutil">
          {mercado.leerApuestas().map((a) => (
            <li key={a.id} className="mx-auto max-w-[32rem]">
              <span className="rounded-full px-1.5 py-0.5 text-ink [text-shadow:0_0_10px_rgba(245,193,59,0.55)]">
                {a.usuario}
              </span>{" "}
              apostó {a.tokens} {a.tokens === 1 ? "token" : "tokens"} {haceTexto(a.cuando)}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex gap-4 border-b border-linea pb-2.5">
          <button
            onClick={() => setFiltroPreguntas("feed")}
            className={`${mono} ${filtroPreguntas === "feed" ? "text-ink" : "text-sutil"}`}
          >
            Abiertas
          </button>
        </div>

        <Asignaturas asignaturas={asignaturas} asigId={asigId} setAsigActiva={setAsigActiva} />

        {preguntasVisibles.map((p) => (
          <FilaPregunta
            key={p.id}
            pregunta={p}
            bloqueado={mercado.pausado}
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
          className={`mt-8 w-full rounded-full border border-linea py-3 text-[13px] font-normal tracking-normal text-ink transition-colors hover:bg-white`}
        >
          {filtroPreguntas === "feed" ? "Archivadas" : "Abiertas"}
        </button>
      </main>
    </div>
  );
}
