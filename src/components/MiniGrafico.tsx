interface Props {
  historial: number[];
}

/**
 * Indicador horizontal de proporción SÍ / NO.
 * Usa la probabilidad actual para mostrar dos segmentos con contraste.
 */
export function MiniGrafico({ historial }: Props) {
  const proporcionSi = Math.max(0, Math.min(100, historial[historial.length - 1] ?? 50));
  const proporcionNo = 100 - proporcionSi;

  if (historial.length === 0) {
    return <div className="mt-2.5 h-8" aria-hidden />;
  }

  return (
    <div className="mt-2.5 space-y-1.5" aria-hidden>
      <div className="h-2.5 overflow-hidden rounded-full bg-linea">
        <div className="flex h-full w-full">
          <div
            className="h-full bg-verde"
            style={{ width: `${proporcionSi}%` }}
          />
          <div
            className="h-full bg-rojo"
            style={{ width: `${proporcionNo}%` }}
          />
        </div>
      </div>
    </div>
  );
}
