var stateIndexKey = "__TSR_index";
var protocolRelativePrefix = /^[\x00-\x20]*(?:[\\/][\t\n\r]*){2,}/;
function normalizeProtocolRelative(url) {
  const match = protocolRelativePrefix.exec(url);
  return match ? "/" + url.slice(match[0].length) : url;
}
function normalizeHref(href) {
  if (/[\x00-\x1f\x7f]/.test(href)) href = href.replace(/[\x00-\x1f\x7f]/g, (character) => "	\n\r".includes(character) ? "" : encodeURIComponent(character));
  return normalizeProtocolRelative(href);
}
var noop = () => {
};
var ServerHistory = class {
  constructor(location) {
    this.location = location;
  }
  get length() {
    return 1;
  }
  get subscribers() {
    return this._subscribers ??= /* @__PURE__ */ new Set();
  }
  subscribe() {
    return noop;
  }
  push() {
  }
  replace() {
  }
  go() {
  }
  back() {
  }
  forward() {
  }
  canGoBack() {
    return false;
  }
  createHref(href) {
    return normalizeHref(href);
  }
  block() {
    return noop;
  }
  flush() {
  }
  destroy() {
  }
  notify() {
  }
  _getBlockers() {
    return [];
  }
};
function createServerHistory(href) {
  return new ServerHistory(parseHref(href, void 0));
}
function parseHref(href, state) {
  const sanitizedHref = normalizeHref(href);
  const hashIndex = sanitizedHref.indexOf("#");
  const searchIndex = sanitizedHref.indexOf("?");
  if (!state) {
    const key = createRandomKey();
    state = {
      [stateIndexKey]: 0,
      key,
      __TSR_key: key
    };
  }
  return {
    href: sanitizedHref,
    pathname: sanitizedHref.substring(0, hashIndex > 0 ? searchIndex > 0 ? Math.min(hashIndex, searchIndex) : hashIndex : searchIndex > 0 ? searchIndex : sanitizedHref.length),
    hash: hashIndex > -1 ? sanitizedHref.substring(hashIndex) : "",
    search: searchIndex > -1 ? sanitizedHref.slice(searchIndex, hashIndex === -1 ? void 0 : hashIndex) : "",
    state
  };
}
function createRandomKey() {
  return (Math.random() + 1).toString(36).substring(7);
}
export {
  createServerHistory as c,
  normalizeProtocolRelative as n,
  parseHref as p
};
