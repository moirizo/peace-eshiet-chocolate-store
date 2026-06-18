# 🍫 Getting Started — Step by Step (for absolute beginners)

This guide assumes you have **never run a backend server before**. Follow it
top to bottom and you'll have the Peace-Eshiet Chocolate Store API running in a few minutes.

---

## What you need (requirements)

| Thing | Needed? | Notes |
|-------|---------|-------|
| A Windows PC | ✅ | macOS/Linux work too, but this guide shows Windows |
| **Node.js** | ✅ | Free. The only thing you must install. Steps below. |
| Internet connection | ⚠️ Once | Only to *install* Node.js the first time (and to view the Swagger docs page). The API itself runs fully offline. |
| Any web browser | ✅ | Chrome, Edge, Firefox… you already have one |
| JMeter / Postman | ❌ Optional | Only if you want to do the testing exercises later |

> **Will it harm my computer?** No. This is a tiny practice program that runs
> only on your own machine and stores nothing permanently.

---

## Step 1 — Install Node.js (do this once)

1. Go to **<https://nodejs.org>**
2. Click the big button that says **"LTS"** (it means the stable version).
   This downloads a file like `node-v20-x64.msi`.
3. Open the downloaded file and click **Next → Next → Next → Install → Finish**.
   You can accept all the default options.

**Check it worked:**

1. Press the **Windows key**, type `cmd`, and open **Command Prompt**.
2. Type this and press Enter:
   ```
   node --version
   ```
3. If you see something like `v20.11.0`, you're done. 🎉
   (If you see *"not recognized"*, restart your computer and try again.)

---

## Step 2 — Get the project onto your computer

**Option A — Download (easiest):**
1. On the project's GitHub page, click the green **`< > Code`** button.
2. Click **Download ZIP**.
3. Right-click the downloaded ZIP → **Extract All…** → pick a folder you'll
   remember, e.g. your Desktop.

**Option B — Git clone (if you know git):**
```
git clone <the-repository-url>
```

Either way you'll end up with a folder named **`chocolate-store`** containing a
file called **`start.bat`**.

---

## Step 3 — Start the server

1. Open the **`chocolate-store`** folder.
2. **Double-click `start.bat`.**

A black window appears showing:

```
  🍫  Peace-Eshiet Chocolate Store API is running!
  ------------------------------------------------
  Local:    http://localhost:3000
  API docs:  http://localhost:3000/docs   (Swagger UI)
  Health:    http://localhost:3000/health

  Demo login -> username: demo   password: password123
  Press Ctrl+C to stop.
```

✅ **That black window staying open = the server is running.** Leave it open
while you use the API.

> If Windows shows a blue **"Windows protected your PC"** box, click
> **More info → Run anyway**. (This appears for any downloaded `.bat` file.)
>
> If a **Windows Firewall** popup appears, click **Allow access**.

---

## Step 4 — Check that it works

Open your web browser and visit these addresses:

- **<http://localhost:3000/health>** → you should see `{"status":"ok", ...}`
- **<http://localhost:3000/docs>** → an interactive **Swagger** page listing
  every endpoint (you can click **"Try it out"** to send real requests)
- **<http://localhost:3000/api/chocolates>** → a list of chocolates

If you see those, congratulations — your backend is live! 🍫

---

## Step 5 — Stop the server

When you're finished, go to the black window and either:
- Press **`Ctrl` + `C`**, **or**
- Just close the window.

To start it again later, double-click **`start.bat`** again.

---

## Optional — Change the port

If something else is already using port `3000`, open Command Prompt **inside the
project folder** and run:

```
set PORT=8080
node server.js
```

Now use `http://localhost:8080` instead.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Double-clicking `start.bat` flashes a window that closes instantly | Node.js isn't installed. Do **Step 1**, then try again. The window now stays open and shows the reason if anything is wrong. |
| `'node' is not recognized` | Node.js isn't installed or your PC needs a restart after installing it. |
| Browser says *"can't reach this page"* | The server window isn't open. Double-click `start.bat` and keep that window open. |
| *"Port 3000 is already in use"* (`EADDRINUSE`) | Another program (maybe a second copy of this server) is using the port. Close it, or use a different port (see above). |
| The `/docs` page is blank | The Swagger page needs internet. Check your connection, or just use `http://localhost:3000/api` which works offline. |

---

## What next?

- **Explore by hand:** open the Swagger page at <http://localhost:3000/docs>, or
  import the Postman collection in `postman/` (see the main
  [README](README.md)).
- **Practice load testing:** follow [`jmeter/README.md`](jmeter/README.md) — it
  has a ready-made test plan and graded exercises.
- **See every endpoint and the full product list:** in the main
  [README](README.md#3-api-reference).
