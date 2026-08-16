import { n as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DyR3hPwK.mjs";
import { r as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useMercado-CbPu3ooe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var ADMIN_HANDLE = "jose.luefer";
function aUsuario(email, nombre) {
	const correo = email ?? "";
	const handle = correo.split("@")[0]?.toLowerCase() ?? "";
	return {
		id: correo,
		nombre: nombre || correo,
		esAdmin: handle === ADMIN_HANDLE
	};
}
function useSesion() {
	const [usuario, setUsuario] = (0, import_react.useState)(null);
	const [cargando, setCargando] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
			setUsuario(session?.user ? aUsuario(session.user.email, session.user.user_metadata?.["full_name"]) : null);
			setCargando(false);
		});
		supabase.auth.getSession().then(({ data }) => {
			setUsuario(data.session?.user ? aUsuario(data.session.user.email, data.session.user.user_metadata?.["full_name"]) : null);
			setCargando(false);
		});
		return () => sub.subscription.unsubscribe();
	}, []);
	const entrarConGoogle = async () => {
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: window.location.origin }
		});
	};
	const salir = async () => {
		await supabase.auth.signOut();
	};
	return {
		usuario,
		cargando,
		entrarConGoogle,
		salir
	};
}
/**
* CAPA DE DATOS AISLADA
* ---------------------
* Toda la lógica del mercado vive aquí. Ningún componente toca el estado
* directamente: sólo llama a las funciones expuestas por useMercado().
*
* Las firmas están pensadas para sustituirse por llamadas a una API real
* (fetch / server functions) sin tocar la UI. Hoy: mock en estado local.
*/
var SALDO_INICIAL = 10;
function probabilidad(p) {
	const total = p.poolSi + p.poolNo;
	if (total === 0) return 50;
	return Math.round(p.poolSi / total * 100);
}
/** volumen(p): tokens totales apostados en la pregunta */
function volumen(p) {
	return p.poolSi + p.poolNo;
}
/** premio(stake, lado, poolSi, poolNo): pago bruto de una posición ganadora */
function premio(stake, lado, poolSi, poolNo) {
	const total = poolSi + poolNo;
	if (lado === "si") return poolSi === 0 ? 0 : total * (stake / poolSi);
	return poolNo === 0 ? 0 : total * (stake / poolNo);
}
function hashAleatorio() {
	const abc = "abcdefghijkmnpqrstuvwxyz23456789";
	let s = "";
	for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * 32)];
	return s;
}
function haceTexto(cuando, ahora = Date.now()) {
	const min = Math.max(1, Math.round((ahora - cuando) / 6e4));
	if (min < 60) return `hace ${min} min`;
	const h = Math.round(min / 60);
	if (h < 24) return `hace ${h} ${h === 1 ? "hora" : "horas"}`;
	const d = Math.round(h / 24);
	return `hace ${d} ${d === 1 ? "día" : "días"}`;
}
/** nombreCorto(titulo): para el pie del hero */
function nombreCorto(titulo) {
	const palabras = titulo.replace(/^¿/, "").replace(/\?$/, "").split(" ").slice(0, 3).join(" ");
	return palabras.charAt(0).toUpperCase() + palabras.slice(1);
}
/** Genera un historial verosímil terminando en la probabilidad actual. */
function historialInicial(final, n = 14) {
	const out = [];
	let v = final + (Math.random() * 24 - 12);
	for (let i = 0; i < n - 1; i++) {
		v = Math.min(96, Math.max(4, v + (Math.random() * 14 - 7)));
		out.push(Math.round(v));
	}
	out.push(final);
	return out;
}
var ASIGNATURAS = [
	{
		id: "mat",
		nombre: "Matemáticas"
	},
	{
		id: "fis",
		nombre: "Física"
	},
	{
		id: "bio",
		nombre: "Biología"
	},
	{
		id: "his",
		nombre: "Historia"
	}
];
function crearMock(titulo, asignaturaId, poolSi, poolNo, resultado = null, archivada = false) {
	const base = {
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
		creadaEn: Date.now()
	};
	return {
		...base,
		historial: historialInicial(probabilidad(base))
	};
}
var MOCK = [
	{
		...crearMock("¿Entra la demostración del teorema de Bolzano?", "mat", 38, 10),
		misSi: 3
	},
	crearMock("¿Cae un problema de circuitos RLC en régimen transitorio?", "fis", 22, 24),
	crearMock("¿Hay un ejercicio de integrales por partes?", "mat", 44, 6),
	crearMock("¿Entra la Guerra de Sucesión en el desarrollo largo?", "his", 14, 26),
	crearMock("¿Piden demostrar la regla de la cadena?", "mat", 19, 21),
	crearMock("¿Sale el efecto fotoeléctrico como teoría?", "fis", 30, 12, true),
	crearMock("¿Entra la mitosis con dibujo?", "bio", 8, 40, false, true)
];
var ALUMNOS = [
	{
		id: "jose.luefer",
		nombre: "José L.",
		saldo: 10,
		pausado: false,
		usaHash: false,
		hash: hashAleatorio()
	},
	{
		id: "marta.gil",
		nombre: "Marta G.",
		saldo: 14,
		pausado: false,
		usaHash: false,
		hash: hashAleatorio()
	},
	{
		id: "anon1",
		nombre: "",
		saldo: 7,
		pausado: false,
		usaHash: true,
		hash: "k7q2ma"
	},
	{
		id: "pablo.ruiz",
		nombre: "Pablo R.",
		saldo: 3,
		pausado: true,
		usaHash: false,
		hash: hashAleatorio()
	},
	{
		id: "lucia.ny",
		nombre: "Lucía N.",
		saldo: 21,
		pausado: false,
		usaHash: false,
		hash: hashAleatorio()
	},
	{
		id: "anon2",
		nombre: "",
		saldo: 9,
		pausado: false,
		usaHash: true,
		hash: "z3m9tp"
	}
];
function nombreVisible(a) {
	return a.usaHash ? `#${a.hash}` : a.nombre || a.id;
}
var AHORA = Date.now();
var APUESTAS = [
	{
		id: "a1",
		usuario: "Marta G.",
		tokens: 4,
		cuando: AHORA - 55 * 6e4
	},
	{
		id: "a2",
		usuario: "#k7q2ma",
		tokens: 2,
		cuando: AHORA - 2 * 36e5
	},
	{
		id: "a3",
		usuario: "Lucía N.",
		tokens: 6,
		cuando: AHORA - 5 * 36e5
	},
	{
		id: "a4",
		usuario: "#z3m9tp",
		tokens: 1,
		cuando: AHORA - 9 * 36e5
	}
];
function useMercado(usuario) {
	const [preguntas, setPreguntas] = (0, import_react.useState)(MOCK);
	const [asignaturas, setAsignaturas] = (0, import_react.useState)(ASIGNATURAS);
	const [alumnos, setAlumnos] = (0, import_react.useState)(ALUMNOS);
	const [apuestas, setApuestas] = (0, import_react.useState)(APUESTAS);
	const [saldo, setSaldo] = (0, import_react.useState)(SALDO_INICIAL);
	const [perfil, setPerfil] = (0, import_react.useState)({
		nombre: "",
		usaHash: false,
		hash: hashAleatorio()
	});
	const miNombre = perfil.usaHash ? `#${perfil.hash}` : perfil.nombre || usuario?.nombre || "Tú";
	const pausado = (0, import_react.useMemo)(() => alumnos.some((a) => a.id === usuario?.id && a.pausado), [alumnos, usuario]);
	/** leerAsignaturas() */
	const leerAsignaturas = (0, import_react.useCallback)(() => asignaturas, [asignaturas]);
	/** leerApuestas(): actividad reciente */
	const leerApuestas = (0, import_react.useCallback)(() => [...apuestas].sort((a, b) => b.cuando - a.cuando).slice(0, 5), [apuestas]);
	/** leerAlumnos() */
	const leerAlumnos = (0, import_react.useCallback)(() => alumnos, [alumnos]);
	/**
	* leerPreguntas(filtro): ordenadas por probabilidad SÍ desc.
	* estado: "abiertas" | "resueltas" | "archivadas" | "todas"
	*/
	const leerPreguntas = (0, import_react.useCallback)((opts) => {
		const estado = opts?.estado ?? "todas";
		return preguntas.filter((p) => opts?.asignaturaId ? p.asignaturaId === opts.asignaturaId : true).filter((p) => {
			if (estado === "abiertas") return p.resultado === null && !p.archivada;
			if (estado === "resueltas") return p.resultado !== null && !p.archivada;
			if (estado === "archivadas") return p.archivada;
			return true;
		}).sort((a, b) => probabilidad(b) - probabilidad(a));
	}, [preguntas]);
	/** resumen(): posible ganancia/pérdida sobre todas mis posiciones abiertas */
	const resumen = (0, import_react.useCallback)(() => {
		let ganar = 0;
		let perder = 0;
		const nombres = [];
		for (const p of preguntas) {
			if (p.resultado !== null) continue;
			if (!(p.misSi > 0 || p.misNo > 0)) continue;
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
		return {
			ganar: Math.round(ganar),
			perder: Math.round(perder),
			nombres
		};
	}, [preguntas]);
	const mutar = (0, import_react.useCallback)((id, fn) => {
		setPreguntas((prev) => prev.map((p) => p.id === id ? fn(p) : p));
	}, []);
	/** apostar(id, lado, tokens = 1) */
	const apostar = (0, import_react.useCallback)((id, lado, tokens = 1) => {
		if (pausado || saldo < tokens) return false;
		let ok = false;
		setPreguntas((prev) => prev.map((p) => {
			if (p.id !== id || p.resultado !== null || p.archivada) return p;
			ok = true;
			const next = {
				...p,
				poolSi: p.poolSi + (lado === "si" ? tokens : 0),
				poolNo: p.poolNo + (lado === "no" ? tokens : 0),
				misSi: p.misSi + (lado === "si" ? tokens : 0),
				misNo: p.misNo + (lado === "no" ? tokens : 0)
			};
			return {
				...next,
				historial: [...p.historial, probabilidad(next)]
			};
		}));
		if (ok) {
			setSaldo((s) => s - tokens);
			setApuestas((prev) => [{
				id: crypto.randomUUID(),
				usuario: miNombre,
				tokens,
				cuando: Date.now()
			}, ...prev]);
		}
		return ok;
	}, [
		saldo,
		pausado,
		miNombre
	]);
	/** retirar(id): devuelve todos mis tokens y revierte el pool */
	const retirar = (0, import_react.useCallback)((id) => {
		if (pausado) return 0;
		let devueltos = 0;
		setPreguntas((prev) => prev.map((p) => {
			if (p.id !== id) return p;
			devueltos = p.misSi + p.misNo;
			if (devueltos === 0) return p;
			const next = {
				...p,
				poolSi: Math.max(0, p.poolSi - p.misSi),
				poolNo: Math.max(0, p.poolNo - p.misNo),
				misSi: 0,
				misNo: 0
			};
			return {
				...next,
				historial: [...p.historial, probabilidad(next)]
			};
		}));
		if (devueltos > 0) setSaldo((s) => s + devueltos);
		return devueltos;
	}, [pausado]);
	/** crearPregunta(titulo, asignaturaId): arranca en 50, sin historial */
	const crearPregunta = (0, import_react.useCallback)((titulo, asignaturaId) => {
		const t = titulo.trim();
		if (!t || pausado || !asignaturaId) return null;
		const nueva = {
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
			creadaEn: Date.now()
		};
		setPreguntas((prev) => [nueva, ...prev]);
		return nueva;
	}, [pausado]);
	/** simular(): otro alumno apuesta 1-3 tokens a un lado random */
	const simular = (0, import_react.useCallback)(() => {
		let registro = null;
		setPreguntas((prev) => {
			const abiertas = prev.filter((p) => p.resultado === null && !p.archivada);
			if (abiertas.length === 0) return prev;
			const objetivo = abiertas[Math.floor(Math.random() * abiertas.length)];
			if (!objetivo) return prev;
			const lado = Math.random() < .5 ? "si" : "no";
			const tokens = 1 + Math.floor(Math.random() * 3);
			const activos = ALUMNOS.filter((a) => !a.pausado);
			const quien = activos[Math.floor(Math.random() * activos.length)];
			registro = {
				id: crypto.randomUUID(),
				usuario: nombreVisible(quien),
				tokens,
				cuando: Date.now()
			};
			return prev.map((p) => {
				if (p.id !== objetivo.id) return p;
				const next = {
					...p,
					poolSi: p.poolSi + (lado === "si" ? tokens : 0),
					poolNo: p.poolNo + (lado === "no" ? tokens : 0)
				};
				return {
					...next,
					historial: [...p.historial, probabilidad(next)]
				};
			});
		});
		if (registro) setApuestas((prev) => [registro, ...prev]);
	}, []);
	const esAdmin = !!usuario?.esAdmin;
	/** resolver(id, entro): paga el premio proporcional al pool. */
	const resolver = (0, import_react.useCallback)((id, entro) => {
		if (!esAdmin) return false;
		let pago = 0;
		setPreguntas((prev) => prev.map((p) => {
			if (p.id !== id || p.resultado !== null) return p;
			const stake = entro ? p.misSi : p.misNo;
			pago = stake > 0 ? Math.round(premio(stake, entro ? "si" : "no", p.poolSi, p.poolNo)) : 0;
			return {
				...p,
				resultado: entro
			};
		}));
		if (pago > 0) setSaldo((s) => s + pago);
		return true;
	}, [esAdmin]);
	/** desresolver(id): vuelve a abrir la pregunta */
	const desresolver = (0, import_react.useCallback)((id) => {
		if (!esAdmin) return false;
		setPreguntas((prev) => prev.map((p) => p.id === id ? {
			...p,
			resultado: null,
			archivada: false
		} : p));
		return true;
	}, [esAdmin]);
	const archivar = (0, import_react.useCallback)((id, valor = true) => {
		if (!esAdmin) return false;
		setPreguntas((prev) => prev.map((p) => p.id === id ? {
			...p,
			archivada: valor
		} : p));
		return true;
	}, [esAdmin]);
	const eliminarPregunta = (0, import_react.useCallback)((id) => {
		if (!esAdmin) return false;
		setPreguntas((prev) => prev.filter((p) => p.id !== id));
		return true;
	}, [esAdmin]);
	const moverPregunta = (0, import_react.useCallback)((id, asignaturaId) => {
		if (!esAdmin) return false;
		setPreguntas((prev) => prev.map((p) => p.id === id ? {
			...p,
			asignaturaId
		} : p));
		return true;
	}, [esAdmin]);
	const editarTitulo = (0, import_react.useCallback)((id, titulo) => {
		if (!esAdmin || !titulo.trim()) return false;
		setPreguntas((prev) => prev.map((p) => p.id === id ? {
			...p,
			titulo: titulo.trim()
		} : p));
		return true;
	}, [esAdmin]);
	const crearAsignatura = (0, import_react.useCallback)((nombre) => {
		if (!esAdmin || !nombre.trim()) return false;
		setAsignaturas((prev) => [...prev, {
			id: crypto.randomUUID(),
			nombre: nombre.trim()
		}]);
		return true;
	}, [esAdmin]);
	const eliminarAsignatura = (0, import_react.useCallback)((id) => {
		if (!esAdmin) return false;
		setAsignaturas((prev) => prev.filter((a) => a.id !== id));
		setPreguntas((prev) => prev.filter((p) => p.asignaturaId !== id));
		return true;
	}, [esAdmin]);
	const renombrarAsignatura = (0, import_react.useCallback)((id, nombre) => {
		if (!esAdmin || !nombre.trim()) return false;
		setAsignaturas((prev) => prev.map((a) => a.id === id ? {
			...a,
			nombre: nombre.trim()
		} : a));
		return true;
	}, [esAdmin]);
	const darTokens = (0, import_react.useCallback)((alumnoId, delta) => {
		if (!esAdmin) return false;
		setAlumnos((prev) => prev.map((a) => a.id === alumnoId ? {
			...a,
			saldo: Math.max(0, a.saldo + delta)
		} : a));
		if (alumnoId === usuario?.id) setSaldo((s) => Math.max(0, s + delta));
		return true;
	}, [esAdmin, usuario]);
	const pausarAlumno = (0, import_react.useCallback)((alumnoId, valor) => {
		if (!esAdmin) return false;
		setAlumnos((prev) => prev.map((a) => a.id === alumnoId ? {
			...a,
			pausado: valor
		} : a));
		return true;
	}, [esAdmin]);
	const guardarNombre = (0, import_react.useCallback)((nombre) => {
		setPerfil((p) => ({
			...p,
			nombre
		}));
	}, []);
	const usarHash = (0, import_react.useCallback)((valor) => {
		setPerfil((p) => ({
			...p,
			usaHash: valor,
			hash: valor ? hashAleatorio() : p.hash
		}));
	}, []);
	return (0, import_react.useMemo)(() => ({
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
		mutar
	}), [
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
		mutar
	]);
}
//#endregion
export { useSesion as a, useMercado as i, nombreVisible as n, volumen as o, probabilidad as r, haceTexto as t };
