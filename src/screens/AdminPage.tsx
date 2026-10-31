import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSesion } from "@/hooks/useSesion";
import { useHaptic } from "@/hooks/useHaptic";
import { suplantarUsuario, dejarDeSuplantar } from "@/hooks/useSuplantado";
import { nombreVisible, premio, probabilidad, useMercado, volumen, type ApuestaDetalle, type Pregunta } from "@/hooks/useMercado";
import { PantallaLogin } from "@/components/PantallaLogin";
import { PantallaSeleccionClase } from "@/components/PantallaSeleccionClase";
import { LoaderApp } from "@/components/LoaderApp";

const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

// ============================================================================
// TAMAÑOS Y ESTILOS COMPARTIDOS (aquí se ajusta todo el tamaño de letra y botones)
// Regla: texto normal 15-17px, etiquetas 13-14px, campos 16px (evita el zoom de iOS),
// botones de al menos 44px de alto para poder pulsarlos bien con el dedo.
// ============================================================================
const mono = "font-mono text-[13px] uppercase tracking-wider";
const btnBase = "touch-manipulation min-h-[44px] rounded-xl px-4 text-[15px] font-medium transition-colors disabled:opacity-40";
const btnSec = `${btnBase} border border-borde bg-white text-ink active:bg-black/5`;
const btnPrim = `${btnBase} bg-ink text-white active:opacity-70`;
const btnPeligro = `${btnBase} border border-rojo/30 bg-rojo/10 text-rojo active:bg-rojo/20`;
const campo = "min-h-[44px] w-full rounded-xl border border-borde bg-white px-3 text-[16px] text-ink outline-none focus:border-ink/40 disabled:opacity-50";
const etiqueta = "mb-1 block text-[13px] font-medium text-sutil";

type VistaAdmin = "preguntas" | "usuarios" | "examenes";
const FILTRO_TODAS = "todas" as const;

function aValorInputLocal(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ============================================================================
// COMPONENTES DE INTERFAZ REUTILIZABLES
// ============================================================================

// Selector de pestañas a ancho completo (en vez de filas de botones pequeños)
function Segmentos<T extends string>({
  opciones,
  valor,
  onCambio,
}: {
  opciones: { id: T; texto: string }[];
  valor: T;
  onCambio: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-black/5 p-1">
      {opciones.map((o) => (
        <button
          key={o.id}
          onClick={() => onCambio(o.id)}
          className={`min-h-[40px] flex-1 touch-manipulation rounded-lg px-3 text-[15px] font-medium transition-colors ${
            valor === o.id ? "bg-white text-ink shadow-sm" : "text-sutil"
          }`}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

// Sección plegable: oculta lo que no se usa todo el rato
function Desplegable({
  titulo,
  descripcion,
  abiertoInicial = false,
  children,
}: {
  titulo: string;
  descripcion?: string;
  abiertoInicial?: boolean;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  return (
    <section className="rounded-2xl border border-borde bg-white">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex min-h-[56px] w-full touch-manipulation items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left active:bg-black/5"
      >
        <span className="min-w-0">
          <span className="block text-[17px] font-semibold text-ink">{titulo}</span>
          {descripcion && <span className="mt-0.5 block text-[14px] leading-snug text-sutil">{descripcion}</span>}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-sutil transition-transform duration-200 ${abierto ? "rotate-90" : ""}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 5l8 7-8 7V5z" />
        </svg>
      </button>
      {abierto && <div className="space-y-4 border-t border-linea px-4 py-4">{children}</div>}
    </section>
  );
}

// Acciones secundarias de cada tarjeta, plegadas por defecto
function MasOpciones({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div>
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="min-h-[40px] touch-manipulation text-[15px] font-medium text-sutil underline decoration-sutil/40 underline-offset-4 active:opacity-60"
      >
        {abierto ? "Menos opciones" : "Más opciones"}
      </button>
      {abierto && <div className="mt-2 space-y-3 border-t border-linea pt-3">{children}</div>}
    </div>
  );
}

function Pastilla({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[13px] font-medium text-ink">{children}</span>;
}

// ============================================================================
// PÁGINA
// ============================================================================
export function AdminPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const haptic = useHaptic();
  const navigate = useNavigate();

  const [vistaAdmin, setVistaAdmin] = useState<VistaAdmin>("preguntas");
  const [verArchivadas, setVerArchivadas] = useState(false);
  const [claseFiltroId, setClaseFiltroId] = useState<string>(FILTRO_TODAS);
  const [nuevaAsig, setNuevaAsig] = useState("");
  const [nuevaAsigClase, setNuevaAsigClase] = useState("");
  const [nuevaClase, setNuevaClase] = useState("");
  const [modalResolucion, setModalResolucion] = useState<{ pregunta: Pregunta; resultado: boolean } | null>(null);

  const [detalleApuestas, setDetalleApuestas] = useState<ApuestaDetalle[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Tokens iniciales para cuentas nuevas
  const [saldoInicialGuardado, setSaldoInicialGuardado] = useState<number | null>(null);
  const [saldoInicialInput, setSaldoInicialInput] = useState("");
  const [guardandoSaldoInicial, setGuardandoSaldoInicial] = useState(false);

  // Liquidez Global (b)
  const [bGlobalGuardado, setBGlobalGuardado] = useState<number | null>(null);
  const [bGlobalInput, setBGlobalInput] = useState("");
  const [guardandoBGlobal, setGuardandoBGlobal] = useState(false);

  // El panel admin siempre se ve como el admin real: al entrar se sale de la suplantación.
  useEffect(() => {
    dejarDeSuplantar();
  }, []);

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

  useEffect(() => {
    if (!usuario?.esAdmin) return;
    let cancelado = false;

    supabase.rpc("admin_get_saldo_inicial").then(({ data, error }) => {
      if (cancelado || error) return;
      const n = Number(data);
      if (!Number.isFinite(n)) return;
      setSaldoInicialGuardado(n);
      setSaldoInicialInput(String(n));
    });

    supabase.rpc("get_lmsr_b").then(({ data, error }) => {
      if (cancelado || error) return;
      const n = Number(data);
      if (!Number.isFinite(n)) return;
      setBGlobalGuardado(n);
      setBGlobalInput(String(n));
    });

    return () => { cancelado = true; };
  }, [usuario?.esAdmin]);

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
        <p className="mt-2 max-w-xs text-[16px] leading-relaxed text-sutil">
          Esta sección es solo para administradores.
        </p>
        <Link to="/" className="mt-8 rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-85">
          Volver al mercado
        </Link>
      </main>
    );
  }

  if (!mercado.perfil.claseId) {
    return <PantallaSeleccionClase clases={mercado.leerClases()} onElegir={mercado.elegirClase} />;
  }

  // Los moderadores solo tienen la pestaña de exámenes
  const vista: VistaAdmin = esAdmin ? vistaAdmin : "examenes";

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

  const saldoInicialNumero = Number(saldoInicialInput);
  const saldoInicialValido =
    saldoInicialInput.trim() !== "" && Number.isFinite(saldoInicialNumero) && saldoInicialNumero >= 0;
  const saldoInicialCambiado = saldoInicialValido && saldoInicialNumero !== saldoInicialGuardado;

  const guardarSaldoInicial = async () => {
    if (!saldoInicialCambiado) return;
    haptic();
    setGuardandoSaldoInicial(true);
    const { error } = await supabase.rpc("admin_set_saldo_inicial", { p_valor: saldoInicialNumero });
    setGuardandoSaldoInicial(false);
    if (error) {
      window.alert(`No se pudo guardar: ${error.message}`);
      return;
    }
    setSaldoInicialGuardado(saldoInicialNumero);
  };

  const guardarBGlobal = async () => {
    const num = Number(bGlobalInput);
    if (!(num > 0)) return;
    haptic();
    setGuardandoBGlobal(true);
    const { error } = await supabase.rpc("admin_set_lmsr_b", { p_valor: num });
    setGuardandoBGlobal(false);
    if (error) {
      window.alert(error.message);
    } else {
      setBGlobalGuardado(num);
      if (mercado.recargar) await mercado.recargar();
    }
  };

  const cambiarMecanismo = async (p: Pregunta, nuevoMec: string) => {
    const { data: bData } = await supabase.rpc("get_lmsr_b");
    const bVal = nuevoMec === "lmsr" ? (Number(bData) || 5) : null;

    if (volumen(p) > 0) {
      if (!window.confirm(`Esta pregunta ya tiene apuestas. Si cambias el sistema a ${nuevoMec.toUpperCase()}, se cancelarán todas las apuestas actuales, se devolverán los tokens y la pregunta volverá a 0. ¿Continuar?`)) {
        return;
      }
      haptic();
      await supabase.rpc("admin_cambiar_mecanismo_y_resetear", {
        p_pregunta_id: p.id,
        p_nuevo_mecanismo: nuevoMec,
        p_nuevo_b: bVal,
      });
    } else {
      haptic();
      await supabase.from("preguntas").update({ mecanismo: nuevoMec, b: bVal }).eq("id", p.id);
    }
    if (mercado.recargar) await mercado.recargar();
  };

  // ------------------------------------------------------------------
  // Tarjeta de una pregunta abierta / resuelta (no archivada)
  // ------------------------------------------------------------------
  const tarjetaPregunta = (p: Pregunta) => (
    <div key={p.id} className="space-y-3 rounded-2xl border border-borde bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="min-w-0 break-words text-[17px] font-medium leading-snug text-ink">{p.titulo}</h4>
        <span className="shrink-0 font-mono text-[20px] tabular-nums text-ink">{probabilidad(p)}%</span>
      </div>

      <p className="font-mono text-[14px] text-sutil">
        vol {volumen(p)} · {p.resultado === null ? "abierta" : p.resultado ? "entró" : "no entró"} · {p.mecanismo === "lmsr" ? "LMSR" : "PM"}
      </p>

      <div className="flex gap-2">
        {p.resultado === null ? (
          <>
            <button
              onClick={() => { haptic(); setModalResolucion({ pregunta: p, resultado: true }); }}
              className={`${btnBase} flex-1 border border-verde/30 bg-verde/10 text-verde active:bg-verde/20`}
            >
              Entró
            </button>
            <button
              onClick={() => { haptic(); setModalResolucion({ pregunta: p, resultado: false }); }}
              className={`${btnBase} flex-1 border border-rojo/30 bg-rojo/10 text-rojo active:bg-rojo/20`}
            >
              No entró
            </button>
          </>
        ) : (
          <>
            <button onClick={() => { haptic(); mercado.desresolver(p.id); }} className={`${btnSec} flex-1`}>Desresolver</button>
            <button onClick={() => { haptic(); mercado.archivar(p.id, true); }} className={`${btnSec} flex-1`}>Archivar</button>
          </>
        )}
      </div>

      <MasOpciones>
        <label className="block">
          <span className={etiqueta}>Sistema de apuestas</span>
          <select
            value={p.mecanismo}
            onChange={(e) => cambiarMecanismo(p, e.target.value)}
            className={campo}
          >
            <option value="lmsr">LMSR</option>
            <option value="pari_mutuel">Pari-Mutuel</option>
          </select>
        </label>

        <label className="block">
          <span className={etiqueta}>Mover a otro examen</span>
          <select
            value={p.asignaturaId}
            onChange={(e) => mercado.moverPregunta(p.id, e.target.value)}
            className={campo}
          >
            {asignaturas.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </label>

        <div className="flex gap-2">
          <button
            onClick={() => { haptic(); const t = window.prompt("Nuevo título", p.titulo); if (t) mercado.editarTitulo(p.id, t); }}
            className={`${btnSec} flex-1`}
          >
            Editar título
          </button>
          <button
            onClick={() => { haptic(); if (window.confirm(`¿Eliminar pregunta?`)) { mercado.eliminarPregunta(p.id); } }}
            className={`${btnPeligro} flex-1`}
          >
            Eliminar
          </button>
        </div>
      </MasOpciones>
    </div>
  );

  return (
    <div className="min-h-screen bg-lienzo pb-28" style={fuenteApple}>
      <header className="fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-5">
          <Link to="/" className="flex min-h-[44px] touch-manipulation items-center text-[17px] font-semibold tracking-tight text-ink">
            ← Mercado
          </Link>
          <span className={`${mono} text-sutil`}>{esAdmin ? "Panel Admin" : "Panel Moderador"}</span>
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-5 pt-[calc(4.5rem+env(safe-area-inset-top))]">
        {/* NAVEGACIÓN: tres pestañas + un único selector de curso */}
        <div className="mb-6 space-y-3">
          {esAdmin && (
            <Segmentos<VistaAdmin>
              opciones={[
                { id: "preguntas", texto: "Preguntas" },
                { id: "usuarios", texto: "Usuarios" },
                { id: "examenes", texto: "Exámenes" },
              ]}
              valor={vistaAdmin}
              onCambio={(v) => { haptic(); setVistaAdmin(v); }}
            />
          )}

          <label className="block">
            <span className={etiqueta}>Curso</span>
            <select
              value={claseFiltroId}
              onChange={(e) => { haptic(); setClaseFiltroId(e.target.value); }}
              className={campo}
            >
              <option value={FILTRO_TODAS}>Todos los cursos</option>
              {clases.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </label>
        </div>

        {/* VISTA: PREGUNTAS (Solo Admin) */}
        {vista === "preguntas" && esAdmin && (
          <div className="space-y-6">
            <Segmentos<"abiertas" | "archivadas">
              opciones={[
                { id: "abiertas", texto: "Abiertas" },
                { id: "archivadas", texto: "Archivadas" },
              ]}
              valor={verArchivadas ? "archivadas" : "abiertas"}
              onCambio={(v) => { haptic(); setVerArchivadas(v === "archivadas"); }}
            />

            {!verArchivadas && (() => {
              const preguntasActivas = [...mercado.leerPreguntas({ estado: "todas", todasAdmin: true })]
                .filter((p) => !p.archivada)
                .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }));

              const huerfanas = preguntasActivas.filter((p) => !asignaturas.some((a) => a.id === p.asignaturaId));

              const bloques = clasesFiltradas.map((clase) => {
                const asignaturasClase = asignaturas.filter((a) => a.claseId === clase.id);
                const asigIds = asignaturasClase.map((a) => a.id);
                const preguntasClase = preguntasActivas.filter((p) => asigIds.includes(p.asignaturaId));
                if (preguntasClase.length === 0) return null;

                return (
                  <div key={clase.id} className="space-y-4">
                    <h2 className="border-l-2 border-ink py-0.5 pl-3 text-[19px] font-bold tracking-tight text-ink">
                      {clase.nombre}
                    </h2>

                    <div className="space-y-6">
                      {asignaturasClase.map((asignatura) => {
                        const preguntasAsignatura = preguntasClase.filter((p) => p.asignaturaId === asignatura.id);
                        if (preguntasAsignatura.length === 0) return null;

                        return (
                          <div key={asignatura.id} className="space-y-2">
                            <h3 className="font-mono text-[14px] font-bold uppercase tracking-wider text-sutil">
                              {asignatura.nombre}
                            </h3>
                            <div className="space-y-3">
                              {preguntasAsignatura.map((p) => tarjetaPregunta(p))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });

              const hayContenido = bloques.some(Boolean) || (viendoTodas && huerfanas.length > 0);

              return (
                <div className="space-y-8">
                  {bloques}

                  {!hayContenido && (
                    <p className="py-8 text-center text-[16px] text-sutil">No hay preguntas abiertas en este curso.</p>
                  )}

                  {viendoTodas && huerfanas.length > 0 && (
                    <div className="space-y-3 rounded-2xl border border-rojo/30 bg-rojo/5 p-4">
                      <h2 className="text-[17px] font-bold text-rojo">Preguntas huérfanas ({huerfanas.length})</h2>
                      {huerfanas.map((p) => (
                        <div key={p.id} className="space-y-2">
                          <p className="break-words text-[15px] text-rojo">{p.titulo}</p>
                          <select
                            value={p.asignaturaId || ""}
                            onChange={(e) => mercado.moverPregunta(p.id, e.target.value)}
                            className={`${campo} border-rojo/40`}
                          >
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

            {verArchivadas && (() => {
              const archivadas = [...mercado.leerPreguntas({ estado: "archivadas", todasAdmin: true })]
                .filter((p) => viendoTodas || claseIdDeAsignatura(p.asignaturaId) === claseFiltroId)
                .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' }));

              if (archivadas.length === 0) {
                return <p className="py-8 text-center text-[16px] text-sutil">No hay preguntas archivadas.</p>;
              }

              return (
                <div className="space-y-3">
                  {archivadas.map((p) => (
                    <div key={p.id} className="space-y-3 rounded-2xl border border-borde bg-white p-4">
                      <h2 className="break-words text-[17px] font-medium leading-snug text-ink">{p.titulo}</h2>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => { haptic(); mercado.archivar(p.id, false); }} className={`${btnSec} flex-1`}>Desarchivar</button>
                        <button onClick={() => { haptic(); mercado.desresolver(p.id); }} className={`${btnSec} flex-1`}>Desresolver</button>
                      </div>
                      <button
                        onClick={() => { haptic(); if (window.confirm(`¿Eliminar?`)) { mercado.eliminarPregunta(p.id); } }}
                        className={`${btnPeligro} w-full`}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* VISTA: USUARIOS (Solo Admin puede gestionar roles mod) */}
        {vista === "usuarios" && esAdmin && (
          <div className="space-y-4">
            {/* AJUSTES DEL MERCADO: plegados porque se tocan muy poco */}
            <Desplegable
              titulo="Ajustes del mercado"
              descripcion="Tokens iniciales y liquidez (b)"
            >
              {/* TOKENS INICIALES PARA CUENTAS NUEVAS */}
              <div className="space-y-2">
                <h3 className="text-[16px] font-bold text-ink">Tokens iniciales</h3>
                <p className="text-[14px] leading-snug text-sutil">
                  Tokens que recibe cada cuenta nueva al crearse. No afecta a los usuarios que ya existen.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={saldoInicialInput}
                    onChange={(e) => setSaldoInicialInput(e.target.value)}
                    disabled={saldoInicialGuardado === null}
                    placeholder={saldoInicialGuardado === null ? "Cargando…" : "0"}
                    className={`${campo} flex-1 font-mono tabular-nums`}
                  />
                  <button
                    onClick={guardarSaldoInicial}
                    disabled={!saldoInicialCambiado || guardandoSaldoInicial}
                    className={`${btnPrim} shrink-0`}
                  >
                    {guardandoSaldoInicial ? "Guardando…" : "Guardar"}
                  </button>
                </div>
                {saldoInicialGuardado !== null && (
                  <p className="font-mono text-[13px] text-sutil">Valor actual: {saldoInicialGuardado} tokens</p>
                )}
              </div>

              <div className="border-t border-linea" />

              {/* LIQUIDEZ GLOBAL LMSR (b) */}
              <div className="space-y-2">
                <h3 className="text-[16px] font-bold text-ink">Liquidez (b) por defecto</h3>
                <p className="text-[14px] leading-snug text-sutil">
                  Determina lo "ligero" o "pesado" que es el mercado LMSR globalmente. Un valor bajo (ej. 5) hace que los % cambien muy rápido.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={bGlobalInput}
                    onChange={(e) => setBGlobalInput(e.target.value)}
                    disabled={bGlobalGuardado === null}
                    placeholder={bGlobalGuardado === null ? "Cargando…" : "5"}
                    className={`${campo} flex-1 font-mono tabular-nums`}
                  />
                  <button
                    onClick={guardarBGlobal}
                    disabled={!bGlobalInput.trim() || Number(bGlobalInput) <= 0 || guardandoBGlobal}
                    className={`${btnPrim} shrink-0`}
                  >
                    {guardandoBGlobal ? "Guardando…" : "Guardar"}
                  </button>
                </div>
                {bGlobalGuardado !== null && (
                  <p className="font-mono text-[13px] text-sutil">Valor actual: b={bGlobalGuardado}</p>
                )}
              </div>
            </Desplegable>

            {(() => {
              const alumnos = [...mercado.leerAlumnos(true)]
                .filter((a) => viendoTodas || a.claseId === claseFiltroId)
                .sort((a, b) => nombreVisible(a).localeCompare(nombreVisible(b), 'es', { sensitivity: 'base' }));

              if (alumnos.length === 0) {
                return <p className="py-8 text-center text-[16px] text-sutil">No hay usuarios en este curso.</p>;
              }

              return alumnos.map((a) => {
                const apostado = mercado.apostadoAbierto[a.id] || 0;
                const total = Math.round(a.saldo + apostado);
                return (
                  <div key={a.id} className="space-y-3 rounded-2xl border border-borde bg-white p-4">
                    <div>
                      <p className="break-words text-[17px] font-semibold text-ink">{nombreVisible(a)}</p>
                      <p className="mt-0.5 font-mono text-[14px] text-sutil">
                        {total} tokens{apostado > 0 && ` (${Math.round(a.saldo)} libres)`}
                      </p>
                      {(a.pausado || a.mod) && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {a.pausado && <Pastilla>Pausado</Pastilla>}
                          {a.mod && <Pastilla>Mod de exámenes</Pastilla>}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="mr-auto text-[14px] text-sutil">Ajustar tokens</span>
                      <button onClick={() => { haptic(); mercado.darTokens(a.id, -20); }} className="h-11 min-w-[52px] touch-manipulation rounded-xl border border-borde bg-white px-2 font-mono text-[15px] text-rojo active:bg-black/5">−20</button>
                      <button onClick={() => { haptic(); mercado.darTokens(a.id, -1); }} className="h-11 w-11 touch-manipulation rounded-xl border border-borde bg-white font-mono text-[18px] text-ink active:bg-black/5">−</button>
                      <button onClick={() => { haptic(); mercado.darTokens(a.id, 1); }} className="h-11 w-11 touch-manipulation rounded-xl border border-borde bg-white font-mono text-[18px] text-ink active:bg-black/5">+</button>
                    </div>

                    <button
                      onClick={() => {
                        haptic();
                        suplantarUsuario({ id: a.id, nombre: nombreVisible(a) });
                        navigate({ to: "/" });
                      }}
                      disabled={a.pausado || !a.claseId || a.id === usuario.id}
                      className={`${btnSec} w-full`}
                    >
                      Entrar como {nombreVisible(a)}
                    </button>

                    <MasOpciones>
                      <label className="block">
                        <span className={etiqueta}>Curso</span>
                        <select
                          value={a.claseId || ""}
                          onChange={(e) => { haptic(); mercado.adminCambiarClaseAlumno(a.id, e.target.value); }}
                          className={campo}
                        >
                          <option value="" disabled>Sin curso</option>
                          {clases.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => { haptic(); mercado.toggleMod(a.id, !a.mod); }}
                          className={a.mod ? `${btnBase} border border-verde bg-verde text-white` : btnSec}
                        >
                          {a.mod ? "Mod activo" : "Hacer mod"}
                        </button>
                        <button
                          onClick={() => { haptic(); mercado.pausarAlumno(a.id, !a.pausado); }}
                          className={a.pausado ? `${btnBase} border border-ink bg-ink text-white` : btnSec}
                        >
                          {a.pausado ? "Reanudar" : "Pausar"}
                        </button>
                      </div>

                      <button
                        onClick={() => { haptic(); if (window.confirm(`¿Devolver apuestas?`)) mercado.adminRetirarApuestas(a.id); }}
                        disabled={apostado === 0}
                        className={`${btnSec} w-full`}
                      >
                        Quitar apuestas{apostado > 0 ? ` (${apostado})` : ""}
                      </button>
                    </MasOpciones>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* VISTA: EXÁMENES (Accesible por Admin y Mod) */}
        {vista === "examenes" && (
          <div className="space-y-4">
            <Desplegable titulo="Crear examen" abiertoInicial>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!nuevaAsig.trim() || !nuevaAsigClase) return;
                  haptic();
                  await mercado.crearAsignatura(nuevaAsig, nuevaAsigClase);
                  setNuevaAsig("");
                }}
                className="space-y-3"
              >
                <label className="block">
                  <span className={etiqueta}>Nombre del examen</span>
                  <input value={nuevaAsig} onChange={(e) => setNuevaAsig(e.target.value)} placeholder="Nuevo examen..." className={campo} />
                </label>
                <label className="block">
                  <span className={etiqueta}>Curso</span>
                  <select value={nuevaAsigClase} onChange={(e) => setNuevaAsigClase(e.target.value)} className={campo}>
                    <option value="" disabled>Elige un curso...</option>
                    {clases.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </label>
                <button type="submit" disabled={!nuevaAsig.trim() || !nuevaAsigClase} className={`${btnPrim} w-full`}>
                  Crear examen
                </button>
              </form>
            </Desplegable>

            {esAdmin && (
              <Desplegable titulo="Gestionar cursos" descripcion="Añadir, renombrar o eliminar cursos">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!nuevaClase.trim()) return;
                    haptic();
                    await mercado.crearClase(nuevaClase);
                    setNuevaClase("");
                  }}
                  className="flex gap-2"
                >
                  <input value={nuevaClase} onChange={(e) => setNuevaClase(e.target.value)} placeholder="Nuevo curso..." className={`${campo} flex-1`} />
                  <button type="submit" disabled={!nuevaClase.trim()} className={`${btnPrim} shrink-0`}>Añadir</button>
                </form>

                <div className="space-y-2 border-t border-linea pt-4">
                  <span className="block text-[13px] font-medium text-sutil">Cursos existentes</span>
                  {clases.map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <input
                        value={c.nombre}
                        onChange={(e) => mercado.renombrarClase(c.id, e.target.value)}
                        className={`${campo} flex-1 bg-black/5 font-medium`}
                      />
                      <button
                        onClick={() => { haptic(); if (window.confirm(`¿Eliminar curso ${c.nombre}?`)) mercado.eliminarClase(c.id); }}
                        className={`${btnPeligro} shrink-0`}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </Desplegable>
            )}

            {clasesFiltradas.map((clase) => {
              const asignaturasClase = asignaturas.filter((a) => a.claseId === clase.id);
              if (asignaturasClase.length === 0) return null;

              return (
                <div key={clase.id} className="space-y-3 pt-2">
                  <h4 className="border-b border-linea pb-1 font-mono text-[15px] font-bold uppercase tracking-wider text-ink">{clase.nombre}</h4>
                  <div className="space-y-3">
                    {asignaturasClase.map((a) => (
                      <div key={a.id} className="space-y-3 rounded-2xl border border-borde bg-white p-4">
                        <div className="flex items-center gap-2">
                          <input
                            value={a.nombre}
                            onChange={(e) => mercado.renombrarAsignatura(a.id, e.target.value)}
                            className={`${campo} flex-1 font-semibold`}
                            placeholder="Nombre del examen..."
                          />
                          {a.cerrada && <Pastilla>Cerrado</Pastilla>}
                        </div>

                        <label className="block">
                          <span className={etiqueta}>Fecha del examen</span>
                          <div className="flex gap-2">
                            <input
                              type="datetime-local"
                              value={a.fechaExamen ? aValorInputLocal(a.fechaExamen) : ""}
                              onChange={(e) => { const v = e.target.value; mercado.editarFechaExamen(a.id, v ? new Date(v) : null); }}
                              className={`${campo} min-w-0 flex-1`}
                            />
                            {a.fechaExamen && (
                              <button onClick={() => mercado.editarFechaExamen(a.id, null)} className={`${btnSec} shrink-0`}>Quitar</button>
                            )}
                          </div>
                        </label>

                        <button
                          onClick={() => { haptic(); mercado.pausarExamen(a.id, !a.cerrada); }}
                          className={`${a.cerrada ? btnPrim : btnSec} w-full`}
                        >
                          {a.cerrada ? "Reabrir examen" : "Cerrar examen"}
                        </button>

                        <MasOpciones>
                          <label className="block">
                            <span className={etiqueta}>Curso</span>
                            <select
                              value={a.claseId || ""}
                              onChange={(e) => { haptic(); mercado.cambiarClaseAsignatura(a.id, e.target.value); }}
                              className={campo}
                            >
                              {clases.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                          </label>
                          <button
                            onClick={() => { haptic(); if (window.confirm(`¿Eliminar examen "${a.nombre}"?`)) mercado.eliminarAsignatura(a.id); }}
                            className={`${btnPeligro} w-full`}
                          >
                            Eliminar examen
                          </button>
                        </MasOpciones>
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

        const conPago = detalleApuestas.map((d) => {
          const gana = d.lado === (resultadoSi ? "si" : "no");
          const pago = gana
            ? Math.round(p.mecanismo === "lmsr" ? d.acciones : premio(d.tokens, d.lado, p.poolSi, p.poolNo))
            : 0;
          return { ...d, gana, pago };
        }).sort((a, b) => b.pago - a.pago);

        const totalAPagar = conPago.reduce((acc, curr) => acc + curr.pago, 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModalResolucion(null)}>
            <div
              className="max-h-[90dvh] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl border border-borde bg-white p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
              style={fuenteApple}
            >
              <div>
                <span className="font-mono text-[13px] uppercase tracking-wider text-sutil">Resolución: {resultadoSi ? "ENTRÓ (SÍ)" : "NO ENTRÓ (NO)"}</span>
                <h3 className="mt-1 break-words text-[19px] font-semibold leading-snug text-ink">{p.titulo}</h3>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[13px] uppercase tracking-wider text-sutil">A quién van los tokens</span>
                <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-borde bg-lienzo p-3 text-[15px]">
                  {cargandoDetalle ? (
                    <p className="py-2 text-center text-sutil">Cargando apuestas…</p>
                  ) : conPago.length === 0 ? (
                    <p className="py-2 text-center text-sutil">Nadie ha apostado en esta pregunta.</p>
                  ) : (
                    conPago.map((d) => (
                      <div key={`${d.usuarioId}-${d.lado}`} className="flex items-center justify-between gap-3 border-b border-linea/50 py-2 last:border-0">
                        <div className="min-w-0">
                          <span className="block truncate font-medium text-ink">{d.nombre}</span>
                          <span className="font-mono text-[13px] uppercase text-sutil">{d.lado} · apostó {d.tokens}</span>
                        </div>
                        <span className="shrink-0 font-mono text-[15px]">
                          {d.gana ? <strong className="text-verde">+{d.pago} tokens</strong> : <span className="text-sutil">0 tokens</span>}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-borde bg-lienzo p-3 font-mono text-[14px] text-sutil">
                <div className="flex justify-between gap-3">
                  <span>{p.mecanismo === "lmsr" ? "Volumen total:" : "Pool total:"}</span>
                  <strong className="shrink-0 text-ink">{poolTotal} tokens</strong>
                </div>
                {p.mecanismo === "lmsr" ? (
                  <div className="flex justify-between gap-3">
                    <span>Tokens a pagar por el AMM (1 token / acción):</span>
                    <strong className="shrink-0 text-ink">{Math.round(totalAPagar)} tokens</strong>
                  </div>
                ) : (
                  <div className="flex justify-between gap-3">
                    <span>A repartir del bando perdedor:</span>
                    <strong className="shrink-0 text-ink">+{poolPerdedor} tokens</strong>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setModalResolucion(null)} className={`${btnSec} flex-1 py-3`}>Cancelar</button>
                <button onClick={confirmarResolucion} className={`${btnPrim} flex-1 py-3`}>Confirmar resolución</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}