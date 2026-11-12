# OpenAccount Seed Script

`seed_all.py` resets the project data in an existing database. It truncates every model table in the `openaccount` schema, then loads the initial user, questionnaire configuration and code tables from `seed_data.json` in the same directory.

**This wipes all existing users, answers and refresh tokens. It is not an incremental import.**

## What Gets Loaded

All 17 tables defined by the SQLAlchemy models are truncated with `TRUNCATE ... RESTART IDENTITY CASCADE`. **Identity sequences are reset**, and `CASCADE` also clears any other table that depends on them through a foreign key. `alembic_version` is left alone.

| Content | Table | Rows |
| --- | --- | ---: |
| Initial admin user | `users` | 1 |
| AML questions | `launderingbacktitles` | 9 |
| AML options | `launderingbackoptions` | 33 |
| Supplementary-info fields | `addinfotitles` | 23 |
| Risk-assessment questions | `questiontitles` | 14 |
| Risk-assessment options and scores | `questionoptions` | 57 |
| Futures-selection question | `choosefuturestitles` | 1 |
| Futures-selection options | `choosefuturesoptions` | 4 |
| Province codes | `provincecodes` | 31 |
| City codes | `citycodes` | 450 |
| Occupation codes | `occupationcodes` | 38 |
| Education codes | `educationalqualificationcodes` | 4 |

The initial user has `is_admin = true`. Its password comes straight from the existing `user_hashed_password` in the JSON and is not re-hashed. addInfo fields use `field_id` 1–23, which map to the submission keys `p1`–`p23`. The four answer tables and `refreshtokens` start empty.

## Initial Admin Login (local development only)

- Phone (`user_phone`): `13800000000`
- Password: `<password>`
- `is_admin`: `true`

The JSON stores only the Argon2 hash. This is a throwaway development credential and must never be used in a real deployment.

## Pre-flight Checks

Before it touches anything, the script checks that:

- `seed_data.json` exists and its table set, columns and row counts match the definitions in `seed_data.py`;
- there are no duplicate keys, option → question and city → province references are valid, and addInfo field IDs are contiguous;
- it is connected to the `postgres` database with `openaccount` as the current schema;
- there is exactly one local Alembic head, and the database is at that version;
- every model table exists.

The script does not create the database, schema or tables, and does not run migrations.

## Usage

From the `service-api` directory:

```bash
python -m scripts.seed.seed_all
```

It prints the server, database, schema, user and migration version, then waits for you to type:

```text
TRUNCATE openaccount
```

Anything else cancels. Automated environments that have already checked the target can skip the prompt (the data and DB checks still run):

```bash
python -m scripts.seed.seed_all --yes
```

The truncate, the import and the row-count checks all run in **one transaction**, so any error rolls everything back. The script also syncs identity sequences and checks that tables it did not seed are empty.

## Files

| File | Role |
| --- | --- |
| `seed_all.py` | Entry point: target checks, confirmation, truncate, import, sequence sync, verification |
| `seed_data.json` | Self-contained initial data |
| `seed_data.py` | Loads and validates the JSON |
| `seed_users.py` | Imports the initial user |
| `seed_code_tables.py` | Imports province/city, occupation and education codes |
| `seed_question_config.py` | Imports questions, options, scores and addInfo field config |

The three import modules are called by `seed_all.py` and share its connection and transaction. If you change the initial data, update the validation definitions in `seed_data.py` to match.
