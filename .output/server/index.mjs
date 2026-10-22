globalThis.__nitro_main__ = import.meta.url;
import { b as NodeResponse, s as serve } from "./_libs/srvx.mjs";
import { d as defineHandler, H as HTTPError, t as toEventHandler, a as defineLazyEventHandler, b as H3Core } from "./_libs/h3.mjs";
import { d as decodePath, w as withLeadingSlash, a as withoutTrailingSlash, j as joinURL } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "./_libs/rou3.mjs";
function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const headers = ((m) => function headersRouteRule(event) {
  for (const [key2, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key2, value);
  }
});
const assets = {
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"19-2NTlN/votVlrfMtAaltZ799LfR0"',
    "mtime": "2026-10-20T07:31:09.867Z",
    "size": 25,
    "path": "../public/robots.txt"
  },
  "/assets/PantallaLogin-DX9D5gPx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d18-BanBRwSyynDtfKuoDFhNHH90Ck4"',
    "mtime": "2026-10-20T07:31:09.587Z",
    "size": 3352,
    "path": "../public/assets/PantallaLogin-DX9D5gPx.js"
  },
  "/assets/PantallaSeleccionClase-BwIWhvj5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"515-Fvhp0xuWP+zl/+h48trmQQ9pNyc"',
    "mtime": "2026-10-20T07:31:09.587Z",
    "size": 1301,
    "path": "../public/assets/PantallaSeleccionClase-BwIWhvj5.js"
  },
  "/assets/admin-jGbNygdr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ddd-YPRyRmOmM9dqg+IMelzcmhvlvzY"',
    "mtime": "2026-10-20T07:31:09.587Z",
    "size": 19933,
    "path": "../public/assets/admin-jGbNygdr.js"
  },
  "/assets/privacidad-BSEfl4dw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bb7-yEj727Uy3BcL3sZe9jrbBXIV8r0"',
    "mtime": "2026-10-20T07:31:09.587Z",
    "size": 2999,
    "path": "../public/assets/privacidad-BSEfl4dw.js"
  },
  "/assets/copyflylogo-_o-9hkMH.png": {
    "type": "image/png",
    "etag": '"e2b7-tEB0hjG/V+CQLbgvQ6L9WjYFqcU"',
    "mtime": "2026-10-20T07:31:09.587Z",
    "size": 58039,
    "path": "../public/assets/copyflylogo-_o-9hkMH.png"
  },
  "/assets/index-BKvBu_08.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a60-R5uvegfBLph6/ln4B2cYh9UHbZ4"',
    "mtime": "2026-10-20T07:31:09.587Z",
    "size": 31328,
    "path": "../public/assets/index-BKvBu_08.js"
  },
  "/assets/mod-DUWZoAbM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a28-ng8BWvCdcnICnvC/ZtAncsOc+xw"',
    "mtime": "2026-10-20T07:31:09.587Z",
    "size": 6696,
    "path": "../public/assets/mod-DUWZoAbM.js"
  },
  "/assets/ranking-Bg7LftTo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a49-M3WyR73UuoQYKmx/XRGyhZb2ELw"',
    "mtime": "2026-10-20T07:31:09.587Z",
    "size": 6729,
    "path": "../public/assets/ranking-Bg7LftTo.js"
  },
  "/assets/profile-CJrb-9Hu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a5-ghkBlc8dbVUWJV4Rnqnqwt1fVCg"',
    "mtime": "2026-10-20T07:31:09.587Z",
    "size": 6565,
    "path": "../public/assets/profile-CJrb-9Hu.js"
  },
  "/apple-touch-icon.png": {
    "type": "image/png",
    "etag": '"46ced-dg2HD11veXqsvZv+7V2H2oJYmPs"',
    "mtime": "2026-10-20T07:31:09.867Z",
    "size": 290029,
    "path": "../public/apple-touch-icon.png"
  },
  "/assets/resueltas-vkmTQWIl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"115b-t8w5aU4UL54fhL+9Dp8ZBtqkPBA"',
    "mtime": "2026-10-20T07:31:09.587Z",
    "size": 4443,
    "path": "../public/assets/resueltas-vkmTQWIl.js"
  },
  "/assets/useMercado-DLc772Uz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3c3d-C3z9akzIlPBNiIn2toj7Izk6FYQ"',
    "mtime": "2026-10-20T07:31:09.587Z",
    "size": 15421,
    "path": "../public/assets/useMercado-DLc772Uz.js"
  },
  "/assets/styles-DmC7RQk4.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"179ce-W9XEioqmlouH1RB6rvcrb3BUz9Y"',
    "mtime": "2026-10-20T07:31:09.587Z",
    "size": 96718,
    "path": "../public/assets/styles-DmC7RQk4.css"
  },
  "/assets/index-xXXScVmC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"89d90-ggHAPfOYTua26vvTSlvlX+P8JQ0"',
    "mtime": "2026-10-20T07:31:09.587Z",
    "size": 564624,
    "path": "../public/assets/index-xXXScVmC.js"
  }
};
function readAsset(id) {
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
  return promises.readFile(resolve(serverDir, assets[id].path));
}
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
function getAsset(id) {
  return assets[id];
}
const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = {
  gzip: ".gz",
  br: ".br",
  zstd: ".zst"
};
const _7bqxJt = defineHandler((event) => {
  if (event.req.method && !METHODS.has(event.req.method)) {
    return;
  }
  let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
  let asset;
  const encodingHeader = event.req.headers.get("accept-encoding") || "";
  const encodings = [...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      event.res.headers.delete("Cache-Control");
      throw new HTTPError({ status: 404 });
    }
    return;
  }
  if (encodings.length > 1) {
    event.res.headers.append("Vary", "Accept-Encoding");
  }
  const ifNotMatch = event.req.headers.get("if-none-match") === asset.etag;
  if (ifNotMatch) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  const ifModifiedSinceH = event.req.headers.get("if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  if (asset.type) {
    event.res.headers.set("Content-Type", asset.type);
  }
  if (asset.etag && !event.res.headers.has("ETag")) {
    event.res.headers.set("ETag", asset.etag);
  }
  if (asset.mtime && !event.res.headers.has("Last-Modified")) {
    event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !event.res.headers.has("Content-Encoding")) {
    event.res.headers.set("Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !event.res.headers.has("Content-Length")) {
    event.res.headers.set("Content-Length", asset.size.toString());
  }
  return readAsset(id);
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_rTkxP7 = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_rTkxP7 };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_7bqxJt)
].filter(Boolean);
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
function createNitroApp() {
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({ error, context: errorCtx });
      }
    }
  };
  const h3App = createH3App({
    onError(error, event) {
      return errorHandler(error, event);
    }
  });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  return {
    fetch: appHandler,
    h3: h3App,
    hooks: void 0,
    captureError
  };
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~middleware"].push(...globalMiddleware);
  h3App["~getMiddleware"] = (event, route) => {
    const pathname = event.url.pathname;
    const method = event.req.method;
    const middleware = [];
    const routeRules = getRouteRules(method, pathname);
    event.context.routeRules = routeRules?.routeRules;
    if (routeRules?.routeRuleMiddleware.length) {
      middleware.push(...routeRules.routeRuleMiddleware);
    }
    middleware.push(...h3App["~middleware"]);
    if (route?.data?.middleware?.length) {
      middleware.push(...route.data.middleware);
    }
    return middleware;
  };
  return h3App;
}
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
  process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
  process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
const tracingSrvxPlugins = [];
const _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
const port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
const host = process.env.NITRO_HOST || process.env.HOST;
const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
serve({
  port,
  hostname: host,
  tls: cert && key ? {
    cert,
    key
  } : void 0,
  fetch: nitroApp.fetch,
  plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
const nodeServer = {};
export {
  nodeServer as default
};
