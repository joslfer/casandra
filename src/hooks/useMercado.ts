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

export interface Asignatura {
  id: string;
  nombre: string;
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
  usuario: string;
  tokens: number;
  cuando: number;
}

export interface Usuario {
  id: string;
  nombre: string;
  esAdmin: boolean;
}

export interface Alumno {
  id: string;
  nombre: string;
  saldo: number;
  pausado: boolean;
  usaHash: boolean;
  hash: string;
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
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [apuestas, setApuestas] = useState<Apuesta[]>([]);
  const [miPerfil, setMiPerfil] = useState<Alumno | null>(null);

  // --------------------------------------------------------
  // CARGA DE DATOS DESDE SUPABASE
  // --------------------------------------------------------
  const cargarDatos = useCallback(async () => {
    // 1. Descargamos tablas públicas
    const [resAsig, resPerf, resPreg, resApu] = await Promise.all([
      supabase.from("asignaturas").select("*"),
      supabase.from("perfiles").select("*"),
      supabase.from("preguntas").select("*").order("creada_en", { ascending: false }),
      supabase.from("apuestas").select("*, perfiles(nombre, usa_hash, hash)").order("cuando", { ascending: false }).limit(30)
    ]);

    // CHIVATOS DE ERRORES:
    if (resAsig.error) console.error("Error Asignaturas:", resAsig.error);
    if (resPerf.error) console.error("Error Perfiles:", resPerf.error);
    if (resPreg.error) console.error("Error Preguntas:", resPreg.error);
    if (resApu.error) console.error("Error Apuestas:", resApu.error);

    // 2. Extraemos MIS apuestas para calcular misSi y misNo
    let misApuestas: any[] = [];
    if (usuario) {
      const { data, error } = await supabase.from("apuestas").select("*").eq("usuario_id", usuario.id);
      if (error) console.error("Error Mis Apuestas:", error);
      if (data) misApuestas = data;
    }

    if (resAsig.data) setAsignaturas(resAsig.data.map((a: any) => ({ id: a.id, nombre: a.nombre })));

    if (resPerf.data) {
      const alums = resPerf.data.map((p: any) => ({
        id: p.id,
        nombre: p.nombre || "",
        saldo: Number(p.saldo),
        pausado: p.pausado,
        usaHash: p.usa_hash,
        hash: p.hash || ""
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
          usuario: nombre,
          tokens: Number(a.tokens),
          cuando: new Date(a.cuando).getTime()
        };
      });
      setApuestas(apFormateadas);
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
  }, [usuario]);

  // Suscripción básica y carga inicial
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // --------------------------------------------------------
  // ESTADOS COMPUTADOS
  // --------------------------------------------------------
  const saldo = miPerfil ? miPerfil.saldo : 0;
  const pausado = miPerfil ? miPerfil.pausado : false;
  
  const perfil = miPerfil 
    ? { nombre: miPerfil.nombre, usaHash: miPerfil.usaHash, hash: miPerfil.hash } 
    : { nombre: "", usaHash: false, hash: "" };
    
  const miNombre = perfil.usaHash ? `#${perfil.hash}` : perfil.nombre || usuario?.nombre || "Tú";

  const leerAsignaturas = useCallback((): Asignatura[] => asignaturas, [asignaturas]);
  const leerAlumnos = useCallback((): Alumno[] => alumnos, [alumnos]);

  // Actividad agrupada para evitar spam visual de clics consecutivos
  const leerApuestas = useCallback((): Apuesta[] => {
    const agrupadas: Apuesta[] = [];
    for (const a of apuestas) {
      const ultima = agrupadas[agrupadas.length - 1];
      if (ultima && ultima.usuario === a.usuario) {
        ultima.tokens += a.tokens;
      } else {
        agrupadas.push({ ...a });
      }
    }
    return agrupadas.slice(0, 15);
  }, [apuestas]);

  // Ranking ordenado por saldo de mayor a menor
  const leerRanking = useCallback(() => {
    return [...alumnos]
      .sort((a, b) => b.saldo - a.saldo)
      .map((a) => ({
        usuario: a.usaHash ? `#${a.hash}` : (a.nombre || "Anónimo"),
        tokens: Math.round(a.saldo)
      }))
      .slice(0, 10);
  }, [alumnos]);

  const leerPreguntas = useCallback(
    (opts?: { asignaturaId?: string; estado?: "abiertas" | "resueltas" | "archivadas" | "todas" }) => {
      const estado = opts?.estado ?? "todas";
      return preguntas
        .filter((p) => (opts?.asignaturaId ? p.asignaturaId === opts.asignaturaId : true))
        .filter((p) => {
          if (estado === "abiertas") return p.resultado === null && !p.archivada;
          if (estado === "resueltas") return p.resultado !== null && !p.archivada;
          if (estado === "archivadas") return p.archivada;
          return true;
        })
        .sort((a, b) => probabilidad(b) - probabilidad(a));
    },
    [preguntas]
  );

  const resumen = useCallback(() => {
    let ganar = 0;
    let perder = 0;
    const nombres: string[] = [];
    for (const p of preguntas) {
      if (p.resultado !== null || (!p.misSi && !p.misNo)) continue;
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
  }, [preguntas]);

  // --------------------------------------------------------
  // ACCIONES DEL USUARIO (CONECTADAS A LA DB)
  // --------------------------------------------------------
  
  const apostar = useCallback(async (id: string, lado: Lado, tokens = 1) => {
    if (!Number.isFinite(tokens) || tokens <= 0 || pausado || saldo < tokens) return false;

    // Actualización optimista de la UI para que se sienta instantánea
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

    // Llamada segura a la DB
    const { error } = await supabase.rpc("apostar", { p_pregunta_id: id, p_lado: lado, p_tokens: tokens });
    if (error) console.error("Error al apostar:", error);
    
    await cargarDatos();
    return !error;
  }, [saldo, pausado, cargarDatos]);

  const retirar = useCallback(async (id: string) => {
    if (pausado) return 0;
    const p = preguntas.find((p) => p.id === id);
    const devolucion = p ? p.misSi + p.misNo : 0;

    // Actualización optimista
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

    // Llamada segura a la DB
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

  const simular = useCallback(() => {
    console.log("Simular deshabilitado. La app ya está conectada al backend real.");
  }, []);

  const mutar = useCallback((id: string, fn: (p: Pregunta) => Pregunta) => {
    setPreguntas((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));
  }, []);

  // --------------------------------------------------------
  // PERFIL
  // --------------------------------------------------------
  
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
  // ADMIN
  // --------------------------------------------------------
  const esAdmin = !!usuario?.esAdmin;

  const resolver = useCallback(async (id: string, entro: boolean) => {
    if (!esAdmin) return false;
    const { error } = await supabase.rpc("resolver_pregunta", { p_pregunta_id: id, p_entro: entro });
    if (error) console.error("Error al resolver:", error);
    await cargarDatos();
    return !error;
  }, [esAdmin, cargarDatos]);

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
    if (!esAdmin) return false;
    await supabase.from("preguntas").delete().eq("id", id);
    await cargarDatos();
    return true;
  }, [esAdmin, cargarDatos]);

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

  const crearAsignatura = useCallback(async (nombre: string) => {
    if (!esAdmin || !nombre.trim()) return false;
    await supabase.from("asignaturas").insert({ nombre: nombre.trim() });
    await cargarDatos();
    return true;
  }, [esAdmin, cargarDatos]);

  const eliminarAsignatura = useCallback(async (id: string) => {
    if (!esAdmin) return false;
    await supabase.from("asignaturas").delete().eq("id", id);
    await cargarDatos();
    return true;
  }, [esAdmin, cargarDatos]);

  const renombrarAsignatura = useCallback(async (id: string, nombre: string) => {
    if (!esAdmin || !nombre.trim()) return false;
    await supabase.from("asignaturas").update({ nombre: nombre.trim() }).eq("id", id);
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

  return useMemo(
    () => ({
      saldo,
      pausado,
      perfil,
      miNombre,
      leerPreguntas,
      leerAsignaturas,
      leerAlumnos,
      leerApuestas,
      leerRanking,
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
      eliminarAsignatura,
      renombrarAsignatura,
      darTokens,
      pausarAlumno,
      guardarNombre,
      usarHash,
      mutar,
    }),
    [
      saldo,
      pausado,
      perfil,
      miNombre,
      leerPreguntas,
      leerAsignaturas,
      leerAlumnos,
      leerApuestas,
      leerRanking,
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
      eliminarAsignatura,
      renombrarAsignatura,
      darTokens,
      pausarAlumno,
      guardarNombre,
      usarHash,
      mutar,
    ]
  );
}

export type Mercado = ReturnType<typeof useMercado>;