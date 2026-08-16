import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSesion } from "@/hooks/useSesion";
import { nombreVisible, probabilidad, useMercado, volumen } from "@/hooks/useMercado";

const mono = "font-mono text-[11px] uppercase tracking-widest";

type VistaAdmin = "preguntas" | "archivado" | "usuarios" | "asignaturas";

function Moneda({ className = "" }: { className?: string }) {
  return <span className={`h-3.5 w-3.5 rounded-full bg-moneda ${className}`} />;
}

export function AdminPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const [vistaAdmin, setVistaAdmin] = useState<VistaAdmin>("preguntas");
  const [nuevaAsig, setNuevaAsig] = useState("");

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

  if (!usuario.esAdmin) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-lienzo px-6 text-center">
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

  const asignaturas = mercado.leerAsignaturas();

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
          <div className="flex gap-4 border-b border-linea pb-2.5">
            {(["preguntas", "archivado", "usuarios", "asignaturas"] as VistaAdmin[]).map((v) => (
              <button
                key={v}
                onClick={() => setVistaAdmin(v)}
                className={`${mono} ${vistaAdmin === v ? "text-ink" : "text-sutil"}`}
              >
                {v}
              </button>
            ))}
          </div>

          {vistaAdmin === "preguntas" &&
            mercado
              .leerPreguntas({ estado: "todas" })
              .filter((p) => !p.archivada)
              .map((p) => (
                <div key={p.id} className="border-b border-linea py-5">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-[14px] leading-snug">{p.titulo}</h2>
                    <span className="font-mono text-[18px] tabular-nums text-sutil">{probabilidad(p)}</span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-sutil">
                    vol {volumen(p)} · {p.resultado === null ? "abierta" : p.resultado ? "entró" : "no entró"}
                  </p>
                  <select
                    value={p.asignaturaId}
                    onChange={(e) => mercado.moverPregunta(p.id, e.target.value)}
                    className="mt-2 w-full rounded-lg border border-borde bg-white px-2 py-1.5 text-[12px]"
                  >
                    {asignaturas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {p.resultado === null ? (
                      <>
                        <button
                          onClick={() => mercado.resolver(p.id, true)}
                          className="flex-1 rounded-lg border border-borde bg-white py-2 text-[13px] hover:border-verde hover:text-verde"
                        >
                          Entró
                        </button>
                        <button
                          onClick={() => mercado.resolver(p.id, false)}
                          className="flex-1 rounded-lg border border-borde bg-white py-2 text-[13px] hover:border-rojo hover:text-rojo"
                        >
                          No entró
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => mercado.desresolver(p.id)}
                          className="flex-1 rounded-lg border border-borde bg-white py-2 text-[13px] hover:border-ink"
                        >
                          Desresolver
                        </button>
                        <button
                          onClick={() => mercado.archivar(p.id, true)}
                          className="flex-1 rounded-lg border border-borde bg-white py-2 text-[13px] hover:border-ink"
                        >
                          Archivar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        const t = window.prompt("Nuevo título", p.titulo);
                        if (t) mercado.editarTitulo(p.id, t);
                      }}
                      className="rounded-lg border border-borde bg-white px-3 py-2 text-[13px]"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => mercado.eliminarPregunta(p.id)}
                      className="rounded-lg border border-borde bg-white px-3 py-2 text-[13px] text-rojo"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}

          {vistaAdmin === "archivado" && (
            <>
              {mercado.leerPreguntas({ estado: "archivadas" }).map((p) => (
                <div key={p.id} className="border-b border-linea py-4">
                  <h2 className="text-[14px] leading-snug text-sutil">{p.titulo}</h2>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => mercado.archivar(p.id, false)}
                      className="flex-1 rounded-lg border border-borde bg-white py-2 text-[13px]"
                    >
                      Desarchivar
                    </button>
                    <button
                      onClick={() => mercado.desresolver(p.id)}
                      className="flex-1 rounded-lg border border-borde bg-white py-2 text-[13px]"
                    >
                      Desresolver
                    </button>
                    <button
                      onClick={() => mercado.eliminarPregunta(p.id)}
                      className="rounded-lg border border-borde bg-white px-3 py-2 text-[13px] text-rojo"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {mercado.leerPreguntas({ estado: "archivadas" }).length === 0 && (
                <p className={`mt-5 ${mono} text-sutil`}>archivo vacío</p>
              )}
            </>
          )}

          {vistaAdmin === "usuarios" &&
            mercado.leerAlumnos().map((a) => (
              <div key={a.id} className="flex items-center gap-3 border-b border-linea py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px]">{nombreVisible(a)}</p>
                  <p className="font-mono text-[11px] text-sutil">
                    {a.saldo} tokens {a.pausado && "· pausado"}
                  </p>
                </div>
                <button
                  onClick={() => mercado.darTokens(a.id, -1)}
                  className="h-8 w-8 rounded-lg border border-borde bg-white text-[14px]"
                >
                  −
                </button>
                <button
                  onClick={() => mercado.darTokens(a.id, 1)}
                  className="h-8 w-8 rounded-lg border border-borde bg-white text-[14px]"
                >
                  +
                </button>
                <button
                  onClick={() => mercado.pausarAlumno(a.id, !a.pausado)}
                  className={`rounded-lg border px-2.5 py-1.5 text-[12px] ${
                    a.pausado ? "border-ink bg-ink text-white" : "border-borde bg-white"
                  }`}
                >
                  {a.pausado ? "Reanudar" : "Pausar"}
                </button>
              </div>
            ))}

          {vistaAdmin === "asignaturas" && (
            <>
              {asignaturas.map((a) => (
                <div key={a.id} className="flex items-center gap-2 border-b border-linea py-3.5">
                  <input
                    value={a.nombre}
                    onChange={(e) => mercado.renombrarAsignatura(a.id, e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
                  />
                  <button
                    onClick={() => mercado.eliminarAsignatura(a.id)}
                    className="rounded-lg border border-borde bg-white px-2.5 py-1.5 text-[12px] text-rojo"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (mercado.crearAsignatura(nuevaAsig)) setNuevaAsig("");
                }}
                className="mt-4 flex gap-2"
              >
                <input
                  value={nuevaAsig}
                  onChange={(e) => setNuevaAsig(e.target.value)}
                  placeholder="Nueva asignatura"
                  className="min-w-0 flex-1 border-b border-borde bg-transparent pb-2 text-[14px] outline-none placeholder:text-sutil focus:border-ink"
                />
                <button type="submit" className="rounded-lg bg-ink px-3 py-1.5 text-[13px] text-white">
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
