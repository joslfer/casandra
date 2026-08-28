import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSesion } from "@/hooks/useSesion";
import { useHaptic } from "@/hooks/useHaptic";
import { probabilidad, useMercado, volumen, type Pregunta } from "@/hooks/useMercado";
import { PantallaLogin } from "@/components/PantallaLogin";
import { LoaderApp } from "@/components/LoaderApp";

const mono = "font-mono text-[11px] uppercase tracking-widest";
const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

function aValorInputLocal(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ModPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const haptic = useHaptic();
  
  const [nuevaAsig, setNuevaAsig] = useState("");
  const [vistaMod, setVistaMod] = useState<"examenes" | "preguntas">("examenes");

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
  const esMod = !!mercado.perfil.mod;

  if (!esAdmin && !esMod) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-lienzo px-6 text-center" style={fuenteApple}>
        <h1 className="text-2xl font-semibold tracking-tight">Sin permisos</h1>
        <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-sutil">
          Esta sección es exclusiva para moderadores o administradores.
        </p>
        <Link to="/" className="mt-8 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85">
          Volver al mercado
        </Link>
      </main>
    );
  }

  const cursoIdActual = mercado.perfil.claseId;
  const clases = mercado.leerClases();
  const cursoActualObj = clases.find(c => c.id === cursoIdActual);
  
  const asignaturas = [...mercado.leerAsignaturas(true)].filter(a => esAdmin || a.claseId === cursoIdActual);
  const preguntas = [...mercado.leerPreguntas({ estado: "todas", todasAdmin: true })].filter(p => {
    const asig = asignaturas.find(a => a.id === p.asignaturaId);
    return asig && (esAdmin || asig.claseId === cursoIdActual);
  });

  return (
    <div className="min-h-screen bg-lienzo pb-28" style={fuenteApple}>
      <header className="fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-5">
          <Link to="/" className="text-[15px] font-semibold tracking-tight text-ink touch-manipulation">
            ← Mercado
          </Link>
          <span className={`${mono} text-sutil`}>Panel Moderador ({cursoActualObj?.nombre || "General"})</span>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-[calc(4rem+env(safe-area-inset-top))]">
        <div className="flex gap-6 border-b border-linea pb-2 mb-6">
          <button
            onClick={() => { haptic(); setVistaMod("examenes"); }}
            className={`${mono} pb-1 border-b-2 transition-all ${vistaMod === "examenes" ? "border-ink text-ink font-semibold" : "border-transparent text-sutil"}`}
          >
            Gestión de Exámenes
          </button>
          <button
            onClick={() => { haptic(); setVistaMod("preguntas"); }}
            className={`${mono} pb-1 border-b-2 transition-all ${vistaMod === "preguntas" ? "border-ink text-ink font-semibold" : "border-transparent text-sutil"}`}
          >
            Gestión de Preguntas
          </button>
        </div>

        {/* VISTA 1: EXÁMENES (Crear, Renombrar, Cerrar/Abrir, Fechas, Eliminar) */}
        {vistaMod === "examenes" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-borde bg-white p-4 shadow-xs space-y-3">
              <h3 className="text-[14px] font-bold text-ink">Añadir Examen en {cursoActualObj?.nombre || "tu curso"}</h3>
              <form onSubmit={async (e) => { 
                e.preventDefault(); 
                if (!nuevaAsig.trim() || !cursoIdActual) return; 
                haptic(); 
                await mercado.crearAsignatura(nuevaAsig, cursoIdActual); 
                setNuevaAsig(""); 
              }} className="flex gap-2">
                <input 
                  value={nuevaAsig} 
                  onChange={(e) => setNuevaAsig(e.target.value)} 
                  placeholder="Nombre del examen..." 
                  className="flex-1 rounded-lg border border-borde px-3 py-1.5 text-[14px] outline-none" 
                />
                <button 
                  type="submit" 
                  disabled={!nuevaAsig.trim()} 
                  className="rounded-lg bg-ink px-4 py-1.5 text-[13px] font-medium text-white disabled:opacity-50"
                >
                  Añadir Examen
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-[13px] font-bold uppercase tracking-wider text-ink border-b border-linea pb-1">{cursoActualObj?.nombre || "Exámenes del Curso"}</h4>
              <div className="space-y-3">
                {asignaturas.map((a) => (
                  <div key={a.id} className="rounded-xl border border-borde bg-white p-4 space-y-3">
                    <input 
                      value={a.nombre} 
                      onChange={(e) => mercado.renombrarAsignatura(a.id, e.target.value)} 
                      className="w-full font-bold text-[15px] bg-transparent outline-none border-b border-linea/60 pb-1" 
                      placeholder="Nombre del examen..."
                    />
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-[12px] font-mono text-sutil">{a.cerrada ? "Examen Cerrado" : "Examen Abierto"}</span>

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
          </div>
        )}

        {/* VISTA 2: PREGUNTAS (Eliminar preguntas del curso) */}
        {vistaMod === "preguntas" && (
          <div className="space-y-3">
            <h3 className="text-[14px] font-bold text-ink mb-2">Preguntas activas en tu curso</h3>
            {preguntas.length === 0 ? (
              <p className="text-sutil text-[13px]">No hay preguntas en este curso.</p>
            ) : (
              preguntas.map((p) => {
                const asig = asignaturas.find(a => a.id === p.asignaturaId);
                return (
                  <div key={p.id} className="rounded-xl border border-borde bg-white p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-mono text-[10px] uppercase text-sutil bg-black/5 px-2 py-0.5 rounded">{asig?.nombre || "Examen"}</span>
                        <h4 className="text-[14px] font-medium text-ink mt-1">{p.titulo}</h4>
                      </div>
                      <span className="font-mono text-[14px] text-sutil shrink-0">{probabilidad(p)}%</span>
                    </div>
                    <div className="flex justify-end pt-2 border-t border-linea">
                      <button 
                        onClick={() => { 
                          haptic(); 
                          if (window.confirm(`¿Seguro que quieres eliminar esta pregunta?`)) {
                            mercado.eliminarPregunta(p.id);
                          } 
                        }} 
                        className="rounded border border-borde px-3 py-1 text-[12px] text-rojo hover:bg-rojo/5"
                      >
                        Eliminar Pregunta
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}