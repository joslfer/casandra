import {
  multiplicador,
  probabilidad,
  volumen,
  type Lado,
  type Pregunta,
} from "@/hooks/useMercado";
import { MiniGrafico } from "./MiniGrafico";

interface Props {
  pregunta: Pregunta;
  onApostar: (lado: Lado) => void;
  onRetirar: () => void;
  bloqueado?: boolean;
}

function fmtMult(n: number): string {
  return `× ${n.toFixed(2).replace(".", ",")}`;
}

export function FilaPregunta({ pregunta, onApostar, onRetirar, bloqueado }: Props) {
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
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-[26px] font-bold leading-none tabular-nums" style={{ color: "rgba(0,0,0,0.13)" }}>
            {vol}
          </span>
          <span
            className={`font-mono text-[30px] leading-none tabular-nums ${
              positivo ? "text-verde" : "text-rojo"
            }`}
          >
            {prob}
          </span>
        </div>
      </div>

      <MiniGrafico historial={pregunta.historial} positivo={positivo} volumen={vol} />

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
              {pregunta.misNo > 0 && (
                <span className="font-mono text-[12px] tabular-nums">{pregunta.misNo}</span>
              )}
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  pregunta.misNo > 0 ? "text-white/70" : "text-sutil"
                }`}
              >
                {fmtMult(multiplicador("no", pregunta))}
              </span>
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
              {pregunta.misSi > 0 && (
                <span className="font-mono text-[12px] tabular-nums">{pregunta.misSi}</span>
              )}
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  pregunta.misSi > 0 ? "text-white/70" : "text-sutil"
                }`}
              >
                {fmtMult(multiplicador("si", pregunta))}
              </span>
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
