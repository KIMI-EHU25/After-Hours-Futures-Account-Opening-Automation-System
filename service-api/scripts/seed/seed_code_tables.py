from __future__ import annotations

from pathlib import Path

from sqlalchemy import Connection, insert

from app.models.code_models import (
    CityCode,
    EducationalQualificationCode,
    OccupationCode,
    ProvinceCode,
)
from scripts.seed.seed_data import load_seed_data


def seed_code_tables(connection: Connection, data_path: Path) -> dict[str, int]:
    data = load_seed_data(data_path)
    table_by_name = {
        "provincecodes": ProvinceCode.__table__,
        "citycodes": CityCode.__table__,
        "occupationcodes": OccupationCode.__table__,
        "educationalqualificationcodes": EducationalQualificationCode.__table__,
    }
    insertion_order = (
        "provincecodes",
        "citycodes",
        "occupationcodes",
        "educationalqualificationcodes",
    )
    for table_name in insertion_order:
        connection.execute(insert(table_by_name[table_name]), data[table_name])
    return {name: len(data[name]) for name in insertion_order}
