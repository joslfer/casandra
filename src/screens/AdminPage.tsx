import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSesion } from "@/hooks/useSesion";
import { useHaptic } from "@/hooks/useHaptic";
import { nombreVisible, premio, probabilidad, useMercado, volumen, type ApuestaDetalle, type Pregunta } from "@/hooks/useMercado";
import { PantallaLogin } from "@/components/PantallaLogin";


const mono = "font-mono text-[11px] uppercase tracking-widest";
const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

type VistaAdmin = "preguntas" | "archivado" | "usuarios" | "asignaturas";

export function AdminPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const haptic = useHaptic();
  
  const [vistaAdmin, setVistaAdmin] = useState<VistaAdmin>("preguntas");
  const [nuevaAsig, setNuevaAsig] = useState("");
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

  if (!usuario) {
    return <PantallaLogin entrarConGoogle={entrarConGoogle} />;
  }

  // Orden alfabético de asignaturas en el admin
  const asignaturas = [...mercado.leerAsignaturas()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

  const confirmarResolucion = async () => {
    if (!modalResolucion) return;
    haptic();
    await mercado.resolver(modalResolucion.pregunta.id, modalResolucion.resultado);
    setModalResolucion(null);
  };

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

{vistaAdmin === "preguntas" && (() => {
            // 1. Obtenemos y ordenamos todas las preguntas activas primero
            const preguntasActivas = [...mercado.leerPreguntas({ estado: "todas" })]
              .filter((p) => !p.archivada)
              .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }));

            // 2. Separamos por asignatura
            return (
              <div className="space-y-6 pt-4">
                {asignaturas.map((asignatura) => {
                  const preguntasAsignatura = preguntasActivas.filter(p => p.asignaturaId === asignatura.id);
                  
                  // Ocultamos la asignatura si no tiene preguntas
                  if (preguntasAsignatura.length === 0) return null; 

                  return (
                    <div key={asignatura.id} className="relative">
                      {/* Cabecera sticky de la asignatura */}
                      <h3 className="sticky top-[3.5rem] z-10 -mx-5 bg-lienzo/95 px-5 py-2 backdrop-blur border-b border-linea font-mono text-[12px] uppercase tracking-wider text-sutil">
                        {asignatura.nombre}
                      </h3>
                      
                      {/* Lista de preguntas de esta asignatura */}
                      <div>
                        {preguntasAsignatura.map((p) => (
                          <div key={p.id} className="border-b border-linea py-5 last:border-0">
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
                                <option key={a.id} value={a.id}>
                                  {a.nombre}
                                </option>
                              ))}
                            </select>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {p.resultado === null ? (
                                <>
                                  <button
                                    onClick={() => { haptic(); setModalResolucion({ pregunta: p, resultado: true }); }}
                                    className="flex-1 touch-manipulation rounded-lg border border-borde bg-white py-2 text-[13px] transition-colors hover:border-verde hover:text-verde active:bg-black/5"
                                  >
                                    Entró
                                  </button>
                                  <button
                                    onClick={() => { haptic(); setModalResolucion({ pregunta: p, resultado: false }); }}
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
                      </div>
                    </div>
                  );
                })}

                {/* 3. Comprobación de seguridad: Preguntas huérfanas (asignatura borrada) */}
                {(() => {
                  const huerfanas = preguntasActivas.filter(p => !asignaturas.some(a => a.id === p.asignaturaId));
                  if (huerfanas.length === 0) return null;
                  
                  return (
                    <div className="relative">
                      <h3 className="sticky top-[3.5rem] z-10 -mx-5 bg-lienzo/95 px-5 py-2 backdrop-blur border-b border-linea font-mono text-[12px] uppercase tracking-wider text-rojo">
                        Sin asignatura / Huérfanas
                      </h3>
                      <div>
                        {huerfanas.map((p) => (
                           /* Renderizas la misma tarjeta de pregunta aquí (copias el div de arriba) */
                           <div key={p.id} className="border-b border-linea py-5 last:border-0 text-rojo">
                             <p className="text-[13px]">Mueve "{p.titulo}" a una asignatura válida.</p>
                             <select
                              value={p.asignaturaId || ""}
                              onChange={(e) => mercado.moverPregunta(p.id, e.target.value)}
                              style={{ fontSize: "16px" }}
                              className="mt-3 w-full rounded-lg border border-rojo bg-white px-2 py-2 text-[16px] text-ink outline-none"
                             >
                               <option value="" disabled>Selecciona asignatura...</option>
                               {asignaturas.map((a) => (
                                 <option key={a.id} value={a.id}>{a.nombre}</option>
                               ))}
                             </select>
                           </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })()}

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

      {/* POPUP BREAKDOWN DE RESOLUCIÓN */}
      {modalResolucion && (() => {
        const p = modalResolucion.pregunta;
        const resultadoSi = modalResolucion.resultado;
        const poolTotal = p.poolSi + p.poolNo;
        const poolPerdedor = resultadoSi ? p.poolNo : p.poolSi;

        const conPago = detalleApuestas
          .map((d) => {
            const gana = d.lado === (resultadoSi ? "si" : "no");
            const pago = gana ? Math.round(premio(d.tokens, d.lado, p.poolSi, p.poolNo)) : 0;
            return { ...d, gana, pago };
          })
          .sort((a, b) => b.pago - a.pago);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModalResolucion(null)}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 border border-borde" onClick={(e) => e.stopPropagation()} style={fuenteApple}>
              <div>
                <span className="font-mono text-[11px] text-sutil uppercase tracking-wider">
                  Resolución: {resultadoSi ? "ENTRÓ (SÍ)" : "NO ENTRÓ (NO)"}
                </span>
                <h3 className="text-[16px] font-semibold text-ink mt-1">{p.titulo}</h3>
              </div>

              <div className="space-y-2">
                <span className="text-[12px] font-mono uppercase text-sutil">A quién van los tokens</span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-borde bg-lienzo p-3 text-[13px]">
                  {cargandoDetalle ? (
                    <p className="text-sutil text-center py-2">Cargando apuestas…</p>
                  ) : conPago.length === 0 ? (
                    <p className="text-sutil text-center py-2">Nadie ha apostado en esta pregunta.</p>
                  ) : (
                    conPago.map((d) => (
                      <div key={`${d.usuarioId}-${d.lado}`} className="flex justify-between items-center py-1 border-b border-linea/50 last:border-0">
                        <div className="min-w-0">
                          <span className="font-medium text-ink truncate block">{d.nombre}</span>
                          <span className="font-mono text-[10px] text-sutil uppercase">{d.lado} · apostó {d.tokens}</span>
                        </div>
                        <span className="font-mono text-[12px] shrink-0">
                          {d.gana ? <strong className="text-verde">+{d.pago} tokens</strong> : <span className="text-sutil">0 tokens</span>}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-borde bg-lienzo p-3 space-y-1 text-[12px] font-mono text-sutil">
                <div className="flex justify-between">
                  <span>Pool total:</span>
                  <strong className="text-ink">{poolTotal} tokens</strong>
                </div>
                <div className="flex justify-between">
                  <span>A repartir del bando perdedor:</span>
                  <strong className="text-ink">+{poolPerdedor} tokens</strong>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setModalResolucion(null)} className="flex-1 rounded-xl border border-borde bg-white py-3 text-[13px] font-medium text-ink hover:border-ink/30 active:bg-black/5">
                  Cancelar
                </button>
                <button onClick={confirmarResolucion} className="flex-1 rounded-xl bg-ink py-3 text-[13px] font-medium text-white hover:opacity-90 active:opacity-70">
                  Confirmar resolución
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}