/**
 * CAPA DE DATOS AISLADA
 * ---------------------
 * Toda la lógica del mercado vive aquí. Ningún componente toca el estado
 * directamente: sólo llama a las funciones expuestas por useMercado().
 *
 * Las firmas están pensadas para sustituirse por llamadas a una API real
 * (fetch / server functions) sin tocar la UI. Hoy: mock en estado local.
 */
import { useCallback, useMemo, useState } from "react";

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
  /** historial de probabilidad SÍ (0-100) */
  historial: number[];
  /** tokens que ha apostado el usuario actual en cada lado */
  misSi: number;
  misNo: number;
  /** null = abierta, true = entró, false = no entró */
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

const SALDO_INICIAL = 10;

export function probabilidad(p: Pick<Pregunta, "poolSi" | "poolNo">): number {
  const total = p.poolSi + p.poolNo;
  if (total === 0) return 50;
  return Math.round((p.poolSi / total) * 100);
}

/** volumen(p): tokens totales apostados en la pregunta */
export function volumen(p: Pick<Pregunta, "poolSi" | "poolNo">): number {
  return p.poolSi + p.poolNo;
}

/** premio(stake, lado, poolSi, poolNo): pago bruto de una posición ganadora */
export function premio(stake: number, lado: Lado, poolSi: number, poolNo: number): number {
  const total = poolSi + poolNo;
  if (lado === "si") return poolSi === 0 ? 0 : total * (stake / poolSi);
  return poolNo === 0 ? 0 : total * (stake / poolNo);
}

/** multiplicador(lado, p): por cuánto multiplicarías 1 token nuevo si ganas */
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

/** nombreCorto(titulo): para el pie del hero */
export function nombreCorto(titulo: string): string {
  const limpio = titulo.replace(/^¿/, "").replace(/\?$/, "");
  const palabras = limpio.split(" ").slice(0, 3).join(" ");
  return palabras.charAt(0).toUpperCase() + palabras.slice(1);
}

/** Genera un historial verosímil terminando en la probabilidad actual. */
function historialInicial(final: number, n = 14): number[] {
  const out: number[] = [];
  let v = final + (Math.random() * 24 - 12);
  for (let i = 0; i < n - 1; i++) {
    v = Math.min(96, Math.max(4, v + (Math.random() * 14 - 7)));
    out.push(Math.round(v));
  }
  out.push(final);
  return out;
}

const ASIGNATURAS: Asignatura[] = [
  { id: "mat", nombre: "Matemáticas" },
  { id: "fis", nombre: "Física" },
  { id: "bio", nombre: "Biología" },
  { id: "his", nombre: "Historia" },
];

function crearMock(
  titulo: string,
  asignaturaId: string,
  poolSi: number,
  poolNo: number,
  resultado: boolean | null = null,
  archivada = false,
): Pregunta {
  const base: Pregunta = {
    id: crypto.randomUUID(),
    titulo,
    asignaturaId,
    poolSi,
    poolNo,
    historial: [],
    misSi: 0,
    misNo: 0,
    resultado,
    archivada,
    creadaEn: Date.now(),
  };
  return { ...base, historial: historialInicial(probabilidad(base)) };
}

const MOCK: Pregunta[] = [
  { ...crearMock("¿Entra la demostración del teorema de Bolzano?", "mat", 38, 10), misSi: 3 },
  crearMock("¿Cae un problema de circuitos RLC en régimen transitorio?", "fis", 22, 24),
  crearMock("¿Hay un ejercicio de integrales por partes?", "mat", 44, 6),
  crearMock("¿Entra la Guerra de Sucesión en el desarrollo largo?", "his", 14, 26),
  crearMock("¿Piden demostrar la regla de la cadena?", "mat", 19, 21),
  crearMock("¿Sale el efecto fotoeléctrico como teoría?", "fis", 30, 12, true),
  crearMock("¿Entra la mitosis con dibujo?", "bio", 8, 40, false, true),
];

const ALUMNOS: Alumno[] = [
  { id: "jose.luefer", nombre: "José L.", saldo: 10, pausado: false, usaHash: false, hash: hashAleatorio() },
  { id: "marta.gil", nombre: "Marta G.", saldo: 14, pausado: false, usaHash: false, hash: hashAleatorio() },
  { id: "anon1", nombre: "", saldo: 7, pausado: false, usaHash: true, hash: "k7q2ma" },
  { id: "pablo.ruiz", nombre: "Pablo R.", saldo: 3, pausado: true, usaHash: false, hash: hashAleatorio() },
  { id: "lucia.ny", nombre: "Lucía N.", saldo: 21, pausado: false, usaHash: false, hash: hashAleatorio() },
  { id: "anon2", nombre: "", saldo: 9, pausado: false, usaHash: true, hash: "z3m9tp" },
];

export function nombreVisible(a: Alumno): string {
  return a.usaHash ? `#${a.hash}` : a.nombre || a.id;
}

const AHORA = Date.now();
const APUESTAS: Apuesta[] = [
  { id: "a1", usuario: "Marta G.", tokens: 4, cuando: AHORA - 55 * 60000 },
  { id: "a2", usuario: "#k7q2ma", tokens: 2, cuando: AHORA - 2 * 3600_000 },
  { id: "a3", usuario: "Lucía N.", tokens: 6, cuando: AHORA - 5 * 3600_000 },
  { id: "a4", usuario: "#z3m9tp", tokens: 1, cuando: AHORA - 9 * 3600_000 },
];

export function useMercado(usuario: Usuario | null) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>(MOCK);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>(ASIGNATURAS);
  const [alumnos, setAlumnos] = useState<Alumno[]>(ALUMNOS);
  const [apuestas, setApuestas] = useState<Apuesta[]>(APUESTAS);
  const [saldo, setSaldo] = useState<number>(SALDO_INICIAL);
  const [perfil, setPerfil] = useState<{ nombre: string; usaHash: boolean; hash: string }>({
    nombre: "",
    usaHash: false,
    hash: hashAleatorio(),
  });

  const miNombre = perfil.usaHash ? `#${perfil.hash}` : perfil.nombre || usuario?.nombre || "Tú";

  const pausado = useMemo(
    () => alumnos.some((a) => a.id === usuario?.id && a.pausado),
    [alumnos, usuario],
  );

  /** leerAsignaturas() */
  const leerAsignaturas = useCallback((): Asignatura[] => asignaturas, [asignaturas]);

  /** leerApuestas(): actividad reciente */
  const leerApuestas = useCallback(
    (): Apuesta[] => [...apuestas].sort((a, b) => b.cuando - a.cuando).slice(0, 5),
    [apuestas],
  );

  /** leerAlumnos() */
  const leerAlumnos = useCallback((): Alumno[] => alumnos, [alumnos]);

  /**
   * leerPreguntas(filtro): ordenadas por probabilidad SÍ desc.
   * estado: "abiertas" | "resueltas" | "archivadas" | "todas"
   */
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
    [preguntas],
  );

  /** resumen(): posible ganancia/pérdida sobre todas mis posiciones abiertas */
  const resumen = useCallback(() => {
    let ganar = 0;
    let perder = 0;
    const nombres: string[] = [];
    for (const p of preguntas) {
      if (p.resultado !== null) continue;
      const abierta = p.misSi > 0 || p.misNo > 0;
      if (!abierta) continue;
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

  const mutar = useCallback((id: string, fn: (p: Pregunta) => Pregunta) => {
    setPreguntas((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));
  }, []);

  /** apostar(id, lado, tokens = 1) */
  const apostar = useCallback(
    (id: string, lado: Lado, tokens = 1): boolean => {
      if (pausado || saldo < tokens) return false;
      let ok = false;
      setPreguntas((prev) =>
        prev.map((p) => {
          if (p.id !== id || p.resultado !== null || p.archivada) return p;
          ok = true;
          const next: Pregunta = {
            ...p,
            poolSi: p.poolSi + (lado === "si" ? tokens : 0),
            poolNo: p.poolNo + (lado === "no" ? tokens : 0),
            misSi: p.misSi + (lado === "si" ? tokens : 0),
            misNo: p.misNo + (lado === "no" ? tokens : 0),
          };
          return { ...next, historial: [...p.historial, probabilidad(next)] };
        }),
      );
      if (ok) {
        setSaldo((s) => s - tokens);
        setApuestas((prev) => [
          { id: crypto.randomUUID(), usuario: miNombre, tokens, cuando: Date.now() },
          ...prev,
        ]);
      }
      return ok;
    },
    [saldo, pausado, miNombre],
  );

  /** retirar(id): devuelve todos mis tokens y revierte el pool */
  const retirar = useCallback(
    (id: string): number => {
      if (pausado) return 0;
      let devueltos = 0;
      setPreguntas((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          devueltos = p.misSi + p.misNo;
          if (devueltos === 0) return p;
          const next: Pregunta = {
            ...p,
            poolSi: Math.max(0, p.poolSi - p.misSi),
            poolNo: Math.max(0, p.poolNo - p.misNo),
            misSi: 0,
            misNo: 0,
          };
          return { ...next, historial: [...p.historial, probabilidad(next)] };
        }),
      );
      if (devueltos > 0) setSaldo((s) => s + devueltos);
      return devueltos;
    },
    [pausado],
  );

  /** crearPregunta(titulo, asignaturaId): arranca en 50, sin historial */
  const crearPregunta = useCallback(
    (titulo: string, asignaturaId: string): Pregunta | null => {
      const t = titulo.trim();
      if (!t || pausado || !asignaturaId) return null;
      const nueva: Pregunta = {
        id: crypto.randomUUID(),
        titulo: t,
        asignaturaId,
        poolSi: 0,
        poolNo: 0,
        historial: [],
        misSi: 0,
        misNo: 0,
        resultado: null,
        archivada: false,
        creadaEn: Date.now(),
      };
      setPreguntas((prev) => [nueva, ...prev]);
      return nueva;
    },
    [pausado],
  );

  /** simular(): otro alumno apuesta 1-3 tokens a un lado random */
  const simular = useCallback((): void => {
    let registro: Apuesta | null = null;
    setPreguntas((prev) => {
      const abiertas = prev.filter((p) => p.resultado === null && !p.archivada);
      if (abiertas.length === 0) return prev;
      const objetivo = abiertas[Math.floor(Math.random() * abiertas.length)];
      if (!objetivo) return prev;
      const lado: Lado = Math.random() < 0.5 ? "si" : "no";
      const tokens = 1 + Math.floor(Math.random() * 3);
      const activos = ALUMNOS.filter((a) => !a.pausado);
      const quien = activos[Math.floor(Math.random() * activos.length)]!;
      registro = {
        id: crypto.randomUUID(),
        usuario: nombreVisible(quien),
        tokens,
        cuando: Date.now(),
      };
      return prev.map((p) => {
        if (p.id !== objetivo.id) return p;
        const next: Pregunta = {
          ...p,
          poolSi: p.poolSi + (lado === "si" ? tokens : 0),
          poolNo: p.poolNo + (lado === "no" ? tokens : 0),
        };
        return { ...next, historial: [...p.historial, probabilidad(next)] };
      });
    });
    if (registro) setApuestas((prev) => [registro!, ...prev]);
  }, []);

  // ---------- ADMIN ----------
  const esAdmin = !!usuario?.esAdmin;

  /** resolver(id, entro): paga el premio proporcional al pool. */
  const resolver = useCallback(
    (id: string, entro: boolean): boolean => {
      if (!esAdmin) return false;
      let pago = 0;
      setPreguntas((prev) =>
        prev.map((p) => {
          if (p.id !== id || p.resultado !== null) return p;
          const stake = entro ? p.misSi : p.misNo;
          pago = stake > 0 ? Math.round(premio(stake, entro ? "si" : "no", p.poolSi, p.poolNo)) : 0;
          return { ...p, resultado: entro };
        }),
      );
      if (pago > 0) setSaldo((s) => s + pago);
      return true;
    },
    [esAdmin],
  );

  /** desresolver(id): vuelve a abrir la pregunta */
  const desresolver = useCallback(
    (id: string): boolean => {
      if (!esAdmin) return false;
      setPreguntas((prev) =>
        prev.map((p) => (p.id === id ? { ...p, resultado: null, archivada: false } : p)),
      );
      return true;
    },
    [esAdmin],
  );

  const archivar = useCallback(
    (id: string, valor = true): boolean => {
      if (!esAdmin) return false;
      setPreguntas((prev) => prev.map((p) => (p.id === id ? { ...p, archivada: valor } : p)));
      return true;
    },
    [esAdmin],
  );

  const eliminarPregunta = useCallback(
    (id: string): boolean => {
      if (!esAdmin) return false;
      setPreguntas((prev) => prev.filter((p) => p.id !== id));
      return true;
    },
    [esAdmin],
  );

  const moverPregunta = useCallback(
    (id: string, asignaturaId: string): boolean => {
      if (!esAdmin) return false;
      setPreguntas((prev) => prev.map((p) => (p.id === id ? { ...p, asignaturaId } : p)));
      return true;
    },
    [esAdmin],
  );

  const editarTitulo = useCallback(
    (id: string, titulo: string): boolean => {
      if (!esAdmin || !titulo.trim()) return false;
      setPreguntas((prev) => prev.map((p) => (p.id === id ? { ...p, titulo: titulo.trim() } : p)));
      return true;
    },
    [esAdmin],
  );

  const crearAsignatura = useCallback(
    (nombre: string): boolean => {
      if (!esAdmin || !nombre.trim()) return false;
      setAsignaturas((prev) => [...prev, { id: crypto.randomUUID(), nombre: nombre.trim() }]);
      return true;
    },
    [esAdmin],
  );

  const eliminarAsignatura = useCallback(
    (id: string): boolean => {
      if (!esAdmin) return false;
      setAsignaturas((prev) => prev.filter((a) => a.id !== id));
      setPreguntas((prev) => prev.filter((p) => p.asignaturaId !== id));
      return true;
    },
    [esAdmin],
  );

  const renombrarAsignatura = useCallback(
    (id: string, nombre: string): boolean => {
      if (!esAdmin || !nombre.trim()) return false;
      setAsignaturas((prev) => prev.map((a) => (a.id === id ? { ...a, nombre: nombre.trim() } : a)));
      return true;
    },
    [esAdmin],
  );

  const darTokens = useCallback(
    (alumnoId: string, delta: number): boolean => {
      if (!esAdmin) return false;
      setAlumnos((prev) =>
        prev.map((a) => (a.id === alumnoId ? { ...a, saldo: Math.max(0, a.saldo + delta) } : a)),
      );
      if (alumnoId === usuario?.id) setSaldo((s) => Math.max(0, s + delta));
      return true;
    },
    [esAdmin, usuario],
  );

  const pausarAlumno = useCallback(
    (alumnoId: string, valor: boolean): boolean => {
      if (!esAdmin) return false;
      setAlumnos((prev) => prev.map((a) => (a.id === alumnoId ? { ...a, pausado: valor } : a)));
      return true;
    },
    [esAdmin],
  );

  // ---------- PERFIL ----------
  const guardarNombre = useCallback((nombre: string) => {
    setPerfil((p) => ({ ...p, nombre }));
  }, []);

  const usarHash = useCallback((valor: boolean) => {
    setPerfil((p) => ({ ...p, usaHash: valor, hash: valor ? hashAleatorio() : p.hash }));
  }, []);

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
    ],
  );
}

export type Mercado = ReturnType<typeof useMercado>;
