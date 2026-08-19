import { Link } from "@tanstack/react-router";
import { useSesion } from "@/hooks/useSesion";
import { useMercado } from "@/hooks/useMercado";

const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

export function ProfilePage() {
  const { usuario, cargando, entrarConGoogle, salir } = useSesion();
  const mercado = useMercado(usuario);

  if (cargando) {
    return <div className="min-h-screen bg-lienzo" />;
  }

  if (!usuario) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-lienzo px-6" style={fuenteApple}>
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
    <div className="min-h-screen bg-lienzo pb-28" style={fuenteApple}>
      <header 
        className="fixed inset-x-0 top-0 z-20 bg-lienzo/95 backdrop-blur" 
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-14 max-w-[520px] items-center px-5">
          <Link 
            to="/" 
            className="flex items-center text-[15px] font-medium tracking-tight text-ink transition-opacity hover:opacity-70 active:opacity-40"
          >
            ← Volver al mercado
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-24">
        <h1 className="mb-2 text-[28px] font-bold tracking-tight text-ink">Perfil</h1>
        
        {/* --- ESPACIO PARA TU TEXTO LIBRE --- */}
        <div className="mb-6 text-[14px] leading-relaxed text-ink">
          <p>
        El objetivo de este mercado es agregar información sumando muchas opiniones distintas. Apuesta pensando por tu cuenta. Cuanto más pensamiento individual mejor.
        </p>
        </div>
        {/* ----------------------------------- */}
        
        <section className="overflow-hidden rounded-xl border border-borde bg-white shadow-sm">
          {/* Campo Nombre */}
          <div className="flex items-center justify-between border-b border-linea p-4">
            <label className="text-[15px] font-medium text-ink">Nombre</label>
            <input
              value={mercado.perfil.nombre}
              onChange={(e) => mercado.guardarNombre(e.target.value)}
              disabled={mercado.perfil.usaHash}
              placeholder={usuario.nombre}
              className="w-1/2 bg-transparent text-right text-[15px] text-sutil outline-none placeholder:text-sutil/50 focus:text-ink disabled:opacity-40"
            />
          </div>

          {/* Switch Modo Anónimo */}
          <div className="flex items-center justify-between p-4">
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-ink">Sin nombre de usuario (recomendado)</span>
              <span className="mt-0.5 text-[12px] text-sutil">Ocultar tu nombre a los demás</span>
            </div>
            
            <button
              onClick={() => mercado.usarHash(!mercado.perfil.usaHash)}
              className={`relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                mercado.perfil.usaHash ? "bg-verde" : "bg-black/10"
              }`}
              role="switch"
              aria-checked={mercado.perfil.usaHash}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  mercado.perfil.usaHash ? "translate-x-[20px]" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>

        <p className="mt-4 px-2 text-[13px] text-sutil">
          En el ranking te ven como <span className="font-semibold text-ink">{mercado.miNombre}</span>.
        </p>

        {/* Botón de Logout */}
        <button 
          onClick={() => salir()} 
          className="mt-10 flex w-full touch-manipulation items-center justify-center rounded-xl bg-rojo/10 px-4 py-3.5 text-[15px] font-semibold text-rojo transition-colors active:bg-rojo/20"
        >
          Cerrar sesión
        </button>
      </main>
    </div>
  );
}