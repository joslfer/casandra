import type { Mercado } from "@/hooks/useMercado";

export function Hero({ mercado }: { mercado: Mercado }) {
  const { nombres } = mercado.resumen();

  return (
    <section className="relative mt-5 border-b border-linea pb-4">
      {nombres.length > 0 && (
        <p className="mt-3 truncate text-[11.5px] text-sutil">
          {nombres.join(" · ")}
        </p>
      )}
    </section>
  );
}
