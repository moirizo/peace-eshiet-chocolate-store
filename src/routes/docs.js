'use strict';

// Serves the OpenAPI spec and a Swagger UI page so you can browse and try the
// API at http://localhost:3000/docs. Files are read from disk once and cached.
// Still zero-dependency: Swagger UI's assets load from a public CDN in the
// browser, so the docs page needs internet — the API itself does not.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

let specCache = null;
let pageCache = null;

/** GET /openapi.yaml — the raw OpenAPI spec. */
function spec(ctx) {
  if (specCache === null) {
    specCache = fs.readFileSync(path.join(ROOT, 'openapi.yaml'), 'utf8');
  }
  ctx.res.writeHead(200, { 'Content-Type': 'application/yaml; charset=utf-8' });
  ctx.res.end(specCache);
}

/** GET /docs — the Swagger UI page. */
function page(ctx) {
  if (pageCache === null) {
    pageCache = fs.readFileSync(path.join(ROOT, 'docs', 'index.html'), 'utf8');
  }
  ctx.res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  ctx.res.end(pageCache);
}

module.exports = { spec, page };
