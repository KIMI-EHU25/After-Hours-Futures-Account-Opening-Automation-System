from __future__ import annotations

import json
from pathlib import Path
from typing import Any


EXPECTED_COLUMNS: dict[str, set[str]] = {
    "users": {"uid", "user_phone", "user_id"},
    "launderingbacktitles": {"question_code", "type", "title"},
    "launderingbackoptions": {"question_code", "option", "optiontext"},
    "addinfotitles": {"field_id", "field_name", "type"},
    "questiontitles": {"question_code", "type", "title"},
    "questionoptions": {"question_code", "option", "optiontext", "value"},
    "choosefuturestitles": {"question_code", "type", "title"},
    "choosefuturesoptions": {"question_code", "option", "optiontext"},
    "provincecodes": {"province_code", "name"},
    "citycodes": {"city_code", "province_code", "name"},
    "occupationcodes": {"occupation_code", "name"},
    "educationalqualificationcodes": {"educationalqualification_code", "name"},
}

EXPECTED_COUNTS = {
    "users": 1,
    "launderingbacktitles": 9,
    "launderingbackoptions": 33,
    "addinfotitles": 25,
    "questiontitles": 14,
    "questionoptions": 57,
    "choosefuturestitles": 1,
    "choosefuturesoptions": 4,
    "provincecodes": 31,
    "citycodes": 450,
    "occupationcodes": 38,
    "educationalqualificationcodes": 4,
}


def _assert_unique(
    rows: list[dict[str, Any]],
    table_name: str,
    key_columns: tuple[str, ...],
) -> None:
    keys = [tuple(row[column] for column in key_columns) for row in rows]
    if len(keys) != len(set(keys)):
        raise ValueError(f"初始化数据表 {table_name} 的键 {key_columns} 存在重复值")


def _validate_references(data: dict[str, list[dict[str, Any]]]) -> None:
    relationships = (
        ("launderingbackoptions", "launderingbacktitles", "question_code"),
        ("questionoptions", "questiontitles", "question_code"),
        ("choosefuturesoptions", "choosefuturestitles", "question_code"),
        ("citycodes", "provincecodes", "province_code"),
    )
    for child_name, parent_name, column_name in relationships:
        parent_values = {row[column_name] for row in data[parent_name]}
        missing = {
            row[column_name]
            for row in data[child_name]
            if row[column_name] not in parent_values
        }
        if missing:
            raise ValueError(
                f"初始化数据表 {child_name}.{column_name} 引用了不存在的值："
                f"{sorted(missing)}"
            )


def load_seed_data(path: Path) -> dict[str, list[dict[str, Any]]]:
    """读取并校验完整、自包含的 JSON 初始化数据。"""
    try:
        raw_data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"初始化数据 JSON 格式错误：{exc}") from exc

    if not isinstance(raw_data, dict):
        raise ValueError("初始化数据 JSON 根节点必须是对象")
    if set(raw_data) != set(EXPECTED_COLUMNS):
        missing = sorted(set(EXPECTED_COLUMNS) - set(raw_data))
        extra = sorted(set(raw_data) - set(EXPECTED_COLUMNS))
        raise ValueError(f"初始化数据表集合不匹配：缺少={missing}，多余={extra}")

    data: dict[str, list[dict[str, Any]]] = {}
    for table_name, expected_columns in EXPECTED_COLUMNS.items():
        rows = raw_data[table_name]
        if not isinstance(rows, list) or not all(isinstance(row, dict) for row in rows):
            raise ValueError(f"初始化数据表 {table_name} 必须是对象数组")
        if len(rows) != EXPECTED_COUNTS[table_name]:
            raise ValueError(
                f"初始化数据表 {table_name} 行数错误："
                f"期望 {EXPECTED_COUNTS[table_name]}，实际 {len(rows)}"
            )
        for index, row in enumerate(rows, start=1):
            if set(row) != expected_columns:
                raise ValueError(
                    f"初始化数据表 {table_name} 第 {index} 行字段不匹配："
                    f"期望 {sorted(expected_columns)}，实际 {sorted(row)}"
                )
        data[table_name] = rows

    unique_keys = {
        "users": ("uid",),
        "launderingbacktitles": ("question_code",),
        "launderingbackoptions": ("question_code", "option"),
        "addinfotitles": ("field_id",),
        "questiontitles": ("question_code",),
        "questionoptions": ("question_code", "option"),
        "choosefuturestitles": ("question_code",),
        "choosefuturesoptions": ("question_code", "option"),
        "provincecodes": ("province_code",),
        "citycodes": ("city_code",),
        "occupationcodes": ("occupation_code",),
        "educationalqualificationcodes": ("educationalqualification_code",),
    }
    for table_name, key_columns in unique_keys.items():
        _assert_unique(data[table_name], table_name, key_columns)
    _assert_unique(data["users"], "users", ("user_id",))
    _validate_references(data)
    return data
