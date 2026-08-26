import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSesion } from "@/hooks/useSesion";
import { useHaptic } from "@/hooks/useHaptic";
import { nombreVisible, premio, probabilidad, useMercado, volumen, type ApuestaDetalle, type Pregunta } from "@/hooks/useMercado";
import { PantallaLogin } from "@/components/PantallaLogin";
import { PantallaSeleccionClase } from "@/components/PantallaSeleccionClase";

const mono = "font-mono text-[11px] uppercase tracking-widest";
const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

type VistaAdmin = "preguntas" | "archivado" | "usuarios" | "asignaturas";

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
  const [nuevaAsig, setNuevaAsig] = useState("");
  const [nuevaAsigClase, setNuevaAsigClase] = useState("");
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

  if (cargando || !mercado.perfilCargado) {
    return <div className="min-h-screen bg-lienzo" />;
  }

  if (!usuario) {
    return <PantallaLogin entrarConGoogle={entrarConGoogle} />;
  }

  if (!usuario.esAdmin) {
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
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-[calc(3.5rem+env(safe-area-inset-top))]">
        <section className="pt-6">
          <div className="flex gap-4 border-b border-linea pb-2.5 overflow-x-auto scrollbar-hide">
            {(["preguntas", "archivado", "usuarios", "asignaturas"] as VistaAdmin[]).map((v) => (
              <button
                key={v}
                onClick={() => { haptic(); setVistaAdmin(v); }}
                className={`${mono} touch-manipulation whitespace-nowrap ${vistaAdmin === v ? "text-ink font-semibold" : "text-sutil"}`}
              >
                {v}
              </button>
            ))}
          </div>

          {vistaAdmin === "preguntas" && (() => {
            const preguntasActivas = [...mercado.leerPreguntas({ estado: "todas", todasAdmin: true })]
              .filter((p) => !p.archivada)
              .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }));

            // Encontramos asignaturas y preguntas huérfanas
            const asigSinClase = asignaturas.filter(a => !clases.some(c => c.id === a.claseId));
            const huerfanas = preguntasActivas.filter(p => !asignaturas.some(a => a.id === p.asignaturaId));

            return (
              <div className="space-y-10 pt-4">
                {/* 1. Agrupación por Clases (Grados/Carreras) */}
                {clases.map((clase) => {
                  const asignaturasClase = asignaturas.filter(a => a.claseId === clase.id);
                  const asigIds = asignaturasClase.map(a => a.id);
                  const preguntasClase = preguntasActivas.filter(p => asigIds.includes(p.asignaturaId));

                  if (preguntasClase.length === 0) return null; 

                  return (
                    <div key={clase.id} className="relative">
                      {/* HEADER CARRERA */}
                      <h2 className="sticky top-[3.5rem] z-10 -mx-5 bg-lienzo/95 px-5 py-3 backdrop-blur border-b border-linea text-[18px] font-bold tracking-tight text-ink shadow-sm">
                        {clase.nombre}
                      </h2>
                      
                      <div className="flex flex-col gap-6">
                        {asignaturasClase.map((asignatura) => {
                          const preguntasAsignatura = preguntasClase.filter(p => p.asignaturaId === asignatura.id);
                          if (preguntasAsignatura.length === 0) return null;

                          return (
                            <div key={asignatura.id} className="mt-4">
                              {/* HEADER ASIGNATURA */}
                              <h3 className="mb-2 border-b border-linea/50 pb-2 font-mono text-[13px] font-bold uppercase tracking-wider text-sutil">
                                {asignatura.nombre}
                              </h3>
                              <div>
                                {preguntasAsignatura.map((p) => (
                                  <div key={p.id} className="border-b border-linea py-5 last:border-0 pl-1">
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
                                      style={{ fontSize: "16px" }}
                                      className="mt-3 w-full rounded-lg border border-borde bg-white px-2 py-2 text-[16px] text-ink outline-none"
                                    >
                                      {asignaturas.map((a) => (
                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                      ))}
                                    </select>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {p.resultado === null ? (
                                        <>
                                          <button onClick={() => { haptic(); setModalResolucion({ pregunta: p, resultado: true }); }} className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] transition-colors hover:border-verde hover:text-verde active:bg-black/5">Entró</button>
                                          <button onClick={() => { haptic(); setModalResolucion({ pregunta: p, resultado: false }); }} className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] transition-colors hover:border-rojo hover:text-rojo active:bg-black/5">No entró</button>
                                        </>
                                      ) : (
                                        <>
                                          <button onClick={() => { haptic(); mercado.desresolver(p.id); }} className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] transition-colors hover:border-ink active:bg-black/5">Desresolver</button>
                                          <button onClick={() => { haptic(); mercado.archivar(p.id, true); }} className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] transition-colors hover:border-ink active:bg-black/5">Archivar</button>
                                        </>
                                      )}
                                      <button onClick={() => { haptic(); const t = window.prompt("Nuevo título", p.titulo); if (t) mercado.editarTitulo(p.id, t); }} className="touch-manipulation rounded-lg border border-borde bg-white px-3 py-2 text-[13px] active:bg-black/5">Editar</button>
                                      <button onClick={() => { haptic(); if (window.confirm(`¿Seguro que quieres eliminar la pregunta "${p.titulo}"?`)) { mercado.eliminarPregunta(p.id); } }} className="touch-manipulation rounded-lg border border-borde bg-white px-3 py-2 text-[13px] text-rojo active:bg-rojo/10">Eliminar</button>
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

                {/* 2. Asignaturas sin Clase pero con preguntas */}
                {(() => {
                  const asigIds = asigSinClase.map(a => a.id);
                  const preguntasSinClase = preguntasActivas.filter(p => asigIds.includes(p.asignaturaId));

                  if (preguntasSinClase.length === 0) return null;

                  return (
                    <div className="relative mt-8">
                      <h2 className="sticky top-[3.5rem] z-10 -mx-5 bg-lienzo/95 px-5 py-3 backdrop-blur border-b border-linea text-[18px] font-bold tracking-tight text-rojo shadow-sm">
                        Asignaturas sin Carrera
                      </h2>
                      <div className="flex flex-col gap-6">
                        {asigSinClase.map(asignatura => {
                           const preguntasAsignatura = preguntasSinClase.filter(p => p.asignaturaId === asignatura.id);
                           if(preguntasAsignatura.length === 0) return null;
                           return (
                              <div key={asignatura.id} className="mt-4">
                                <h3 className="mb-2 font-mono text-[13px] font-bold uppercase tracking-wider text-rojo/70 border-b border-rojo/20 pb-2">
                                  {asignatura.nombre}
                                </h3>
                                <div>
                                  {preguntasAsignatura.map((p) => (
                                    <div key={p.id} className="border-b border-linea py-5 last:border-0 pl-1">
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
                                        style={{ fontSize: "16px" }}
                                        className="mt-3 w-full rounded-lg border border-borde bg-white px-2 py-2 text-[16px] text-ink outline-none"
                                      >
                                        {asignaturas.map((a) => (
                                          <option key={a.id} value={a.id}>{a.nombre}</option>
                                        ))}
                                      </select>
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {p.resultado === null ? (
                                          <>
                                            <button onClick={() => { haptic(); setModalResolucion({ pregunta: p, resultado: true }); }} className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] transition-colors hover:border-verde hover:text-verde active:bg-black/5">Entró</button>
                                            <button onClick={() => { haptic(); setModalResolucion({ pregunta: p, resultado: false }); }} className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] transition-colors hover:border-rojo hover:text-rojo active:bg-black/5">No entró</button>
                                          </>
                                        ) : (
                                          <>
                                            <button onClick={() => { haptic(); mercado.desresolver(p.id); }} className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] transition-colors hover:border-ink active:bg-black/5">Desresolver</button>
                                            <button onClick={() => { haptic(); mercado.archivar(p.id, true); }} className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] transition-colors hover:border-ink active:bg-black/5">Archivar</button>
                                          </>
                                        )}
                                        <button onClick={() => { haptic(); const t = window.prompt("Nuevo título", p.titulo); if (t) mercado.editarTitulo(p.id, t); }} className="touch-manipulation rounded-lg border border-borde bg-white px-3 py-2 text-[13px] active:bg-black/5">Editar</button>
                                        <button onClick={() => { haptic(); if (window.confirm(`¿Seguro que quieres eliminar la pregunta "${p.titulo}"?`)) { mercado.eliminarPregunta(p.id); } }} className="touch-manipulation rounded-lg border border-borde bg-white px-3 py-2 text-[13px] text-rojo active:bg-rojo/10">Eliminar</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                           )
                        })}
                      </div>
                    </div>
                  )
                })()}

                {/* 3. Preguntas totalmente Huérfanas */}
                {huerfanas.length > 0 && (
                  <div className="relative mt-8">
                    <h2 className="sticky top-[3.5rem] z-10 -mx-5 bg-lienzo/95 px-5 py-3 backdrop-blur border-b border-linea text-[18px] font-bold tracking-tight text-rojo shadow-sm">
                      Preguntas Huérfanas
                    </h2>
                    <div>
                      {huerfanas.map((p) => (
                        <div key={p.id} className="border-b border-linea py-5 last:border-0 pl-1 text-rojo">
                          <p className="text-[13px]">Mueve "{p.titulo}" a una asignatura válida.</p>
                          <select value={p.asignaturaId || ""} onChange={(e) => mercado.moverPregunta(p.id, e.target.value)} style={{ fontSize: "16px" }} className="mt-3 w-full rounded-lg border border-rojo bg-white px-2 py-2 text-[16px] text-ink outline-none">
                            <option value="" disabled>Selecciona asignatura...</option>
                            {asignaturas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })()}

          {vistaAdmin === "archivado" && (
            <div className="pt-4">
              {[...mercado.leerPreguntas({ estado: "archivadas", todasAdmin: true })]
                .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }))
                .map((p) => (
                <div key={p.id} className="border-b border-linea py-4">
                  <h2 className="text-[14px] leading-snug text-sutil">{p.titulo}</h2>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => { haptic(); mercado.archivar(p.id, false); }} className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] active:bg-black/5">Desarchivar</button>
                    <button onClick={() => { haptic(); mercado.desresolver(p.id); }} className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] active:bg-black/5">Desresolver</button>
                    <button onClick={() => { haptic(); if (window.confirm(`¿Seguro que quieres eliminar permanentemente "${p.titulo}"?`)) { mercado.eliminarPregunta(p.id); } }} className="touch-manipulation rounded-lg border border-borde bg-white px-3 py-2 text-[13px] text-rojo active:bg-rojo/10">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {vistaAdmin === "usuarios" && (
            <div className="pt-4">
              {[...mercado.leerAlumnos(true)]
                .sort((a, b) => nombreVisible(a).localeCompare(nombreVisible(b), 'es', { sensitivity: 'base' }))
                .map((a) => {
                  const apostado = mercado.apostadoAbierto[a.id] || 0;
                  const total = Math.round(a.saldo + apostado);
                  return (
                    <div key={a.id} className="flex flex-col gap-3 border-b border-linea py-4">
                      {/* Fila 1: Info y botones de tokens */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium text-ink">{nombreVisible(a)}</p>
                          <p className="font-mono text-[11px] text-sutil">
                            {total} tokens
                            {apostado > 0 && ` (${Math.round(a.saldo)} libres + ${Math.round(apostado)} apostados)`}
                            {a.pausado && " · pausado"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button onClick={() => { haptic(); mercado.darTokens(a.id, -20); }} className="h-8 px-2 touch-manipulation rounded-lg border border-borde bg-white text-[11px] font-mono text-rojo active:bg-black/5">−20</button>
                          <button onClick={() => { haptic(); mercado.darTokens(a.id, -1); }} className="h-8 w-8 touch-manipulation rounded-lg border border-borde bg-white text-[14px] active:bg-black/5">−</button>
                          <button onClick={() => { haptic(); mercado.darTokens(a.id, 1); }} className="h-8 w-8 touch-manipulation rounded-lg border border-borde bg-white text-[14px] active:bg-black/5">+</button>
                        </div>
                      </div>

                      {/* Fila 2: Select clase, quitar apuestas y pausar */}
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={a.claseId || ""}
                          onChange={(e) => {
                            haptic();
                            mercado.adminCambiarClaseAlumno(a.id, e.target.value);
                          }}
                          className="flex-1 min-w-[120px] rounded-lg border border-borde bg-white px-2 py-1.5 text-[12px] text-ink outline-none"
                        >
                          <option value="" disabled>Sin clase</option>
                          {clases.map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => {
                            haptic();
                            if (window.confirm(`¿Devolver todas las apuestas activas a ${nombreVisible(a)}?`)) {
                              mercado.adminRetirarApuestas(a.id);
                            }
                          }}
                          disabled={apostado === 0}
                          className="shrink-0 touch-manipulation rounded-lg border border-borde bg-white px-3 py-1.5 text-[12px] transition-colors hover:text-rojo active:bg-black/5 disabled:opacity-40"
                        >
                          Quitar apuestas
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
                    </div>
                  );
                })}
            </div>
          )}

          {vistaAdmin === "asignaturas" && (() => {
            const huerfanas = asignaturas.filter(a => !a.claseId || !clases.some(c => c.id === a.claseId));

            return (
              <div className="space-y-6 pt-4">
                
                {/* 1. Panel para crear nueva asignatura SIEMPRE ARRIBA */}
                <div className="rounded-xl border border-borde bg-black/5 p-4 mb-2">
                  <h3 className="text-[13px] font-semibold text-ink mb-3">Nueva asignatura</h3>
                  <form onSubmit={async (e) => { 
                    e.preventDefault(); 
                    if (!nuevaAsig.trim() || !nuevaAsigClase) return; 
                    try { 
                      haptic(); 
                      await mercado.crearAsignatura(nuevaAsig, nuevaAsigClase); 
                      setNuevaAsig(""); 
                      setNuevaAsigClase("");
                    } catch (error) { console.error("Error:", error); } 
                  }} className="flex flex-col sm:flex-row gap-3">
                    <input 
                      value={nuevaAsig} 
                      onChange={(e) => setNuevaAsig(e.target.value)} 
                      placeholder="Nombre..." 
                      style={{ fontSize: "16px" }} 
                      className="min-w-0 flex-1 rounded-lg border border-borde bg-white px-3 py-2 text-[15px] text-ink outline-none placeholder:text-sutil focus:border-ink/30" 
                    />
                    <div className="flex gap-2">
                      <select 
                        value={nuevaAsigClase} 
                        onChange={(e) => setNuevaAsigClase(e.target.value)} 
                        style={{ fontSize: "16px" }} 
                        className="flex-1 shrink-0 rounded-lg border border-borde bg-white px-2 py-2 text-[14px] text-ink outline-none"
                      >
                        <option value="" disabled>Elegir Grado...</option>
                        {clases.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                      <button 
                        type="submit" 
                        disabled={!nuevaAsig.trim() || !nuevaAsigClase} 
                        className="shrink-0 touch-manipulation rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-white transition-opacity active:opacity-70 disabled:opacity-50"
                      >
                        Añadir
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Asignaturas agrupadas por clase */}
                {clases.map(clase => {
                  const asignaturasClase = asignaturas.filter(a => a.claseId === clase.id);
                  if (asignaturasClase.length === 0) return null;

                  return (
                    <div key={clase.id} className="relative">
                      <h3 className="sticky top-[3.5rem] z-10 -mx-5 bg-lienzo/95 px-5 py-2 backdrop-blur border-b border-linea font-mono text-[14px] font-bold uppercase tracking-wider text-ink">
                        {clase.nombre}
                      </h3>
                      <div>
                        {asignaturasClase.map((a) => (
                          <div key={a.id} className="flex flex-col gap-2 border-b border-linea py-4 last:border-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <input 
                                value={a.nombre} 
                                onChange={(e) => mercado.renombrarAsignatura(a.id, e.target.value)} 
                                style={{ fontSize: "16px" }} 
                                className={`min-w-[150px] flex-1 bg-transparent text-[16px] font-bold text-ink outline-none focus:border-b focus:border-ink/30 ${a.cerrada ? "opacity-50" : ""}`} 
                              />
                              <select 
                                value={a.claseId || ""} 
                                onChange={(e) => { haptic(); mercado.cambiarClaseAsignatura(a.id, e.target.value); }} 
                                className="shrink-0 rounded-lg border border-borde bg-white px-2 py-1.5 text-[12px] text-ink outline-none"
                              >
                                <option value="" disabled>Sin Grado</option>
                                {clases.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                              </select>
                              <button 
                                onClick={() => { haptic(); mercado.pausarExamen(a.id, !a.cerrada); }} 
                                className={`shrink-0 touch-manipulation rounded-lg border px-3 py-1.5 text-[12px] transition-colors ${a.cerrada ? "border-ink bg-ink text-white" : "border-borde bg-white text-ink hover:border-ink/30"}`}
                              >
                                {a.cerrada ? "Reabrir" : "Cerrar exam"}
                              </button>
                              <button 
                                onClick={() => { haptic(); if (window.confirm(`¿Seguro que quieres eliminar la asignatura "${a.nombre}"?`)) { mercado.eliminarAsignatura(a.id); } }} 
                                className="shrink-0 touch-manipulation rounded-lg border border-borde bg-white px-3 py-1.5 text-[12px] text-rojo active:bg-rojo/10"
                              >
                                Eliminar
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-1">
                              <label className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-sutil">Examen</label>
                              <input 
                                type="datetime-local" 
                                value={a.fechaExamen ? aValorInputLocal(a.fechaExamen) : ""} 
                                onChange={(e) => { const valor = e.target.value; mercado.editarFechaExamen(a.id, valor ? new Date(valor) : null); }} 
                                style={{ fontSize: "16px" }} 
                                className="min-w-0 flex-1 rounded-lg border border-borde bg-white px-2 py-1.5 text-[14px] text-ink outline-none focus:border-ink/40" 
                              />
                              {a.fechaExamen && (
                                <button 
                                  onClick={() => { haptic(); mercado.editarFechaExamen(a.id, null); }} 
                                  className="shrink-0 touch-manipulation rounded-lg border border-borde bg-white px-2.5 py-1.5 text-[12px] text-sutil active:bg-black/5"
                                >
                                  Quitar
                                </button>
                              )}
                            </div>
                            {a.cerrada && <p className="text-[12px] text-sutil font-mono uppercase">Examen cerrado. No se admiten apuestas.</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* 3. Huérfanas */}
                {huerfanas.length > 0 && (
                  <div className="relative mt-8">
                    <h3 className="sticky top-[3.5rem] z-10 -mx-5 bg-lienzo/95 px-5 py-2 backdrop-blur border-b border-linea font-mono text-[14px] font-bold uppercase tracking-wider text-rojo">
                      Sin Grado / Huérfanas
                    </h3>
                    <div>
                      {huerfanas.map((a) => (
                        <div key={a.id} className="flex flex-col gap-2 border-b border-linea py-4 last:border-0">
                          <p className="text-[13px] text-rojo">Esta asignatura no tiene clase asignada.</p>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ink">{a.nombre}</span>
                            <select 
                              value={a.claseId || ""} 
                              onChange={(e) => { haptic(); mercado.cambiarClaseAsignatura(a.id, e.target.value); }} 
                              className="ml-auto shrink-0 rounded-lg border border-rojo bg-white px-2 py-1.5 text-[12px] text-ink outline-none"
                            >
                              <option value="" disabled>Seleccionar clase...</option>
                              {clases.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                            <button 
                                onClick={() => { haptic(); if (window.confirm(`¿Seguro que quieres eliminar la asignatura "${a.nombre}"?`)) { mercado.eliminarAsignatura(a.id); } }} 
                                className="shrink-0 touch-manipulation rounded-lg border border-borde bg-white px-3 py-1.5 text-[12px] text-rojo active:bg-rojo/10"
                              >
                                Eliminar
                              </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })()}
        </section>
      </main>

      {/* POPUP DE RESOLUCIÓN */}
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