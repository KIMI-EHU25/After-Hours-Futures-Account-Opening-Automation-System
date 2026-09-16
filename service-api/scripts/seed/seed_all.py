from __future__ import annotations

import argparse
from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory
from sqlalchemy import Connection, inspect, text

from app.database import Base, engine
from app.models import bussiness_models, code_models, config_models  # noqa: F401
from scripts.seed.seed_code_tables import seed_code_tables
from scripts.seed.seed_question_config import seed_question_config
from scripts.seed.seed_users import seed_users


PROJECT_ROOT = Path(__file__).resolve().parents[2]
SEED_DATA_PATH = Path(__file__).resolve().with_name("seed_data.json")
SCHEMA = "openaccount"


def _expected_alembic_head() -> str:
    config = Config(str(PROJECT_ROOT / "alembic.ini"))
    script = ScriptDirectory.from_config(config)
    heads = script.get_heads()
    if len(heads) != 1:
        raise RuntimeError(f"要求 Alembic 只有一个 head，实际为：{heads}")
    return heads[0]


def _read_target_state(connection: Connection) -> dict[str, object]:
    row = connection.execute(
        text(
            "SELECT current_database(), current_schema(), current_user, "
            "inet_server_addr()::text, inet_server_port()"
        )
    ).one()
    return {
        "database": row[0],
        "schema": row[1],
        "user": row[2],
        "server_address": row[3] or engine.url.host or "local socket",
        "server_port": row[4] or engine.url.port,
    }


def _validate_database(connection: Connection) -> tuple[dict[str, object], str]:
    target = _read_target_state(connection)
    if target["database"] != "postgres":
        raise RuntimeError(f"拒绝初始化非 postgres 数据库：{target['database']}")
    if target["schema"] != SCHEMA:
        raise RuntimeError(
            f"当前 schema 是 {target['schema']!r}，期望通过 search_path 连接到 {SCHEMA!r}"
        )

    expected_head = _expected_alembic_head()
    current_heads = connection.execute(
        text(f'SELECT version_num FROM "{SCHEMA}".alembic_version')
    ).scalars().all()
    if current_heads != [expected_head]:
        raise RuntimeError(
            f"数据库 Alembic revision={current_heads}，代码 head={expected_head}；"
            "请先执行 alembic upgrade head"
        )

    expected_tables = {table.name for table in Base.metadata.tables.values()}
    actual_tables = set(inspect(connection).get_table_names(schema=SCHEMA))
    missing_tables = sorted(expected_tables - actual_tables)
    if missing_tables:
        raise RuntimeError("数据库缺少模型表：" + ", ".join(missing_tables))

    return target, expected_head


def _truncate_model_tables(connection: Connection) -> None:
    tables = list(Base.metadata.sorted_tables)
    if not tables:
        raise RuntimeError("SQLAlchemy metadata 中没有模型表")
    if any(table.schema != SCHEMA for table in tables):
        raise RuntimeError("检测到 openaccount 之外的模型表，拒绝执行清空")

    preparer = connection.dialect.identifier_preparer
    table_list = ", ".join(preparer.format_table(table) for table in tables)
    connection.execute(text(f"TRUNCATE TABLE {table_list} RESTART IDENTITY CASCADE"))


def _sync_sequence(connection: Connection, table_name: str, column_name: str) -> None:
    qualified_table = f"{SCHEMA}.{table_name}"
    connection.execute(
        text(
            "SELECT setval("
            "pg_get_serial_sequence(:table_name, :column_name), "
            f'COALESCE((SELECT MAX("{column_name}") FROM "{SCHEMA}"."{table_name}"), 1), '
            "true)"
        ),
        {"table_name": qualified_table, "column_name": column_name},
    )


def _verify_counts(connection: Connection, expected_counts: dict[str, int]) -> None:
    for table_name, expected_count in sorted(expected_counts.items()):
        actual_count = connection.execute(
            text(f'SELECT COUNT(*) FROM "{SCHEMA}"."{table_name}"')
        ).scalar_one()
        if actual_count != expected_count:
            raise RuntimeError(
                f"表 {table_name} 行数校验失败：期望 {expected_count}，实际 {actual_count}"
            )

    seeded_tables = set(expected_counts)
    for table in Base.metadata.tables.values():
        if table.name in seeded_tables:
            continue
        actual_count = connection.execute(
            text(f'SELECT COUNT(*) FROM "{SCHEMA}"."{table.name}"')
        ).scalar_one()
        if actual_count != 0:
            raise RuntimeError(f"未初始化表 {table.name} 清空后仍有 {actual_count} 行")


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="清空 openaccount 的全部模型表并导入配置初始数据。"
    )
    parser.add_argument(
        "--yes",
        action="store_true",
        help="跳过交互确认；仅应在已核对数据库目标的自动化环境中使用。",
    )
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    if not SEED_DATA_PATH.is_file():
        raise FileNotFoundError(f"找不到初始化数据文件：{SEED_DATA_PATH}")

    # Validate every JSON row before requesting destructive confirmation.
    from scripts.seed.seed_data import load_seed_data

    load_seed_data(SEED_DATA_PATH)

    with engine.connect() as connection:
        target, head = _validate_database(connection)

    print("即将初始化数据库：")
    print(f"  server   = {target['server_address']}:{target['server_port']}")
    print(f"  database = {target['database']}")
    print(f"  schema   = {target['schema']}")
    print(f"  user     = {target['user']}")
    print(f"  revision = {head}")
    print(
        f"  action   = 清空全部 {len(Base.metadata.tables)} 张模型表并重新导入配置数据和初始化用户"
    )

    confirmation = f"TRUNCATE {SCHEMA}"
    if not args.yes:
        entered = input(f"请输入 {confirmation!r} 继续：").strip()
        if entered != confirmation:
            print("输入不匹配，已取消，数据库未修改。")
            return

    with engine.begin() as connection:
        _truncate_model_tables(connection)
        counts: dict[str, int] = {}
        counts.update(seed_users(connection, SEED_DATA_PATH))
        counts.update(seed_code_tables(connection, SEED_DATA_PATH))
        counts.update(seed_question_config(connection, SEED_DATA_PATH))

        _sync_sequence(connection, "users", "uid")
        _sync_sequence(connection, "launderingbacktitles", "question_code")
        _sync_sequence(connection, "addinfotitles", "field_id")
        _sync_sequence(connection, "questiontitles", "question_code")
        _sync_sequence(connection, "choosefuturestitles", "question_code")
        _verify_counts(connection, counts)

    print("初始化完成：")
    for table_name, count in sorted(counts.items()):
        print(f"  {table_name}: {count}")


if __name__ == "__main__":
    main()
