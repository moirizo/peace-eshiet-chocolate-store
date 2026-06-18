'use strict';

// Shopping cart, scoped to the logged-in user. All endpoints require auth.
// The cart is the natural multi-step flow for JMeter practice: log in, add a few
// items, update quantities, then check out (see orders.js).

const { state } = require('../store');
const { sendJson, sendError } = require('../utils');

/** Get (or lazily create) the cart for a user id. */
function cartFor(userId) {
  if (!state.carts[userId]) state.carts[userId] = { items: [] };
  return state.carts[userId];
}

/** Build a detailed cart view with product info and totals. */
function cartView(cart) {
  const items = cart.items.map((line) => {
    const choc = state.chocolates.find((c) => c.id === line.chocolateId);
    const price = choc ? choc.price : 0;
    return {
      chocolateId: line.chocolateId,
      name: choc ? choc.name : '(removed)',
      brand: choc ? choc.brand : null,
      unitPrice: price,
      quantity: line.quantity,
      lineTotal: Math.round(price * line.quantity * 100) / 100,
    };
  });
  const total = Math.round(items.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, itemCount, total };
}

/** GET /api/cart */
function getCart(ctx) {
  sendJson(ctx.res, 200, cartView(cartFor(ctx.user.id)));
}

/** POST /api/cart/items  { chocolateId, quantity } */
function addItem(ctx) {
  const b = ctx.body || {};
  const chocolateId = parseInt(b.chocolateId, 10);
  const quantity = parseInt(b.quantity, 10) || 1;
  if (!chocolateId) return sendError(ctx.res, 422, 'chocolateId is required');
  if (quantity < 1) return sendError(ctx.res, 422, 'quantity must be at least 1');
  const choc = state.chocolates.find((c) => c.id === chocolateId);
  if (!choc) return sendError(ctx.res, 404, `Chocolate ${chocolateId} not found`);

  const cart = cartFor(ctx.user.id);
  const existing = cart.items.find((i) => i.chocolateId === chocolateId);
  if (existing) existing.quantity += quantity;
  else cart.items.push({ chocolateId, quantity });
  sendJson(ctx.res, 201, cartView(cart));
}

/** PUT /api/cart/items/:chocolateId  { quantity } */
function updateItem(ctx) {
  const chocolateId = parseInt(ctx.params.chocolateId, 10);
  const quantity = parseInt((ctx.body || {}).quantity, 10);
  if (Number.isNaN(quantity) || quantity < 0) {
    return sendError(ctx.res, 422, 'quantity must be 0 or greater');
  }
  const cart = cartFor(ctx.user.id);
  const line = cart.items.find((i) => i.chocolateId === chocolateId);
  if (!line) return sendError(ctx.res, 404, `Item ${chocolateId} is not in the cart`);
  if (quantity === 0) {
    cart.items = cart.items.filter((i) => i.chocolateId !== chocolateId);
  } else {
    line.quantity = quantity;
  }
  sendJson(ctx.res, 200, cartView(cart));
}

/** DELETE /api/cart/items/:chocolateId */
function removeItem(ctx) {
  const chocolateId = parseInt(ctx.params.chocolateId, 10);
  const cart = cartFor(ctx.user.id);
  const before = cart.items.length;
  cart.items = cart.items.filter((i) => i.chocolateId !== chocolateId);
  if (cart.items.length === before) {
    return sendError(ctx.res, 404, `Item ${chocolateId} is not in the cart`);
  }
  sendJson(ctx.res, 200, cartView(cart));
}

/** DELETE /api/cart — empty the cart. */
function clearCart(ctx) {
  cartFor(ctx.user.id).items = [];
  sendJson(ctx.res, 200, cartView(cartFor(ctx.user.id)));
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, cartFor, cartView };
