from __future__ import annotations

from pathlib import Path

from sqlalchemy import Connection, insert

from app.models.config_models import (
    addInfoTitle,
    chooseFuturesOption,
    chooseFuturesTitle,
    launderingBackOption,
    launderingBackTitle,
    questionOption,
    questionTitle,
)
from scripts.seed.seed_data import load_seed_data


def seed_question_config(connection: Connection, data_path: Path) -> dict[str, int]:
    data = load_seed_data(data_path)
    table_by_name = {
        "launderingbacktitles": launderingBackTitle.__table__,
        "launderingbackoptions": launderingBackOption.__table__,
        "addinfotitles": addInfoTitle.__table__,
        "questiontitles": questionTitle.__table__,
        "questionoptions": questionOption.__table__,
        "choosefuturestitles": chooseFuturesTitle.__table__,
        "choosefuturesoptions": chooseFuturesOption.__table__,
    }
    insertion_order = (
        "launderingbacktitles",
        "launderingbackoptions",
        "addinfotitles",
        "questiontitles",
        "questionoptions",
        "choosefuturestitles",
        "choosefuturesoptions",
    )
    for table_name in insertion_order:
        connection.execute(insert(table_by_name[table_name]), data[table_name])
    return {name: len(data[name]) for name in insertion_order}
