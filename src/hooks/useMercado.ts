/**
 * CAPA DE DATOS CONECTADA A SUPABASE
 * ----------------------------------
 * Toda la lógica del mercado se conecta ahora a la base de datos real.
 * Se utilizan las funciones RPC de PostgreSQL para garantizar seguridad
 * atómica en las transacciones (apuestas y repartos).
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Lado = "si" | "no";

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
  poolSi: number;
  poolNo: number;
  historial: number[];
  misSi: number;
  misNo: number;
  resultado: boolean | null;
  archivada: boolean;
  creadaEn: number;
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

export function probabilidad(p: Pick<Pregunta, "poolSi" | "poolNo">): number {
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

export function multiplicador(lado: Lado, p: Pick<Pregunta, "poolSi" | "poolNo">): number {
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

export function useMercado(usuario: Usuario | null) {
  const [clases, setClases] = useState<Clase[]>([]);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [apuestas, setApuestas] = useState<Apuesta[]>([]);
  const [miPerfil, setMiPerfil] = useState<Alumno | null>(null);
  const [apostadoAbierto, setApostadoAbierto] = useState<Record<string, number>>({});
  
  const [perfilCargado, setPerfilCargado] = useState(false);
  const [idCargado, setIdCargado] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    const [resClases, resAsig, resPerf, resPreg, resApu, resApuAbiertas] = await Promise.all([
      supabase.from("clases").select("*").order("nombre"),
      supabase.from("asignaturas").select("*"),
      supabase.from("perfiles").select("*"),
      supabase.from("preguntas").select("*").order("creada_en", { ascending: false }),
      supabase.from("apuestas").select("*, perfiles(nombre, usa_hash, hash)").order("cuando", { ascending: false }).limit(60),
      supabase
        .from("apuestas")
        .select("usuario_id, tokens, preguntas!inner(resultado, archivada)")
        .is("preguntas.resultado", null)
        .eq("preguntas.archivada", false)
    ]);

    let misApuestas: any[] = [];
    if (usuario) {
      const { data } = await supabase.from("apuestas").select("*").eq("usuario_id", usuario.id);
      if (data) misApuestas = data;
    }

    if (resClases.data) setClases(resClases.data.map((c: any) => ({ id: c.id, nombre: c.nombre })));

    if (resAsig.data)
      setAsignaturas(
        resAsig.data.map((a: any) => ({
          id: a.id,
          claseId: a.clase_id,
          nombre: a.nombre,
          cerrada: a.cerrada,
          fechaExamen: a.fecha_examen ? new Date(a.fecha_examen).getTime() : null
        }))
      );

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

    if (resPreg.data) {
      const pregs: Pregunta[] = resPreg.data.map((p: any) => {
        let misSi = 0;
        let misNo = 0;
        for (const ap of misApuestas) {
          if (ap.pregunta_id === p.id) {
            if (ap.lado === "si") misSi += Number(ap.tokens);
            else misNo += Number(ap.tokens);
          }
        }
        return {
          id: p.id,
          titulo: p.titulo,
          asignaturaId: p.asignatura_id,
          poolSi: Number(p.pool_si),
          poolNo: Number(p.pool_no),
          historial: typeof p.historial === "string" ? JSON.parse(p.historial) : p.historial || [],
          misSi,
          misNo,
          resultado: p.resultado,
          archivada: p.archivada,
          creadaEn: new Date(p.creada_en).getTime()
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

  const leerRanking = useCallback(() => {
    return [...alumnos]
      .filter(a => a.claseId === miClaseId)
      .map((a) => ({
        usuario: a.usaHash ? `#${a.hash}` : (a.nombre || "Anónimo"),
        tokens: Math.round(a.saldo + (apostadoAbierto[a.id] || 0))
      }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10);
  }, [alumnos, apostadoAbierto, miClaseId]);

  const leerPreguntas = useCallback(
    (opts?: { asignaturaId?: string; estado?: "abiertas" | "resueltas" | "archivadas" | "todas", todasAdmin?: boolean }) => {
      const estado = opts?.estado ?? "todas";
      const asigPermitidas = new Set(asignaturas.filter(a => (opts?.todasAdmin && tienePermisoExamenes) ? true : a.claseId === miClaseId).map(a => a.id));

      return preguntas
        .filter((p) => asigPermitidas.has(p.asignaturaId))
        .filter((p) => (opts?.asignaturaId ? p.asignaturaId === opts.asignaturaId : true))
        .filter((p) => {
          if (estado === "abiertas") return p.resultado === null && !p.archivada;
          if (estado === "resueltas") return p.resultado !== null && !p.archivada;
          if (estado === "archivadas") return p.archivada;
          return true;
        })
        .sort((a, b) => probabilidad(b) - probabilidad(a));
    },
    [preguntas, asignaturas, miClaseId, tienePermisoExamenes]
  );

  const resumen = useCallback(() => {
    let ganar = 0;
    let perder = 0;
    const nombres: string[] = [];
    const preguntasVisibles = leerPreguntas({ estado: "abiertas" });
    for (const p of preguntasVisibles) {
      if ((!p.misSi && !p.misNo)) continue;
      if (p.misSi > 0) {
        ganar += premio(p.misSi, "si", p.poolSi, p.poolNo) - p.misSi;
        perder += p.misSi;
      }
      if (p.misNo > 0) {
        ganar += premio(p.misNo, "no", p.poolSi, p.poolNo) - p.misNo;
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
      return {
        ...p,
        poolSi: p.poolSi + (lado === "si" ? tokens : 0),
        poolNo: p.poolNo + (lado === "no" ? tokens : 0),
        misSi: p.misSi + (lado === "si" ? tokens : 0),
        misNo: p.misNo + (lado === "no" ? tokens : 0)
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
    const devolucion = p ? p.misSi + p.misNo : 0;

    setPreguntas((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      return {
        ...p,
        poolSi: Math.max(0, p.poolSi - p.misSi),
        poolNo: Math.max(0, p.poolNo - p.misNo),
        misSi: 0,
        misNo: 0
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
    const { data, error } = await supabase.from("preguntas").insert({
      titulo: t,
      asignatura_id: asignaturaId,
      historial: [50]
    }).select().single();

    if (error || !data) return null;
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
      .select("usuario_id, lado, tokens, perfiles(nombre, usa_hash, hash)")
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
      } else {
        agrupado.set(clave, {
          usuarioId: a.usuario_id,
          nombre,
          lado: a.lado as Lado,
          tokens: Number(a.tokens)
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
    if (!esAdmin && esMod) return false; // Los mods no pueden cambiar de curso el examen
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

  const renombrarAsignatura = useCallback(async (id: string, nombre: string) => {
    if (!tienePermisoExamenes || !nombre.trim()) return false;
    if (!esAdmin && esMod) {
      const asig = asignaturas.find(a => a.id === id);
      if (!asig || asig.claseId !== miClaseId) return false;
    }
    await supabase.from("asignaturas").update({ nombre: nombre.trim() }).eq("id", id);
    await cargarDatos();
    return true;
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

  const renombrarClase = useCallback(async (claseId: string, nombre: string) => {
    if (!esAdmin || !nombre.trim()) return false;
    const { error } = await supabase.from("clases").update({ nombre: nombre.trim() }).eq("id", claseId);
    if (error) { alert("Error al renombrar clase: " + error.message); return false; }
    await cargarDatos();
    return true;
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