# service-api Smoke Checks

These scripts use Node.js's built-in `fetch()` to call a running FastAPI backend. They give a quick development check that the endpoints respond and that the basic flows work: register, log in, refresh, submit answers, log out and read back data.

**This is not a production acceptance suite.** Passing every script does not mean the system is ready for production.

## Scope

Each script sends one preset request, checks that the HTTP status is successful and parses the response. Most print the response. The jsinject script writes it to a JSON file instead. On failure a script prints the error and exits non-zero, which stops `run.ps1`.

Not covered: invalid input, edge cases, the full permission rules, concurrency, performance, security, or what actually ends up in the database. "All commands successfully completed." means only that the preset requests passed these basic checks.

## Files

| File / directory | Purpose |
| --- | --- |
| `main.js` | Base URL (`http://127.0.0.1:8000`); not the runner |
| `run.ps1` | Seeds the DB, then runs every check in order |
| `auth_test/` | Register, login, refresh, logout |
| `launderingBack_test/` | Read AML config, submit AML answers |
| `addInfo_test/` | Read addInfo config, submit `p1`–`p23` |
| `question_test/` | Read risk-assessment config, submit answers |
| `chooseFutures_test/` | Read futures-selection config, submit answers |
| `code_test/` | Read province, city, occupation and education codes |
| `jsinject_test/` | Read a user's injection data and save it to `jsinject_data.json` |
| `utils/token_file.js` | Read/write the local access and refresh tokens |
| `test_token.json` | Local token file (git-ignored) |
| `jsinject_data.json` | Last jsinject response (git-ignored) |

## Order of Execution

`run.ps1` runs these steps in order:

1. Seeds the database (`scripts.seed.seed_all`).
2. Reads the four page configs and the four code tables.
3. Registers a test user, logs in and refreshes the access token.
4. Submits all four kinds of answers.
5. Logs out.
6. Reads the jsinject data and saves it to `test/jsinject_data.json`.

The test user is phone `13900000000` (fictional). Its password is read from the `TEST_USER_PASSWORD` environment variable (at least 8 characters), so set it before running the auth scripts. It is a different account from the seeded admin.

Login saves both tokens to `test_token.json`. Refresh updates the access token and keeps the refresh token. The answer scripts send `Authorization: Bearer <access_token>` and leave `uid` out of the body. Logout sends both tokens and then sets the local values to `"None"`.

## jsinject

```http
GET /api/jsinject/data?uid=2
Authorization: Bearer <JS_INJECT_KEY>
```

`uid=2` assumes a fresh seed: the admin is 1, so the registered test user is usually 2. The key in the script is a placeholder. Replace it with the value of `JS_INJECT_KEY` in your `.env` (moving this to an environment variable is a planned improvement). Because the shared key is not tied to a session, the read still works after logout.

The output file is only written when the request succeeds and the JSON parses, so an old file does not prove that the latest run succeeded.

## Usage

You need Node.js with built-in `fetch()`, the Python dependencies, a configured and migrated database, and the API running.

**A batch run resets the database first.** From `service-api`:

```powershell
.\test\run.ps1
```

You can also run a single check:

```bash
node test/launderingBack_test/get_launderingBack_config.js
```

Single scripts do not seed, but register, login, answer and logout still write to the database and to the local token file. The scripts depend on each other, so prepare the data and login state each one needs.
