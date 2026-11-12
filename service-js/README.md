# service-js: Injection-Script Server

`service-js` is a small FastAPI server that hands out JavaScript. When a client calls the script endpoint, the server returns the source of `app/script/main.js`. The Android app downloads it and injects it into the official account-opening site it has loaded, which pre-fills the user's data.

The Android side owns loading the official site, fetching the script and running the injection. This directory provides the download endpoint and the page-filling logic.

## Script Endpoint

```http
GET /script/main.js
```

The response is JavaScript (not JSON) with `Content-Type: application/javascript; charset=utf-8`, `Content-Disposition: inline` and `Cache-Control: no-store`, served via `FileResponse`. The server only serves the code. It never runs it.

## Intended Flow

1. The user fills in their data on the simulated front end, which submits it to `service-api`.
2. The Android app loads the official account-opening site, `https://app5.cfmmc.com`.
3. The app requests `/script/main.js` and injects it into the page.
4. The script reads the user's saved data and fills the controls on whichever official page is showing.
5. Steps that need the user (ID/bank-card photos, video verification) stay manual.

Keep the two sources apart: **the data to fill comes from service-api, and the page and its controls come from the official site.** The script works the DOM, clicks options, updates the page's Vue instance state where needed, and waits for cascading options to load.

## Current Implementation

`main.js` runs on first load and whenever `pushState`, `replaceState`, `popstate` or `hashchange` fires, and dispatches on `location.pathname`:

| Official path | Data group | Content |
| --- | --- | --- |
| `/launderingBack` | `launderingBack` | AML questionnaire |
| `/addInfo` | `addInfo` | Supplementary account info |
| `/question` | `question` | Trader risk assessment |
| `/chooseFutures` | `chooseFutures` | Futures product selection |

Techniques used:

- **Native value setters plus synthetic `input`/`change` events**, so Vue's `v-model` picks up programmatic input.
- **Direct Vue 2 state updates** (`__vue__`, `$set`, `$nextTick`) for Vux date pickers and popup pickers.
- **Cascading-picker orchestration:** province → city and branch province → city → category → branch. The script calls the page's own change handlers and polls until the dependent option list contains the target value.
- **Re-querying the DOM on every step** so it never works on stale nodes after Vue re-renders, and **verifying after each click** that the checkbox or radio state actually changed.

Data is currently a hard-coded sample `const data` object (fictional). The addInfo keys match service-api (`p1`–`p23`), the other pages use `p<question number>`, and multi-select answers are letter strings such as `AC`. Debug alerts are still enabled.

## Reading Real Backend Data: Not Done Yet

**The script does not yet call service-api. It runs on the hard-coded sample data.** service-api already exposes `GET /api/jsinject/data?uid=<uid>`, protected by a temporary shared key. The planned design is for the Android app to fetch the user's own data with the user's credentials and pass it to the script, with no extra login on the official site. Never embed the shared key in a publicly downloadable script.

## Running Locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8002
```

On a real Android device, use an address the phone can reach. The phone's `127.0.0.1` is the phone itself.

## CORS

CORS currently allows all origins, methods and headers. That is a development setting. A native Android download is not subject to CORS, but an in-page `fetch()` is. CORS is not authentication.

## Files

| File | Purpose |
| --- | --- |
| `app/main.py` | FastAPI app, CORS, script endpoint |
| `app/script/main.js` | Route listener, sample data, page-filling logic |
| `requirements.txt` | Python dependencies |

The script depends on the official site's DOM and Vue component structure and has to be re-checked when that site changes. A successful download does not prove that the injection works inside the app. That still needs end-to-end checking on a device.
