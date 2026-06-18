# JMeter practice guide

This folder contains a ready-to-run JMeter test plan for the Peace-Eshiet Chocolate Store API
plus a set of exercises to grow your skills.

## Prerequisites

- **Java** (JMeter needs it): <https://adoptium.net> — install the LTS Temurin build.
- **Apache JMeter**: download from <https://jmeter.apache.org/download_jmeter.cgi>,
  unzip it anywhere.
- The **Peace-Eshiet Chocolate Store API must be running** (double-click `start.bat` in the
  project root — see the main README).

## Run the example plan in the GUI

1. Start JMeter: run `bin/jmeter.bat` (Windows) from where you unzipped JMeter.
2. **File → Open** → choose `chocolate-store-test-plan.jmx`.
3. Press the green **Start** (▶) button.
4. Click **View Results Tree** and **Summary Report** (left panel) to watch the
   requests and timings.

> The plan targets `localhost:3000` by default. To point it elsewhere, edit the
> `HOST` and `PORT` values under **Test Plan → User Defined Variables**.

## Run it from the command line (how real load tests are run)

The GUI is for *building and debugging* a test. For an actual load test, run it
"non-GUI" so JMeter isn't slowed down by drawing graphs:

```bash
jmeter -n -t chocolate-store-test-plan.jmx -l results/run.jtl -e -o results/report
```

- `-n` non-GUI mode
- `-t` the test plan
- `-l` raw results file
- `-e -o results/report` generate an HTML dashboard into `results/report`

Open `results/report/index.html` afterwards to see the full report. (The
`results/` folder is git-ignored.)

> Tip: call `POST http://localhost:3000/api/admin/reset` before a run if you want
> each run to start from identical data.

## What the example plan teaches

| Step | Technique |
|------|-----------|
| 01 Login | **Correlation** — a JSON Extractor pulls `token` out of the response into a variable |
| (header manager) | Reusing the captured token via `Authorization: Bearer ${token}` |
| 02 Browse | Sending **query parameters** and asserting the response code |
| 03 Add to cart | Sending a **JSON request body** on a `POST` |
| 04 Checkout | Another extraction — capturing the generated `orderId` |
| 05 View order | Using a captured variable in the **URL path** + a "contains" assertion |

## Exercises (in rough order of difficulty)

1. **Ramp it up.** Change the Thread Group to 50 users over a 30-second ramp and
   3 loops. Watch the Summary Report's average/throughput change.
2. **Add think time.** Insert a *Uniform Random Timer* (300–1000 ms) so virtual
   users behave more like humans.
3. **Parameterize the search.** Add a *CSV Data Set Config* with a column of
   chocolate types (`dark`, `milk`, `white`, `ruby`) and use `${type}` in the
   browse request so each user searches something different.
4. **Random product.** Use a `__Random(1,39,)` function to add a random
   `chocolateId` to the cart each iteration.
5. **Assert on content, not just status.** Add a *JSON Assertion* on the browse
   step checking that `meta.total` is greater than 0.
6. **Test the slow endpoint.** Build a tiny plan that hits
   `/api/slow?delay=1500` and confirm your reported response times reflect it.
7. **Test error handling.** Hit `/api/flaky?failRate=0.5` with 100 requests and
   observe the error % in the Summary Report. Add an assertion and see failures
   show up red in View Results Tree.
8. **Register unique users.** Use `${__threadNum}` and `${__time}` to register a
   unique username per thread, then log in as that user — a more realistic flow
   than everyone sharing the `demo` account.

## Common gotchas

- **Connection refused?** The API server isn't running. Start `start.bat` first.
- **401 errors on cart/checkout?** The login step failed or the token wasn't
  extracted — check the Login response in View Results Tree, and confirm the
  JSON Extractor variable name is `token`.
- **Don't load test in GUI mode.** Use the `-n` command line for anything beyond
  a handful of users; the GUI consumes resources and skews results.
