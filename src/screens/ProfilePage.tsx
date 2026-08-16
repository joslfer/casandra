import { Link } from "@tanstack/react-router";
import { useSesion } from "@/hooks/useSesion";
import { useMercado } from "@/hooks/useMercado";

const mono = "font-mono text-[11px] uppercase tracking-widest";

function Moneda({ className = "" }: { className?: string }) {
  return <span className={`h-3.5 w-3.5 rounded-full bg-moneda ${className}`} />;
}

export function ProfilePage() {
  const { usuario, cargando, entrarConGoogle, salir } = useSesion();
  const mercado = useMercado(usuario);

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
          onClick={entrarConGoogle}
          className="mt-8 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
        >
          Entrar con Google
        </button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-lienzo pb-28">
      <header className="fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-5">
          <Link to="/" className="text-[15px] font-semibold tracking-tight text-ink">
            ← Mercado
          </Link>
          <span className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-white">
            <Moneda />
            <span className="font-mono text-[13px] tabular-nums">{mercado.saldo}</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-14">
        <section className="pt-6">
          <p className={`${mono} text-sutil`}>Tu usuario</p>
          <label className="mt-4 block text-[12px] text-sutil">Nombre visible</label>
          <input
            value={mercado.perfil.nombre}
            onChange={(e) => mercado.guardarNombre(e.target.value)}
            disabled={mercado.perfil.usaHash}
            placeholder={usuario.nombre}
            className="mt-1 w-full border-b border-borde bg-transparent pb-2 text-[15px] outline-none placeholder:text-sutil focus:border-ink disabled:opacity-40"
          />
          <button
            onClick={() => mercado.usarHash(!mercado.perfil.usaHash)}
            className="mt-5 flex w-full items-center justify-between rounded-lg border border-borde bg-white px-3.5 py-3 text-left text-[13px]"
          >
            <span>Prefiero usuario hash</span>
            <span
              className={`h-4 w-4 rounded-full border ${
                mercado.perfil.usaHash ? "border-ink bg-ink" : "border-borde"
              }`}
            />
          </button>
          <p className="mt-3 font-mono text-[13px] text-sutil">
            Te ven como <span className="text-ink">{mercado.miNombre}</span>
          </p>
          <button onClick={() => salir()} className={`mt-8 ${mono} text-sutil hover:text-ink`}>
            cerrar sesión
          </button>
        </section>
      </main>
    </div>
  );
}