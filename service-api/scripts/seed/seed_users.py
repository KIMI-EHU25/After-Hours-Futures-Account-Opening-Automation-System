from __future__ import annotations

from pathlib import Path

from sqlalchemy import Connection, insert

from app.models.bussiness_models import User
from scripts.seed.seed_data import load_seed_data


def seed_users(connection: Connection, data_path: Path) -> dict[str, int]:
    data = load_seed_data(data_path)
    connection.execute(insert(User.__table__), data["users"])
    return {"users": len(data["users"])}
