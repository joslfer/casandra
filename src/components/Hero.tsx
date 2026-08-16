import type { Mercado } from "@/hooks/useMercado";

function Cofre() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="cofreT" x1="0" y1="0" x2="0" y2="1">

          <stop offset="0%" stopColor="#f7dd9a" />
          <stop offset="100%" stopColor="#d9a83f" />
        </linearGradient>
        <linearGradient id="cofreB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0b256" />
          <stop offset="100%" stopColor="#a97722" />
        </linearGradient>
      </defs>
      <path
        d="M10 24a22 22 0 0 1 44 0v4H10v-4Z"
        fill="url(#cofreT)"
        stroke="#8a5713"
        strokeWidth="2"
      />
      <rect x="10" y="28" width="44" height="26" rx="4" fill="url(#cofreB)" stroke="#8a5713" strokeWidth="2" />
      <path d="M10 36h44" stroke="#8a5713" strokeWidth="2" />
      <rect x="27" y="30" width="10" height="14" rx="2" fill="#f7e9c6" stroke="#8a5713" strokeWidth="2" />
      <circle cx="32" cy="37" r="1.8" fill="#8a5713" />
      <path d="M32 38.5v3" stroke="#8a5713" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 24v4M44 24v4" stroke="#8a5713" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export function Hero({ mercado }: { mercado: Mercado }) {
  const { ganar, perder, nombres } = mercado.resumen();

  return (
    <section
      className="relative mt-5 overflow-hidden rounded-[20px] border p-5"
      style={{
        background: "linear-gradient(150deg, #f7e9c6 0%, #edd18a 100%)",
        borderColor: "#e3c581",
      }}
    >
      <span
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,165,36,0.22) 0%, rgba(245,165,36,0) 70%)",
        }}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p
            className="text-[11px] font-medium uppercase"
            style={{ color: "#a8873f", letterSpacing: "0.18em" }}
          >
            Tu predicción
          </p>
          <p className="mt-1.5 flex items-baseline gap-2">
            <span
              className="font-mono text-[42px] font-bold leading-none tabular-nums"
              style={{ color: "#8a5713" }}
            >
              {mercado.saldo}
            </span>
            <span className="text-[12px]" style={{ color: "#a8873f" }}>
              tokens
            </span>
          </p>
        </div>
        <Cofre />
      </div>

      <div className="relative mt-5 flex gap-2.5">
        {[
          { etiqueta: "Podrías perder", signo: "−", valor: perder },
          { etiqueta: "Podrías ganar", signo: "+", valor: ganar },
        ].map((p) => (
          <div
            key={p.etiqueta}
            className="flex-1 rounded-xl border bg-white/55 px-3.5 py-2.5"
            style={{ borderColor: "#e3c581" }}
          >
            <p className="text-[11px]" style={{ color: "#a8873f" }}>
              {p.etiqueta}
            </p>
            <p className="mt-1 font-mono text-[20px] tabular-nums" style={{ color: "#3a2f16" }}>
              <span style={{ color: "#a8873f" }}>{p.signo}</span>
              {p.valor}
            </p>
          </div>
        ))}
      </div>

      {nombres.length > 0 && (
        <p
          className="relative mt-3.5 truncate text-[11.5px]"
          style={{ color: "#a8873f" }}
        >
          {nombres.join(" · ")}
        </p>
      )}
    </section>
  );
}
