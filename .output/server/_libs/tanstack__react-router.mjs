import { r as reactExports, j as jsxRuntimeExports, R as React } from "./react.mjs";
import { i as invariant, d as deepEqual, g as getUrlScheme, a as isDangerousProtocol, f as functionalUpdate, r as removeTrailingSlash, B as BaseRootRoute, b as BaseRoute, c as isModuleNotFoundError, e as isNotFound, h as getScrollRestorationScriptForRouter, j as rootRouteId, k as createNonReactiveReadonlyStore, l as createNonReactiveMutableStore, R as RouterCore, m as hasKeys, _ as _getAssetMatches, n as escapeHtml, o as getAssetCrossOrigin, p as getScriptPreloadAttrs, q as appendUniqueUserTags, s as resolveManifestCssLink, t as composeSsrBodyScripts, u as getSsrBodyScriptParts, v as transformReadableStreamWithRouter, w as waitForReason, x as createSsrStreamResponse, y as getSsrStatus } from "./tanstack__router-core.mjs";
import { R as ReactDOMServer } from "./react-dom.mjs";
import { PassThrough, Readable } from "node:stream";
import { i as isbot } from "./isbot.mjs";
var reactUse = reactExports.use;
var useLayoutEffect = reactExports.useEffect;
var CatchBoundary = class extends reactExports.Component {
  constructor(..._args) {
    super(..._args);
    this.state = { error: 0 };
    this.reset = () => {
      this.setState({ error: 0 });
    };
  }
  static getDerivedStateFromProps(props, state) {
    const resetKey = props.getResetKey();
    if (state.error && state.resetKey !== resetKey) return {
      resetKey,
      error: 0
    };
    return { resetKey };
  }
  static getDerivedStateFromError(error) {
    return { error: [error] };
  }
  componentDidCatch(error, errorInfo) {
    this.props.onCatch?.(error, errorInfo);
  }
  render() {
    const error = this.state.error;
    if (error) {
      const element = reactExports.createElement(this.props.errorComponent ?? ErrorComponent, {
        error: error[0],
        reset: this.reset
      });
      return element;
    }
    return this.props.children;
  }
};
function ErrorComponent({ error }) {
  const [show, setShow] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    style: {
      padding: ".5rem",
      maxWidth: "100%"
    },
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: ".5rem"
        },
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("strong", {
          style: { fontSize: "1rem" },
          children: "Something went wrong!"
        }), /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
          style: {
            appearance: "none",
            fontSize: ".6em",
            border: "1px solid currentColor",
            padding: ".1rem .2rem",
            fontWeight: "bold",
            borderRadius: ".25rem"
          },
          onClick: () => setShow((d) => !d),
          children: show ? "Hide Error" : "Show Error"
        })]
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: ".25rem" } }),
      show ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("pre", {
        style: {
          fontSize: ".7em",
          border: "1px solid red",
          borderRadius: ".25rem",
          padding: ".3rem",
          color: "red",
          overflow: "auto"
        },
        children: error?.message ? /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: error.message }) : null
      }) }) : null
    ]
  });
}
var getSnapshot = () => true;
var getServerSnapshot = () => false;
function ClientOnly({ children, fallback = null }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(React.Fragment, { children: useHydrated() ? children : fallback });
}
function useHydrated(enabled = true) {
  return React.useSyncExternalStore(subscribe, getSnapshot, enabled ? getServerSnapshot : getSnapshot);
}
function subscribe() {
  return () => {
  };
}
var routerContext = reactExports.createContext(null);
function useRouter(opts) {
  const value = reactExports.useContext(routerContext);
  return value;
}
var matchContext = reactExports.createContext(void 0);
var dummyMatchContext = reactExports.createContext(void 0);
function useMatch(opts) {
  const router = useRouter();
  const nearestRouteId = reactExports.useContext(opts.from ? dummyMatchContext : matchContext);
  const routeId = opts.from ?? nearestRouteId;
  const matchStore = router.stores.getMatchStore(routeId);
  {
    const match = matchStore.get();
    if (!match) {
      if (opts.shouldThrow ?? true) {
        invariant();
      }
      return;
    }
    return opts.select ? opts.select(match) : match;
  }
}
function useLoaderData(opts) {
  return useMatch({
    from: opts.from,
    strict: opts.strict,
    structuralSharing: opts.structuralSharing,
    select: (match) => {
      return opts.select ? opts.select(match.loaderData) : match.loaderData;
    }
  });
}
function useLoaderDeps(opts) {
  const { select, ...rest } = opts;
  return useMatch({
    ...rest,
    select: (match) => {
      return select ? select(match.loaderDeps) : match.loaderDeps;
    }
  });
}
function useParams(opts) {
  return useMatch({
    from: opts.from,
    shouldThrow: opts.shouldThrow,
    structuralSharing: opts.structuralSharing,
    strict: opts.strict,
    select: (match) => {
      const params = opts.strict === false ? match.params : match._strictParams;
      return opts.select ? opts.select(params) : params;
    }
  });
}
function useSearch(opts) {
  return useMatch({
    from: opts.from,
    strict: opts.strict,
    shouldThrow: opts.shouldThrow,
    structuralSharing: opts.structuralSharing,
    select: (match) => {
      return opts.select ? opts.select(match.search) : match.search;
    }
  });
}
function useNavigate(_defaultOpts) {
  const router = useRouter();
  return reactExports.useCallback((options) => {
    return router.navigate({
      ...options,
      from: options.from ?? _defaultOpts?.from
    });
  }, [_defaultOpts?.from, router]);
}
function useRouteContext(opts) {
  return useMatch({
    ...opts,
    select: (match) => opts.select ? opts.select(match.context) : match.context
  });
}
function resolveExternalLink(to, protocolAllowlist) {
  const scheme = typeof to === "string" && getUrlScheme(to);
  if (!scheme) return;
  if (!protocolAllowlist.has(scheme)) {
    return null;
  }
  return to;
}
function resolveIsActive(location, next, activeOptions, basepath, isHydrated) {
  const currentPath = removeTrailingSlash(location.pathname, basepath);
  const nextPath = removeTrailingSlash(next.pathname, basepath);
  if (activeOptions?.exact ? currentPath !== nextPath : !(currentPath.startsWith(nextPath) && (currentPath.length === nextPath.length || currentPath[nextPath.length] === "/"))) return false;
  if (activeOptions?.includeSearch ?? true) {
    if (!deepEqual(location.search, next.search, !activeOptions?.exact, activeOptions?.explicitUndefined)) return false;
  }
  if (activeOptions?.includeHash) return isHydrated && location.hash === next.hash;
  return true;
}
function useLinkProps(options, forwardedRef, host) {
  const router = useRouter();
  return getServerLinkProps(router, options, forwardedRef, host);
}
var STATIC_EMPTY_OBJECT = {};
var STATIC_ACTIVE_OBJECT = { className: "active" };
var ROUTER_OPTION_KEYS = /* @__PURE__ */ new Set([
  "to",
  "params",
  "search",
  "hash",
  "state",
  "mask",
  "from",
  "unsafeRelative",
  "_fromLocation",
  "reloadDocument",
  "preload",
  "preloadDelay",
  "preloadIntentProximity",
  "hashScrollIntoView",
  "replace",
  "startTransition",
  "resetScroll",
  "viewTransition",
  "ignoreBlocker",
  "activeProps",
  "inactiveProps",
  "activeOptions",
  "_asChild"
]);
function collectElementProps(options, host) {
  const props = {};
  for (const key in options) {
    if (ROUTER_OPTION_KEYS.has(key) || key === "type" && host !== void 0 || key === "disabled" && host === "a") continue;
    props[key] = options[key];
  }
  return props;
}
function applyLinkState(props, options, isActive, href, linkDisabled, host) {
  const { activeProps, inactiveProps, className, style, target } = options;
  const stateProps = functionalUpdate(isActive ? activeProps : inactiveProps, {}) ?? (isActive ? STATIC_ACTIVE_OBJECT : STATIC_EMPTY_OBJECT);
  Object.assign(props, stateProps);
  props.href = href;
  if (host !== "a") props.disabled = linkDisabled;
  props.target = target;
  const stateStyle = stateProps.style;
  if (style || stateStyle) props.style = style && stateStyle ? {
    ...style,
    ...stateStyle
  } : style || stateStyle;
  const stateClassName = stateProps.className;
  if (className || stateClassName) props.className = className ? stateClassName ? `${className} ${stateClassName}` : className : stateClassName;
  if (linkDisabled) {
    props.role = "link";
    props["aria-disabled"] = true;
  }
  if (isActive) {
    props["data-status"] = "active";
    props["aria-current"] = "page";
  }
  return props;
}
function getServerLinkProps(router, options, forwardedRef, host) {
  const { to, disabled, activeOptions } = options;
  const directExternalLink = resolveExternalLink(to, router.protocolAllowlist);
  const next = directExternalLink === void 0 ? router.buildLocation(options) : void 0;
  const hrefOption = next ? getHrefOption(next, router, disabled) : directExternalLink ?? void 0;
  const linkDisabled = disabled || !hrefOption;
  const externalLink = directExternalLink ?? (hrefOption && getUrlScheme(hrefOption) ? hrefOption : void 0);
  const props = collectElementProps(options, host);
  props.ref = forwardedRef;
  if (externalLink) {
    props.href = externalLink;
    return props;
  }
  return applyLinkState(props, options, !!next && !(!disabled && !hrefOption) && resolveIsActive(router.stores.location.get(), next, activeOptions, router.basepath, false), hrefOption, linkDisabled, host);
}
function getHrefOption(next, router, disabled) {
  if (disabled) return;
  const location = next.maskedLocation ?? next;
  const href = location.external ? location.publicHref : router.history.createHref(location.publicHref) || "/";
  if ((location.external || href !== location.publicHref) && isDangerousProtocol(href, router.protocolAllowlist)) {
    return;
  }
  return href;
}
var Link = reactExports.memo(reactExports.forwardRef((props, ref) => {
  const host = props._asChild || "a";
  const linkProps = useLinkProps(props, ref, host);
  const children = typeof props.children === "function" ? props.children({ isActive: linkProps["data-status"] === "active" }) : props.children;
  return reactExports.createElement(host, linkProps, children);
}), areLinkPropsEqual);
function areLinkPropsEqual(prev, next) {
  let extraKeys = 0;
  for (const key in next) {
    extraKeys++;
    if (prev[key] === next[key]) continue;
    if (!ROUTER_OPTION_KEYS.has(key) || !deepEqual(prev[key], next[key], false, true)) return false;
  }
  for (const _key in prev) extraKeys--;
  return extraKeys === 0;
}
var Route = class extends BaseRoute {
  /**
  * @deprecated Use the `createRoute` function instead.
  */
  constructor(options) {
    super(options);
    this.useMatch = (opts) => {
      return useMatch({
        ...opts,
        from: this.id
      });
    };
    this.useRouteContext = (opts) => {
      return useRouteContext({
        ...opts,
        from: this.id
      });
    };
    this.useSearch = (opts) => {
      return useSearch({
        ...opts,
        from: this.id
      });
    };
    this.useParams = (opts) => {
      return useParams({
        ...opts,
        from: this.id
      });
    };
    this.useLoaderDeps = (opts) => {
      return useLoaderDeps({
        ...opts,
        from: this.id
      });
    };
    this.useLoaderData = (opts) => {
      return useLoaderData({
        ...opts,
        from: this.id
      });
    };
    this.useNavigate = () => {
      return useNavigate({ from: this.fullPath });
    };
    this.Link = React.forwardRef((props, ref) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
        ref,
        from: this.fullPath,
        ...props
      });
    });
  }
};
function createRoute(options) {
  return new Route(options);
}
function createRootRouteWithContext() {
  return (options) => {
    return createRootRoute(options);
  };
}
var RootRoute = class extends BaseRootRoute {
  /**
  * @deprecated `RootRoute` is now an internal implementation detail. Use `createRootRoute()` instead.
  */
  constructor(options) {
    super(options);
    this.useMatch = (opts) => {
      return useMatch({
        ...opts,
        from: this.id
      });
    };
    this.useRouteContext = (opts) => {
      return useRouteContext({
        ...opts,
        from: this.id
      });
    };
    this.useSearch = (opts) => {
      return useSearch({
        ...opts,
        from: this.id
      });
    };
    this.useParams = (opts) => {
      return useParams({
        ...opts,
        from: this.id
      });
    };
    this.useLoaderDeps = (opts) => {
      return useLoaderDeps({
        ...opts,
        from: this.id
      });
    };
    this.useLoaderData = (opts) => {
      return useLoaderData({
        ...opts,
        from: this.id
      });
    };
    this.useNavigate = () => {
      return useNavigate({ from: this.fullPath });
    };
    this.Link = React.forwardRef((props, ref) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
        ref,
        from: this.fullPath,
        ...props
      });
    });
  }
};
function createRootRoute(options) {
  return new RootRoute(options);
}
function createFileRoute(path) {
  return (options) => {
    const route = createRoute(options);
    route.isRoot = false;
    return route;
  };
}
function lazyRouteComponent(importer, exportName) {
  let loadPromise;
  let comp;
  let error;
  const load = () => {
    if (!loadPromise) {
      error = void 0;
      loadPromise = importer().then((res) => {
        comp = res[exportName];
      }).catch((err) => {
        loadPromise = void 0;
        error = err;
      });
    }
    return loadPromise;
  };
  const lazyComp = function Lazy(props) {
    if (error) {
      if (isModuleNotFoundError(error) && false) ;
      throw error;
    }
    if (!comp) if (reactUse) reactUse(load());
    else throw load();
    return reactExports.createElement(comp, props);
  };
  lazyComp.preload = load;
  return lazyComp;
}
function CatchNotFound(props) {
  const router = useRouter();
  {
    const resetKey = `not-found-${router.stores.location.get().pathname}-${router.stores.status.get()}`;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CatchBoundary, {
      getResetKey: () => resetKey,
      onCatch: (error, errorInfo) => {
        if (isNotFound(error)) props.onCatch?.(error, errorInfo);
        else throw error;
      },
      errorComponent: ({ error }) => {
        if (isNotFound(error)) return props.fallback?.(error);
        else throw error;
      },
      children: props.children
    });
  }
}
function DefaultGlobalNotFound() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Not Found" });
}
function ScriptOnce({ children }) {
  const router = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("script", {
    nonce: router.options.ssr?.nonce,
    dangerouslySetInnerHTML: { __html: children + ";document.currentScript.remove()" }
  });
}
function renderRouteNotFound(router, route, data) {
  if (!route.options.notFoundComponent) {
    if (router.options.defaultNotFoundComponent) {
      const notFoundElement2 = /* @__PURE__ */ jsxRuntimeExports.jsx(router.options.defaultNotFoundComponent, { ...data });
      return notFoundElement2;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DefaultGlobalNotFound, {});
  }
  const notFoundElement = /* @__PURE__ */ jsxRuntimeExports.jsx(route.options.notFoundComponent, { ...data });
  return notFoundElement;
}
function ScrollRestoration() {
  const script = getScrollRestorationScriptForRouter(useRouter());
  if (!script) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScriptOnce, { children: script });
}
function renderPending(router, route) {
  const PendingComponent = route?.options.pendingComponent ?? router.options.defaultPendingComponent;
  if (!PendingComponent) return null;
  const pendingElement = /* @__PURE__ */ jsxRuntimeExports.jsx(PendingComponent, {});
  return pendingElement;
}
var canWrapInSuspense = (router, route, ssr) => !route.isRoot || route.options.shellComponent || route.options.wrapInSuspense || ssr === false || ssr === "data-only" || false;
var Match = reactExports.memo(function MatchImpl({ routeId }) {
  const router = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MatchView, {
    router,
    match: router.stores.byRoute.get(routeId).get()
  });
});
function MatchView({ router, match }) {
  const route = router.routesById[match.routeId];
  const pendingElement = renderPending(router, route);
  const routeErrorComponent = route.options.errorComponent ?? router.options.defaultErrorComponent;
  const routeOnCatch = route.options.onCatch ?? router.options.defaultOnCatch;
  const routeNotFoundComponent = route.isRoot ? route.options.notFoundComponent ?? router.options.notFoundRoute?.options.component : route.options.notFoundComponent;
  const resolvedNoSsr = match.ssr === false || match.ssr === "data-only";
  const wrapInSuspense = canWrapInSuspense(router, route, match.ssr) && (route.options.wrapInSuspense ?? pendingElement ?? (route.options.errorComponent?.preload || resolvedNoSsr));
  let content = /* @__PURE__ */ jsxRuntimeExports.jsx(MatchInner, { match });
  if (resolvedNoSsr) content = /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, {
    fallback: pendingElement,
    children: content
  });
  if (routeNotFoundComponent) content = /* @__PURE__ */ jsxRuntimeExports.jsx(CatchNotFound, {
    fallback: (error) => {
      error.routeId ??= match.routeId;
      if (error.routeId !== match.routeId) throw error;
      const notFoundElement = reactExports.createElement(routeNotFoundComponent, error);
      return notFoundElement;
    },
    children: content
  });
  if (routeErrorComponent) content = /* @__PURE__ */ jsxRuntimeExports.jsx(CatchBoundary, {
    getResetKey: () => match,
    errorComponent: routeErrorComponent,
    onCatch: (error, errorInfo) => {
      if (isNotFound(error)) {
        error.routeId ??= match.routeId;
        throw error;
      }
      routeOnCatch?.(error, errorInfo);
    },
    children: content
  });
  if (wrapInSuspense) content = /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, {
    fallback: pendingElement,
    children: content
  });
  const scrollRestoration = route.parentRoute?.id === rootRouteId && router.options.scrollRestoration ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollRestoration, {}) : null;
  const ShellComponent = route.isRoot ? route.options.shellComponent : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(matchContext.Provider, {
    value: match.routeId,
    children: ShellComponent ? /* @__PURE__ */ jsxRuntimeExports.jsxs(ShellComponent, { children: [content, scrollRestoration] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [content, scrollRestoration] })
  });
}
var MatchInner = reactExports.memo(function MatchInnerImpl({ match }) {
  const router = useRouter();
  const routeId = match.routeId;
  const route = router.routesById[routeId];
  const key = reactExports.useMemo(() => {
    const remountDeps = (route.options.remountDeps ?? router.options.defaultRemountDeps)?.({
      routeId,
      loaderDeps: match.loaderDeps,
      params: match._strictParams,
      search: match._strictSearch
    });
    return remountDeps ? JSON.stringify(remountDeps) : void 0;
  }, [
    routeId,
    match.loaderDeps,
    match._strictParams,
    match._strictSearch,
    route.options.remountDeps,
    router.options.defaultRemountDeps
  ]);
  const out = reactExports.useMemo(() => {
    const Comp = route.options.component ?? router.options.defaultComponent;
    return Comp ? /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, {}, key) : /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
  }, [
    key,
    route.options.component,
    router.options.defaultComponent
  ]);
  if (match.status === "pending") {
    if (router.ssr && !canWrapInSuspense(router, route, match.ssr)) return out;
    if (router._tx) throw router._tx[5];
    return renderPending(router, route);
  }
  if (match.status === "notFound") return renderRouteNotFound(router, route, match.error);
  if (match.status === "error") {
    {
      const errorElement = /* @__PURE__ */ jsxRuntimeExports.jsx((route.options.errorComponent ?? router.options.defaultErrorComponent) || ErrorComponent, {
        error: match.error,
        reset: void 0,
        info: { componentStack: "" }
      });
      return errorElement;
    }
  }
  return out;
});
var Outlet = reactExports.memo(function OutletImpl() {
  const router = useRouter();
  const routeId = reactExports.useContext(matchContext);
  let parentGlobalNotFound;
  let parentNotFoundError;
  let childRouteId;
  {
    const matches = router.stores.matches.get();
    const parentIndex = matches.findIndex((match) => match.routeId === routeId);
    const parentMatch = matches[parentIndex];
    parentGlobalNotFound = !!parentMatch._notFound;
    parentNotFoundError = parentMatch.error;
    childRouteId = matches[parentIndex + 1]?.routeId;
  }
  if (parentGlobalNotFound) return renderRouteNotFound(router, router.routesById[routeId], parentNotFoundError);
  if (!childRouteId) return null;
  const nextMatch = /* @__PURE__ */ jsxRuntimeExports.jsx(Match, { routeId: childRouteId });
  if (routeId === rootRouteId) return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, {
    fallback: renderPending(router),
    children: nextMatch
  });
  return nextMatch;
});
function settleOwner(owner, rendered) {
  const settle = owner[1];
  owner.length = 0;
  settle?.(rendered);
}
function Matches() {
  const router = useRouter();
  const rootRoute = router.routesById[rootRouteId];
  renderPending(router, rootRoute);
  const inner = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [false, /* @__PURE__ */ jsxRuntimeExports.jsx(MatchesInner, {})] });
  return router.options.InnerWrap ? /* @__PURE__ */ jsxRuntimeExports.jsx(router.options.InnerWrap, { children: inner }) : inner;
}
function MatchesInner() {
  const router = useRouter();
  const acknowledgement = router._rendered;
  const matches = router.stores.matches.get();
  const match = matches[0];
  const routeId = match?.routeId;
  useLayoutEffect(() => {
    if (acknowledgement[0] === matches) settleOwner(acknowledgement, true);
  }, [acknowledgement, matches]);
  const matchComponent = routeId ? /* @__PURE__ */ jsxRuntimeExports.jsx(Match, { routeId }) : null;
  return router.options.disableGlobalCatchBoundary ? matchComponent : /* @__PURE__ */ jsxRuntimeExports.jsx(CatchBoundary, {
    getResetKey: () => match,
    onCatch: void 0,
    children: matchComponent
  });
}
var getStoreFactory = (opts) => {
  return {
    createMutableStore: createNonReactiveMutableStore,
    createReadonlyStore: createNonReactiveReadonlyStore,
    batch: (fn) => fn()
  };
};
var createRouter = (options) => {
  return new Router(options);
};
var Router = class extends RouterCore {
  constructor(options) {
    super(options, getStoreFactory);
  }
};
function RouterContextProvider({ router, children, ...rest }) {
  if (hasKeys(rest)) router.update({
    ...router.options,
    ...rest,
    context: {
      ...router.options.context,
      ...rest.context
    }
  });
  const provider = /* @__PURE__ */ jsxRuntimeExports.jsx(routerContext.Provider, {
    value: router,
    children
  });
  if (router.options.Wrap) return /* @__PURE__ */ jsxRuntimeExports.jsx(router.options.Wrap, { children: provider });
  return provider;
}
function RouterProvider({ router, ...rest }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RouterContextProvider, {
    router,
    ...rest,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Matches, {})
  });
}
var noopScriptHandler = () => {
};
function setScriptAttrs(script, attrs) {
  if (!attrs) return;
  for (const [key, value] of Object.entries(attrs)) if (key !== "suppressHydrationWarning" && value !== void 0 && value !== false) script.setAttribute(key, typeof value === "boolean" ? "" : String(value));
}
function Asset(asset) {
  const { attrs, children, nonce, preventScriptHoist } = asset;
  const innerHTML = reactExports.useMemo(() => children === void 0 ? void 0 : { __html: children }, [children]);
  switch (asset.tag) {
    case "title":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("title", {
        ...attrs,
        suppressHydrationWarning: true,
        children
      });
    case "meta":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("meta", {
        ...attrs,
        suppressHydrationWarning: true
      });
    case "link":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("link", {
        ...attrs,
        precedence: attrs?.precedence ?? (attrs?.rel === "stylesheet" ? "default" : void 0),
        nonce,
        suppressHydrationWarning: true
      });
    case "style":
      if (asset.inlineCss && false) ;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("style", {
        ...attrs,
        dangerouslySetInnerHTML: innerHTML,
        nonce
      });
    case "script":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Script, {
        attrs,
        preventScriptHoist,
        children
      });
    default:
      return null;
  }
}
function Script({ attrs, children, preventScriptHoist }) {
  useRouter();
  useHydrated();
  const innerHTML = reactExports.useMemo(() => children === void 0 ? void 0 : { __html: children }, [children]);
  const dataScript = typeof attrs?.type === "string" && attrs.type !== "" && attrs.type !== "text/javascript" && attrs.type !== "module";
  reactExports.useEffect(() => {
    if (dataScript) return;
    if (attrs?.src) {
      const link = document.createElement("a");
      link.href = attrs.src;
      const normSrc = link.href;
      for (const el of document.scripts) if (el.src === normSrc) return;
      const script = document.createElement("script");
      setScriptAttrs(script, attrs);
      document.head.appendChild(script);
      return () => script.remove();
    }
    if (typeof children === "string") {
      const typeAttr = typeof attrs?.type === "string" ? attrs.type : "text/javascript";
      const nonceAttr = typeof attrs?.nonce === "string" ? attrs.nonce : void 0;
      for (const el of document.scripts) {
        if (el.hasAttribute("src")) continue;
        const sType = el.getAttribute("type") ?? "text/javascript";
        const sNonce = el.getAttribute("nonce") ?? void 0;
        if (el.textContent === children && sType === typeAttr && sNonce === nonceAttr) return;
      }
      const script = document.createElement("script");
      script.textContent = children;
      setScriptAttrs(script, attrs);
      document.head.appendChild(script);
      return () => script.remove();
    }
  }, [
    attrs,
    children,
    dataScript
  ]);
  {
    if (attrs?.src) {
      if (!preventScriptHoist) return /* @__PURE__ */ jsxRuntimeExports.jsx("script", {
        ...attrs,
        suppressHydrationWarning: true
      });
      return /* @__PURE__ */ jsxRuntimeExports.jsx("script", {
        ...attrs,
        onLoad: noopScriptHandler,
        suppressHydrationWarning: true
      });
    }
    if (typeof children === "string") return /* @__PURE__ */ jsxRuntimeExports.jsx("script", {
      ...attrs,
      dangerouslySetInnerHTML: innerHTML,
      suppressHydrationWarning: true
    });
    return null;
  }
}
function buildTagsFromMatches(router, nonce, matches, assetCrossOrigin) {
  matches = _getAssetMatches(matches);
  const routeMeta = matches.map((match) => match.meta).filter((meta) => meta !== void 0);
  const resultMeta = [];
  const metaByAttribute = {};
  let title;
  for (let i = routeMeta.length - 1; i >= 0; i--) {
    const metas = routeMeta[i];
    for (let j = metas.length - 1; j >= 0; j--) {
      const m = metas[j];
      if (!m) continue;
      if (m.title) {
        if (!title) title = {
          tag: "title",
          children: m.title
        };
      } else if ("script:ld+json" in m) try {
        const json = JSON.stringify(m["script:ld+json"]);
        resultMeta.push({
          tag: "script",
          attrs: { type: "application/ld+json" },
          children: escapeHtml(json)
        });
      } catch {
      }
      else {
        const attribute = m.name ?? m.property;
        if (attribute) if (metaByAttribute[attribute]) continue;
        else metaByAttribute[attribute] = true;
        resultMeta.push({
          tag: "meta",
          attrs: {
            ...m,
            nonce
          }
        });
      }
    }
  }
  if (title) resultMeta.push(title);
  if (nonce) resultMeta.push({
    tag: "meta",
    attrs: {
      property: "csp-nonce",
      content: nonce
    }
  });
  resultMeta.reverse();
  const constructedLinks = matches.flatMap((match) => match.links ?? []).filter((link) => link !== void 0).map((link) => ({
    tag: "link",
    attrs: {
      ...link,
      nonce
    }
  }));
  const manifest = router.ssr?.manifest;
  const manifestCssTags = [];
  if (manifest) {
    matches.forEach((match) => {
      manifest.routes[match.routeId]?.css?.forEach((link) => {
        const resolvedLink = resolveManifestCssLink(link);
        manifestCssTags.push({
          tag: "link",
          attrs: {
            rel: "stylesheet",
            ...resolvedLink,
            crossOrigin: getAssetCrossOrigin(assetCrossOrigin, "stylesheet") ?? resolvedLink.crossOrigin,
            suppressHydrationWarning: true,
            nonce
          }
        });
      });
    });
    if (manifest.inlineStyle) manifestCssTags.push({
      tag: "style",
      attrs: {
        ...manifest.inlineStyle.attrs,
        nonce
      },
      children: manifest.inlineStyle.children,
      inlineCss: true
    });
  }
  const preloadLinks = [];
  if (manifest) matches.forEach((match) => {
    manifest.routes[match.routeId]?.preloads?.forEach((preload) => {
      preloadLinks.push({
        tag: "link",
        attrs: {
          ...getScriptPreloadAttrs(manifest, preload, assetCrossOrigin),
          nonce
        }
      });
    });
  });
  const styles = matches.flatMap((match) => match.styles ?? []).filter((style) => style !== void 0).map(({ children, ...attrs }) => ({
    tag: "style",
    attrs: {
      ...attrs,
      nonce
    },
    children
  }));
  const headScripts = matches.flatMap((match) => match.headScripts ?? []).filter((script) => script !== void 0).map(({ children, ...script }) => ({
    tag: "script",
    attrs: {
      ...script,
      nonce
    },
    children
  }));
  const tags = [];
  appendUniqueUserTags(tags, resultMeta);
  tags.push(...preloadLinks);
  appendUniqueUserTags(tags, constructedLinks);
  tags.push(...manifestCssTags);
  appendUniqueUserTags(tags, styles);
  appendUniqueUserTags(tags, headScripts);
  return tags;
}
var useTags = (assetCrossOrigin) => {
  const router = useRouter();
  const nonce = router.options.ssr?.nonce;
  return buildTagsFromMatches(router, nonce, router.stores.matches.get(), assetCrossOrigin);
};
function HeadContent(props) {
  const tags = useTags(props.assetCrossOrigin);
  const nonce = useRouter().options.ssr?.nonce;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: tags.map((tag) => /* @__PURE__ */ reactExports.createElement(Asset, {
    ...tag,
    key: `tsr-meta-${JSON.stringify(tag)}`,
    nonce
  })) });
}
var routeScriptAttrs = { suppressHydrationWarning: true };
var Scripts = () => {
  const router = useRouter();
  const nonce = router.options.ssr?.nonce;
  const getParts = (matches) => {
    const parts = getSsrBodyScriptParts(matches, router.ssr?.manifest, nonce, routeScriptAttrs);
    for (const script of parts[1]) if (typeof script.attrs?.src === "string") {
      const scriptWithHoist = script;
      scriptWithHoist.preventScriptHoist = true;
    }
    return parts;
  };
  return renderScripts(composeSsrBodyScripts(getParts(router.stores.matches.get()), router.serverSsr?.takeInitialHydrationScriptTags()));
};
function renderScripts(scripts) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: scripts.map((asset, i) => /* @__PURE__ */ reactExports.createElement(Asset, {
    ...asset,
    key: `tsr-scripts-${asset.tag}-${i}`
  })) });
}
var renderRouterToStream = async ({ request, router, responseHeaders, children }) => {
  const signal = request.signal;
  if (signal.aborted) {
    router.serverSsr?.cleanup();
    throw signal.reason;
  }
  let rendererTeardown = false;
  const bot = isbot(request.headers.get("User-Agent"));
  const onError = (renderer) => (error, info) => {
    if (!rendererTeardown && !signal.aborted) console.error(`Error in ${renderer}:`, error, info);
  };
  try {
    if (typeof ReactDOMServer.renderToReadableStream === "function") {
      const stream = await ReactDOMServer.renderToReadableStream(children, {
        signal,
        nonce: router.options.ssr?.nonce,
        progressiveChunkSize: Number.POSITIVE_INFINITY,
        onError: onError("renderToReadableStream")
      });
      const rendererAbort = bot ? new AbortController() : void 0;
      const responseStream = transformReadableStreamWithRouter(router, stream, {
        rendererSafePoint: "script-close",
        signal,
        onAbort: (reason) => {
          rendererTeardown = true;
          rendererAbort?.abort(reason);
        }
      });
      if (rendererAbort) await waitForReason(stream.allReady, rendererAbort.signal);
      return createSsrStreamResponse(router, new Response(responseStream, {
        status: getSsrStatus(router),
        headers: responseHeaders
      }));
    }
    if (typeof ReactDOMServer.renderToPipeableStream === "function") {
      const reactAppPassthrough = new PassThrough();
      let pipeable;
      let resolveReady;
      const ready = new Promise((resolve) => {
        resolveReady = resolve;
      });
      const rendererAbort = new AbortController();
      const abortPipeable = (reason) => {
        if (rendererTeardown) return;
        rendererTeardown = true;
        rendererAbort.abort(reason);
        try {
          pipeable?.abort(reason);
        } catch {
        }
      };
      try {
        pipeable = ReactDOMServer.renderToPipeableStream(children, {
          nonce: router.options.ssr?.nonce,
          progressiveChunkSize: Number.POSITIVE_INFINITY,
          ...bot ? { onAllReady: resolveReady } : { onShellReady: resolveReady },
          onError: onError("renderToPipeableStream"),
          onShellError: (error) => rendererAbort.abort(error)
        });
        const responseStream = transformReadableStreamWithRouter(router, Readable.toWeb(reactAppPassthrough), {
          rendererSafePoint: "script-close",
          signal,
          onAbort: abortPipeable
        });
        await waitForReason(ready, rendererAbort.signal);
        pipeable.pipe(reactAppPassthrough);
        return createSsrStreamResponse(router, new Response(responseStream, {
          status: getSsrStatus(router),
          headers: responseHeaders
        }));
      } catch (error) {
        abortPipeable(error);
        throw error;
      }
    }
    throw new Error("No renderToReadableStream or renderToPipeableStream found in react-dom/server. Ensure you are using a version of react-dom that supports streaming.");
  } catch (error) {
    router.serverSsr?.cleanup();
    throw error;
  }
};
export {
  HeadContent as H,
  Link as L,
  Outlet as O,
  RouterProvider as R,
  Scripts as S,
  createRootRouteWithContext as a,
  createFileRoute as b,
  createRouter as c,
  lazyRouteComponent as l,
  renderRouterToStream as r,
  useRouter as u
};
