'use strict';

// Simple reference endpoints: the list of brands and chocolate types, derived
// from the live catalogue. Handy as lightweight GET targets in JMeter.

const { state } = require('../store');
const { TYPES } = require('../seed');
const { sendJson } = require('../utils');

/** GET /api/brands — distinct brands with a product count. */
function brands(ctx) {
  const counts = {};
  for (const c of state.chocolates) {
    counts[c.brand] = (counts[c.brand] || 0) + 1;
  }
  const data = Object.keys(counts)
    .sort()
    .map((name) => ({ name, productCount: counts[name] }));
  sendJson(ctx.res, 200, { data });
}

/** GET /api/types — the chocolate types with a product count. */
function types(ctx) {
  const data = TYPES.map((name) => ({
    name,
    productCount: state.chocolates.filter((c) => c.type === name).length,
  }));
  sendJson(ctx.res, 200, { data });
}

module.exports = { brands, types };
