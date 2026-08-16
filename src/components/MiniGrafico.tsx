interface Props {
  historial: number[];
  positivo: boolean;
  /** tokens totales apostados: engrosa la línea */
  volumen: number;
}

/**
 * Línea sin ejes/grid/marcadores, relleno degradado.
 * La variación se amplifica respecto al primer valor para hacerla legible.
 * El grosor de la línea es proporcional al volumen (con tope).
 */
export function MiniGrafico({ historial, positivo, volumen }: Props) {
  const W = 520;
  const H = 64;

  if (historial.length < 2) {
    return <div className="h-16" aria-hidden />;
  }

  const grosor = Math.min(6, 1.2 + volumen / 18);

  const base = historial[0]!;
  const AMP = 3.2;
  const rel = historial.map((v) => (v - base) * AMP);
  const min = Math.min(...rel);
  const max = Math.max(...rel);
  const span = Math.max(6, max - min);
  const pad = 8;

  const pts = rel.map((v, i) => {
    const x = (i / (rel.length - 1)) * W;
    const y = H - pad - ((v - min) / span) * (H - pad * 2);
    return [x, y] as const;
  });

  const linea = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${linea} L${W},${H} L0,${H} Z`;
  const color = positivo ? "var(--verde)" : "var(--rojo)";
  const gid = `g-${positivo ? "up" : "down"}`;

  return (
    <svg
      className="mt-2.5 block h-16 w-full"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={linea}
        fill="none"
        stroke={color}
        strokeWidth={grosor}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
