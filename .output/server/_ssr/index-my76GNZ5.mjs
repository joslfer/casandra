import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useSesion, a as useMercado, h as haceTexto, p as probabilidad } from "./useMercado-Dm6Iw5oZ.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./client-DKc3rSMY.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
function useHaptic() {
  const switchRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    input.setAttribute("aria-hidden", "true");
    input.tabIndex = -1;
    input.style.cssText = "position:fixed;inline-size:1px;block-size:1px;opacity:0;pointer-events:none;clip-path:inset(50%);overflow:hidden;inset:0;";
    document.body.appendChild(input);
    switchRef.current = input;
    return () => {
      switchRef.current = null;
      input.remove();
    };
  }, []);
  return reactExports.useCallback(() => {
    const input = switchRef.current;
    if (!input) return;
    input.click();
  }, []);
}
function Moneda({ className = "" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-3.5 w-3.5 rounded-full bg-moneda ${className}` });
}
const mono = "font-mono text-[11px] uppercase tracking-widest";
const fuenteApple = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };
function EscalaPuntos({
  si,
  no,
  misSi,
  misNo
}) {
  const total = si + no;
  if (total === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2.5 font-mono text-[11px] text-sutil", children: "sin apuestas todavía" });
  }
  const otrosNo = Math.max(0, no - misNo);
  const otrosSi = Math.max(0, si - misSi);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2.5 grid grid-cols-2 gap-2", "aria-hidden": true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-start gap-1", children: [
      Array.from({ length: otrosNo }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-rojo" }, `no-o-${i}`)),
      Array.from({ length: misNo }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-moneda" }, `no-m-${i}`))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row-reverse flex-wrap gap-1", children: [
      Array.from({ length: otrosSi }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-verde" }, `si-o-${i}`)),
      Array.from({ length: misSi }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-moneda" }, `si-m-${i}`))
    ] })
  ] });
}
function FilaPregunta({
  pregunta,
  onApostar,
  bloqueado,
  sinTokens,
  ocultarBorde
}) {
  const prob = probabilidad(pregunta);
  const totalApuestas = pregunta.poolSi + pregunta.poolNo;
  const tieneApuestas = totalApuestas > 0;
  const positivo = prob >= 50;
  const cerrada = pregunta.resultado !== null;
  const btnBase = "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[14px] font-medium transition-colors disabled:opacity-40";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "article",
    {
      className: `py-6 ${ocultarBorde ? "" : "border-b border-linea"} transition-all duration-500 ease-in-out`,
      style: { willChange: "transform" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-[19px] font-medium leading-snug text-ink", children: pregunta.titulo }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `font-mono text-[30px] leading-none tabular-nums ${!tieneApuestas ? "text-sutil" : positivo ? "text-verde" : "text-rojo"}`,
              children: tieneApuestas ? `${prob}%` : "--%"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(EscalaPuntos, { si: pregunta.poolSi, no: pregunta.poolNo, misSi: pregunta.misSi, misNo: pregunta.misNo }),
        cerrada ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 font-mono text-[12px] uppercase tracking-widest text-sutil", children: [
          "Resuelta · ",
          pregunta.resultado ? "entró" : "no entró"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              "data-apuesta": true,
              onClick: () => onApostar("no"),
              disabled: bloqueado,
              style: fuenteApple,
              className: `${btnBase} ${pregunta.misNo > 0 ? "border-rojo bg-rojo text-white" : sinTokens ? "border-linea bg-black/5 text-sutil" : "border-borde bg-white text-ink hover:border-ink/30"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "NO" }),
                pregunta.misNo > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[12px] tabular-nums", children: [
                  "· ",
                  pregunta.misNo
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              "data-apuesta": true,
              onClick: () => onApostar("si"),
              disabled: bloqueado,
              style: fuenteApple,
              className: `${btnBase} ${pregunta.misSi > 0 ? "border-verde bg-verde text-white" : sinTokens ? "border-linea bg-black/5 text-sutil" : "border-borde bg-white text-ink hover:border-ink/30"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "SÍ" }),
                pregunta.misSi > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[12px] tabular-nums", children: [
                  "· ",
                  pregunta.misSi
                ] })
              ]
            }
          )
        ] })
      ]
    }
  );
}
function Asignaturas({
  asignaturas,
  asigId,
  setAsigActiva
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap justify-center gap-2 py-6", children: asignaturas.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick: () => setAsigActiva(a.id),
      style: fuenteApple,
      className: `whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${a.id === asigId ? "border-ink bg-ink text-white" : "border-borde bg-white text-ink hover:border-ink/30"}`,
      children: a.nombre
    },
    a.id
  )) });
}
function ModalNuevaPregunta({
  asignaturas,
  asigInicial,
  onCerrar,
  onCrear
}) {
  const [titulo, setTitulo] = reactExports.useState("");
  const [asigId, setAsigId] = reactExports.useState(asigInicial);
  const [error, setError] = reactExports.useState(null);
  const [cargando, setCargando] = reactExports.useState(false);
  const enviar = async () => {
    if (!titulo.trim()) {
      setError("Escribe un enunciado");
      return;
    }
    try {
      setCargando(true);
      setError(null);
      await onCrear(titulo, asigId);
      onCerrar();
    } catch (err) {
      console.error("Error al crear pregunta:", err);
      setError("No se pudo publicar. Revisa tu conexión o permisos.");
    } finally {
      setCargando(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center",
      onClick: onCerrar,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: (e) => e.stopPropagation(),
          className: "w-full rounded-t-2xl bg-lienzo p-5 sm:max-w-sm sm:rounded-2xl",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-[15px] font-semibold text-ink", children: "Nueva pregunta" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                autoFocus: true,
                value: titulo,
                onChange: (e) => {
                  setTitulo(e.target.value);
                  if (error) setError(null);
                },
                disabled: cargando,
                className: "mt-3 w-full rounded-lg border border-borde bg-white px-3 py-2.5 text-[14px] text-ink outline-none focus:border-ink/40 disabled:opacity-50"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: asignaturas.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setAsigId(a.id),
                style: fuenteApple,
                disabled: cargando,
                className: `whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${a.id === asigId ? "border-ink bg-ink text-white" : "border-borde bg-white text-ink hover:border-ink/30"}`,
                children: a.nombre
              },
              a.id
            )) }),
            error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[12px] text-rojo", children: error }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onCerrar,
                  disabled: cargando,
                  style: fuenteApple,
                  className: "flex-1 rounded-full border border-borde bg-white py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-ink/30 disabled:opacity-50",
                  children: "Cancelar"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: enviar,
                  disabled: cargando,
                  style: fuenteApple,
                  className: "flex-1 rounded-full bg-ink py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50",
                  children: cargando ? "Publicando..." : "Publicar"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function MarketPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const [mostrarArchivadas, setMostrarArchivadas] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [modalAbierto, setModalAbierto] = reactExports.useState(false);
  const haptic = useHaptic();
  const [rankingDisplay, setRankingDisplay] = reactExports.useState([]);
  const [actividadDisplay, setActividadDisplay] = reactExports.useState([]);
  const [preguntasDisplay, setPreguntasDisplay] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const intervalRanking = setInterval(() => {
      setRankingDisplay(mercado.leerRanking?.() || []);
    }, 3e3);
    const intervalActividad = setInterval(() => {
      setActividadDisplay(mercado.leerApuestas() || []);
    }, 6e4);
    const intervalPreguntas = setInterval(() => {
      setPreguntasDisplay(mercado.leerPreguntas({ estado: "todas" }));
    }, 5e3);
    setRankingDisplay(mercado.leerRanking?.() || []);
    setActividadDisplay(mercado.leerApuestas() || []);
    setPreguntasDisplay(mercado.leerPreguntas({ estado: "todas" }));
    return () => {
      clearInterval(intervalRanking);
      clearInterval(intervalActividad);
      clearInterval(intervalPreguntas);
    };
  }, [mercado]);
  const asignaturas = mercado.leerAsignaturas();
  const [asigActiva, setAsigActiva] = reactExports.useState("");
  const asigId = asigActiva || asignaturas[0]?.id || "";
  if (cargando) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-lienzo" });
  }
  if (!usuario) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex min-h-screen flex-col items-center justify-center bg-lienzo px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Casandra" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-xs text-center text-[14px] leading-relaxed text-sutil", children: "Mercado de predicción académico. Apuesta tokens a si una pregunta entra en el examen." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: async () => {
            haptic();
            setError(await entrarConGoogle());
          },
          style: fuenteApple,
          className: "mt-8 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85",
          children: "Entrar con Google"
        }
      ),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[12px] text-rojo", children: error })
    ] });
  }
  const abiertas = preguntasDisplay.filter((p) => p.asignaturaId === asigId && p.resultado === null && !p.archivada);
  const archivadas = preguntasDisplay.filter((p) => p.asignaturaId === asigId && p.resultado !== null || p.archivada);
  const preguntasConApuesta = preguntasDisplay.filter(
    (p) => p.resultado === null && !p.archivada && p.misSi + p.misNo > 0
  );
  const tieneApuestas = preguntasConApuesta.length > 0;
  const retirarTodo = () => {
    preguntasConApuesta.forEach((p) => mercado.retirar(p.id));
  };
  const intentarApostar = (id, lado) => {
    if (mercado.saldo < 1) {
      document.body.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-7px)" },
          { transform: "translateX(6px)" },
          { transform: "translateX(-4px)" },
          { transform: "translateX(0)" }
        ],
        { duration: 280, easing: "ease-in-out" }
      );
      return;
    }
    mercado.apostar(id, lado);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen bg-lienzo pb-28",
      style: fuenteApple,
      onClickCapture: (event) => {
        const target = event.target;
        if (target.closest("button, a, input, select, textarea")) haptic();
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-14 max-w-[520px] items-center justify-between px-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              style: fuenteApple,
              className: "text-[15px] font-semibold tracking-tight",
              children: "Adivina preguntas para ganar"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            usuario.esAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin", className: mono, children: "Admin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/profile", className: "text-ink transition-opacity hover:opacity-70", "aria-label": "Perfil", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "3" })
            ] }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-[520px] px-5 pt-14", children: [
          !mercado.pausado && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-10 flex flex-col items-center justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Moneda, { className: "h-8 w-8" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[64px] leading-none tabular-nums tracking-tight text-ink", children: mercado.saldo })
              ] }),
              tieneApuestas && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: retirarTodo,
                  disabled: mercado.pausado,
                  style: fuenteApple,
                  className: "absolute left-[calc(100%+20px)] w-32 rounded-lg border border-borde bg-white px-3 py-2.5 text-left text-[12px] font-medium leading-tight text-ink shadow-sm transition-colors hover:bg-black/5 disabled:opacity-40",
                  children: "Retirar todo y recuperar tokens."
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: fuenteApple, className: "mt-4 text-[13px] font-medium uppercase tracking-widest text-sutil", children: "Tokens disponibles" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid grid-cols-2 gap-6 px-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-[160px] overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: fuenteApple, className: "mb-3 text-[11px] font-semibold uppercase tracking-widest text-sutil shrink-0", children: "Ranking" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2.5 text-[13px] text-ink", style: fuenteApple, children: rankingDisplay.slice(0, 4).map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate pr-2 font-medium", children: r.usuario }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex shrink-0 items-center gap-1 font-mono tabular-nums", children: [
                  r.tokens,
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Moneda, { className: "h-2.5 w-2.5" })
                ] })
              ] }, i)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-[160px] overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: fuenteApple, className: "mb-3 text-[11px] font-semibold uppercase tracking-widest text-sutil shrink-0", children: "Actividad" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3 text-[12px] leading-snug text-sutil", style: fuenteApple, children: actividadDisplay.slice(0, 4).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-col gap-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-ink", children: a.usuario }),
                  " apostó",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 font-mono text-ink", children: [
                    a.tokens,
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Moneda, { className: "h-2 w-2" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] opacity-80", children: haceTexto(a.cuando) })
              ] }, a.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Asignaturas, { asignaturas, asigId, setAsigActiva }),
          abiertas.map((p, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            FilaPregunta,
            {
              pregunta: p,
              bloqueado: mercado.pausado,
              sinTokens: mercado.saldo < 1,
              ocultarBorde: index === abiertas.length - 1,
              onApostar: (lado) => intentarApostar(p.id, lado)
            },
            p.id
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setMostrarArchivadas(!mostrarArchivadas),
              style: fuenteApple,
              className: "flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-sutil transition-colors hover:text-ink",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Archivadas" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "svg",
                  {
                    className: `h-3.5 w-3.5 transition-transform duration-200 ${mostrarArchivadas ? "rotate-180" : ""}`,
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 2,
                    viewBox: "0 0 24 24",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 9l-7 7-7-7" })
                  }
                )
              ]
            }
          ) }),
          mostrarArchivadas && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex flex-col", children: archivadas.map((p, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            FilaPregunta,
            {
              pregunta: p,
              bloqueado: mercado.pausado,
              sinTokens: mercado.saldo < 1,
              ocultarBorde: index === abiertas.length - 1,
              onApostar: (lado) => intentarApostar(p.id, lado)
            },
            p.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setModalAbierto(true),
            "aria-label": "Nueva pregunta",
            className: "fixed bottom-6 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-[28px] leading-none text-white shadow-lg transition-opacity hover:opacity-90",
            children: "+"
          }
        ),
        modalAbierto && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ModalNuevaPregunta,
          {
            asignaturas,
            asigInicial: asigId,
            onCerrar: () => setModalAbierto(false),
            onCrear: async (t, id) => {
              await mercado.crearPregunta(t, id);
            }
          }
        )
      ]
    }
  );
}
const SplitComponent = MarketPage;
export {
  SplitComponent as component
};
