# service-api 开户资料后端

`service-api` 使用 FastAPI、SQLAlchemy 和 PostgreSQL，负责用户认证、提供问卷及字段配置、保存用户提交的开户资料与答案，以及返回供页面注入使用的数据。

模拟开户页面 `frontend` 调用本服务收集资料。`service-js` 提供供 Android APK 注入官方开户网页的脚本，其读取本服务真实数据的流程仍待完善。本服务不执行官方网页注入，也不完成真实开户操作。

## 目录说明

| 路径 | 作用 |
| --- | --- |
| `app/main.py` | FastAPI 入口、路由注册和 CORS 配置 |
| `app/database.py` | 数据库连接、Session 和模型基类 |
| `app/security.py` | 密码哈希、Access Token 签发及 Refresh Token 生成和哈希 |
| `app/routers/` | HTTP 路由与依赖声明 |
| `app/schemas/` | 请求、响应结构及字段校验 |
| `app/cruds/` | 数据库读写和业务校验 |
| `app/models/` | 用户、答案、问卷配置及基础代码表模型 |
| `app/dependencies/` | 当前用户验证和管理员权限依赖 |
| `alembic/`、`alembic.ini` | 数据库迁移 |
| `scripts/seed/` | 数据重置与初始化脚本 |
| `test/` | Node.js 接口基本功能检查脚本 |
| `.env.example` | 环境变量模板 |
| `api.md` | 详细接口文档 |

## 环境与配置

需要 Python、PostgreSQL，以及 `requirements.txt` 中的依赖。只有运行 `test/` 内的接口检查时才需要 Node.js。

以下 PowerShell 命令均从 `service-api` 目录执行：

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

首次配置时，将 `.env.example` 复制为 `.env` 并填写实际值。已有 `.env` 时不要覆盖：

```powershell
Copy-Item .env.example .env
```

| 环境变量 | 含义 |
| --- | --- |
| `DATABASE_URL` | 数据库连接地址，如 `postgresql+psycopg://<username>:<password>@<host>:5432/postgres` |
| `SECRET_KEY` | JWT 签名密钥，使用随机生成的私有值 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access Token 有效分钟数，填写正整数 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh Token 有效天数，填写正整数 |

应用通过 python-dotenv 加载配置，数据库连接设置 `search_path=openaccount`。不要将真实 `.env`、密码或 Token 提交到仓库。

## 数据库迁移与初始化

当前项目使用 PostgreSQL 数据库 `postgres` 中的 `openaccount` Schema。迁移脚本不负责创建该 Schema；首次准备数据库时，需要由具备权限的数据库用户执行：

```sql
CREATE SCHEMA IF NOT EXISTS openaccount;
```

准备好连接配置和 Schema 后执行迁移：

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m alembic current
```

当前本地迁移链 head 为 `c70cdb6870d2`。实际数据库版本以 `alembic current` 输出为准，后续新增迁移时以最新 head 为准。Alembic 版本表位于 `openaccount.alembic_version`。

需要重置初始数据时，可执行：

```powershell
.\.venv\Scripts\python.exe -m scripts.seed.seed_all
```

**seed 会清空全部模型表中的现有用户、答案、Refresh Token 和配置数据，重置自增序列，再导入初始管理员、问卷配置及基础代码。它不是增量更新，也不是日常启动步骤。** 默认需要核对目标并输入 `TRUNCATE openaccount` 确认。

完整行为、数据数量和初始管理员登录信息见 [seed README](scripts/seed/README.md)。数据库表及字段说明见 [数据库表结构](../docs/数据库表结构.md)。

## 启动服务器

本机开发启动：

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

需要供局域网内手机或其他机器访问时，可将 `--host` 改为 `0.0.0.0`，客户端使用服务器实际地址访问。`--reload` 用于开发调试。

启动后可访问：

- Swagger UI：`http://127.0.0.1:8000/docs`
- OpenAPI：`http://127.0.0.1:8000/openapi.json`

当前 CORS 配置允许所有来源、方法和请求头。它用于目前的开发联调，并不替代用户认证或数据访问权限控制。

## 接口与认证

详细请求体、响应和字段规则见 [api.md](api.md)。当前业务接口如下：

| 方法 | 路径 | 登录要求 | 用途 |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | 无 | 注册普通用户 |
| POST | `/api/auth/login` | 无 | 登录并获取两个 Token |
| POST | `/api/auth/refresh` | 请求体携带 Refresh Token | 获取新的 Access Token |
| POST | `/api/auth/logout` | Access Token + 请求体中的 Refresh Token | 注销当前会话的 Refresh Token |
| GET | `/api/launderingBack/config` | 无 | 反洗钱配置 |
| POST | `/api/launderingBack/answer` | Access Token | 提交反洗钱答案 |
| GET | `/api/addInfo/config` | 无 | 补充资料字段配置 |
| POST | `/api/addInfo/answer` | Access Token | 提交补充资料 |
| GET | `/api/question/config` | 无 | 风险测评配置 |
| POST | `/api/question/answer` | Access Token | 提交风险测评答案 |
| GET | `/api/chooseFutures/config` | 无 | 期货选择配置 |
| POST | `/api/chooseFutures/answer` | Access Token | 提交期货选择答案 |
| GET | `/api/code/province` | 无 | 省份代码 |
| GET | `/api/code/city` | 无 | 城市代码 |
| GET | `/api/code/occupation` | 无 | 职业代码 |
| GET | `/api/code/educationalqualification` | 无 | 学历代码 |
| GET | `/api/jsinject/data?uid=<uid>` | 当前无 | 获取用户最新的四类答案 |

受保护接口的请求头格式为：

```http
Authorization: Bearer <access_token>
```

登录返回 `access_token`、`refresh_token` 和 `token_type`。Access Token 是带有用户编号及过期时间的 JWT；数据库只保存 Refresh Token 的哈希及所属用户、过期时间和 active 状态。

refresh 需要有效、未过期且仍为 active 的 Refresh Token，仅返回新的 Access Token，不轮换 Refresh Token。客户端可在受保护请求返回 `401` 后刷新并重试一次，刷新失败时按返回原因处理登录状态。

logout 校验 Refresh Token 属于当前 Access Token 用户，且未过期、仍为 active，再将其设为 inactive。它不会立即撤销已经签发的 Access Token；客户端退出时应清除本地两个 Token，即使 logout 请求失败也应清除。

四个答案提交接口由服务端根据 Access Token 确定 `uid`，客户端不需要也不应在答案请求体中传入 `uid`。每次成功提交新增一条记录，jsinject 数据读取按流水号返回每一类的最新记录。

## addInfo 字段约定

补充资料的请求键名和答案表字段统一为 `p1` 至 `p23`。配置接口返回 `field_id`、中文 `field_name` 和 `type`：前端以中文名称展示，以 `p${field_id}` 提交，不能再使用旧英文字段键名。

校验包括身份证格式、出生日期与校验位、手机号、邮编、邮箱、长期有效日期关联、居间人字段关联，以及省市匹配、职业和学历代码有效性。

具体规则以 `app/schemas/addInfo_schemas.py`、`app/cruds/addInfo_cruds.py` 及数据库结构文档为准。

## jsinject 的待完善事项

**数据读取接口已实现，身份认证及数据访问权限控制尚未实现。** 当前接口接受查询参数 `uid`，用户不存在时返回 `404`，尚未提交的页面数据为 `null`。

后续应优先根据 Access Token 确定当前用户，使普通用户只能读取自己的资料，并与 Android APK、service-js 的认证和数据读取方案同步。当前实现及基本接口检查通过，不代表服务已满足生产上线要求。

## 基本接口检查

`test/` 使用 Node.js 请求正在运行的后端，仅检查预设请求及基本流程，不是严谨的生产验收测试。使用方式与限制见 [test README](test/README.md)。

**`test/run.ps1` 会先调用 seed 重置数据库，再运行注册、登录、答案提交等会写入数据的请求。** 执行前务必核对目标；不要将其作为无副作用的服务健康检查。
