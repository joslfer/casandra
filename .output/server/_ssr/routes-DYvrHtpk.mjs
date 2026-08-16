import { n as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { a as useSesion, i as useMercado, n as nombreVisible, o as volumen, r as probabilidad, t as haceTexto } from "./useMercado-CbPu3ooe.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DYvrHtpk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Moneda({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-3.5 w-3.5 rounded-full bg-moneda ${className}` });
}
var mono = "font-mono text-[11px] uppercase tracking-widest";
function Hero({ mercado }) {
	const { nombres } = mercado.resumen();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "relative mt-5 border-b border-linea pb-4",
		children: nombres.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 truncate text-[11.5px] text-sutil",
			children: nombres.join(" · ")
		})
	});
}
function MiniGrafico({ historial }) {
	const proporcionSi = Math.max(0, Math.min(100, historial[historial.length - 1] ?? 50));
	const proporcionNo = 100 - proporcionSi;
	if (historial.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-2.5 h-8",
		"aria-hidden": true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-2.5 space-y-1.5",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-2.5 overflow-hidden rounded-full bg-linea",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-full w-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-verde",
					style: { width: `${proporcionSi}%` }
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-rojo",
					style: { width: `${proporcionNo}%` }
				})]
			})
		})
	});
}
function FilaPregunta({ pregunta, onApostar, onRetirar, bloqueado }) {
	const prob = probabilidad(pregunta);
	const positivo = prob >= 50;
	const apostado = pregunta.misSi + pregunta.misNo;
	const cerrada = pregunta.resultado !== null;
	volumen(pregunta);
	const btnBase = "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[14px] font-normal transition-colors disabled:opacity-40";
	const helvetica = { fontFamily: "Helvetica, Arial, sans-serif" };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "border-b border-linea py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-[15px] leading-snug text-ink",
					children: pregunta.titulo
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `font-mono text-[30px] leading-none tabular-nums ${positivo ? "text-verde" : "text-rojo"}`,
					children: prob
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniGrafico, { historial: pregunta.historial }),
			cerrada ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 font-mono text-[12px] uppercase tracking-widest text-sutil",
				children: ["Resuelta · ", pregunta.resultado ? "entró" : "no entró"]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => onApostar("no"),
					disabled: bloqueado,
					style: helvetica,
					className: `${btnBase} ${pregunta.misNo > 0 ? "border-rojo bg-rojo text-white" : "border-borde bg-white text-ink hover:border-ink/30"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "NO" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => onApostar("si"),
					disabled: bloqueado,
					style: helvetica,
					className: `${btnBase} ${pregunta.misSi > 0 ? "border-verde bg-verde text-white" : "border-borde bg-white text-ink hover:border-ink/30"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SÍ" })
				})]
			}), apostado > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: onRetirar,
				className: "mt-2 w-full rounded-lg border border-borde bg-transparent py-2 font-mono text-[12px] uppercase tracking-widest text-sutil transition-colors hover:text-ink",
				children: ["Retirar ", apostado]
			})] })
		]
	});
}
function Asignaturas({ asignaturas, asigId, setAsigActiva }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-4 overflow-x-auto border-b border-linea pb-2.5 pt-4",
		children: asignaturas.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => setAsigActiva(a.id),
			className: `whitespace-nowrap text-[13px] transition-colors ${a.id === asigId ? "text-ink" : "text-sutil hover:text-ink"}`,
			children: a.nombre
		}, a.id))
	});
}
function MarketPage() {
	const { usuario, cargando, entrarConGoogle, salir } = useSesion();
	const mercado = useMercado(usuario);
	const [vista, setVista] = (0, import_react.useState)("feed");
	const [vistaAdmin, setVistaAdmin] = (0, import_react.useState)("preguntas");
	const [error, setError] = (0, import_react.useState)(null);
	const [nuevaAsig, setNuevaAsig] = (0, import_react.useState)("");
	const asignaturas = mercado.leerAsignaturas();
	const [asigActiva, setAsigActiva] = (0, import_react.useState)("");
	const asigId = asigActiva || asignaturas[0]?.id || "";
	if (cargando) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-screen bg-lienzo" });
	if (!usuario) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center bg-lienzo px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Casandra"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xs text-center text-[14px] leading-relaxed text-sutil",
				children: "Mercado de predicción académico. Apuesta tokens a si una pregunta entra en el examen."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: async () => setError(await entrarConGoogle()),
				className: "mt-8 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85",
				children: "Entrar con Google"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[12px] text-rojo",
				children: error
			})
		]
	});
	const abiertas = mercado.leerPreguntas({
		asignaturaId: asigId,
		estado: "abiertas"
	});
	const archivadas = mercado.leerPreguntas({
		asignaturaId: asigId,
		estado: "archivadas"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-lienzo pb-28",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex h-14 max-w-[520px] items-center justify-between px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setVista("feed"),
					className: "text-[15px] font-semibold tracking-tight",
					children: "Casandra"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/profile",
							className: mono,
							children: "Perfil"
						}),
						usuario.esAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setVista(vista === "admin" ? "feed" : "admin"),
							className: `${mono} ${vista === "admin" ? "text-ink" : "text-sutil"}`,
							children: "Admin"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moneda, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[13px] tabular-nums",
								children: mercado.saldo
							})]
						})
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-[520px] px-5 pt-14",
			children: [
				mercado.pausado && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 rounded-lg border border-borde bg-white px-3 py-2 text-[12px] text-sutil",
					children: "Tu cuenta está pausada por el administrador."
				}),
				(vista === "feed" || vista === "archivadas") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, { mercado }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-2 text-center text-[14px] font-normal leading-relaxed text-sutil",
						children: mercado.leerApuestas().map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "mx-auto max-w-[32rem]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full px-1.5 py-0.5 text-ink [text-shadow:0_0_10px_rgba(245,193,59,0.55)]",
									children: a.usuario
								}),
								" ",
								"apostó ",
								a.tokens,
								" ",
								a.tokens === 1 ? "token" : "tokens",
								" ",
								haceTexto(a.cuando)
							]
						}, a.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 flex gap-4 border-b border-linea pb-2.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setVista("feed"),
							className: `${mono} ${vista === "feed" ? "text-ink" : "text-sutil"}`,
							children: "Abiertas"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Asignaturas, {
						asignaturas,
						asigId,
						setAsigActiva
					}),
					(vista === "feed" ? abiertas : archivadas).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilaPregunta, {
						pregunta: p,
						bloqueado: mercado.pausado,
						onApostar: (lado) => mercado.apostar(p.id, lado),
						onRetirar: () => mercado.retirar(p.id)
					}, p.id)),
					(vista === "feed" ? abiertas : archivadas).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-6 ${mono} text-sutil`,
						children: "sin preguntas aquí"
					}),
					vista === "feed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => mercado.simular(),
						className: `mt-6 ${mono} text-sutil transition-colors hover:text-ink`,
						children: "simular apuesta de otro alumno →"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setVista(vista === "feed" ? "archivadas" : "feed"),
						className: `mt-8 w-full rounded-full border border-linea py-3 text-[13px] font-normal tracking-normal text-ink transition-colors hover:bg-white`,
						children: vista === "feed" ? "Archivadas" : "Abiertas"
					})
				] }),
				vista === "admin" && usuario.esAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "pt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-4 border-b border-linea pb-2.5",
							children: [
								"preguntas",
								"archivado",
								"usuarios",
								"asignaturas"
							].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setVistaAdmin(v),
								className: `${mono} ${vistaAdmin === v ? "text-ink" : "text-sutil"}`,
								children: v
							}, v))
						}),
						vistaAdmin === "preguntas" && mercado.leerPreguntas({ estado: "todas" }).filter((p) => !p.archivada).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-b border-linea py-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-[14px] leading-snug",
										children: p.titulo
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-[18px] tabular-nums text-sutil",
										children: probabilidad(p)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-mono text-[11px] text-sutil",
									children: [
										"vol ",
										volumen(p),
										" · ",
										p.resultado === null ? "abierta" : p.resultado ? "entró" : "no entró"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: p.asignaturaId,
									onChange: (e) => mercado.moverPregunta(p.id, e.target.value),
									className: "mt-2 w-full rounded-lg border border-borde bg-white px-2 py-1.5 text-[12px]",
									children: asignaturas.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: a.id,
										children: a.nombre
									}, a.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: [
										p.resultado === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => mercado.resolver(p.id, true),
											className: "flex-1 rounded-lg border border-borde bg-white py-2 text-[13px] hover:border-verde hover:text-verde",
											children: "Entró"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => mercado.resolver(p.id, false),
											className: "flex-1 rounded-lg border border-borde bg-white py-2 text-[13px] hover:border-rojo hover:text-rojo",
											children: "No entró"
										})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => mercado.desresolver(p.id),
											className: "flex-1 rounded-lg border border-borde bg-white py-2 text-[13px] hover:border-ink",
											children: "Desresolver"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => mercado.archivar(p.id, true),
											className: "flex-1 rounded-lg border border-borde bg-white py-2 text-[13px] hover:border-ink",
											children: "Archivar"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												const t = window.prompt("Nuevo título", p.titulo);
												if (t) mercado.editarTitulo(p.id, t);
											},
											className: "rounded-lg border border-borde bg-white px-3 py-2 text-[13px]",
											children: "Editar"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => mercado.eliminarPregunta(p.id),
											className: "rounded-lg border border-borde bg-white px-3 py-2 text-[13px] text-rojo",
											children: "Eliminar"
										})
									]
								})
							]
						}, p.id)),
						vistaAdmin === "archivado" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [mercado.leerPreguntas({ estado: "archivadas" }).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-b border-linea py-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-[14px] leading-snug text-sutil",
								children: p.titulo
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => mercado.archivar(p.id, false),
										className: "flex-1 rounded-lg border border-borde bg-white py-2 text-[13px]",
										children: "Desarchivar"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => mercado.desresolver(p.id),
										className: "flex-1 rounded-lg border border-borde bg-white py-2 text-[13px]",
										children: "Desresolver"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => mercado.eliminarPregunta(p.id),
										className: "rounded-lg border border-borde bg-white px-3 py-2 text-[13px] text-rojo",
										children: "Eliminar"
									})
								]
							})]
						}, p.id)), mercado.leerPreguntas({ estado: "archivadas" }).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `mt-5 ${mono} text-sutil`,
							children: "archivo vacío"
						})] }),
						vistaAdmin === "usuarios" && mercado.leerAlumnos().map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 border-b border-linea py-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-[14px]",
										children: nombreVisible(a)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-mono text-[11px] text-sutil",
										children: [
											a.saldo,
											" tokens ",
											a.pausado && "· pausado"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => mercado.darTokens(a.id, -1),
									className: "h-8 w-8 rounded-lg border border-borde bg-white text-[14px]",
									children: "−"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => mercado.darTokens(a.id, 1),
									className: "h-8 w-8 rounded-lg border border-borde bg-white text-[14px]",
									children: "+"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => mercado.pausarAlumno(a.id, !a.pausado),
									className: `rounded-lg border px-2.5 py-1.5 text-[12px] ${a.pausado ? "border-ink bg-ink text-white" : "border-borde bg-white"}`,
									children: a.pausado ? "Reanudar" : "Pausar"
								})
							]
						}, a.id)),
						vistaAdmin === "asignaturas" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [asignaturas.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 border-b border-linea py-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: a.nombre,
								onChange: (e) => mercado.renombrarAsignatura(a.id, e.target.value),
								className: "min-w-0 flex-1 bg-transparent text-[14px] outline-none"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => mercado.eliminarAsignatura(a.id),
								className: "rounded-lg border border-borde bg-white px-2.5 py-1.5 text-[12px] text-rojo",
								children: "Eliminar"
							})]
						}, a.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: (e) => {
								e.preventDefault();
								if (mercado.crearAsignatura(nuevaAsig)) setNuevaAsig("");
							},
							className: "mt-4 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: nuevaAsig,
								onChange: (e) => setNuevaAsig(e.target.value),
								placeholder: "Nueva asignatura",
								className: "min-w-0 flex-1 border-b border-borde bg-transparent pb-2 text-[14px] outline-none placeholder:text-sutil focus:border-ink"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "rounded-lg bg-ink px-3 py-1.5 text-[13px] text-white",
								children: "Añadir"
							})]
						})] })
					]
				})
			]
		})]
	});
}
var SplitComponent = MarketPage;
//#endregion
export { SplitComponent as component };
