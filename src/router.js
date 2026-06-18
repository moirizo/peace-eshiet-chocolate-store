'use strict';

// A tiny path-pattern router built on Node's core http module — no Express needed.
// Routes are registered as (method, pattern, handler). Patterns support :params,
// e.g. "/api/chocolates/:id". Matched params are passed to the handler in ctx.params.

class Router {
  constructor() {
    this.routes = [];
  }

  add(method, pattern, handler) {
    const paramNames = [];
    const regexSource = pattern
      .replace(/\/+$/, '') // ignore trailing slash
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape regex specials (colon is safe)
      .replace(/:([A-Za-z0-9_]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      });
    const regex = new RegExp(`^${regexSource || '/'}$`);
    this.routes.push({ method: method.toUpperCase(), regex, paramNames, handler });
    return this;
  }

  get(pattern, handler) { return this.add('GET', pattern, handler); }
  post(pattern, handler) { return this.add('POST', pattern, handler); }
  put(pattern, handler) { return this.add('PUT', pattern, handler); }
  patch(pattern, handler) { return this.add('PATCH', pattern, handler); }
  delete(pattern, handler) { return this.add('DELETE', pattern, handler); }

  /**
   * Find a handler for the given method + pathname.
   * Returns { handler, params } or null if no route matches the path.
   * If the path matches but the method does not, returns { methodNotAllowed: true }.
   */
  match(method, pathname) {
    const normalized = pathname.replace(/\/+$/, '') || '/';
    let pathMatched = false;
    for (const route of this.routes) {
      const m = route.regex.exec(normalized);
      if (!m) continue;
      pathMatched = true;
      if (route.method !== method.toUpperCase()) continue;
      const params = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(m[i + 1]);
      });
      return { handler: route.handler, params };
    }
    if (pathMatched) return { methodNotAllowed: true };
    return null;
  }
}

module.exports = Router;
