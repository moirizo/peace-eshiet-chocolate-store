'use strict';

// Utility endpoints that are especially useful when learning performance testing:
//  - /health        : a cheap liveness check
//  - /api           : a self-describing index of all routes
//  - /api/admin/reset: restore seed data so test runs are repeatable
//  - /api/slow       : configurable latency, to see response-time graphs move
//  - /api/flaky      : configurable error rate, to practise assertions & error %

const { state, reset } = require('../store');
const { sendJson, delay } = require('../utils');

/** GET /health */
function health(ctx) {
  sendJson(ctx.res, 200, {
    status: 'ok',
    uptimeSeconds: Math.round((Date.now() - state.startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
}

/** GET /api — list the available endpoints. */
function index(ctx) {
  sendJson(ctx.res, 200, {
    name: 'Peace-Eshiet Chocolate Store API',
    version: '1.0.0',
    docs: 'GET /docs (Swagger UI) — spec at GET /openapi.yaml',
    endpoints: {
      health: 'GET /health',
      catalogue: [
        'GET /api/chocolates?page&limit&brand&type&origin&minPrice&maxPrice&q&sort',
        'GET /api/chocolates/:id',
        'POST /api/chocolates',
        'PUT /api/chocolates/:id',
        'PATCH /api/chocolates/:id',
        'DELETE /api/chocolates/:id',
        'GET /api/brands',
        'GET /api/types',
      ],
      auth: [
        'POST /api/auth/register  { username, password, email? }',
        'POST /api/auth/login     { username, password }  -> { token }',
        'GET  /api/auth/me        (Bearer token)',
        'POST /api/auth/logout    (Bearer token)',
      ],
      cart: [
        'GET    /api/cart                       (Bearer token)',
        'POST   /api/cart/items                 (Bearer token) { chocolateId, quantity }',
        'PUT    /api/cart/items/:chocolateId    (Bearer token) { quantity }',
        'DELETE /api/cart/items/:chocolateId    (Bearer token)',
        'DELETE /api/cart                       (Bearer token)',
      ],
      orders: [
        'POST /api/orders        (Bearer token)  -> checkout current cart',
        'GET  /api/orders        (Bearer token)',
        'GET  /api/orders/:id    (Bearer token)',
      ],
      testingHelpers: [
        'POST /api/admin/reset   -> restore seed data',
        'GET  /api/slow?delay=2000   -> responds after N ms',
        'GET  /api/flaky?failRate=0.3 -> returns 500 some of the time',
      ],
      demoUser: { username: 'demo', password: 'password123' },
    },
  });
}

/** POST /api/admin/reset */
function resetData(ctx) {
  reset();
  sendJson(ctx.res, 200, { message: 'Store reset to seed data', chocolates: state.chocolates.length });
}

/** GET /api/slow?delay=ms — artificial latency (capped at 10s). */
async function slow(ctx) {
  const ms = Math.min(10000, Math.max(0, parseInt(ctx.query.delay, 10) || 1000));
  await delay(ms);
  sendJson(ctx.res, 200, { message: `Responded after ${ms} ms`, delayMs: ms });
}

/** GET /api/flaky?failRate=0.3 — fails randomly to practise error handling. */
function flaky(ctx) {
  const rate = Math.min(1, Math.max(0, parseFloat(ctx.query.failRate) || 0.3));
  if (Math.random() < rate) {
    sendJson(ctx.res, 500, { error: { status: 500, message: 'Simulated random failure' } });
  } else {
    sendJson(ctx.res, 200, { message: 'Success', failRate: rate });
  }
}

module.exports = { health, index, resetData, slow, flaky };
