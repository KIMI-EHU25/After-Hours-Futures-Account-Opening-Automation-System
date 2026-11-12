# service-api: Account-Opening Data Backend

`service-api` is built with FastAPI, SQLAlchemy and PostgreSQL. It handles user authentication, serves questionnaire and form configuration, stores the account-opening data and answers users submit, and returns the data used for page injection.

The simulated front end (`frontend/`) calls this service to collect data. `service-js` serves the script that the Android app injects into the official account-opening site; the step where that script reads real data from this service is still unfinished. This service does not inject anything into the official site and does not open real accounts.

## Directory Layout

| Path | Purpose |
| --- | --- |
| `app/main.py` | FastAPI entry point, router registration, CORS |
| `app/database.py` | DB engine, session factory, declarative base |
| `app/security.py` | Password hashing, access-token signing, refresh-token generation and hashing |
| `app/routers/` | HTTP routes and dependency wiring |
| `app/schemas/` | Request/response models and field validation |
| `app/cruds/` | Database reads/writes and business validation |
| `app/models/` | Users, answers, questionnaire config and code-table models |
| `app/dependencies/` | Current-user, admin-role and injection-key dependencies |
| `alembic/`, `alembic.ini` | Database migrations |
| `scripts/seed/` | Data reset and initialisation |
| `test/` | Node.js API smoke checks |
| `.env.example` | Environment-variable template |
| `api.md` | Detailed API reference (Chinese) |

## Environment and Configuration

You need Python, PostgreSQL and the packages in `requirements.txt`. Node.js is only needed for the scripts in `test/`.

From the `service-api` directory:

```bash
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt     # Windows: .\.venv\Scripts\python.exe
cp .env.example .env                                    # do not overwrite an existing .env
```

| Variable | Meaning |
| --- | --- |
| `DATABASE_URL` | e.g. `postgresql+psycopg://<username>:<password>@<host>:5432/postgres` |
| `SECRET_KEY` | JWT signing key; use a private random value |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access-token lifetime in minutes (positive integer) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh-token lifetime in days (positive integer) |
| `SEED_ADMIN_PASSWORD` | Password for the initial admin account; hashed with Argon2 when the seed script runs and never stored in the repository |
| `JS_INJECT_KEY` | Temporary shared key for the jsinject endpoint. It is separate from the JWT key and from user tokens, and is sent as a Bearer header. |

Configuration is loaded with python-dotenv, and the DB connection sets `search_path=openaccount`. Never commit a real `.env`, password or token.

## Migrations and Initialisation

The project uses the `openaccount` schema inside the `postgres` database. Migrations do not create the schema, so a privileged user must run this once:

```sql
CREATE SCHEMA IF NOT EXISTS openaccount;
```

Then:

```bash
alembic upgrade head
alembic current
```

The current head is `c70cdb6870d2`. The Alembic version table is `openaccount.alembic_version`.

To reset the initial data:

```bash
python -m scripts.seed.seed_all
```

**The seed script truncates every model table: users, answers, refresh tokens and config. It also resets identity sequences, then imports the initial admin, questionnaire config and code tables. It is not an incremental update and is not part of normal start-up.** By default you have to type `TRUNCATE openaccount` to confirm. See the [seed README](scripts/seed/README.md).

## Running the Server

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

To reach it from a phone on the LAN, use `--host 0.0.0.0`.

CORS currently allows every origin, method and header (`allow_credentials=True`). That is a development setting and must be tightened before production. CORS is a browser policy: it is not authentication and does not stop native or Node.js clients.

## Endpoints and Authentication

Full request/response details are in [api.md](api.md).

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | none | Register a regular user |
| POST | `/api/auth/login` | none | Log in and receive both tokens |
| POST | `/api/auth/refresh` | refresh token in body | Get a new access token |
| POST | `/api/auth/logout` | access token + refresh token in body | Deactivate the current refresh token |
| GET | `/api/launderingBack/config` | none | AML questionnaire config |
| POST | `/api/launderingBack/answer` | access token | Submit AML answers |
| GET | `/api/addInfo/config` | none | Supplementary-info field config |
| POST | `/api/addInfo/answer` | access token | Submit supplementary info |
| GET | `/api/question/config` | none | Risk-assessment config |
| POST | `/api/question/answer` | access token | Submit risk-assessment answers |
| GET | `/api/chooseFutures/config` | none | Futures-selection config |
| POST | `/api/chooseFutures/answer` | access token | Submit futures selection |
| GET | `/api/code/province` | none | Province codes |
| GET | `/api/code/city` | none | City codes |
| GET | `/api/code/occupation` | none | Occupation codes |
| GET | `/api/code/educationalqualification` | none | Education codes |
| GET | `/api/jsinject/data?uid=<uid>` | injection shared key | Latest answers of all four kinds for a user |

Login returns `access_token`, `refresh_token` and `token_type`. The access token is a JWT holding the user ID and expiry. The database stores only a **hash** of the refresh token, plus its owner, expiry and active flag.

- **refresh** needs a valid, unexpired, active refresh token. It returns only a new access token and does not rotate the refresh token.
- **logout** checks that the refresh token belongs to the access-token user and is still valid, then marks it inactive. Access tokens already issued stay valid until they expire, so clients should always clear both tokens locally.
- The four answer endpoints take the `uid` from the access token. Clients do not send a `uid`. Each submission inserts a new row, and jsinject returns the newest row per page.

## addInfo Field Convention

Supplementary-info keys and columns are `p1`–`p23`. The config endpoint returns `field_id`, a display `field_name` (Chinese) and a `type`. The front end shows the name and submits `p${field_id}`.

Validation covers: ID-card format, embedded birth date and check digit; phone, postcode and email; long-term-validity ↔ date-range consistency; intermediary-field dependencies; province ↔ city matching; and valid occupation/education codes. See `app/schemas/addInfo_schemas.py` and `app/cruds/addInfo_cruds.py`.

## jsinject: Open Items

```http
GET /api/jsinject/data?uid=<uid>
Authorization: Bearer <JS_INJECT_KEY>
```

A wrong key returns `403`. A missing or non-Bearer header is rejected by FastAPI's `HTTPBearer`. An unknown user returns `404`, and pages the user has not submitted come back as `null`.

The shared key only guards the entry point. It does not tie the caller to the `uid`. The planned design is for the Android app to authenticate as the user and fetch only that user's own data, with the server taking the user from the access token. **Never ship the shared key inside a public page or script.**

## Smoke Checks

`test/` uses Node.js to call a running backend. It only exercises preset requests and basic flows; see the [test README](test/README.md). **`test/run.ps1` runs the seed (which resets the database) before it registers users and submits answers.**
