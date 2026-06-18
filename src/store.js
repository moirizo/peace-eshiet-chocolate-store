'use strict';

// In-memory data store. Everything lives in process memory and is lost when the
// server stops — which is exactly what you want for repeatable load tests:
// restart (or call POST /api/admin/reset) to get back to a known state.

const { buildChocolates, buildUsers } = require('./seed');

const state = {
  chocolates: [],
  users: [],
  carts: {}, // userId -> { items: [{ chocolateId, quantity }] }
  orders: [], // { id, userId, items, total, status, createdAt }
  tokens: {}, // token -> userId
  nextChocolateId: 1,
  nextUserId: 1,
  nextOrderId: 1,
  startedAt: Date.now(),
};

/** Reset all data back to the seed catalogue. */
function reset() {
  state.chocolates = buildChocolates();
  state.users = buildUsers();
  state.carts = {};
  state.orders = [];
  state.tokens = {};
  state.nextChocolateId = state.chocolates.length + 1;
  state.nextUserId = state.users.length + 1;
  state.nextOrderId = 1;
}

// Build the initial dataset immediately on require.
reset();

module.exports = { state, reset };
