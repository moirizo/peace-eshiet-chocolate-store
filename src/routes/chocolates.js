'use strict';

// CRUD + querying for the chocolate catalogue. The query options on the list
// endpoint (filter / search / sort / paginate) give you plenty to parameterize
// and assert against in JMeter.

const { state } = require('../store');
const { sendJson, sendError, paginate } = require('../utils');

/** GET /api/chocolates — list with filtering, search, sorting, pagination. */
function list(ctx) {
  let items = state.chocolates.slice();
  const q = ctx.query;

  if (q.brand) {
    items = items.filter((c) => c.brand.toLowerCase() === q.brand.toLowerCase());
  }
  if (q.type) {
    items = items.filter((c) => c.type.toLowerCase() === q.type.toLowerCase());
  }
  if (q.origin) {
    items = items.filter((c) => c.origin.toLowerCase() === q.origin.toLowerCase());
  }
  if (q.minPrice) {
    const min = parseFloat(q.minPrice);
    if (!Number.isNaN(min)) items = items.filter((c) => c.price >= min);
  }
  if (q.maxPrice) {
    const max = parseFloat(q.maxPrice);
    if (!Number.isNaN(max)) items = items.filter((c) => c.price <= max);
  }
  if (q.q) {
    const needle = q.q.toLowerCase();
    items = items.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.brand.toLowerCase().includes(needle) ||
        c.description.toLowerCase().includes(needle)
    );
  }

  // sort=field or sort=-field (descending). Allowed fields below.
  if (q.sort) {
    const desc = q.sort.startsWith('-');
    const field = desc ? q.sort.slice(1) : q.sort;
    const allowed = ['name', 'brand', 'type', 'price', 'cacaoPercentage', 'stock', 'id'];
    if (allowed.includes(field)) {
      items.sort((a, b) => {
        if (a[field] < b[field]) return desc ? 1 : -1;
        if (a[field] > b[field]) return desc ? -1 : 1;
        return 0;
      });
    }
  }

  const { data, meta } = paginate(items, q);
  sendJson(ctx.res, 200, { data, meta });
}

/** GET /api/chocolates/:id */
function getOne(ctx) {
  const id = parseInt(ctx.params.id, 10);
  const item = state.chocolates.find((c) => c.id === id);
  if (!item) return sendError(ctx.res, 404, `Chocolate ${ctx.params.id} not found`);
  sendJson(ctx.res, 200, item);
}

/** POST /api/chocolates */
function create(ctx) {
  const b = ctx.body || {};
  const required = ['name', 'brand', 'type', 'price'];
  const missing = required.filter((f) => b[f] === undefined || b[f] === '');
  if (missing.length) {
    return sendError(ctx.res, 422, `Missing required field(s): ${missing.join(', ')}`);
  }
  const item = {
    id: state.nextChocolateId++,
    name: String(b.name),
    brand: String(b.brand),
    type: String(b.type),
    cacaoPercentage: Number(b.cacaoPercentage) || 0,
    price: Number(b.price),
    stock: Number(b.stock) || 0,
    origin: b.origin ? String(b.origin) : 'Unknown',
    sku: b.sku ? String(b.sku) : `NEW-${String(state.nextChocolateId).padStart(4, '0')}`,
    description: b.description ? String(b.description) : `${b.name} by ${b.brand}.`,
  };
  state.chocolates.push(item);
  sendJson(ctx.res, 201, item);
}

/** PUT /api/chocolates/:id — full replace of mutable fields. */
function replace(ctx) {
  const id = parseInt(ctx.params.id, 10);
  const item = state.chocolates.find((c) => c.id === id);
  if (!item) return sendError(ctx.res, 404, `Chocolate ${ctx.params.id} not found`);
  const b = ctx.body || {};
  const required = ['name', 'brand', 'type', 'price'];
  const missing = required.filter((f) => b[f] === undefined || b[f] === '');
  if (missing.length) {
    return sendError(ctx.res, 422, `Missing required field(s): ${missing.join(', ')}`);
  }
  Object.assign(item, {
    name: String(b.name),
    brand: String(b.brand),
    type: String(b.type),
    cacaoPercentage: Number(b.cacaoPercentage) || 0,
    price: Number(b.price),
    stock: Number(b.stock) || 0,
    origin: b.origin ? String(b.origin) : item.origin,
    description: b.description ? String(b.description) : item.description,
  });
  sendJson(ctx.res, 200, item);
}

/** PATCH /api/chocolates/:id — partial update. */
function update(ctx) {
  const id = parseInt(ctx.params.id, 10);
  const item = state.chocolates.find((c) => c.id === id);
  if (!item) return sendError(ctx.res, 404, `Chocolate ${ctx.params.id} not found`);
  const b = ctx.body || {};
  const editable = ['name', 'brand', 'type', 'cacaoPercentage', 'price', 'stock', 'origin', 'description'];
  for (const field of editable) {
    if (b[field] !== undefined) {
      item[field] = ['cacaoPercentage', 'price', 'stock'].includes(field) ? Number(b[field]) : b[field];
    }
  }
  sendJson(ctx.res, 200, item);
}

/** DELETE /api/chocolates/:id */
function remove(ctx) {
  const id = parseInt(ctx.params.id, 10);
  const index = state.chocolates.findIndex((c) => c.id === id);
  if (index === -1) return sendError(ctx.res, 404, `Chocolate ${ctx.params.id} not found`);
  const [deleted] = state.chocolates.splice(index, 1);
  sendJson(ctx.res, 200, { deleted });
}

module.exports = { list, getOne, create, replace, update, remove };
