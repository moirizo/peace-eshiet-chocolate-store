'use strict';

// Checkout + order history. Creating an order turns the current cart into an
// immutable order and empties the cart — the end of the classic e-commerce flow.

const { state } = require('../store');
const { sendJson, sendError } = require('../utils');
const { cartFor, cartView } = require('./cart');

/** POST /api/orders — check out the current cart. */
function checkout(ctx) {
  const cart = cartFor(ctx.user.id);
  if (cart.items.length === 0) {
    return sendError(ctx.res, 422, 'Cannot check out an empty cart');
  }
  const view = cartView(cart);
  const order = {
    id: state.nextOrderId++,
    userId: ctx.user.id,
    items: view.items,
    itemCount: view.itemCount,
    total: view.total,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  state.orders.push(order);
  cart.items = []; // empty the cart after checkout
  sendJson(ctx.res, 201, order);
}

/** GET /api/orders — the logged-in user's orders. */
function list(ctx) {
  const data = state.orders.filter((o) => o.userId === ctx.user.id);
  sendJson(ctx.res, 200, { data, meta: { total: data.length } });
}

/** GET /api/orders/:id — a single order owned by the user. */
function getOne(ctx) {
  const id = parseInt(ctx.params.id, 10);
  const order = state.orders.find((o) => o.id === id && o.userId === ctx.user.id);
  if (!order) return sendError(ctx.res, 404, `Order ${ctx.params.id} not found`);
  sendJson(ctx.res, 200, order);
}

module.exports = { checkout, list, getOne };
