from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import Connection, insert

from app.models.bussiness_models import User
from app.security import password_hash
from scripts.seed.seed_data import load_seed_data


def _admin_password() -> str:
    load_dotenv()
    password = os.environ.get("SEED_ADMIN_PASSWORD", "")
    if len(password) < 8:
        raise RuntimeError(
            "Set SEED_ADMIN_PASSWORD (at least 8 characters) in .env before seeding."
        )
    return password


def seed_users(connection: Connection, data_path: Path) -> dict[str, int]:
    data = load_seed_data(data_path)
    hashed_password = password_hash.hash(_admin_password())
    rows = [
        {**user, "user_hashed_password": hashed_password}
        for user in data["users"]
    ]
    connection.execute(insert(User.__table__), rows)
    return {"users": len(rows)}
