# After-Hours Futures Account Opening Automation System

> **Portfolio project, view only.** This repository is published so people can look at my work. It is **not** open source. All rights reserved; see [LICENSE](LICENSE).

This system speeds up opening a **futures trading account** (night-session trading, "夜盘开户") through the official CFMMC mobile web flow. Users fill in their personal information, anti-money-laundering answers, risk questionnaire and product choices **once**, on a simulated account-opening site. An Android app then loads the official account-opening website and **injects JavaScript** that fills each official page with the saved answers. Only the steps that legally need the user (ID card photos, bank card upload, video verification, signing agreements) are left for them to do by hand.

I built this during an internship. My part covers the backend API, the simulated front end, the injection-script service and the injection experiments. The Android container app that runs the script was built by another team member.

---

## Highlights

- **FastAPI + PostgreSQL backend** with a layered layout (routers → schemas → CRUD → models), SQLAlchemy 2.0 typed models and **11 Alembic migrations**.
- **Full auth flow:** Argon2 password hashing, short-lived **JWT access tokens**, long-lived **refresh tokens stored only as SHA-256 hashes**, refresh and logout endpoints, and an admin-role dependency.
- **Strict validation of Chinese ID data:** an 18-digit ID-card checksum (ISO 7064 MOD 11-2), embedded birth date, phone/postcode/email formats, linked date ranges, province ↔ city matching, and occupation/education code lookups.
- **Config-driven questionnaires:** questions, options and score values live in the database, and the front end renders them dynamically.
- **DOM/Vue injection engine** (`service-js/app/script/main.js`, ~800 lines) that drives a third-party Vue 2 + Vant/Vux SPA it does not control. It hooks the History API to follow SPA routing, writes into Vue reactive state (`$set`, `$nextTick`), uses native value setters plus synthetic events, and waits on cascading async pickers (province → city → branch).
- **Dependency-free front end:** vanilla ES Modules, with automatic access-token refresh, single-flight refresh shared by concurrent requests, and one retry on `401`.
- **Safe data reset tooling:** the seed script checks the target DB, schema and Alembic head, asks for typed confirmation, and runs inside a single transaction.

---

## Architecture

```text
┌────────────────────────┐   register / login / submit answers   ┌──────────────────────────┐
│  frontend/             │ ─────────────── HTTP + JSON ────────▶ │  service-api/  (FastAPI) │
│  Simulated account-    │ ◀──────── JWT access + refresh ────── │  auth · config · answers │
│  opening site (HTML/JS)│                                       │  code tables · jsinject  │
└────────────────────────┘                                       └────────────┬─────────────┘
                                                                              │ SQLAlchemy + psycopg
                                                                              ▼
                                                                ┌──────────────────────────┐
                                                                │ PostgreSQL               │
                                                                │ schema: openaccount      │
                                                                │ (17 tables + alembic)    │
                                                                └──────────────────────────┘
                                                                              ▲
                                    GET /api/jsinject/data?uid=…              │ latest answers
┌────────────────────────┐          (shared key, planned: user token)         │
│  Android APK (WebView) │ ───────────────────────────────────────────────────┘
│  loads official site   │
│  app5.cfmmc.com        │ ── GET /script/main.js ──▶ ┌──────────────────────────┐
│  and injects script    │ ◀──── JavaScript source ── │ service-js/  (FastAPI)   │
└────────────────────────┘                            │ serves the injection JS  │
                                                      └──────────────────────────┘
```

| Module | What it does |
| --- | --- |
| [`frontend/`](frontend) | Simulated account-opening site in vanilla HTML/CSS/JS (ES Modules). Collects every answer the official flow will ask for. |
| [`service-api/`](service-api) | FastAPI business backend: authentication, questionnaire configuration, answer storage, code tables, and the data endpoint for injection. ([README](service-api/README.md), [API reference, Chinese](service-api/api.md)) |
| [`service-js/`](service-js) | Small FastAPI server that hands the injection script to the Android app. ([README](service-js/README.md)) |
| [`service-api/scripts/seed/`](service-api/scripts/seed) | Resets the schema and loads the initial admin, questionnaire config and code tables. ([README](service-api/scripts/seed/README.md)) |
| [`service-api/test/`](service-api/test) | Node.js end-to-end smoke checks against a running API. ([README](service-api/test/README.md)) |
| [`test_for_JsInject/`](test_for_JsInject) | Standalone two-page lab for proving WebView injection survives SPA navigation. ([README](test_for_JsInject/README.md)) |
| [`docs/`](docs) | Reference material (Chinese): DB schema, field list, scoring rules, region/occupation/education code tables, official page paths. |

---

## End-to-End System Flow

### Phase 1: Collect data on the simulated site

```text
Home (register / log in)
  → Anti-money-laundering questionnaire   (launderingBack, 9 questions)
  → Supplementary personal info           (addInfo, 23 fields p1–p23)
  → Trader risk assessment                (question, 14 scored questions)
  → Futures product selection             (chooseFutures)
  → Result page                           (dataprint: shows what was saved)
```

1. **Register:** `POST /api/auth/register` with phone, ID number and password. The password is hashed with Argon2. Phone and ID number must be unique (`409` on conflict).
2. **Log in:** `POST /api/auth/login` returns:
   - an **access token**: an HS256 JWT holding `sub = uid` and an expiry.
   - a **refresh token**: 32 random bytes. Only its SHA-256 hash is stored in `refreshtokens`, with an expiry and an `is_active` flag.
   The browser keeps both tokens in `sessionStorage` (never the password).
3. **Load each page's config:** for example `GET /api/addInfo/config` and `GET /api/question/config`. Questions, options and field labels come from the database, so the forms are generated rather than hard-coded. Dropdowns use `GET /api/code/province | city | occupation | educationalqualification`.
4. **Submit answers:** `POST /api/<page>/answer` with `Authorization: Bearer <access_token>`. The server takes the `uid` **from the token, not from the request body**. It validates the payload (Pydantic schema plus CRUD-level business checks) and inserts a new row. Every submission is kept, and the latest `serial_number` wins.
5. **Token lifecycle:** when a protected call returns `401`, the front end calls `POST /api/auth/refresh` once and retries. Concurrent requests share one in-flight refresh. `POST /api/auth/logout` deactivates the current refresh token, and the client always clears its local session.

### Phase 2: Fill the official site automatically

6. The **Android app** opens the official account-opening site (`https://app5.cfmmc.com`) in a WebView.
7. It downloads the script from **service-js**: `GET /script/main.js`, served as `application/javascript` with `Cache-Control: no-store`.
8. It gets the user's saved data from **service-api**: `GET /api/jsinject/data?uid=<uid>`. The response holds the latest record from each of the four answer tables.
9. The injected script **watches SPA navigation** by wrapping `history.pushState` / `replaceState` and listening for `popstate` / `hashchange`. It routes on `location.pathname`:

| Official page | Path | Script behaviour |
| --- | --- | --- |
| Login / phone verification | `/canahartaLogin` | Fills the ID field (test helper) |
| ID card upload | `/idcardUpload` | User action |
| AML questionnaire | `/launderingBack` | Clicks single- and multi-select Vant/WeUI checkboxes |
| Supplementary info | `/addInfo` | Text fields, dates, long-term-ID checkbox, cascading pickers (province → city, branch province → city → category → branch), occupation, education, intermediary radio |
| Bank card | `/settleBank` | User action |
| Trader type | `/appropriate` | User action |
| Risk assessment | `/question` | Waits for 14 async radio groups, then selects by question number and option letter |
| Risk result chart | `/echarts` | User action |
| Product selection | `/chooseFutures` | Waits for options to load, then toggles commodity-futures checkboxes and checks each one stuck |
| Agreements / video | `/agreement`, `/video` | User action (end of flow) |

10. The user finishes the steps that need them in person, and the account application is submitted on the official site.

### Data model (simplified)

```text
users ─┬─< launderingbackanswers   (p1–p9)
       ├─< addinfoanswers          (p1–p23)
       ├─< questionanswers         (p1–p14)
       ├─< choosefuturesanswers    (p1)
       └─< refreshtokens           (token_hash, expires_at, is_active)

launderingbacktitles ─< launderingbackoptions
questiontitles       ─< questionoptions (with scores)
choosefuturestitles  ─< choosefuturesoptions
addinfotitles
provincecodes ─< citycodes        occupationcodes        educationalqualificationcodes
```

All tables live in the `openaccount` schema of the `postgres` database. Field-level details are in [docs/数据库表结构.md](docs/数据库表结构.md) (Chinese).

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Front end | HTML5, CSS3, vanilla JavaScript (ES Modules), `fetch`, `sessionStorage` |
| Backend | Python, FastAPI, Uvicorn, Pydantic v2 |
| Database | PostgreSQL, SQLAlchemy 2.0 (typed `Mapped[]` models), psycopg 3, Alembic |
| Security | PyJWT (HS256), pwdlib + Argon2, SHA-256 hashed refresh tokens, `HTTPBearer` |
| Injection | Browser DOM APIs, History API hooks, Vue 2 instance manipulation, Vant/Vux components |
| Tooling | Node.js smoke-test scripts, PowerShell runner, python-dotenv |

---

## API Overview

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | none | Register a user |
| POST | `/api/auth/login` | none | Get access and refresh tokens |
| POST | `/api/auth/refresh` | refresh token (body) | Get a new access token |
| POST | `/api/auth/logout` | access token + refresh token | Deactivate the session |
| GET | `/api/{launderingBack,addInfo,question,chooseFutures}/config` | none | Questionnaire / form configuration |
| POST | `/api/{launderingBack,addInfo,question,chooseFutures}/answer` | access token | Submit answers |
| GET | `/api/code/{province,city,occupation,educationalqualification}` | none | Code tables for dropdowns |
| GET | `/api/jsinject/data?uid=` | shared injection key | Latest answers for injection |
| GET | `/script/main.js` (service-js) | none | Injection script source |

---

## Running Locally

**Requirements:** Python 3.10+, PostgreSQL, and Node.js 18+ (only for the smoke tests).

```bash
# 1. Backend
cd service-api
python -m venv .venv && source .venv/bin/activate      # Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                    # fill in DATABASE_URL, SECRET_KEY, JS_INJECT_KEY, SEED_ADMIN_PASSWORD, token lifetimes
psql -c "CREATE SCHEMA IF NOT EXISTS openaccount;"      # once, as a privileged user
alembic upgrade head
python -m scripts.seed.seed_all                         # WARNING: truncates all project tables
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 2. Simulated front end (from the repository root)
python -m http.server 8001 --bind 127.0.0.1 --directory frontend
# open http://127.0.0.1:8001/index/index.html

# 3. Injection-script server
cd service-js && pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8002
```

The ports (API 8000, front end 8001, script server 8002) are conventions and can be changed. To use the front end from a phone, bind to `0.0.0.0` and open the computer's LAN address.

---

## Project Status and Known Limitations

I'm stating these openly because this was a work in progress when my internship ended:

- The injection script still uses **hard-coded sample data**. The `/api/jsinject/data` endpoint is built, but wiring it into the Android app is unfinished.
- `/api/jsinject/data` is protected by a **temporary shared key**. Anyone with the key can read any `uid`. The planned design is for the Android app to authenticate as the user and fetch only that user's own data.
- CORS is wide open (`*`) for development and must be locked down before production.
- The injection logic depends on the official site's DOM and Vue structure, so it has to be re-checked whenever that site changes.
- The Node.js scripts in `service-api/test/` are smoke checks, not a full automated test suite.

All personal data in this repository (names, ID numbers, addresses, phone numbers) is **fictional sample data**.

---

## License

Copyright © 2026 Kimi Hu. **All rights reserved.** You may view this code for evaluation (for example, recruiting). You may not copy, modify, distribute or use it. See [LICENSE](LICENSE).
