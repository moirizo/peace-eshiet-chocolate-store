# 🍫 Peace-Eshiet Chocolate Store API

A small, **zero-dependency** REST API for a fictional online chocolate store.
It exists for one purpose: to give you a realistic, free backend to **practise
JMeter scripting and performance engineering** against — no cloud accounts, no
paid APIs, no database to install.

Everything runs in memory, so you can hammer it as hard as you like and reset it
to a clean state whenever you want.

---

## 1. Quick start (the easy way, Windows)

> 🔰 **Never run a backend before?** Follow the gentle, click-by-click
> **[Getting Started guide](GETTING_STARTED.md)** instead — it covers everything
> below in more detail, with troubleshooting.

You only need **one** thing installed: **Node.js**.

1. **Install Node.js** (free) from <https://nodejs.org> — download the **LTS**
   version and click Next → Next → Finish. *(Skip this if it's already installed.)*
2. **Download this project**: click the green **Code → Download ZIP** button on
   GitHub and unzip it (or `git clone` it if you know how).
3. **Double-click `start.bat`**.

A black window opens and shows:

```
  🍫  Peace-Eshiet Chocolate Store API is running!
  Local:    http://localhost:3000
```

That's it — the API is live. Leave that window open while you use it. To stop,
close the window or press `Ctrl+C`.

> **Test it:** open <http://localhost:3000/api> in your browser. You should see a
> list of all available endpoints.
>
> **Browse the API visually:** open <http://localhost:3000/docs> for an
> interactive **Swagger UI** page where you can read and try every endpoint.

### Running it from a terminal instead

```bash
node server.js
# or
npm start
```

Change the port if 3000 is taken:

```bash
# Windows PowerShell
$env:PORT=8080 ; node server.js
```

---

## 2. The demo login

A ready-made user exists so you can log in immediately:

| username | password      |
|----------|---------------|
| `demo`   | `password123` |

---

## 3. API reference

Base URL: `http://localhost:3000`

> 📋 **Full product list:** see **[PRODUCTS.md](PRODUCTS.md)** for a table of all
> 39 products (name, brand, type, cacao %, price, stock, origin, SKU).

### Catalogue (no auth needed)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/chocolates` | List chocolates (supports query options below) |
| GET | `/api/chocolates/:id` | Get one chocolate |
| POST | `/api/chocolates` | Create a chocolate |
| PUT | `/api/chocolates/:id` | Replace a chocolate |
| PATCH | `/api/chocolates/:id` | Update some fields |
| DELETE | `/api/chocolates/:id` | Delete a chocolate |
| GET | `/api/brands` | List brands + product counts |
| GET | `/api/types` | List types (dark/milk/white/ruby) |

**List query parameters** (mix and match):

```
?page=2&limit=5            pagination
?brand=Lindt              filter by brand
?type=dark                filter by type
?origin=Switzerland       filter by country
?minPrice=3&maxPrice=8    price range
?q=truffle                text search (name/brand/description)
?sort=price               sort ascending (use -price for descending)
```

Example:
`GET /api/chocolates?type=dark&minPrice=3&sort=-price&limit=5`

### Auth

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | `{username, password, email?}` | Create an account |
| POST | `/api/auth/login` | `{username, password}` | Returns `{ token, user }` |
| GET | `/api/auth/me` | — | Current user *(needs token)* |
| POST | `/api/auth/logout` | — | Invalidate token *(needs token)* |

Send the token on protected requests as a header:
`Authorization: Bearer <token>`

### Cart *(all need a token)*

| Method | Path | Body |
|--------|------|------|
| GET | `/api/cart` | — |
| POST | `/api/cart/items` | `{chocolateId, quantity}` |
| PUT | `/api/cart/items/:chocolateId` | `{quantity}` |
| DELETE | `/api/cart/items/:chocolateId` | — |
| DELETE | `/api/cart` | — (empty the cart) |

### Orders *(all need a token)*

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/orders` | Check out the current cart → creates an order |
| GET | `/api/orders` | List your orders |
| GET | `/api/orders/:id` | Get one order |

### Testing helpers (the fun part for performance practice)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Cheap liveness check |
| GET | `/api` | Self-describing list of all endpoints |
| POST | `/api/admin/reset` | Restore all seed data (great between test runs) |
| GET | `/api/slow?delay=2000` | Responds after N ms — watch response-time graphs move |
| GET | `/api/flaky?failRate=0.3` | Returns HTTP 500 some of the time — practise assertions & error % |

---

## 3a. Exploring the API (Swagger & Postman)

Two ways to poke at the API by hand before you script load tests:

- **Swagger UI** — start the server and open <http://localhost:3000/docs>. It's
  an interactive page generated from [`openapi.yaml`](openapi.yaml); you can read
  every endpoint and hit **Try it out** to send real requests. *(The page pulls
  Swagger UI from a CDN, so it needs internet; the API itself works offline.)*
- **Postman** — import
  [`postman/chocolate-store.postman_collection.json`](postman/chocolate-store.postman_collection.json)
  (Postman → Import → File). It contains one plain, hardcoded request per
  endpoint, grouped into folders. No variables or scripts — just hit **Send**.
  For the Cart/Orders requests, first run **Auth → Login**, copy the `token` from
  the response, and paste it into the `Authorization` header (replace
  `PASTE_TOKEN_HERE`).

## 4. Practising with JMeter

A ready-to-run test plan is included: **`jmeter/chocolate-store-test-plan.jmx`**.
See **[`jmeter/README.md`](jmeter/README.md)** for how to open and run it, plus a
set of exercises that build up your skills (correlation, parameterization with
CSV files, assertions, think times, and more).

The included plan demonstrates the full e-commerce flow with the techniques you'll
use most often:

1. **Login** → extract the `token` from the JSON response *(correlation)*
2. **Browse** dark chocolates with query parameters
3. **Add to cart** using the extracted token
4. **Checkout** → extract the `orderId`
5. **View the order** using that id, with a response assertion

---

## 5. How it's built

- Pure **Node.js core modules** (`http`, `url`, `crypto`) — no frameworks, no
  `npm install`, no `node_modules` folder.
- In-memory data store, rebuilt from `src/seed.js` on startup and on reset.
- Tiny custom router in `src/router.js`; route handlers live in `src/routes/`.

```
chocolate-store/
├── server.js              # entry point — starts the HTTP server, wires routes
├── start.bat              # double-click launcher for Windows
├── package.json
├── PRODUCTS.md            # full catalogue table (all 39 products)
├── openapi.yaml           # OpenAPI 3.0 spec (source for Swagger UI)
├── docs/
│   └── index.html         # Swagger UI page served at /docs
├── postman/
│   └── chocolate-store.postman_collection.json
├── src/
│   ├── router.js          # minimal path-pattern router
│   ├── store.js           # in-memory state + reset()
│   ├── seed.js            # the chocolate catalogue + demo user
│   ├── auth.js            # bearer-token helpers
│   ├── utils.js           # JSON response / body parsing / pagination helpers
│   └── routes/            # one file per resource
│       ├── chocolates.js
│       ├── catalog.js
│       ├── auth.js
│       ├── cart.js
│       ├── orders.js
│       ├── docs.js          # serves /docs and /openapi.yaml
│       └── misc.js
└── jmeter/
    ├── chocolate-store-test-plan.jmx
    └── README.md
```

## 6. Notes

- This is a **practice toy**, not production software: passwords are stored in
  plain text, there's no persistence, and CORS is wide open. That's all
  intentional to keep it simple and easy to run.
- Data resets every time you restart the server (or call `/api/admin/reset`).
