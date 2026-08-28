import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSesion } from "@/hooks/useSesion";
import { useHaptic } from "@/hooks/useHaptic";
import { nombreVisible, premio, probabilidad, useMercado, volumen, type ApuestaDetalle, type Pregunta } from "@/hooks/useMercado";
import { PantallaLogin } from "@/components/PantallaLogin";
import { PantallaSeleccionClase } from "@/components/PantallaSeleccionClase";
import { LoaderApp } from "@/components/LoaderApp";

const mono = "font-mono text-[11px] uppercase tracking-widest";
const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

type VistaAdmin = "preguntas" | "archivado" | "usuarios" | "asignaturas";
const FILTRO_TODAS = "todas" as const;

function aValorInputLocal(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const haptic = useHaptic();
  
  const [vistaAdmin, setVistaAdmin] = useState<VistaAdmin>("preguntas");
  const [claseFiltroId, setClaseFiltroId] = useState<string>(FILTRO_TODAS);
  const [nuevaAsig, setNuevaAsig] = useState("");
  const [nuevaAsigClase, setNuevaAsigClase] = useState("");
  const [nuevaClase, setNuevaClase] = useState("");
  const [modalResolucion, setModalResolucion] = useState<{ pregunta: Pregunta; resultado: boolean } | null>(null);

  const [detalleApuestas, setDetalleApuestas] = useState<ApuestaDetalle[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    if (!modalResolucion) {
      setDetalleApuestas([]);
      return;
    }
    let cancelado = false;
    setCargandoDetalle(true);
    mercado.leerApuestasDePregunta(modalResolucion.pregunta.id).then((detalle) => {
      if (!cancelado) {
        setDetalleApuestas(detalle);
        setCargandoDetalle(false);
      }
    });
    return () => { cancelado = true; };
  }, [modalResolucion?.pregunta.id]);

  useEffect(() => {
    if (claseFiltroId !== FILTRO_TODAS) setNuevaAsigClase(claseFiltroId);
  }, [claseFiltroId]);

  if (cargando || !mercado.perfilCargado) {
    return (
      <div className="min-h-screen bg-lienzo flex items-center justify-center">
        <LoaderApp />
      </div>
    );
  }

  if (!usuario) {
    return <PantallaLogin entrarConGoogle={entrarConGoogle} />;
  }

  const esAdmin = !!usuario.esAdmin;
  const esMod = !!(mercado.perfil as any).mod;
  const tieneAccesoAdmin = esAdmin || esMod;

  if (!tieneAccesoAdmin) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-lienzo px-6 text-center" style={fuenteApple}>
        <h1 className="text-2xl font-semibold tracking-tight">Sin permisos</h1>
        <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-sutil">
          Esta sección es solo para administradores.
        </p>
        <Link to="/" className="mt-8 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85">
          Volver al mercado
        </Link>
      </main>
    );
  }

  if (!mercado.perfil.claseId) {
    return <PantallaSeleccionClase clases={mercado.leerClases()} onElegir={mercado.elegirClase} />;
  }

  const asignaturas = [...mercado.leerAsignaturas(true)].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  const clases = [...mercado.leerClases()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  const clasesFiltradas = claseFiltroId === FILTRO_TODAS ? clases : clases.filter((c) => c.id === claseFiltroId);
  const viendoTodas = claseFiltroId === FILTRO_TODAS;
  const claseIdDeAsignatura = (asignaturaId: string) => asignaturas.find((a) => a.id === asignaturaId)?.claseId;

  const confirmarResolucion = async () => {
    if (!modalResolucion) return;
    haptic();
    await mercado.resolver(modalResolucion.pregunta.id, modalResolucion.resultado);
    setModalResolucion(null);
  };

  return (
    <div className="min-h-screen bg-lienzo pb-28" style={fuenteApple}>
      <header className="fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-5">
          <Link to="/" className="text-[15px] font-semibold tracking-tight text-ink touch-manipulation">
            ← Mercado
          </Link>
          <span className={`${mono} text-sutil`}>{esAdmin ? "Panel Admin" : "Panel Moderador"}</span>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-[calc(4rem+env(safe-area-inset-top))]">
        <div className="mb-4 flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 border-b border-linea">
          <button
            onClick={() => { haptic(); setClaseFiltroId(FILTRO_TODAS); }}
            className={`shrink-0 touch-manipulation rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
              viendoTodas ? "bg-ink text-white" : "bg-black/5 text-ink hover:bg-black/10"
            }`}
          >
            Todos
          </button>
          {clases.map((c) => (
            <button
              key={c.id}
              onClick={() => { haptic(); setClaseFiltroId(c.id); }}
              className={`shrink-0 touch-manipulation rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                claseFiltroId === c.id ? "bg-ink text-white" : "bg-black/5 text-ink hover:bg-black/10"
              }`}
            >
              {c.nombre}
            </button>
          ))}
        </div>

        <div className="flex gap-6 border-b border-linea pb-2 mb-6 overflow-x-auto scrollbar-hide">
          {(["preguntas", "archivado", "usuarios", "asignaturas"] as VistaAdmin[]).map((v) => {
            // Si es moderador, ocultamos las pestañas de preguntas y archivado/usuarios si solo quieres que gestione exámenes, o las dejamos visibles según convenga. Aquí permitimos ver asignaturas siempre.
            if (!esAdmin && (v === "preguntas" || v === "archivado" || v === "usuarios")) return null;
            return (
              <button
                key={v}
                onClick={() => { haptic(); setVistaAdmin(v); }}
                className={`${mono} touch-manipulation whitespace-nowrap pb-1 border-b-2 transition-all ${
                  vistaAdmin === v ? "border-ink text-ink font-semibold" : "border-transparent text-sutil hover:text-ink"
                }`}
              >
                {v === "asignaturas" ? "Cursos y Exámenes" : v}
              </button>
            );
          })}
        </div>

        {/* VISTA: PREGUNTAS (Solo Admin) */}
        {vistaAdmin === "preguntas" && esAdmin && (() => {
          const preguntasActivas = [...mercado.leerPreguntas({ estado: "todas", todasAdmin: true })]
            .filter((p) => !p.archivada)
            .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }));

          const asigSinClase = asignaturas.filter(a => !clases.some(c => c.id === a.claseId));
          const huerfanas = preguntasActivas.filter(p => !asignaturas.some(a => a.id === p.asignaturaId));

          return (
            <div className="space-y-8">
              {clasesFiltradas.map((clase) => {
                const asignaturasClase = asignaturas.filter(a => a.claseId === clase.id);
                const asigIds = asignaturasClase.map(a => a.id);
                const preguntasClase = preguntasActivas.filter(p => asigIds.includes(p.asignaturaId));

                if (preguntasClase.length === 0) return null; 

                return (
                  <div key={clase.id} className="space-y-4">
                    <h2 className="text-[16px] font-bold tracking-tight text-ink border-l-2 border-ink pl-3 py-0.5">
                      {clase.nombre}
                    </h2>
                    
                    <div className="space-y-6 pl-2">
                      {asignaturasClase.map((asignatura) => {
                        const preguntasAsignatura = preguntasClase.filter(p => p.asignaturaId === asignatura.id);
                        if (preguntasAsignatura.length === 0) return null;

                        return (
                          <div key={asignatura.id} className="space-y-2">
                            <h3 className="font-mono text-[12px] font-bold uppercase tracking-wider text-sutil">
                              {asignatura.nombre}
                            </h3>
                            <div className="space-y-3">
                              {preguntasAsignatura.map((p) => (
                                <div key={p.id} className="rounded-xl border border-borde bg-white p-4 shadow-xs space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <h4 className="text-[14px] leading-snug font-medium text-ink">{p.titulo}</h4>
                                    <span className="font-mono text-[16px] tabular-nums text-sutil shrink-0">{probabilidad(p)}%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] font-mono text-sutil">
                                    <span>vol {volumen(p)} · {p.resultado === null ? "abierta" : p.resultado ? "entró" : "no entró"}</span>
                                    <select
                                      value={p.asignaturaId}
                                      onChange={(e) => mercado.moverPregunta(p.id, e.target.value)}
                                      className="rounded border border-borde bg-lienzo px-2 py-1 text-[12px] text-ink outline-none"
                                    >
                                      {asignaturas.map((a) => (
                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-linea">
                                    {p.resultado === null ? (
                                      <>
                                        <button onClick={() => { haptic(); setModalResolucion({ pregunta: p, resultado: true }); }} className="flex-1 touch-manipulation rounded-lg bg-black/5 py-1.5 text-[12px] font-medium transition-colors hover:bg-verde/10 hover:text-verde">Entró</button>
                                        <button onClick={() => { haptic(); setModalResolucion({ pregunta: p, resultado: false }); }} className="flex-1 touch-manipulation rounded-lg bg-black/5 py-1.5 text-[12px] font-medium transition-colors hover:bg-rojo/10 hover:text-rojo">No entró</button>
                                      </>
                                    ) : (
                                      <>
                                        <button onClick={() => { haptic(); mercado.desresolver(p.id); }} className="flex-1 touch-manipulation rounded-lg bg-black/5 py-1.5 text-[12px]">Desresolver</button>
                                        <button onClick={() => { haptic(); mercado.archivar(p.id, true); }} className="flex-1 touch-manipulation rounded-lg bg-black/5 py-1.5 text-[12px]">Archivar</button>
                                      </>
                                    )}
                                    <button onClick={() => { haptic(); const t = window.prompt("Nuevo título", p.titulo); if (t) mercado.editarTitulo(p.id, t); }} className="touch-manipulation rounded-lg bg-black/5 px-3 py-1.5 text-[12px]">Editar</button>
                                    <button onClick={() => { haptic(); if (window.confirm(`¿Eliminar pregunta?`)) { mercado.eliminarPregunta(p.id); } }} className="touch-manipulation rounded-lg bg-rojo/10 px-3 py-1.5 text-[12px] text-rojo">Eliminar</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {viendoTodas && huerfanas.length > 0 && (
                <div className="rounded-xl border border-rojo/30 bg-rojo/5 p-4 space-y-2">
                  <h2 className="text-[14px] font-bold text-rojo">Preguntas Huérfanas ({huerfanas.length})</h2>
                  {huerfanas.map((p) => (
                    <div key={p.id} className="text-[13px] text-rojo flex items-center justify-between">
                      <span className="truncate pr-2">{p.titulo}</span>
                      <select value={p.asignaturaId || ""} onChange={(e) => mercado.moverPregunta(p.id, e.target.value)} className="rounded border border-rojo bg-white px-2 py-1 text-[12px] text-ink">
                        <option value="" disabled>Mover a...</option>
                        {asignaturas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* VISTA: ARCHIVADO (Solo Admin) */}
        {vistaAdmin === "archivado" && esAdmin && (
          <div className="space-y-3">
            {[...mercado.leerPreguntas({ estado: "archivadas", todasAdmin: true })]
              .filter((p) => viendoTodas || claseIdDeAsignatura(p.asignaturaId) === claseFiltroId)
              .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }))
              .map((p) => (
              <div key={p.id} className="rounded-xl border border-borde bg-white p-4 space-y-3">
                <h2 className="text-[14px] font-medium text-sutil">{p.titulo}</h2>
                <div className="flex gap-2">
                  <button onClick={() => { haptic(); mercado.archivar(p.id, false); }} className="flex-1 rounded-lg bg-black/5 py-1.5 text-[12px]">Desarchivar</button>
                  <button onClick={() => { haptic(); mercado.desresolver(p.id); }} className="flex-1 rounded-lg bg-black/5 py-1.5 text-[12px]">Desresolver</button>
                  <button onClick={() => { haptic(); if (window.confirm(`¿Eliminar?`)) { mercado.eliminarPregunta(p.id); } }} className="rounded-lg bg-rojo/10 px-3 py-1.5 text-[12px] text-rojo">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VISTA: USUARIOS (Solo Admin puede gestionar roles mod) */}
        {vistaAdmin === "usuarios" && esAdmin && (
          <div className="space-y-3">
            {[...mercado.leerAlumnos(true)]
              .filter((a) => viendoTodas || a.claseId === claseFiltroId)
              .sort((a, b) => nombreVisible(a).localeCompare(nombreVisible(b), 'es', { sensitivity: 'base' }))
              .map((a) => {
                const apostado = mercado.apostadoAbierto[a.id] || 0;
                const total = Math.round(a.saldo + apostado);
                return (
                  <div key={a.id} className="rounded-xl border border-borde bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[14px] font-semibold text-ink">{nombreVisible(a)}</p>
                        <p className="font-mono text-[11px] text-sutil">
                          {total} tokens {apostado > 0 && `(${Math.round(a.saldo)} libres)`} {a.pausado && "· pausado"} {a.mod && "· mod exámenes"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { haptic(); mercado.darTokens(a.id, -20); }} className="h-7 px-2 rounded border border-borde text-[11px] font-mono text-rojo">−20</button>
                        <button onClick={() => { haptic(); mercado.darTokens(a.id, -1); }} className="h-7 w-7 rounded border border-borde text-[13px]">−</button>
                        <button onClick={() => { haptic(); mercado.darTokens(a.id, 1); }} className="h-7 w-7 rounded border border-borde text-[13px]">+</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-linea">
                      <select
                        value={a.claseId || ""}
                        onChange={(e) => { haptic(); mercado.adminCambiarClaseAlumno(a.id, e.target.value); }}
                        className="flex-1 min-w-[100px] rounded border border-borde bg-lienzo px-2 py-1 text-[12px]"
                      >
                        <option value="" disabled>Sin curso</option>
                        {clases.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>

                      {/* Botón de Permiso Mod */}
                      <button 
                        onClick={() => { haptic(); mercado.toggleMod(a.id, !a.mod); }} 
                        className={`rounded border px-2.5 py-1 text-[12px] ${a.mod ? "bg-verde text-white border-verde" : "bg-white border-borde text-sutil"}`}
                      >
                        {a.mod ? "Mod activo" : "Hacer mod"}
                      </button>

                      <button onClick={() => { haptic(); if (window.confirm(`¿Devolver apuestas?`)) mercado.adminRetirarApuestas(a.id); }} disabled={apostado === 0} className="rounded border border-borde px-2.5 py-1 text-[12px] disabled:opacity-40">Quitar apuestas</button>
                      <button onClick={() => { haptic(); mercado.pausarAlumno(a.id, !a.pausado); }} className={`rounded border px-2.5 py-1 text-[12px] ${a.pausado ? "bg-ink text-white border-ink" : "bg-white border-borde"}`}>
                        {a.pausado ? "Reanudar" : "Pausar"}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* VISTA: CURSOS Y EXÁMENES (Accesible por Admin y Mod) */}
        {vistaAdmin === "asignaturas" && (
          <div className="space-y-6">
            {/* PANEL DE CREACIÓN DE CURSOS (Solo Admin puede crear/renombrar/eliminar cursos) */}
            {esAdmin && (
              <div className="rounded-2xl border border-borde bg-white p-4 shadow-xs space-y-4">
                <h3 className="text-[14px] font-bold text-ink">Gestión de Cursos</h3>
                
                <form onSubmit={async (e) => { e.preventDefault(); if (!nuevaClase.trim()) return; haptic(); await mercado.crearClase(nuevaClase); setNuevaClase(""); }} className="flex gap-2">
                  <input value={nuevaClase} onChange={(e) => setNuevaClase(e.target.value)} placeholder="Nuevo curso..." className="flex-1 rounded-lg border border-borde px-3 py-1.5 text-[14px] outline-none" />
                  <button type="submit" disabled={!nuevaClase.trim()} className="rounded-lg bg-ink px-4 py-1.5 text-[13px] font-medium text-white disabled:opacity-50">Añadir Curso</button>
                </form>

                <div className="space-y-2 pt-2 border-t border-linea">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-sutil">Renombrar / Eliminar Cursos</span>
                  {clases.map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <input value={c.nombre} onChange={(e) => mercado.renombrarClase(c.id, e.target.value)} className="flex-1 bg-black/5 rounded-lg px-3 py-1 text-[14px] font-medium outline-none" />
                      <button onClick={() => { haptic(); if (window.confirm(`¿Eliminar curso ${c.nombre}?`)) mercado.eliminarClase(c.id); }} className="rounded-lg border border-borde px-2.5 py-1 text-[12px] text-rojo">Eliminar</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PANEL DE CREACIÓN DE EXÁMENES (Admin o Mod) */}
            <div className="rounded-2xl border border-borde bg-white p-4 shadow-xs space-y-3">
              <h3 className="text-[14px] font-bold text-ink">Crear Examen</h3>
              <form onSubmit={async (e) => { e.preventDefault(); if (!nuevaAsig.trim() || !nuevaAsigClase) return; haptic(); await mercado.crearAsignatura(nuevaAsig, nuevaAsigClase); setNuevaAsig(""); }} className="flex gap-2">
                <input value={nuevaAsig} onChange={(e) => setNuevaAsig(e.target.value)} placeholder="Nuevo examen..." className="flex-1 rounded-lg border border-borde px-3 py-1.5 text-[14px] outline-none" />
                <select value={nuevaAsigClase} onChange={(e) => setNuevaAsigClase(e.target.value)} className="rounded-lg border border-borde px-2 py-1.5 text-[13px]">
                  <option value="" disabled>Curso...</option>
                  {clases.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <button type="submit" disabled={!nuevaAsig.trim() || !nuevaAsigClase} className="rounded-lg bg-ink px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-50">Crear Examen</button>
              </form>
            </div>

            {/* LISTADO DE EXÁMENES POR CURSO */}
            {clasesFiltradas.map(clase => {
              const asignaturasClase = asignaturas.filter(a => a.claseId === clase.id);
              if (asignaturasClase.length === 0) return null;

              return (
                <div key={clase.id} className="space-y-3">
                  <h4 className="font-mono text-[13px] font-bold uppercase tracking-wider text-ink border-b border-linea pb-1">{clase.nombre}</h4>
                  <div className="space-y-3">
                    {asignaturasClase.map((a) => (
                      <div key={a.id} className="rounded-xl border border-borde bg-white p-4 space-y-3">
                        <input 
                          value={a.nombre} 
                          onChange={(e) => mercado.renombrarAsignatura(a.id, e.target.value)} 
                          className="w-full font-bold text-[15px] bg-transparent outline-none border-b border-linea/60 pb-1" 
                          placeholder="Nombre del examen..."
                        />
                        
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <select 
                            value={a.claseId || ""} 
                            onChange={(e) => { haptic(); mercado.cambiarClaseAsignatura(a.id, e.target.value); }} 
                            className="rounded border border-borde bg-lienzo px-2 py-1.5 text-[12px] outline-none"
                          >
                            {clases.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                          </select>

                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => { haptic(); mercado.pausarExamen(a.id, !a.cerrada); }} 
                              className={`rounded px-3 py-1.5 text-[12px] font-medium border ${a.cerrada ? "bg-ink text-white border-ink" : "bg-white border-borde text-ink"}`}
                            >
                              {a.cerrada ? "Reabrir" : "Cerrar"}
                            </button>
                            <button 
                              onClick={() => { haptic(); if (window.confirm(`¿Eliminar examen "${a.nombre}"?`)) mercado.eliminarAsignatura(a.id); }} 
                              className="rounded border border-borde px-3 py-1.5 text-[12px] text-rojo hover:bg-rojo/5"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-linea text-[12px]">
                          <span className="font-mono text-sutil">Fecha:</span>
                          <input 
                            type="datetime-local" 
                            value={a.fechaExamen ? aValorInputLocal(a.fechaExamen) : ""} 
                            onChange={(e) => { const v = e.target.value; mercado.editarFechaExamen(a.id, v ? new Date(v) : null); }} 
                            className="flex-1 rounded border border-borde px-2 py-1 outline-none text-[12px]" 
                          />
                          {a.fechaExamen && <button onClick={() => mercado.editarFechaExamen(a.id, null)} className="text-sutil underline">Quitar</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL DE RESOLUCIÓN */}
      {modalResolucion && (() => {
        const p = modalResolucion.pregunta;
        const resultadoSi = modalResolucion.resultado;
        const poolTotal = p.poolSi + p.poolNo;
        const poolPerdedor = resultadoSi ? p.poolNo : p.poolSi;
        const conPago = detalleApuestas.map((d) => { const gana = d.lado === (resultadoSi ? "si" : "no"); const pago = gana ? Math.round(premio(d.tokens, d.lado, p.poolSi, p.poolNo)) : 0; return { ...d, gana, pago }; }).sort((a, b) => b.pago - a.pago);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModalResolucion(null)}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 border border-borde" onClick={(e) => e.stopPropagation()} style={fuenteApple}>
              <div>
                <span className="font-mono text-[11px] text-sutil uppercase tracking-wider">Resolución: {resultadoSi ? "ENTRÓ (SÍ)" : "NO ENTRÓ (NO)"}</span>
                <h3 className="text-[16px] font-semibold text-ink mt-1">{p.titulo}</h3>
              </div>
              <div className="space-y-2">
                <span className="text-[12px] font-mono uppercase text-sutil">A quién van los tokens</span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-borde bg-lienzo p-3 text-[13px]">
                  {cargandoDetalle ? <p className="text-sutil text-center py-2">Cargando apuestas…</p> : conPago.length === 0 ? <p className="text-sutil text-center py-2">Nadie ha apostado en esta pregunta.</p> : (
                    conPago.map((d) => (
                      <div key={`${d.usuarioId}-${d.lado}`} className="flex justify-between items-center py-1 border-b border-linea/50 last:border-0">
                        <div className="min-w-0">
                          <span className="font-medium text-ink truncate block">{d.nombre}</span>
                          <span className="font-mono text-[10px] text-sutil uppercase">{d.lado} · apostó {d.tokens}</span>
                        </div>
                        <span className="font-mono text-[12px] shrink-0">{d.gana ? <strong className="text-verde">+{d.pago} tokens</strong> : <span className="text-sutil">0 tokens</span>}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-borde bg-lienzo p-3 space-y-1 text-[12px] font-mono text-sutil">
                <div className="flex justify-between"><span>Pool total:</span><strong className="text-ink">{poolTotal} tokens</strong></div>
                <div className="flex justify-between"><span>A repartir del bando perdedor:</span><strong className="text-ink">+{poolPerdedor} tokens</strong></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setModalResolucion(null)} className="flex-1 rounded-xl border border-borde bg-white py-3 text-[13px] font-medium text-ink hover:border-ink/30 active:bg-black/5">Cancelar</button>
                <button onClick={confirmarResolucion} className="flex-1 rounded-xl bg-ink py-3 text-[13px] font-medium text-white hover:opacity-90 active:opacity-70">Confirmar resolución</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}