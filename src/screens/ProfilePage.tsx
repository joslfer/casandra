import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSesion } from "@/hooks/useSesion";
import { useMercado } from "@/hooks/useMercado";
import { PantallaLogin } from "@/components/PantallaLogin";
import { LoaderApp } from "@/components/LoaderApp"; // <-- Importamos tu loader

const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

export function ProfilePage() {
  const { usuario, cargando, entrarConGoogle, salir } = useSesion();
  const mercado = useMercado(usuario);

  // Estado local para que escribir vaya perfecto sin lag
  const [nombreLocal, setNombreLocal] = useState("");

  // Sincronizamos el estado local con el real cuando carga la página
  useEffect(() => {
    if (mercado.perfil?.nombre) {
      setNombreLocal(mercado.perfil.nombre);
    }
  }, [mercado.perfil?.nombre]);

  // -----------------------------------------------------
  // BLOQUEO DEL SWIPE-TO-GO-BACK DE IOS
  // -----------------------------------------------------
  useEffect(() => {
    const bloquearSwipeIOS = (e: TouchEvent) => {
      // Si el toque empieza en los primeros 25 píxeles del borde izquierdo
      if (e.touches[0].clientX < 25) {
        e.preventDefault();
      }
    };
    
    // Necesitamos { passive: false } para que preventDefault() funcione
    document.addEventListener("touchstart", bloquearSwipeIOS, { passive: false });
    
    return () => {
      document.removeEventListener("touchstart", bloquearSwipeIOS);
    };
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen bg-lienzo flex items-center justify-center">
        <LoaderApp />
      </div>
    );
  }

  if (!usuario) {
    return <PantallaLogin entrarConGoogle={entrarConGoogle} />;
  }

  // Si el perfil no ha cargado aún, también mostramos el loader
  if (!mercado.perfilCargado) {
    return (
      <div className="min-h-screen bg-lienzo flex items-center justify-center">
        <LoaderApp />
      </div>
    );
  }

  // Función que guarda de verdad solo cuando salimos del input (onBlur)
  const guardarSiCambio = () => {
    if (nombreLocal !== mercado.perfil.nombre) {
      mercado.guardarNombre(nombreLocal);
    }
  };

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

      <main className="mx-auto max-w-[520px] px-5 pt-[calc(4.5rem+env(safe-area-inset-top))]">
        <h1 className="mb-2 text-[28px] font-bold tracking-tight text-ink">Perfil</h1>
        
        <div className="mb-6 text-[14px] leading-relaxed text-ink">
          <p>
            El objetivo de este mercado es agregar información sumando muchas opiniones distintas. Apuesta pensando por tu cuenta. Cuanto más pensamiento individual mejor.
          </p>
        </div>
        
        <section className="overflow-hidden rounded-xl border border-borde bg-white shadow-sm">
          
          {/* Campo Nombre: Ahora con diseño de "caja editable" e icono de lápiz */}
          <div className="flex flex-col border-b border-linea p-4">
            <label className="text-[14px] font-medium text-sutil">
              Nombre (recomendado)
            </label>
            <div className="relative mt-2">
              <input
                value={nombreLocal}
                onChange={(e) => setNombreLocal(e.target.value)}
                onBlur={guardarSiCambio}
                disabled={mercado.perfil.usaHash}
                placeholder={usuario.nombre}
                className="w-full rounded-lg border border-borde bg-black/5 px-3 py-2 pr-10 text-[22px] font-semibold text-ink outline-none transition-colors placeholder:text-sutil/40 focus:border-ink/30 focus:bg-white disabled:border-transparent disabled:bg-transparent disabled:opacity-40"
              />
              {/* Icono de Lápiz */}
              {!mercado.perfil.usaHash && (
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sutil/60">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Switch Modo Anónimo */}
          <div className="flex items-center justify-between p-4">
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-ink">Sin nombre de usuario</span>
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

          {/* Selector de Clase */}
          <div className="flex flex-col border-t border-linea p-4">
            <label className="text-[14px] font-medium text-sutil">
              Grado / Clase
            </label>
            <div className="relative mt-2">
              <select
                value={mercado.perfil.claseId || ""}
                onChange={(e) => mercado.elegirClase(e.target.value)}
                className="w-full appearance-none rounded-lg border border-borde bg-black/5 px-3 py-2.5 pr-10 text-[16px] font-medium text-ink outline-none transition-colors focus:border-ink/30 focus:bg-white active:bg-black/5"
              >
                <option value="" disabled>Selecciona tu clase...</option>
                {mercado.leerClases().map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {/* Icono de flecha para el select */}
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sutil/60">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </div>
            </div>
            <p className="mt-2 text-[12px] text-sutil">
              Cambiar de clase ocultará tus asignaturas actuales y mostrará las nuevas.
            </p>
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

        {/* Aviso de borrado de datos */}
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-borde bg-black/5 p-4">
          <svg className="mt-0.5 h-[18px] w-[18px] shrink-0 text-sutil" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
          <p className="text-[13px] leading-relaxed text-sutil">
            Para eliminar los datos, consultarme.
          </p>
        </div>

      </main>
    </div>
  );
}