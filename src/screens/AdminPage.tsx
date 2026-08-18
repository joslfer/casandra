import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSesion } from "@/hooks/useSesion";
import { useHaptic } from "@/hooks/useHaptic";
import { nombreVisible, probabilidad, useMercado, volumen } from "@/hooks/useMercado";

const mono = "font-mono text-[11px] uppercase tracking-widest";
const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

type VistaAdmin = "preguntas" | "archivado" | "usuarios" | "asignaturas";

function Moneda({ className = "" }: { className?: string }) {
  return <span className={`h-3.5 w-3.5 rounded-full bg-moneda ${className}`} />;
}

export function AdminPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const haptic = useHaptic();
  
  const [vistaAdmin, setVistaAdmin] = useState<VistaAdmin>("preguntas");
  const [nuevaAsig, setNuevaAsig] = useState("");

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

  if (!usuario.esAdmin) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-lienzo px-6 text-center" style={fuenteApple}>
        <h1 className="text-2xl font-semibold tracking-tight">Sin permisos</h1>
        <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-sutil">
          Esta sección es solo para administradores.
        </p>
        <Link
          to="/"
          className="mt-8 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
        >
          Volver al mercado
        </Link>
      </main>
    );
  }

  // Orden alfabético de asignaturas en el admin
  const asignaturas = [...mercado.leerAsignaturas()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

  return (
    <div className="min-h-screen bg-lienzo pb-28" style={fuenteApple}>
      <header 
        className="fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-5">
          <Link to="/" className="text-[15px] font-semibold tracking-tight text-ink touch-manipulation">
            ← Mercado
          </Link>
          <span className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-white">
            <Moneda />
            <span className="font-mono text-[13px] tabular-nums">{mercado.saldo}</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-[calc(3.5rem+env(safe-area-inset-top))]">
        <section className="pt-6">
          <div className="flex gap-4 border-b border-linea pb-2.5 overflow-x-auto scrollbar-hide">
            {(["preguntas", "archivado", "usuarios", "asignaturas"] as VistaAdmin[]).map((v) => (
              <button
                key={v}
                onClick={() => {
                  haptic();
                  setVistaAdmin(v);
                }}
                className={`${mono} touch-manipulation whitespace-nowrap ${vistaAdmin === v ? "text-ink font-semibold" : "text-sutil"}`}
              >
                {v}
              </button>
            ))}
          </div>

          {vistaAdmin === "preguntas" &&
            [...mercado.leerPreguntas({ estado: "todas" })]
              .filter((p) => !p.archivada)
              .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }))
              .map((p) => (
                <div key={p.id} className="border-b border-linea py-5">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-[14px] leading-snug font-medium text-ink">{p.titulo}</h2>
                    <span className="font-mono text-[18px] tabular-nums text-sutil shrink-0">{probabilidad(p)}%</span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-sutil">
                    vol {volumen(p)} · {p.resultado === null ? "abierta" : p.resultado ? "entró" : "no entró"}
                  </p>
                  <select
                    value={p.asignaturaId}
                    onChange={(e) => mercado.moverPregunta(p.id, e.target.value)}
                    style={{ fontSize: "16px" }} // Evita zoom en iOS al desplegar
                    className="mt-3 w-full rounded-lg border border-borde bg-white px-2 py-2 text-[16px] text-ink outline-none"
                  >
                    {asignaturas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.resultado === null ? (
                      <>
                        <button
                          onClick={() => { haptic(); mercado.resolver(p.id, true); }}
                          className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] transition-colors hover:border-verde hover:text-verde active:bg-black/5"
                        >
                          Entró
                        </button>
                        <button
                          onClick={() => { haptic(); mercado.resolver(p.id, false); }}
                          className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] transition-colors hover:border-rojo hover:text-rojo active:bg-black/5"
                        >
                          No entró
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { haptic(); mercado.desresolver(p.id); }}
                          className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] transition-colors hover:border-ink active:bg-black/5"
                        >
                          Desresolver
                        </button>
                        <button
                          onClick={() => { haptic(); mercado.archivar(p.id, true); }}
                          className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] transition-colors hover:border-ink active:bg-black/5"
                        >
                          Archivar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        haptic();
                        const t = window.prompt("Nuevo título", p.titulo);
                        if (t) mercado.editarTitulo(p.id, t);
                      }}
                      className="touch-manipulation rounded-lg border border-borde bg-white px-3 py-2 text-[13px] active:bg-black/5"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        haptic();
                        if (window.confirm(`¿Seguro que quieres eliminar la pregunta "${p.titulo}"?`)) {
                          mercado.eliminarPregunta(p.id);
                        }
                      }}
                      className="touch-manipulation rounded-lg border border-borde bg-white px-3 py-2 text-[13px] text-rojo active:bg-rojo/10"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}

          {vistaAdmin === "archivado" && (
            <>
              {[...mercado.leerPreguntas({ estado: "archivadas" })]
                .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }))
                .map((p) => (
                <div key={p.id} className="border-b border-linea py-4">
                  <h2 className="text-[14px] leading-snug text-sutil">{p.titulo}</h2>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => { haptic(); mercado.archivar(p.id, false); }}
                      className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] active:bg-black/5"
                    >
                      Desarchivar
                    </button>
                    <button
                      onClick={() => { haptic(); mercado.desresolver(p.id); }}
                      className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] active:bg-black/5"
                    >
                      Desresolver
                    </button>
                    <button
                      onClick={() => {
                        haptic();
                        if (window.confirm(`¿Seguro que quieres eliminar permanentemente la pregunta "${p.titulo}"?`)) {
                          mercado.eliminarPregunta(p.id);
                        }
                      }}
                      className="touch-manipulation rounded-lg border border-borde bg-white px-3 py-2 text-[13px] text-rojo active:bg-rojo/10"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {mercado.leerPreguntas({ estado: "archivadas" }).length === 0 && (
                <p className={`mt-5 ${mono} text-sutil text-center`}>archivo vacío</p>
              )}
            </>
          )}

          {vistaAdmin === "usuarios" &&
            [...mercado.leerAlumnos()]
              .sort((a, b) => nombreVisible(a).localeCompare(nombreVisible(b), 'es', { sensitivity: 'base' }))
              .map((a) => (
              <div key={a.id} className="flex items-center gap-2 border-b border-linea py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-ink">{nombreVisible(a)}</p>
                  <p className="font-mono text-[11px] text-sutil">
                    {a.saldo} tokens {a.pausado && "· pausado"}
                  </p>
                </div>
                <button
                  onClick={() => { haptic(); mercado.darTokens(a.id, -20); }}
                  className="h-8 px-2 shrink-0 touch-manipulation rounded-lg border border-borde bg-white text-[11px] font-mono text-rojo active:bg-black/5"
                >
                  −20
                </button>
                <button
                  onClick={() => { haptic(); mercado.darTokens(a.id, -1); }}
                  className="h-8 w-8 shrink-0 touch-manipulation rounded-lg border border-borde bg-white text-[14px] active:bg-black/5"
                >
                  −
                </button>
                <button
                  onClick={() => { haptic(); mercado.darTokens(a.id, 1); }}
                  className="h-8 w-8 shrink-0 touch-manipulation rounded-lg border border-borde bg-white text-[14px] active:bg-black/5"
                >
                  +
                </button>
                <button
                  onClick={() => { haptic(); mercado.pausarAlumno(a.id, !a.pausado); }}
                  className={`shrink-0 touch-manipulation rounded-lg border px-3 py-1.5 text-[12px] transition-colors ${
                    a.pausado ? "border-ink bg-ink text-white" : "border-borde bg-white text-ink hover:border-ink/30"
                  }`}
                >
                  {a.pausado ? "Reanudar" : "Pausar"}
                </button>
              </div>
            ))}

          {vistaAdmin === "asignaturas" && (
            <>
              {asignaturas.map((a) => (
                <div key={a.id} className="flex items-center gap-3 border-b border-linea py-3.5">
                  <input
                    value={a.nombre}
                    onChange={(e) => mercado.renombrarAsignatura(a.id, e.target.value)}
                    style={{ fontSize: "16px" }} // Evita zoom en iOS Safari
                    className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none focus:border-b focus:border-ink/30"
                  />
                  <button
                    onClick={() => {
                      haptic();
                      if (window.confirm(`¿Seguro que quieres eliminar la asignatura "${a.nombre}"?`)) {
                        mercado.eliminarAsignatura(a.id);
                      }
                    }}
                    className="shrink-0 touch-manipulation rounded-lg border border-borde bg-white px-3 py-1.5 text-[12px] text-rojo active:bg-rojo/10"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!nuevaAsig.trim()) return;
                  try {
                    haptic();
                    await mercado.crearAsignatura(nuevaAsig);
                    setNuevaAsig("");
                  } catch (error) {
                    console.error("Error al crear asignatura:", error);
                  }
                }}
                className="mt-5 flex gap-3"
              >
                <input
                  value={nuevaAsig}
                  onChange={(e) => setNuevaAsig(e.target.value)}
                  placeholder="Nueva asignatura..."
                  style={{ fontSize: "16px" }} // Evita zoom en iOS Safari
                  className="min-w-0 flex-1 border-b border-borde bg-transparent pb-2 text-[16px] text-ink outline-none placeholder:text-sutil focus:border-ink"
                />
                <button 
                  type="submit" 
                  disabled={!nuevaAsig.trim()}
                  className="shrink-0 touch-manipulation rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-white transition-opacity active:opacity-70 disabled:opacity-50"
                >
                  Añadir
                </button>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}