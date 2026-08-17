import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DyR3hPwK.mjs";
import { r as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useMercado-CgAkKORp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var ADMIN_HANDLE = "jose.luefer";
function aUsuario(id, email, nombre) {
	const correo = email ?? "";
	const handle = correo.split("@")[0]?.toLowerCase() ?? "";
	return {
		id,
		nombre: nombre || correo,
		esAdmin: handle === ADMIN_HANDLE
	};
}
function useSesion() {
	const [usuario, setUsuario] = (0, import_react.useState)(null);
	const [cargando, setCargando] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
			setUsuario(session?.user ? aUsuario(session.user.id, session.user.email, session.user.user_metadata?.["full_name"]) : null);
			setCargando(false);
		});
		supabase.auth.getSession().then(({ data }) => {
			setUsuario(data.session?.user ? aUsuario(data.session.user.id, data.session.user.email, data.session.user.user_metadata?.["full_name"]) : null);
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
* CAPA DE DATOS CONECTADA A SUPABASE
* ----------------------------------
* Toda la lógica del mercado se conecta ahora a la base de datos real.
* Se utilizan las funciones RPC de PostgreSQL para garantizar seguridad
* atómica en las transacciones (apuestas y repartos).
*/
function probabilidad(p) {
	const total = p.poolSi + p.poolNo;
	if (total === 0) return 50;
	return Math.round(p.poolSi / total * 100);
}
function volumen(p) {
	return p.poolSi + p.poolNo;
}
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
function nombreCorto(titulo) {
	const palabras = titulo.replace(/^¿/, "").replace(/\?$/, "").split(" ").slice(0, 3).join(" ");
	return palabras.charAt(0).toUpperCase() + palabras.slice(1);
}
function nombreVisible(a) {
	return a.usaHash ? `#${a.hash}` : a.nombre || a.id;
}
function useMercado(usuario) {
	const [preguntas, setPreguntas] = (0, import_react.useState)([]);
	const [asignaturas, setAsignaturas] = (0, import_react.useState)([]);
	const [alumnos, setAlumnos] = (0, import_react.useState)([]);
	const [apuestas, setApuestas] = (0, import_react.useState)([]);
	const [miPerfil, setMiPerfil] = (0, import_react.useState)(null);
	const cargarDatos = (0, import_react.useCallback)(async () => {
		const [resAsig, resPerf, resPreg, resApu] = await Promise.all([
			supabase.from("asignaturas").select("*"),
			supabase.from("perfiles").select("*"),
			supabase.from("preguntas").select("*").order("creada_en", { ascending: false }),
			supabase.from("apuestas").select("*, perfiles(nombre, usa_hash, hash)").order("cuando", { ascending: false }).limit(30)
		]);
		if (resAsig.error) console.error("Error Asignaturas:", resAsig.error);
		if (resPerf.error) console.error("Error Perfiles:", resPerf.error);
		if (resPreg.error) console.error("Error Preguntas:", resPreg.error);
		if (resApu.error) console.error("Error Apuestas:", resApu.error);
		let misApuestas = [];
		if (usuario) {
			const { data, error } = await supabase.from("apuestas").select("*").eq("usuario_id", usuario.id);
			if (error) console.error("Error Mis Apuestas:", error);
			if (data) misApuestas = data;
		}
		if (resAsig.data) setAsignaturas(resAsig.data.map((a) => ({
			id: a.id,
			nombre: a.nombre
		})));
		if (resPerf.data) {
			const alums = resPerf.data.map((p) => ({
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
			const apFormateadas = resApu.data.map((a) => {
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
			const pregs = resPreg.data.map((p) => {
				let misSi = 0;
				let misNo = 0;
				for (const ap of misApuestas) if (ap.pregunta_id === p.id) {
					if (ap.lado === "si") misSi += Number(ap.tokens);
					else misNo += Number(ap.tokens);
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
	(0, import_react.useEffect)(() => {
		cargarDatos();
	}, [cargarDatos]);
	const saldo = miPerfil ? miPerfil.saldo : 0;
	const pausado = miPerfil ? miPerfil.pausado : false;
	const perfil = miPerfil ? {
		nombre: miPerfil.nombre,
		usaHash: miPerfil.usaHash,
		hash: miPerfil.hash
	} : {
		nombre: "",
		usaHash: false,
		hash: ""
	};
	const miNombre = perfil.usaHash ? `#${perfil.hash}` : perfil.nombre || usuario?.nombre || "Tú";
	const leerAsignaturas = (0, import_react.useCallback)(() => asignaturas, [asignaturas]);
	const leerAlumnos = (0, import_react.useCallback)(() => alumnos, [alumnos]);
	const leerApuestas = (0, import_react.useCallback)(() => {
		const agrupadas = [];
		for (const a of apuestas) {
			const ultima = agrupadas[agrupadas.length - 1];
			if (ultima && ultima.usuario === a.usuario) ultima.tokens += a.tokens;
			else agrupadas.push({ ...a });
		}
		return agrupadas.slice(0, 15);
	}, [apuestas]);
	const leerRanking = (0, import_react.useCallback)(() => {
		return [...alumnos].sort((a, b) => b.saldo - a.saldo).map((a) => ({
			usuario: a.usaHash ? `#${a.hash}` : a.nombre || "Anónimo",
			tokens: Math.round(a.saldo)
		})).slice(0, 10);
	}, [alumnos]);
	const leerPreguntas = (0, import_react.useCallback)((opts) => {
		const estado = opts?.estado ?? "todas";
		return preguntas.filter((p) => opts?.asignaturaId ? p.asignaturaId === opts.asignaturaId : true).filter((p) => {
			if (estado === "abiertas") return p.resultado === null && !p.archivada;
			if (estado === "resueltas") return p.resultado !== null && !p.archivada;
			if (estado === "archivadas") return p.archivada;
			return true;
		}).sort((a, b) => probabilidad(b) - probabilidad(a));
	}, [preguntas]);
	const resumen = (0, import_react.useCallback)(() => {
		let ganar = 0;
		let perder = 0;
		const nombres = [];
		for (const p of preguntas) {
			if (p.resultado !== null || !p.misSi && !p.misNo) continue;
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
	const apostar = (0, import_react.useCallback)(async (id, lado, tokens = 1) => {
		if (!Number.isFinite(tokens) || tokens <= 0 || pausado || saldo < tokens) return false;
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
		setMiPerfil((prev) => prev ? {
			...prev,
			saldo: prev.saldo - tokens
		} : prev);
		const { error } = await supabase.rpc("apostar", {
			p_pregunta_id: id,
			p_lado: lado,
			p_tokens: tokens
		});
		if (error) console.error("Error al apostar:", error);
		await cargarDatos();
		return !error;
	}, [
		saldo,
		pausado,
		cargarDatos
	]);
	const retirar = (0, import_react.useCallback)(async (id) => {
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
		setMiPerfil((prev) => prev ? {
			...prev,
			saldo: prev.saldo + devolucion
		} : prev);
		const { error } = await supabase.rpc("retirar_todo", { p_pregunta_id: id });
		if (error) console.error("Error al retirar:", error);
		await cargarDatos();
		return devolucion;
	}, [
		pausado,
		preguntas,
		cargarDatos
	]);
	const crearPregunta = (0, import_react.useCallback)(async (titulo, asignaturaId) => {
		const t = titulo.trim();
		if (!t || pausado || !asignaturaId) return null;
		const { data, error } = await supabase.from("preguntas").insert({
			titulo: t,
			asignatura_id: asignaturaId,
			historial: [50]
		}).select().single();
		if (error || !data) return null;
		await cargarDatos();
		return data;
	}, [pausado, cargarDatos]);
	const simular = (0, import_react.useCallback)(() => {
		console.log("Simular deshabilitado. La app ya está conectada al backend real.");
	}, []);
	const mutar = (0, import_react.useCallback)((id, fn) => {
		setPreguntas((prev) => prev.map((p) => p.id === id ? fn(p) : p));
	}, []);
	const guardarNombre = (0, import_react.useCallback)(async (nombre) => {
		if (!usuario) return;
		setMiPerfil((prev) => prev ? {
			...prev,
			nombre
		} : prev);
		await supabase.from("perfiles").update({ nombre }).eq("id", usuario.id);
		await cargarDatos();
	}, [usuario, cargarDatos]);
	const usarHash = (0, import_react.useCallback)(async (valor) => {
		if (!usuario) return;
		const nuevoHash = valor ? hashAleatorio() : miPerfil?.hash;
		setMiPerfil((prev) => prev ? {
			...prev,
			usaHash: valor,
			hash: nuevoHash || ""
		} : prev);
		await supabase.from("perfiles").update({
			usa_hash: valor,
			hash: nuevoHash
		}).eq("id", usuario.id);
		await cargarDatos();
	}, [
		usuario,
		miPerfil,
		cargarDatos
	]);
	const esAdmin = !!usuario?.esAdmin;
	const resolver = (0, import_react.useCallback)(async (id, entro) => {
		if (!esAdmin) return false;
		const { error } = await supabase.rpc("resolver_pregunta", {
			p_pregunta_id: id,
			p_entro: entro
		});
		if (error) console.error("Error al resolver:", error);
		await cargarDatos();
		return !error;
	}, [esAdmin, cargarDatos]);
	const desresolver = (0, import_react.useCallback)(async (id) => {
		if (!esAdmin) return false;
		await supabase.from("preguntas").update({
			resultado: null,
			archivada: false
		}).eq("id", id);
		await cargarDatos();
		return true;
	}, [esAdmin, cargarDatos]);
	const archivar = (0, import_react.useCallback)(async (id, valor = true) => {
		if (!esAdmin) return false;
		await supabase.from("preguntas").update({ archivada: valor }).eq("id", id);
		await cargarDatos();
		return true;
	}, [esAdmin, cargarDatos]);
	const eliminarPregunta = (0, import_react.useCallback)(async (id) => {
		if (!esAdmin) return false;
		await supabase.from("preguntas").delete().eq("id", id);
		await cargarDatos();
		return true;
	}, [esAdmin, cargarDatos]);
	const moverPregunta = (0, import_react.useCallback)(async (id, asignaturaId) => {
		if (!esAdmin) return false;
		await supabase.from("preguntas").update({ asignatura_id: asignaturaId }).eq("id", id);
		await cargarDatos();
		return true;
	}, [esAdmin, cargarDatos]);
	const editarTitulo = (0, import_react.useCallback)(async (id, titulo) => {
		if (!esAdmin || !titulo.trim()) return false;
		await supabase.from("preguntas").update({ titulo: titulo.trim() }).eq("id", id);
		await cargarDatos();
		return true;
	}, [esAdmin, cargarDatos]);
	const crearAsignatura = (0, import_react.useCallback)(async (nombre) => {
		if (!esAdmin || !nombre.trim()) return false;
		await supabase.from("asignaturas").insert({ nombre: nombre.trim() });
		await cargarDatos();
		return true;
	}, [esAdmin, cargarDatos]);
	const eliminarAsignatura = (0, import_react.useCallback)(async (id) => {
		if (!esAdmin) return false;
		await supabase.from("asignaturas").delete().eq("id", id);
		await cargarDatos();
		return true;
	}, [esAdmin, cargarDatos]);
	const renombrarAsignatura = (0, import_react.useCallback)(async (id, nombre) => {
		if (!esAdmin || !nombre.trim()) return false;
		await supabase.from("asignaturas").update({ nombre: nombre.trim() }).eq("id", id);
		await cargarDatos();
		return true;
	}, [esAdmin, cargarDatos]);
	const darTokens = (0, import_react.useCallback)(async (alumnoId, delta) => {
		if (!esAdmin) return false;
		const alum = alumnos.find((a) => a.id === alumnoId);
		if (alum) {
			await supabase.from("perfiles").update({ saldo: Math.max(0, alum.saldo + delta) }).eq("id", alumnoId);
			await cargarDatos();
		}
		return true;
	}, [
		esAdmin,
		alumnos,
		cargarDatos
	]);
	const pausarAlumno = (0, import_react.useCallback)(async (alumnoId, valor) => {
		if (!esAdmin) return false;
		await supabase.from("perfiles").update({ pausado: valor }).eq("id", alumnoId);
		await cargarDatos();
		return true;
	}, [
		esAdmin,
		alumnos,
		cargarDatos
	]);
	return (0, import_react.useMemo)(() => ({
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
		mutar
	]);
}
//#endregion
export { useSesion as a, useMercado as i, nombreVisible as n, volumen as o, probabilidad as r, haceTexto as t };
