import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useSesion, a as useMercado } from "./useMercado-Dm6Iw5oZ.mjs";
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
function ProfilePage() {
  const { usuario, cargando, entrarConGoogle, salir } = useSesion();
  const mercado = useMercado(usuario);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-lienzo pb-28", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "fixed inset-x-0 top-0 z-20 border-b border-linea bg-lienzo/95 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-14 max-w-[520px] items-center justify-between px-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-[15px] font-semibold tracking-tight text-ink", children: "← Mercado" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Moneda, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[13px] tabular-nums", children: mercado.saldo })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-[520px] px-5 pt-14", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `${mono} text-sutil`, children: "Tu usuario" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mt-4 block text-[12px] text-sutil", children: "Nombre visible" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          value: mercado.perfil.nombre,
          onChange: (e) => mercado.guardarNombre(e.target.value),
          disabled: mercado.perfil.usaHash,
          placeholder: usuario.nombre,
          className: "mt-1 w-full border-b border-borde bg-transparent pb-2 text-[15px] outline-none placeholder:text-sutil focus:border-ink disabled:opacity-40"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => mercado.usarHash(!mercado.perfil.usaHash),
          className: "mt-5 flex w-full items-center justify-between rounded-lg border border-borde bg-white px-3.5 py-3 text-left text-[13px]",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Prefiero usuario hash" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `h-4 w-4 rounded-full border ${mercado.perfil.usaHash ? "border-ink bg-ink" : "border-borde"}`
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 font-mono text-[13px] text-sutil", children: [
        "Te ven como ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-ink", children: mercado.miNombre })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => salir(), className: `mt-8 ${mono} text-sutil hover:text-ink`, children: "cerrar sesión" })
    ] }) })
  ] });
}
const SplitComponent = ProfilePage;
export {
  SplitComponent as component
};
