# JS Injection Lab

A standalone two-page experiment to see how an Android WebView runs injected JavaScript and how filling behaves after navigation. It does not talk to service-api and does not exercise the real account-opening flow. The production script server is [service-js](../service-js/README.md).

## Start the Page Server

```bash
cd test_for_JsInject/http_server
python server.py
```

It listens on `0.0.0.0:8000`. `http://127.0.0.1:8000/` redirects to `/pages/index/index.html`. From a phone, use the computer's LAN address and make sure the firewall allows it.

## Start the Script Server

```bash
cd test_for_JsInject/js_server
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m uvicorn server:app --port 8001 --host 0.0.0.0
```

The app requests `http://<computer-ip>:8001/script.js` and receives the source of `download.js` (JavaScript, `no-store`).

These ports clash with the main project (service-api 8000, front end 8001). Stop those services or change the ports.

## Injection Logic

Downloading the script only fetches the code. The Android side still has to run it in the page, because the lab pages never request `/script.js` themselves.

`main_func()` in `js_server/download.js` shows a debug alert and calls `distinguish_by_pathname()`:

| Path | Target field |
| --- | --- |
| `/pages/index/index.html` | `input-index` |
| `/pages/second/second.html` | `input-second` |

The script waits for the DOM, then listens to `pushState`, `replaceState`, `popstate` and `hashchange` and reruns when the URL changes. The same URL is de-duplicated.

A full navigation or reload creates a new page context, and the script and its listeners are lost. The Android side must re-inject after every page load.

## What This Lab Showed

In earlier runs of the two-page navigation test, both inputs were filled correctly. That is a past result. It does not mean every current app, official page or navigation type has been verified.
