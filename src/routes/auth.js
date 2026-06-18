'use strict';

// Register / login / whoami. Login returns a token you carry on later requests.
// In JMeter: POST /api/auth/login, extract "token" from the JSON response with a
// JSON Extractor, then send it as "Authorization: Bearer ${token}" downstream.

const { state } = require('../store');
const { sendJson, sendError, randomToken } = require('../utils');

/** POST /api/auth/register */
function register(ctx) {
  const b = ctx.body || {};
  if (!b.username || !b.password) {
    return sendError(ctx.res, 422, 'username and password are required');
  }
  if (state.users.some((u) => u.username.toLowerCase() === String(b.username).toLowerCase())) {
    return sendError(ctx.res, 409, `Username "${b.username}" is already taken`);
  }
  const user = {
    id: state.nextUserId++,
    username: String(b.username),
    email: b.email ? String(b.email) : `${b.username}@chocolate.store`,
    password: String(b.password),
  };
  state.users.push(user);
  sendJson(ctx.res, 201, publicUser(user));
}

/** POST /api/auth/login -> { token, user } */
function login(ctx) {
  const b = ctx.body || {};
  const user = state.users.find(
    (u) => u.username.toLowerCase() === String(b.username || '').toLowerCase() && u.password === String(b.password || '')
  );
  if (!user) return sendError(ctx.res, 401, 'Invalid username or password');
  const token = randomToken();
  state.tokens[token] = user.id;
  sendJson(ctx.res, 200, { token, user: publicUser(user) });
}

/** GET /api/auth/me (requires auth) */
function me(ctx) {
  sendJson(ctx.res, 200, publicUser(ctx.user));
}

/** POST /api/auth/logout (requires auth) — invalidate the presented token. */
function logout(ctx) {
  const header = ctx.req.headers['authorization'] || '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (match) delete state.tokens[match[1]];
  sendJson(ctx.res, 200, { message: 'Logged out' });
}

/** Strip the password before returning a user object. */
function publicUser(user) {
  return { id: user.id, username: user.username, email: user.email };
}

module.exports = { register, login, me, logout };
