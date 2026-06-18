'use strict';

// Small helpers shared by every route handler. Kept tiny and dependency-free
// so the whole project runs on a plain Node.js install with no `npm install`.

/** Send a JSON response with the given status code. */
function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

/** Send a standard error envelope: { error: { message, status } }. */
function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: { status: statusCode, message } });
}

/**
 * Read and JSON-parse a request body.
 * Resolves to {} for empty bodies. Rejects with a 400-style error on bad JSON.
 */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const MAX = 1024 * 1024; // 1 MB guardrail

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX) {
        reject({ status: 413, message: 'Request body too large' });
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject({ status: 400, message: 'Invalid JSON in request body' });
      }
    });

    req.on('error', () => reject({ status: 400, message: 'Error reading request body' }));
  });
}

/** Sleep for ms milliseconds (used to simulate slow endpoints). */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Generate a random hex token (for the fake auth system). */
function randomToken() {
  return require('crypto').randomBytes(24).toString('hex');
}

/**
 * Apply pagination to an array.
 * Reads `page` (1-based) and `limit` from the query object.
 * Returns { data, meta } where meta describes the paging.
 */
function paginate(items, query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

module.exports = { sendJson, sendError, readJsonBody, delay, randomToken, paginate };
