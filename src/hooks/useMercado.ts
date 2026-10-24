/**
- CAPA DE DATOS CONECTADA A SUPABASE
- ----------------------------------
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Lado = "si" | "no";
export type Mecanismo = "pari_mutuel" | "lmsr";

export interface Clase {
  id: string;
  nombre: string;
}

export interface Asignatura {
  id: string;
  claseId: string;
  nombre: string;
  cerrada: boolean;
  fechaExamen: number | null;
}

export interface Pregunta {
  id: string;
  titulo: string;
  asignaturaId: string;
  asignaturaNombre: string;
  poolSi: number;
  poolNo: number;
  historial: number[];
  misSi: number;
  misNo: number;
  resultado: boolean | null;
  archivada: boolean;
  creadaEn: number;
  mecanismo: Mecanismo;
  qSi: number;
  qNo: number;
  b: number | null;
  misAccionesSi: number;
  misAccionesNo: number;
}

export interface Apuesta {
  id: string;
  usuarioId: string;
  usuario: string;
  tokens: number;
  cuando: number;
}

export interface ApuestaDetalle {
  usuarioId: string;
  nombre: string;
  lado: Lado;
  tokens: number;
  acciones: number;
}

export interface Usuario {
  id: string;
  nombre: string;
  esAdmin: boolean;
}

export interface Alumno {
  id: string;
  claseId: string | null;
  nombre: string;
  saldo: number;
  pausado: boolean;
  usaHash: boolean;
  hash: string;
  mod: boolean;
}

type InfoMercado = Pick<Pregunta, "poolSi" | "poolNo"> &
  Partial<Pick<Pregunta, "mecanismo" | "qSi" | "qNo" | "b">>;

export function lmsrProbSi(qSi: number, qNo: number, b: number): number {
  return 1 / (1 + Math.exp((qNo - qSi) / b));
}

export function lmsrCoste(qSi: number, qNo: number, b: number): number {
  const m = Math.max(qSi, qNo);
  return m + b * Math.log(Math.exp((qSi - m) / b) + Math.exp((qNo - m) / b));
}

export function lmsrAcciones(lado: Lado, tokens: number, qSi: number, qNo: number, b: number): number {
  const p = lmsrProbSi(qSi, qNo, b);
  const e = Math.exp(tokens / b);
  if (lado === "si") return b * Math.log((e - 1 + p) / p);
  return b * Math.log((e - p) / (1 - p));
}

function lmsrParams(p: InfoMercado): { qSi: number; qNo: number; b: number } | null {
  if (p.mecanismo !== "lmsr" || !p.b || p.b <= 0) return null;
  return { qSi: p.qSi ?? 0, qNo: p.qNo ?? 0, b: p.b };
}

export function probabilidad(p: InfoMercado): number {
  const l = lmsrParams(p);
  if (l) return Math.round(lmsrProbSi(l.qSi, l.qNo, l.b) * 100);
  const total = p.poolSi + p.poolNo;
  if (total === 0) return 50;
  return Math.round((p.poolSi / total) * 100);
}

export function volumen(p: Pick<Pregunta, "poolSi" | "poolNo">): number {
  return p.poolSi + p.poolNo;
}

export function premio(stake: number, lado: Lado, poolSi: number, poolNo: number): number {
  const total = poolSi + poolNo;
  if (lado === "si") return poolSi === 0 ? 0 : total * (stake / poolSi);
  return poolNo === 0 ? 0 : total * (stake / poolNo);
}

export function pagoSiGana(p: Pregunta, lado: Lado): number {
  if (p.mecanismo === "lmsr") return lado === "si" ? p.misAccionesSi : p.misAccionesNo;
  return premio(lado === "si" ? p.misSi : p.misNo, lado, p.poolSi, p.poolNo);
}

export function multiplicador(lado: Lado, p: InfoMercado): number {
  const l = lmsrParams(p);
  if (l) return lmsrAcciones(lado, 1, l.qSi, l.qNo, l.b);
  const poolSi = p.poolSi + (lado === "si" ? 1 : 0);
  const poolNo = p.poolNo + (lado === "no" ? 1 : 0);
  return premio(1, lado, poolSi, poolNo);
}

export function hashAleatorio(): string {
  const abc = "abcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}

export const RECOMPENSA_CREAR_PREGUNTA = 0;

const MS_SEMANA = 7 * 24 * 60 * 60 * 1000;

export function haceTexto(cuando: number, ahora = Date.now()): string {
  const min = Math.max(1, Math.round((ahora - cuando) / 60000));
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} ${h === 1 ? "hora" : "horas"}`;
  const d = Math.round(h / 24);
  return `hace ${d} ${d === 1 ? "día" : "días"}`;
}

export function nombreCorto(titulo: string): string {
  const limpio = titulo.replace(/^¿/, "").replace(/\?$/, "");
  const palabras = limpio.split(" ").slice(0, 3).join(" ");
  return palabras.charAt(0).toUpperCase() + palabras.slice(1);
}

export function nombreVisible(a: Alumno): string {
  return a.usaHash ? `#${a.hash}` : a.nombre || a.id;
}

// -----------------------------------------------------
// FUNCIÓN ESTADÍSTICAS GLOBAL (EXTRAÍDA)
// -----------------------------------------------------
export function calcularEstadisticas(ranking: any[]) {
  const tokensTotales = ranking.reduce((total, r) => total + (r.tokens || 0), 0);
  const tokensApostados = ranking.reduce((total, r) => total + (r.apostado || 0), 0);
  
  const participantes = ranking.filter((r) => (r.apostado || 0) > 0).length;
  const usuariosTotales = ranking.length;
  
  const tokensPromedio = usuariosTotales > 0 ? tokensTotales / usuariosTotales : 0;
  const opinionesAgregadas = tokensPromedio > 0 ? tokensApostados / tokensPromedio : 0;

  return {
    tokensApostados,
    tokensTotales,
    pctSobreTotal: tokensTotales > 0 ? Math.round((tokensApostados / tokensTotales) * 100) : 0,
    participantes,
    usuariosTotales,
    opinionesAgregadas,
  };
}


export function useMercado(usuario: Usuario | null) {
  const [clases, setClases] = useState<Clase[]>([]);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [apuestas, setApuestas] = useState<Apuesta[]>([]);
  const [miPerfil, setMiPerfil] = useState<Alumno | null>(null);
  const [apostadoAbierto, setApostadoAbierto] = useState<Record<string, number>>({});
  const [activosSemana, setActivosSemana] = useState<string[]>([]);

  const [perfilCargado, setPerfilCargado] = useState(false);
  const [idCargado, setIdCargado] = useState<string | null>(null);

  const debounceClases = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const debounceAsignaturas = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const dc = debounceClases.current;
    const da = debounceAsignaturas.current;
    return () => {
      Object.values(dc).forEach(clearTimeout);
      Object.values(da).forEach(clearTimeout);
    };
  }, []);

  const cargarDatos = useCallback(async () => {
    const desdeSemana = new Date(Date.now() - MS_SEMANA).toISOString();

    const [resClases, resAsig, resPerf, resPreg, resApu, resApuAbiertas, resApuSemana] = await Promise.all([
      supabase.from("clases").select("*").order("nombre"),
      supabase.from("asignaturas").select("*"),
      supabase.from("perfiles").select("*"),
      supabase.from("preguntas").select("*").order("creada_en", { ascending: false }),
      supabase.from("apuestas").select("*, perfiles(nombre, usa_hash, hash)").order("cuando", { ascending: false }).limit(60),
      supabase
        .from("apuestas")
        .select("usuario_id, tokens, preguntas!inner(resultado, archivada)")
        .is("preguntas.resultado", null)
        .eq("preguntas.archivada", false),
      supabase
        .from("apuestas")
        .select("usuario_id")
        .gte("cuando", desdeSemana)
    ]);

    let misApuestas: any[] = [];
    if (usuario) {
      const { data } = await supabase.from("apuestas").select("*").eq("usuario_id", usuario.id);
      if (data) misApuestas = data;
    }

    if (resClases.data) {
      setClases((prev) => {
        const pendientes = new Set(Object.keys(debounceClases.current));
        const frescas = resClases.data.map((c: any) => ({ id: c.id, nombre: c.nombre }));
        if (pendientes.size === 0) return frescas;
        return frescas.map((c) => {
          if (!pendientes.has(c.id)) return c;
          const local = prev.find((p) => p.id === c.id);
          return local ?? c;
        });
      });
    }

    if (resAsig.data) {
      setAsignaturas((prev) => {
        const pendientes = new Set(Object.keys(debounceAsignaturas.current));
        const frescas = resAsig.data.map((a: any) => ({
          id: a.id,
          claseId: a.clase_id,
          nombre: a.nombre,
          cerrada: a.cerrada,
          fechaExamen: a.fecha_examen ? new Date(a.fecha_examen).getTime() : null
        }));
        if (pendientes.size === 0) return frescas;
        return frescas.map((a) => {
          if (!pendientes.has(a.id)) return a;
          const local = prev.find((p) => p.id === a.id);
          return local ?? a;
        });
      });
    }

    if (resPerf.data) {
      const alums = resPerf.data.map((p: any) => ({
        id: p.id,
        claseId: p.clase_id || null,
        nombre: p.nombre || "",
        saldo: Number(p.saldo),
        pausado: p.pausado,
        usaHash: p.usa_hash,
        hash: p.hash || "",
        mod: !!p.mod
      }));
      setAlumnos(alums);
      if (usuario) {
        const mio = alums.find((a) => a.id === usuario.id);
        if (mio) setMiPerfil(mio);
      }
    }

    if (resApu.data) {
      const apFormateadas: Apuesta[] = resApu.data.map((a: any) => {
        const p = a.perfiles;
        let nombre = "Anónimo";
        if (p) nombre = p.usa_hash ? `#${p.hash}` : p.nombre || "Anónimo";
        return {
          id: a.id,
          usuarioId: a.usuario_id,
          usuario: nombre,
          tokens: Number(a.tokens),
          cuando: new Date(a.cuando).getTime()
        };
      });
      setApuestas(apFormateadas);
    }

    if (resApuAbiertas.data) {
      const acumulado: Record<string, number> = {};
      for (const a of resApuAbiertas.data as any[]) {
        acumulado[a.usuario_id] = (acumulado[a.usuario_id] || 0) + Number(a.tokens);
      }
      setApostadoAbierto(acumulado);
    }

    if (resApuSemana.data) {
      const ids = new Set<string>();
      for (const a of resApuSemana.data as any[]) ids.add(a.usuario_id);
      setActivosSemana(Array.from(ids));
    }

    if (resPreg.data) {
      const pregs: Pregunta[] = resPreg.data.map((p: any) => {
        let misSi = 0;
        let misNo = 0;
        let misAccionesSi = 0;
        let misAccionesNo = 0;
        for (const ap of misApuestas) {
          if (ap.pregunta_id === p.id) {
            if (ap.lado === "si") {
              misSi += Number(ap.tokens);
              misAccionesSi += Number(ap.acciones) || 0;
            } else {
              misNo += Number(ap.tokens);
              misAccionesNo += Number(ap.acciones) || 0;
            }
          }
        }
        return {
          id: p.id,
          titulo: p.titulo,
          asignaturaId: p.asignatura_id ?? "",
          asignaturaNombre: p.asignatura_nombre ?? "",
          poolSi: Number(p.pool_si),
          poolNo: Number(p.pool_no),
          historial: typeof p.historial === "string" ? JSON.parse(p.historial) : p.historial || [],
          misSi,
          misNo,
          resultado: p.resultado,
          archivada: p.archivada,
          creadaEn: new Date(p.creada_en).getTime(),
          mecanismo: (p.mecanismo === "lmsr" ? "lmsr" : "pari_mutuel") as Mecanismo,
          qSi: Number(p.q_si ?? 0),
          qNo: Number(p.q_no ?? 0),
          b: p.b == null ? null : Number(p.b),
          misAccionesSi,
          misAccionesNo
        };
      });
      setPreguntas(pregs);
    }

    setIdCargado(usuario ? usuario.id : null);
    setPerfilCargado(true);
  }, [usuario]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const recargar = useCallback(async () => {
    await cargarDatos();
  }, [cargarDatos]);

  const esAdmin = !!usuario?.esAdmin;
  const esMod = !!miPerfil?.mod;
  const tienePermisoExamenes = esAdmin || esMod;

  const saldo = miPerfil ? miPerfil.saldo : 0;
  const pausado = miPerfil ? miPerfil.pausado : false;
  const miClaseId = miPerfil?.claseId;

  const perfil = miPerfil
    ? { nombre: miPerfil.nombre, usaHash: miPerfil.usaHash, hash: miPerfil.hash, claseId: miPerfil.claseId, mod: miPerfil.mod }
    : { nombre: "", usaHash: false, hash: "", claseId: null, mod: false };

  const miNombre = perfil.usaHash ? `#${perfil.hash}` : perfil.nombre || usuario?.nombre || "Tú";

  const leerClases = useCallback((): Clase[] => clases, [clases]);

  const leerAsignaturas = useCallback((todasAdmin = false): Asignatura[] => {
    return asignaturas.filter(a => (todasAdmin && tienePermisoExamenes) ? true : a.claseId === miClaseId);
  }, [asignaturas, miClaseId, tienePermisoExamenes]);

  const leerAlumnos = useCallback((todasAdmin = false): Alumno[] => {
    return alumnos.filter(a => (todasAdmin && tienePermisoExamenes) ? true : a.claseId === miClaseId);
  }, [alumnos, miClaseId, tienePermisoExamenes]);

  const leerApuestas = useCallback((): Apuesta[] => {
    const alumnosClase = new Set(alumnos.filter(a => a.claseId === miClaseId).map(a => a.id));
    const agrupadas: Apuesta[] = [];
    for (const a of apuestas) {
      if (!alumnosClase.has(a.usuarioId)) continue;
      const ultima = agrupadas[agrupadas.length - 1];
      if (ultima && ultima.usuario === a.usuario) {
        ultima.tokens += a.tokens;
      } else {
        agrupadas.push({ ...a });
      }
    }
    return agrupadas.slice(0, 15);
  }, [apuestas, alumnos, miClaseId]);

  const leerWAU = useCallback((): number => {
    const alumnosClase = new Set(alumnos.filter(a => a.claseId === miClaseId).map(a => a.id));
    return activosSemana.filter((id) => alumnosClase.has(id)).length;
  }, [activosSemana, alumnos, miClaseId]);

  const leerRanking = useCallback(() => {
    return [...alumnos]
      .filter(a => a.claseId === miClaseId)
      .map((a) => {
        const apostado = Math.round(apostadoAbierto[a.id] || 0);
        const tokens = Math.round(a.saldo + (apostadoAbierto[a.id] || 0));
        return {
          usuario: a.usaHash ? `#${a.hash}` : (a.nombre || "Anónimo"),
          tokens,
          apostado,
          porcentaje: tokens > 0 ? Math.round((apostado / tokens) * 100) : 0
        };
      })
      .sort((a, b) => {
        if (b.tokens !== a.tokens) {
          return b.tokens - a.tokens;
        }
        return a.usuario.localeCompare(b.usuario, 'es', { sensitivity: 'base' });
      })
      .slice(0, 10);
  }, [alumnos, apostadoAbierto, miClaseId]);

  const leerPreguntas = useCallback(
    (opts?: {
      asignaturaId?: string;
      estado?: "abiertas" | "resueltas" | "archivadas" | "todas";
      todasAdmin?: boolean;
      incluirHuerfanas?: boolean;
    }) => {
      const estado = opts?.estado ?? "todas";
      const asigPermitidas = new Set(asignaturas.filter(a => (opts?.todasAdmin && tienePermisoExamenes) ? true : a.claseId === miClaseId).map(a => a.id));

      return preguntas
        .filter((p) => {
          if (p.asignaturaId) return asigPermitidas.has(p.asignaturaId);
          if (opts?.todasAdmin && esAdmin) return true;
          if (opts?.incluirHuerfanas) return p.misSi > 0 || p.misNo > 0;
          return false;
        })
        .filter((p) => (opts?.asignaturaId ? p.asignaturaId === opts.asignaturaId : true))
        .filter((p) => {
          if (estado === "abiertas") return p.resultado === null && !p.archivada;
          if (estado === "resueltas") return p.resultado !== null && !p.archivada;
          if (estado === "archivadas") return p.archivada;
          return true;
        })
        .sort((a, b) => probabilidad(b) - probabilidad(a));
    },
    [preguntas, asignaturas, miClaseId, tienePermisoExamenes, esAdmin]
  );

  const resumen = useCallback(() => {
    let ganar = 0;
    let perder = 0;
    const nombres: string[] = [];
    const preguntasVisibles = leerPreguntas({ estado: "abiertas" });
    for (const p of preguntasVisibles) {
      if ((!p.misSi && !p.misNo)) continue;
      if (p.misSi > 0) {
        ganar += pagoSiGana(p, "si") - p.misSi;
        perder += p.misSi;
      }
      if (p.misNo > 0) {
        ganar += pagoSiGana(p, "no") - p.misNo;
        perder += p.misNo;
      }
      nombres.push(nombreCorto(p.titulo));
    }
    return { ganar: Math.round(ganar), perder: Math.round(perder), nombres };
  }, [leerPreguntas]);

  const elegirClase = useCallback(async (claseId: string) => {
    if (!usuario || pausado) return;
    const esCambio = miPerfil?.claseId && miPerfil.claseId !== claseId;

    const { error } = await supabase.rpc("cambiar_clase_y_resetear", {
      p_usuario_id: usuario.id,
      p_nueva_clase_id: claseId
    });

    if (error) {
      alert("Error de Supabase: " + error.message);
      return;
    }

    const nuevoSaldo = esCambio ? 0 : (miPerfil?.saldo || 0);
    setMiPerfil(prev => prev ? { ...prev, claseId, saldo: nuevoSaldo } : prev);
    await cargarDatos();
  }, [usuario, pausado, miPerfil, cargarDatos]);

  const apostar = useCallback(async (id: string, lado: Lado, tokens = 1) => {
    if (!Number.isFinite(tokens) || tokens <= 0 || pausado || saldo < tokens) return false;
    const pregunta = preguntas.find((p) => p.id === id);
    const asignatura = pregunta ? asignaturas.find((a) => a.id === pregunta.asignaturaId) : undefined;
    if (asignatura?.cerrada) return false;

    setPreguntas((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const l = lmsrParams(p);
      const acciones = l ? lmsrAcciones(lado, tokens, l.qSi, l.qNo, l.b) : 0;
      return {
        ...p,
        poolSi: p.poolSi + (lado === "si" ? tokens : 0),
        poolNo: p.poolNo + (lado === "no" ? tokens : 0),
        qSi: p.qSi + (lado === "si" ? acciones : 0),
        qNo: p.qNo + (lado === "no" ? acciones : 0),
        misSi: p.misSi + (lado === "si" ? tokens : 0),
        misNo: p.misNo + (lado === "no" ? tokens : 0),
        misAccionesSi: p.misAccionesSi + (lado === "si" ? acciones : 0),
        misAccionesNo: p.misAccionesNo + (lado === "no" ? acciones : 0)
      };
    }));
    setMiPerfil((prev) => (prev ? { ...prev, saldo: prev.saldo - tokens } : prev));

    const { error } = await supabase.rpc("apostar", { p_pregunta_id: id, p_lado: lado, p_tokens: tokens });
    if (error) console.error("Error al apostar:", error);
    await cargarDatos();
    return !error;
  }, [saldo, pausado, cargarDatos, preguntas, asignaturas]);

  const retirar = useCallback(async (id: string) => {
    if (pausado) return 0;
    const p = preguntas.find((p) => p.id === id);

    let devolucion = 0;
    if (p) {
      const l = lmsrParams(p);
      devolucion = l
        ? lmsrCoste(l.qSi, l.qNo, l.b) - lmsrCoste(l.qSi - p.misAccionesSi, l.qNo - p.misAccionesNo, l.b)
        : p.misSi + p.misNo;
    }

    setPreguntas((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      return {
        ...p,
        poolSi: Math.max(0, p.poolSi - p.misSi),
        poolNo: Math.max(0, p.poolNo - p.misNo),
        qSi: p.qSi - p.misAccionesSi,
        qNo: p.qNo - p.misAccionesNo,
        misSi: 0,
        misNo: 0,
        misAccionesSi: 0,
        misAccionesNo: 0
      };
    }));
    setMiPerfil((prev) => (prev ? { ...prev, saldo: prev.saldo + devolucion } : prev));

    const { error } = await supabase.rpc("retirar_todo", { p_pregunta_id: id });
    if (error) console.error("Error al retirar:", error);
    await cargarDatos();
    return devolucion;
  }, [pausado, preguntas, cargarDatos]);

  const crearPregunta = useCallback(async (titulo: string, asignaturaId: string) => {
    const t = titulo.trim();
    if (!t || pausado || !asignaturaId) return null;

    // Llamamos a la función de Supabase sin pasarle b, para que use obligatoriamente el global del Admin
    const { data, error } = await supabase.rpc("crear_pregunta_con_recompensa", {
      p_titulo: t,
      p_asignatura_id: asignaturaId,
      p_recompensa: RECOMPENSA_CREAR_PREGUNTA,
      p_mecanismo: "lmsr"
    });

    if (error || !data) {
      console.error("Error al crear pregunta:", error);
      return null;
    }

    if (RECOMPENSA_CREAR_PREGUNTA > 0) {
      setMiPerfil((prev) => (prev ? { ...prev, saldo: prev.saldo + RECOMPENSA_CREAR_PREGUNTA } : prev));
    }

    await cargarDatos();
    return data as unknown as Pregunta;
  }, [pausado, cargarDatos]);

  const simular = useCallback(() => { console.log("Simular deshabilitado."); }, []);

  const mutar = useCallback((id: string, fn: (p: Pregunta) => Pregunta) => {
    setPreguntas((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));
  }, []);

  const guardarNombre = useCallback(async (nombre: string) => {
    if (!usuario) return;
    setMiPerfil((prev) => (prev ? { ...prev, nombre } : prev));
    await supabase.from("perfiles").update({ nombre }).eq("id", usuario.id);
    await cargarDatos();
  }, [usuario, cargarDatos]);

  const usarHash = useCallback(async (valor: boolean) => {
    if (!usuario) return;
    const nuevoHash = valor ? hashAleatorio() : miPerfil?.hash;
    setMiPerfil((prev) => (prev ? { ...prev, usaHash: valor, hash: nuevoHash || "" } : prev));
    await supabase.from("perfiles").update({ usa_hash: valor, hash: nuevoHash }).eq("id", usuario.id);
    await cargarDatos();
  }, [usuario, miPerfil, cargarDatos]);

  // --------------------------------------------------------
  // ADMIN & MOD
  // --------------------------------------------------------

  const resolver = useCallback(async (id: string, entro: boolean) => {
    if (!esAdmin) return false;
    const { error } = await supabase.rpc("resolver_pregunta", { p_pregunta_id: id, p_entro: entro });
    if (error) console.error("Error al resolver:", error);
    await cargarDatos();
    return !error;
  }, [esAdmin, cargarDatos]);

  const leerApuestasDePregunta = useCallback(async (preguntaId: string): Promise<ApuestaDetalle[]> => {
    const { data, error } = await supabase
      .from("apuestas")
      .select("usuario_id, lado, tokens, acciones, perfiles(nombre, usa_hash, hash)")
      .eq("pregunta_id", preguntaId);

    if (error) { console.error("Error al leer apuestas:", error); return []; }
    if (!data) return [];

    const agrupado = new Map<string, ApuestaDetalle>();
    for (const a of data as any[]) {
      const p = a.perfiles;
      const nombre = p ? (p.usa_hash ? `#${p.hash}` : p.nombre || "Anónimo") : "Anónimo";
      const clave = `${a.usuario_id}-${a.lado}`;
      const existente = agrupado.get(clave);
      if (existente) {
        existente.tokens += Number(a.tokens);
        existente.acciones += Number(a.acciones) || 0;
      } else {
        agrupado.set(clave, {
          usuarioId: a.usuario_id,
          nombre,
          lado: a.lado as Lado,
          tokens: Number(a.tokens),
          acciones: Number(a.acciones) || 0
        });
      }
    }
    return Array.from(agrupado.values());
  }, []);

  const desresolver = useCallback(async (id: string) => {
    if (!esAdmin) return false;
    await supabase.from("preguntas").update({ resultado: null, archivada: false }).eq("id", id);
    await cargarDatos();
    return true;
  }, [esAdmin, cargarDatos]);

  const archivar = useCallback(async (id: string, valor = true) => {
    if (!esAdmin) return false;
    await supabase.from("preguntas").update({ archivada: valor }).eq("id", id);
    await cargarDatos();
    return true;
  }, [esAdmin, cargarDatos]);

  const eliminarPregunta = useCallback(async (id: string) => {
    if (!esAdmin) {
      if (!esMod) return false;
      const preg = preguntas.find(p => p.id === id);
      const asig = preg ? asignaturas.find(a => a.id === preg.asignaturaId) : null;
      if (!asig || asig.claseId !== miClaseId) return false;
    }
    const { error } = await supabase.rpc("eliminar_pregunta", { p_pregunta_id: id });
    if (error) console.error("Error al eliminar pregunta:", error);
    await cargarDatos();
    return !error;
  }, [esAdmin, esMod, preguntas, asignaturas, miClaseId, cargarDatos]);

  const moverPregunta = useCallback(async (id: string, asignaturaId: string) => {
    if (!esAdmin) return false;
    await supabase.from("preguntas").update({ asignatura_id: asignaturaId }).eq("id", id);
    await cargarDatos();
    return true;
  }, [esAdmin, cargarDatos]);

  const editarTitulo = useCallback(async (id: string, titulo: string) => {
    if (!esAdmin || !titulo.trim()) return false;
    await supabase.from("preguntas").update({ titulo: titulo.trim() }).eq("id", id);
    await cargarDatos();
    return true;
  }, [esAdmin, cargarDatos]);

  const crearAsignatura = useCallback(async (nombre: string, claseId: string) => {
    if (!tienePermisoExamenes || !nombre.trim() || !claseId) return false;
    if (!esAdmin && esMod && claseId !== miClaseId) return false;
    await supabase.from("asignaturas").insert({ nombre: nombre.trim(), clase_id: claseId });
    await cargarDatos();
    return true;
  }, [tienePermisoExamenes, esAdmin, esMod, miClaseId, cargarDatos]);

  const cambiarClaseAsignatura = useCallback(async (id: string, claseId: string) => {
    if (!tienePermisoExamenes) return false;
    if (!esAdmin && esMod) return false;
    await supabase.from("asignaturas").update({ clase_id: claseId }).eq("id", id);
    await cargarDatos();
    return true;
  }, [tienePermisoExamenes, esAdmin, esMod, cargarDatos]);

  const eliminarAsignatura = useCallback(async (id: string) => {
    if (!tienePermisoExamenes) return false;
    if (!esAdmin && esMod) {
      const asig = asignaturas.find(a => a.id === id);
      if (!asig || asig.claseId !== miClaseId) return false;
    }
    await supabase.from("asignaturas").delete().eq("id", id);
    await cargarDatos();
    return true;
  }, [tienePermisoExamenes, esAdmin, esMod, asignaturas, miClaseId, cargarDatos]);

  const renombrarAsignatura = useCallback((id: string, nombre: string) => {
    if (!tienePermisoExamenes) return;
    if (!esAdmin && esMod) {
      const asig = asignaturas.find(a => a.id === id);
      if (!asig || asig.claseId !== miClaseId) return;
    }

    setAsignaturas((prev) => prev.map((a) => (a.id === id ? { ...a, nombre } : a)));

    if (debounceAsignaturas.current[id]) clearTimeout(debounceAsignaturas.current[id]);

    debounceAsignaturas.current[id] = setTimeout(async () => {
      const nombreLimpio = nombre.trim();
      delete debounceAsignaturas.current[id];
      if (!nombreLimpio) return;
      const { error } = await supabase.from("asignaturas").update({ nombre: nombreLimpio }).eq("id", id);
      if (error) {
        console.error("Error al renombrar asignatura:", error);
        alert("Error al renombrar examen: " + error.message);
        await cargarDatos();
      }
    }, 600);
  }, [tienePermisoExamenes, esAdmin, esMod, asignaturas, miClaseId, cargarDatos]);

  const pausarExamen = useCallback(async (asignaturaId: string, valor: boolean) => {
    if (!tienePermisoExamenes) return false;
    if (!esAdmin && esMod) {
      const asig = asignaturas.find(a => a.id === asignaturaId);
      if (!asig || asig.claseId !== miClaseId) return false;
    }
    const { error } = await supabase.from("asignaturas").update({ cerrada: valor }).eq("id", asignaturaId);
    if (error) console.error("Error al pausar examen:", error);
    await cargarDatos();
    return !error;
  }, [tienePermisoExamenes, esAdmin, esMod, asignaturas, miClaseId, cargarDatos]);

  const editarFechaExamen = useCallback(async (asignaturaId: string, fecha: Date | null) => {
    if (!tienePermisoExamenes) return false;
    if (!esAdmin && esMod) {
      const asig = asignaturas.find(a => a.id === asignaturaId);
      if (!asig || asig.claseId !== miClaseId) return false;
    }
    const { error } = await supabase
      .from("asignaturas")
      .update({ fecha_examen: fecha ? fecha.toISOString() : null })
      .eq("id", asignaturaId);
    if (error) console.error("Error al editar fecha de examen:", error);
    await cargarDatos();
    return !error;
  }, [tienePermisoExamenes, esAdmin, esMod, asignaturas, miClaseId, cargarDatos]);

  const editarFechaExamenPublica = useCallback(async (asignaturaId: string, fecha: Date | null) => {
    if (!usuario) return false;
    const { error } = await supabase.rpc("actualizar_fecha_examen", {
      p_asignatura_id: asignaturaId,
      p_fecha: fecha ? fecha.toISOString() : null
    });
    if (error) console.error("Error al actualizar fecha de examen (público):", error);
    await cargarDatos();
    return !error;
  }, [usuario, cargarDatos]);

  const crearClase = useCallback(async (nombre: string) => {
    if (!esAdmin || !nombre.trim()) return false;
    const { error } = await supabase.from("clases").insert({ nombre: nombre.trim() });
    if (error) { alert("Error al crear clase: " + error.message); return false; }
    await cargarDatos();
    return true;
  }, [esAdmin, cargarDatos]);

  const renombrarClase = useCallback((claseId: string, nombre: string) => {
    if (!esAdmin) return;

    setClases((prev) => prev.map((c) => (c.id === claseId ? { ...c, nombre } : c)));

    if (debounceClases.current[claseId]) clearTimeout(debounceClases.current[claseId]);

    debounceClases.current[claseId] = setTimeout(async () => {
      const nombreLimpio = nombre.trim();
      delete debounceClases.current[claseId];
      if (!nombreLimpio) return;
      const { error } = await supabase.from("clases").update({ nombre: nombreLimpio }).eq("id", claseId);
      if (error) {
        console.error("Error al renombrar clase:", error);
        alert("Error al renombrar clase: " + error.message);
        await cargarDatos();
      }
    }, 600);
  }, [esAdmin, cargarDatos]);

  const eliminarClase = useCallback(async (claseId: string) => {
    if (!esAdmin) return false;
    const { error } = await supabase.from("clases").delete().eq("id", claseId);
    if (error) { alert("Error al eliminar clase: " + error.message); return false; }
    await cargarDatos();
    return true;
  }, [esAdmin, cargarDatos]);

  const darTokens = useCallback(async (alumnoId: string, delta: number) => {
    if (!esAdmin) return false;
    const { error } = await supabase.rpc("admin_dar_tokens", { p_alumno_id: alumnoId, p_delta: delta });
    if (error) console.error("Error al dar tokens:", error);
    await cargarDatos();
    return !error;
  }, [esAdmin, cargarDatos]);

  const pausarAlumno = useCallback(async (alumnoId: string, valor: boolean) => {
    if (!esAdmin) return false;
    const { error } = await supabase.rpc("admin_pausar_alumno", { p_alumno_id: alumnoId, p_valor: valor });
    if (error) console.error("Error al pausar alumno:", error);
    await cargarDatos();
    return !error;
  }, [esAdmin, cargarDatos]);

  const adminCambiarClaseAlumno = useCallback(async (alumnoId: string, claseId: string) => {
    if (!esAdmin) return false;
    const { error } = await supabase.from("perfiles").update({ clase_id: claseId }).eq("id", alumnoId);
    if (error) console.error("Error al cambiar clase del alumno:", error);
    await cargarDatos();
    return !error;
  }, [esAdmin, cargarDatos]);

  const adminRetirarApuestas = useCallback(async (alumnoId: string) => {
    if (!esAdmin) return false;
    const { error } = await supabase.rpc("admin_retirar_apuestas", { p_alumno_id: alumnoId });
    if (error) alert("Error: " + error.message);
    await cargarDatos();
    return !error;
  }, [esAdmin, cargarDatos]);

  const toggleMod = useCallback(async (alumnoId: string, valor: boolean) => {
    if (!esAdmin) return false;
    const { error } = await supabase.from("perfiles").update({ mod: valor }).eq("id", alumnoId);
    if (error) { alert("Error al cambiar permisos de moderador: " + error.message); return false; }
    await cargarDatos();
    return true;
  }, [esAdmin, cargarDatos]);

  return useMemo(
    () => ({
      perfilCargado: perfilCargado && idCargado === (usuario ? usuario.id : null),
      saldo,
      pausado,
      perfil,
      miNombre,
      leerClases,
      elegirClase,
      leerPreguntas,
      leerAsignaturas,
      leerAlumnos,
      leerApuestas,
      leerApuestasDePregunta,
      leerRanking,
      leerWAU,
      apostadoAbierto,
      resumen,
      apostar,
      retirar,
      crearPregunta,
      simular,
      resolver,
      desresolver,
      archivar,
      eliminarPregunta,
      moverPregunta,
      editarTitulo,
      crearAsignatura,
      cambiarClaseAsignatura,
      eliminarAsignatura,
      renombrarAsignatura,
      pausarExamen,
      editarFechaExamen,
      editarFechaExamenPublica,
      crearClase,
      renombrarClase,
      eliminarClase,
      adminCambiarClaseAlumno,
      adminRetirarApuestas,
      darTokens,
      pausarAlumno,
      toggleMod,
      guardarNombre,
      usarHash,
      mutar,
      recargar,
    }),
    [
      perfilCargado,
      idCargado,
      usuario?.id,
      saldo,
      pausado,
      perfil,
      miNombre,
      leerClases,
      elegirClase,
      leerPreguntas,
      leerAsignaturas,
      leerAlumnos,
      leerApuestas,
      leerApuestasDePregunta,
      leerRanking,
      leerWAU,
      apostadoAbierto,
      resumen,
      apostar,
      retirar,
      crearPregunta,
      simular,
      resolver,
      desresolver,
      archivar,
      eliminarPregunta,
      moverPregunta,
      editarTitulo,
      crearAsignatura,
      cambiarClaseAsignatura,
      eliminarAsignatura,
      renombrarAsignatura,
      pausarExamen,
      editarFechaExamen,
      editarFechaExamenPublica,
      crearClase,
      renombrarClase,
      eliminarClase,
      darTokens,
      pausarAlumno,
      toggleMod,
      guardarNombre,
      usarHash,
      mutar,
      recargar,
    ]
  );
}

export type Mercado = ReturnType<typeof useMercado>;