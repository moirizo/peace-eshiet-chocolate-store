'use strict';

// Entry point. Creates the HTTP server, wires up all routes, and turns each
// request into a small `ctx` object the handlers consume. Built only on Node's
// core modules so it runs with zero `npm install`.

const http = require('http');
const { URL } = require('url');

const Router = require('./src/router');
const { requireAuth } = require('./src/auth');
const { sendJson, sendError, readJsonBody } = require('./src/utils');

const chocolates = require('./src/routes/chocolates');
const catalog = require('./src/routes/catalog');
const auth = require('./src/routes/auth');
const cart = require('./src/routes/cart');
const orders = require('./src/routes/orders');
const misc = require('./src/routes/misc');
const docs = require('./src/routes/docs');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const router = new Router();

// --- Health & index ---------------------------------------------------------
router.get('/health', misc.health);
router.get('/', misc.index);
router.get('/api', misc.index);

// --- API docs (Swagger UI + OpenAPI spec) -----------------------------------
router.get('/docs', docs.page);
router.get('/openapi.yaml', docs.spec);

// --- Catalogue --------------------------------------------------------------
router.get('/api/chocolates', chocolates.list);
router.post('/api/chocolates', chocolates.create);
router.get('/api/chocolates/:id', chocolates.getOne);
router.put('/api/chocolates/:id', chocolates.replace);
router.patch('/api/chocolates/:id', chocolates.update);
router.delete('/api/chocolates/:id', chocolates.remove);
router.get('/api/brands', catalog.brands);
router.get('/api/types', catalog.types);

// --- Auth -------------------------------------------------------------------
router.post('/api/auth/register', auth.register);
router.post('/api/auth/login', auth.login);
router.get('/api/auth/me', requireAuth(auth.me));
router.post('/api/auth/logout', requireAuth(auth.logout));

// --- Cart (all require auth) ------------------------------------------------
router.get('/api/cart', requireAuth(cart.getCart));
router.post('/api/cart/items', requireAuth(cart.addItem));
router.put('/api/cart/items/:chocolateId', requireAuth(cart.updateItem));
router.delete('/api/cart/items/:chocolateId', requireAuth(cart.removeItem));
router.delete('/api/cart', requireAuth(cart.clearCart));

// --- Orders (all require auth) ----------------------------------------------
router.post('/api/orders', requireAuth(orders.checkout));
router.get('/api/orders', requireAuth(orders.list));
router.get('/api/orders/:id', requireAuth(orders.getOne));

// --- Testing helpers --------------------------------------------------------
router.post('/api/admin/reset', misc.resetData);
router.get('/api/slow', misc.slow);
router.get('/api/flaky', misc.flaky);

// ---------------------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  const startedAt = Date.now();

  // Permissive CORS so a browser or any tool can call the API freely.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let parsed;
  try {
    parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch (e) {
    return sendError(res, 400, 'Bad request URL');
  }

  const query = Object.fromEntries(parsed.searchParams.entries());

  res.on('finish', () => {
    const ms = Date.now() - startedAt;
    // Simple access log: METHOD path -> status (Xms)
    console.log(`${req.method} ${parsed.pathname} -> ${res.statusCode} (${ms}ms)`);
  });

  const route = router.match(req.method, parsed.pathname);

  if (!route) {
    return sendError(res, 404, `No route for ${req.method} ${parsed.pathname}`);
  }
  if (route.methodNotAllowed) {
    return sendError(res, 405, `Method ${req.method} not allowed for ${parsed.pathname}`);
  }

  try {
    let body = {};
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      body = await readJsonBody(req);
    }
    const ctx = { req, res, params: route.params, query, body };
    await route.handler(ctx);
  } catch (err) {
    if (err && err.status) {
      return sendError(res, err.status, err.message);
    }
    console.error('Unhandled error:', err);
    if (!res.headersSent) sendError(res, 500, 'Internal server error');
  }
});

server.listen(PORT, HOST, () => {
  console.log('');
  console.log('  🍫  Peace-Eshiet Chocolate Store API is running!');
  console.log('  ------------------------------------------------');
  console.log(`  Local:    http://localhost:${PORT}`);
  console.log(`  API index: http://localhost:${PORT}/api`);
  console.log(`  API docs:  http://localhost:${PORT}/docs   (Swagger UI)`);
  console.log(`  Health:    http://localhost:${PORT}/health`);
  console.log('');
  console.log('  Demo login -> username: demo   password: password123');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});
