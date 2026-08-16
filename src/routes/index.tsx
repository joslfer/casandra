import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSesion } from "@/hooks/useSesion";
import {
  haceTexto,
  nombreVisible,
  probabilidad,
  useMercado,
  volumen,
} from "@/hooks/useMercado";
import { FilaPregunta } from "@/components/FilaPregunta";
import { Hero } from "@/components/Hero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Casandra — mercado de predicción de exámenes" },
      {
        name: "description",
        content:
          "Apuesta tokens con tus compañeros a si una pregunta entra o no entra en el examen. Probabilidades en vivo.",
      },
      { property: "og:title", content: "Casandra — mercado de predicción de exámenes" },
      {
        property: "og:description",
        content: "Apuesta tokens a si una pregunta entra o no entra en el examen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Casandra,
});

function Moneda({ className = "" }: { className?: string }) {
  return <span className={`h-3.5 w-3.5 rounded-full bg-moneda ${className}`} />;
}

type Vista = "feed" | "resueltas" | "perfil" | "admin";
type VistaAdmin = "preguntas" | "archivado" | "usuarios" | "asignaturas";

const mono = "font-mono text-[11px] uppercase tracking-widest";

function Casandra() {
  const { usuario, cargando, entrarConGoogle, salir } = useSesion();
  const mercado = useMercado(usuario);
  const [vista, setVista] = useState<Vista>("feed");
  const [vistaAdmin, setVistaAdmin] = useState<VistaAdmin>("preguntas");
  const [abrirForm, setAbrirForm] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [nuevaAsig, setNuevaAsig] = useState("");

  const asignaturas = mercado.leerAsignaturas();
  const [asigActiva, setAsigActiva] = useState<string>("");
  const asigId = asigActiva || asignaturas[0]?.id || "";

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
          onClick={async () => setError(await entrarConGoogle())}
          className="mt-8 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
        >
          Entrar con Google
        </button>
        {error && <p className="mt-3 text-[12px] text-rojo">{error}</p>}
      </main>
    );
  }

  const abiertas = mercado.leerPreguntas({ asignaturaId: asigId, estado: "abiertas" });
  const resueltas = mercado.leerPreguntas({ asignaturaId: asigId, estado: "resueltas" });

  const Asignaturas = () => (
    <div className="flex gap-4 overflow-x-auto border-b border-linea pb-2.5 pt-4">
      {asignaturas.map((a) => (
        <button
          key={a.id}
          onClick={() => setAsigActiva(a.id)}
          className={`whitespace-nowrap text-[13px] transition-colors ${
            a.id === asigId ? "text-ink" : "text-sutil hover:text-ink"
          }`}
        >
          {a.nombre}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-lienzo pb-28">
      <header className="fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-5">
          <button onClick={() => setVista("feed")} className="text-[15px] font-semibold tracking-tight">
            Casandra
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVista(vista === "perfil" ? "feed" : "perfil")}
              className={`${mono} ${vista === "perfil" ? "text-ink" : "text-sutil"}`}
            >
              Perfil
            </button>
            {usuario.esAdmin && (
              <button
                onClick={() => setVista(vista === "admin" ? "feed" : "admin")}
                className={`${mono} ${vista === "admin" ? "text-ink" : "text-sutil"}`}
              >
                Admin
              </button>
            )}
            <span className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-white">
              <Moneda />
              <span className="font-mono text-[13px] tabular-nums">{mercado.saldo}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-14">
        {mercado.pausado && (
          <p className="mt-4 rounded-lg border border-borde bg-white px-3 py-2 text-[12px] text-sutil">
            Tu cuenta está pausada por el administrador.
          </p>
        )}

        {(vista === "feed" || vista === "resueltas") && (
          <>
            <Hero mercado={mercado} />

            <ul className="mt-4 space-y-1.5">
              {mercado.leerApuestas().map((a) => (
                <li key={a.id} className="text-[12px] text-sutil">
                  {a.usuario} apostó {a.tokens} {a.tokens === 1 ? "token" : "tokens"}{" "}
                  {haceTexto(a.cuando)}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex gap-4 border-b border-linea pb-2.5">
              <button
                onClick={() => setVista("feed")}
                className={`${mono} ${vista === "feed" ? "text-ink" : "text-sutil"}`}
              >
                Abiertas
              </button>
              <button
                onClick={() => setVista("resueltas")}
                className={`${mono} ${vista === "resueltas" ? "text-ink" : "text-sutil"}`}
              >
                Resueltas
              </button>
            </div>

            <Asignaturas />

            {(vista === "feed" ? abiertas : resueltas).map((p) => (
              <FilaPregunta
                key={p.id}
                pregunta={p}
                bloqueado={mercado.pausado}
                onApostar={(lado) => mercado.apostar(p.id, lado)}
                onRetirar={() => mercado.retirar(p.id)}
              />
            ))}

            {(vista === "feed" ? abiertas : resueltas).length === 0 && (
              <p className={`mt-6 ${mono} text-sutil`}>sin preguntas aquí</p>
            )}

            {vista === "feed" && (
              <button
                onClick={() => mercado.simular()}
                className={`mt-6 ${mono} text-sutil transition-colors hover:text-ink`}
              >
                simular apuesta de otro alumno →
              </button>
            )}
          </>
        )}

        {vista === "perfil" && (
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
        )}

        {vista === "admin" && usuario.esAdmin && (
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
                      <span className="font-mono text-[18px] tabular-nums text-sutil">
                        {probabilidad(p)}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-sutil">
                      vol {volumen(p)} ·{" "}
                      {p.resultado === null ? "abierta" : p.resultado ? "entró" : "no entró"}
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
        )}
      </main>

      {abrirForm && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-ink/20 p-5 sm:items-center"
          onClick={() => setAbrirForm(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              if (mercado.crearPregunta(texto, asigId)) {
                setTexto("");
                setAbrirForm(false);
              }
            }}
            className="w-full max-w-[520px] rounded-xl bg-lienzo p-5"
          >
            <textarea
              autoFocus
              rows={4}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="¿Entra…?"
              className="w-full resize-none rounded-lg border border-borde bg-white p-3 text-[15px] leading-relaxed outline-none placeholder:text-sutil focus:border-ink"
            />
            <select
              value={asigId}
              onChange={(e) => setAsigActiva(e.target.value)}
              className="mt-3 w-full rounded-lg border border-borde bg-white px-3 py-2 text-[13px]"
            >
              {asignaturas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="mt-3 w-full rounded-lg bg-ink py-2.5 text-[13px] font-medium text-white"
            >
              Crear pregunta
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setAbrirForm(true)}
        aria-label="Nueva pregunta"
        className="fixed bottom-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-xl font-light text-white shadow-sm transition-opacity hover:opacity-85"
      >
        +
      </button>
    </div>
  );
}
