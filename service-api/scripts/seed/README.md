# OpenAccount 项目 seed 脚本

`seed_all.py` 用于重置已有数据库中的项目数据：清空 `openaccount` 下全部模型表，再从同目录的 `seed_data.json` 导入初始用户、问卷配置和基础代码数据。

**执行后，原有用户、问卷答案和 Refresh Token 都会被清空。该脚本不是增量导入工具。**

## 初始化内容

目前直接清空的范围是 SQLAlchemy 模型定义的 17 张表，包括用户表、四张答案表、Refresh Token 表、问卷配置表和基础代码表。清空使用 `TRUNCATE ... RESTART IDENTITY CASCADE`，**会重置自增编号**；`CASCADE` 还会清空通过外键依赖这些表的其他表。`alembic_version` 不在模型表清空列表中。

随后导入以下数据：

| 内容 | 表 | 当前行数 |
| --- | --- | ---: |
| 初始管理员用户 | `users` | 1 |
| 反洗钱题目 | `launderingbacktitles` | 9 |
| 反洗钱选项 | `launderingbackoptions` | 33 |
| 补充资料字段配置 | `addinfotitles` | 23 |
| 风险测评题目 | `questiontitles` | 14 |
| 风险测评选项及分值 | `questionoptions` | 57 |
| 期货选择题目 | `choosefuturestitles` | 1 |
| 期货选择选项 | `choosefuturesoptions` | 4 |
| 省份代码 | `provincecodes` | 31 |
| 城市代码 | `citycodes` | 450 |
| 职业代码 | `occupationcodes` | 38 |
| 学历代码 | `educationalqualificationcodes` | 4 |

初始用户的 `is_admin` 为 `true`，密码直接使用 JSON 中已有的 `user_hashed_password`，导入时不会重新生成密码哈希。补充资料配置使用中文 `field_name`，`field_id` 为 1 至 23，对应答案提交键名 `p1` 至 `p23`。

四张答案表和 `refreshtokens` 不导入初始记录，初始化完成后保持为空。

## 初始管理员登录信息

当前 `seed_data.json` 中初始管理员对应的登录信息为：

- 手机号（`user_phone`）：`13800000000`
- 明文密码（`user_password`）：`<password>`
- 管理员标记（`is_admin`）：`true`

JSON 只保存密码哈希，不保存明文密码；上述密码已通过本地 Argon2 校验，与当前 JSON 中的哈希匹配。这是重新初始化后该账号的登录信息，如果数据库中的密码后来被修改，则以实际数据库为准。修改种子用户或密码哈希时，应同步更新本节。

## 执行前检查

脚本会先检查：

- `seed_data.json` 是否存在，JSON 表集合、每行字段和行数是否符合 `seed_data.py` 中的定义。
- 指定键是否重复，选项与题目、城市与省份的引用是否有效，addInfo 字段编号是否按顺序连续。
- 连接的数据库是否为 `postgres`，当前 Schema 是否为 `openaccount`。
- 本地 Alembic 是否只有一个 head，数据库的迁移版本是否与它一致。
- 数据库是否已经包含全部模型表。

该脚本不创建数据库、Schema 或表，也不执行 Alembic 迁移。应先准备好数据库结构并完成迁移。

## 使用方式

在已安装后端依赖、配置好数据库连接的环境中，从 `service-api` 目录执行：

```powershell
python -m scripts.seed.seed_all
```

脚本会打印服务器地址、数据库、Schema、连接用户和迁移版本。核对后输入以下内容才会开始清空：

```text
TRUNCATE openaccount
```

输入不匹配时取消操作。已核对目标的自动化环境可以使用下面的命令跳过交互确认；数据和数据库检查仍然执行：

```powershell
python -m scripts.seed.seed_all --yes
```

清空、导入及行数检查在同一个数据库事务中执行，异常会触发事务回滚。脚本还会同步用户及各题目/字段配置表的自增序列，并验证未导入数据的模型表为空。成功后打印各导入表的行数。

## 文件分工

| 文件 | 作用 |
| --- | --- |
| `seed_all.py` | 完整初始化入口，负责目标检查、确认、清空、导入、序列同步和结果检查 |
| `seed_data.json` | 自包含的初始数据来源 |
| `seed_data.py` | 读取并校验 JSON 数据 |
| `seed_users.py` | 导入初始用户 |
| `seed_code_tables.py` | 导入省市、职业及学历代码 |
| `seed_question_config.py` | 导入题目、选项、分值及补充资料字段配置 |

三个导入模块由 `seed_all.py` 调用，共用其数据库连接和事务。修改初始数据数量或字段时，需要同步调整 `seed_data.py` 中的校验定义。
