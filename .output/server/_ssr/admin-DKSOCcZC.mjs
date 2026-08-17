import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useSesion, a as useMercado, p as probabilidad, v as volumen, n as nombreVisible } from "./useMercado-Dm6Iw5oZ.mjs";
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
const mono = "font-mono text-[11px] uppercase tracking-widest";
function Moneda({ className = "" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-3.5 w-3.5 rounded-full bg-moneda ${className}` });
}
function AdminPage() {
  const { usuario, cargando, entrarConGoogle } = useSesion();
  const mercado = useMercado(usuario);
  const [vistaAdmin, setVistaAdmin] = reactExports.useState("preguntas");
  const [nuevaAsig, setNuevaAsig] = reactExports.useState("");
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
          onClick: entrarConGoogle,
          className: "mt-8 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85",
          children: "Entrar con Google"
        }
      )
    ] });
  }
  if (!usuario.esAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex min-h-screen flex-col items-center justify-center bg-lienzo px-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Sin permisos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-xs text-[14px] leading-relaxed text-sutil", children: "Esta sección es solo para administradores." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "mt-8 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85",
          children: "Volver al mercado"
        }
      )
    ] });
  }
  const asignaturas = mercado.leerAsignaturas();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-lienzo pb-28", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-14 max-w-[520px] items-center justify-between px-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-[15px] font-semibold tracking-tight text-ink", children: "← Mercado" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Moneda, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[13px] tabular-nums", children: mercado.saldo })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-[520px] px-5 pt-14", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 border-b border-linea pb-2.5", children: ["preguntas", "archivado", "usuarios", "asignaturas"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setVistaAdmin(v),
          className: `${mono} ${vistaAdmin === v ? "text-ink" : "text-sutil"}`,
          children: v
        },
        v
      )) }),
      vistaAdmin === "preguntas" && mercado.leerPreguntas({ estado: "todas" }).filter((p) => !p.archivada).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-linea py-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-[14px] leading-snug", children: p.titulo }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[18px] tabular-nums text-sutil", children: probabilidad(p) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 font-mono text-[11px] text-sutil", children: [
          "vol ",
          volumen(p),
          " · ",
          p.resultado === null ? "abierta" : p.resultado ? "entró" : "no entró"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: p.asignaturaId,
            onChange: (e) => mercado.moverPregunta(p.id, e.target.value),
            className: "mt-2 w-full rounded-lg border border-borde bg-white px-2 py-1.5 text-[12px]",
            children: asignaturas.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: a.id, children: a.nombre }, a.id))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap gap-2", children: [
          p.resultado === null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => mercado.resolver(p.id, true),
                className: "flex-1 rounded-lg border border-borde bg-white py-2 text-[13px] hover:border-verde hover:text-verde",
                children: "Entró"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => mercado.resolver(p.id, false),
                className: "flex-1 rounded-lg border border-borde bg-white py-2 text-[13px] hover:border-rojo hover:text-rojo",
                children: "No entró"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => mercado.desresolver(p.id),
                className: "flex-1 rounded-lg border border-borde bg-white py-2 text-[13px] hover:border-ink",
                children: "Desresolver"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => mercado.archivar(p.id, true),
                className: "flex-1 rounded-lg border border-borde bg-white py-2 text-[13px] hover:border-ink",
                children: "Archivar"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                const t = window.prompt("Nuevo título", p.titulo);
                if (t) mercado.editarTitulo(p.id, t);
              },
              className: "rounded-lg border border-borde bg-white px-3 py-2 text-[13px]",
              children: "Editar"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => mercado.eliminarPregunta(p.id),
              className: "rounded-lg border border-borde bg-white px-3 py-2 text-[13px] text-rojo",
              children: "Eliminar"
            }
          )
        ] })
      ] }, p.id)),
      vistaAdmin === "archivado" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        mercado.leerPreguntas({ estado: "archivadas" }).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-linea py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-[14px] leading-snug text-sutil", children: p.titulo }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => mercado.archivar(p.id, false),
                className: "flex-1 rounded-lg border border-borde bg-white py-2 text-[13px]",
                children: "Desarchivar"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => mercado.desresolver(p.id),
                className: "flex-1 rounded-lg border border-borde bg-white py-2 text-[13px]",
                children: "Desresolver"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => mercado.eliminarPregunta(p.id),
                className: "rounded-lg border border-borde bg-white px-3 py-2 text-[13px] text-rojo",
                children: "Eliminar"
              }
            )
          ] })
        ] }, p.id)),
        mercado.leerPreguntas({ estado: "archivadas" }).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-5 ${mono} text-sutil`, children: "archivo vacío" })
      ] }),
      vistaAdmin === "usuarios" && mercado.leerAlumnos().map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 border-b border-linea py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-[14px]", children: nombreVisible(a) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[11px] text-sutil", children: [
            a.saldo,
            " tokens ",
            a.pausado && "· pausado"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => mercado.darTokens(a.id, -1),
            className: "h-8 w-8 rounded-lg border border-borde bg-white text-[14px]",
            children: "−"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => mercado.darTokens(a.id, 1),
            className: "h-8 w-8 rounded-lg border border-borde bg-white text-[14px]",
            children: "+"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => mercado.pausarAlumno(a.id, !a.pausado),
            className: `rounded-lg border px-2.5 py-1.5 text-[12px] ${a.pausado ? "border-ink bg-ink text-white" : "border-borde bg-white"}`,
            children: a.pausado ? "Reanudar" : "Pausar"
          }
        )
      ] }, a.id)),
      vistaAdmin === "asignaturas" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        asignaturas.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-linea py-3.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: a.nombre,
              onChange: (e) => mercado.renombrarAsignatura(a.id, e.target.value),
              className: "min-w-0 flex-1 bg-transparent text-[14px] outline-none"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => mercado.eliminarAsignatura(a.id),
              className: "rounded-lg border border-borde bg-white px-2.5 py-1.5 text-[12px] text-rojo",
              children: "Eliminar"
            }
          )
        ] }, a.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            onSubmit: (e) => {
              e.preventDefault();
              if (mercado.crearAsignatura(nuevaAsig)) setNuevaAsig("");
            },
            className: "mt-4 flex gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: nuevaAsig,
                  onChange: (e) => setNuevaAsig(e.target.value),
                  placeholder: "Nueva asignatura",
                  className: "min-w-0 flex-1 border-b border-borde bg-transparent pb-2 text-[14px] outline-none placeholder:text-sutil focus:border-ink"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "rounded-lg bg-ink px-3 py-1.5 text-[13px] text-white", children: "Añadir" })
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
const SplitComponent = AdminPage;
export {
  SplitComponent as component
};
