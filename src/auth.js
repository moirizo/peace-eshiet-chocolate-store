'use strict';

// Fake bearer-token auth. On login we hand out a random token and remember which
// user it maps to. Protected endpoints expect: Authorization: Bearer <token>.
// This is intentionally simple — perfect for practising JMeter "correlation"
// (extract the token from the login response, reuse it on later requests).

const { state } = require('./store');
const { sendError } = require('./utils');

/** Resolve the logged-in user from the Authorization header, or null. */
function resolveUser(req) {
  const header = req.headers['authorization'] || '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return null;
  const userId = state.tokens[match[1]];
  if (!userId) return null;
  return state.users.find((u) => u.id === userId) || null;
}

/**
 * Wrap a handler so it only runs for authenticated requests.
 * Adds ctx.user. Responds 401 otherwise.
 */
function requireAuth(handler) {
  return (ctx) => {
    const user = resolveUser(ctx.req);
    if (!user) {
      return sendError(ctx.res, 401, 'Missing or invalid bearer token. Log in via POST /api/auth/login.');
    }
    ctx.user = user;
    return handler(ctx);
  };
}

module.exports = { resolveUser, requireAuth };
