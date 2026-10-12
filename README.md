# 夜盘开户项目

本项目通过模拟开户网页预采集用户资料，使用 FastAPI + PostgreSQL 保存用户及问卷答案，再由 Android APK 加载官方开户网页并注入 JavaScript，辅助完成资料填写。

目前前端与业务后端的注册、登录和答案提交流程已接入；注入脚本仍使用示例数据，读取真实后端数据及相关权限衔接待完善。Android APK 的网页加载和注入实现由其他同事负责，本项目主要维护 service-api、模拟开户前端及注入脚本服务。

## 项目组成与文档入口

| 模块 | 作用 | 详细说明 |
| --- | --- | --- |
| `frontend/` | 原生 HTML、CSS、JavaScript 模拟开户网页 | 本文的前端启动与流程说明 |
| `service-api/` | 用户认证、配置读取、答案保存及数据汇总 | [后端 README](service-api/README.md)、[接口文档](service-api/api.md) |
| `service-js/` | 返回供 Android APK 注入官方网页的 JavaScript 代码 | [脚本服务 README](service-js/README.md) |
| `service-api/scripts/seed/` | 清空项目数据并导入初始管理员、问卷配置和基础代码 | [seed README](service-api/scripts/seed/README.md) |
| `service-api/test/` | 使用 Node.js 检查接口基本功能 | [接口检查 README](service-api/test/README.md) |
| `test_for_JsInject/` | 独立的注入实验页面和脚本服务 | [注入实验 README](test_for_JsInject/README.md) |
| `docs/` | 数据库、字段、代码、评分和官方页面路径记录 | 本文末尾的资料链接 |

主要数据流程：

```text
模拟开户网页 frontend
    │ 注册、登录、提交资料（HTTP / JSON）
    ▼
service-api ── SQLAlchemy + psycopg ── PostgreSQL
    │                                 postgres.openaccount
    │ 返回用户最新的四类答案
    ▼
注入脚本读取数据（尚待接入）
    │
    ▼
Android APK 加载官方网页并执行注入
    ▲
    │ 获取 JavaScript 源码
service-js：GET /script/main.js
```

service-js 返回的是脚本源码，用户预填写资料来自 service-api，官方网页提供待填写的控件。三者的职责和当前限制见 [service-js README](service-js/README.md)。

## 技术栈

- 前端：原生 HTML、CSS、JavaScript ES Modules。
- 后端与脚本服务器：Python、FastAPI、Uvicorn。
- 数据与校验：PostgreSQL、SQLAlchemy、Pydantic、Alembic。
- 认证：JWT Access Token、数据库保存哈希的 Refresh Token、Argon2 密码哈希。
- 基本接口检查：Node.js 内置 `fetch()`。

后端依赖以各服务的 `requirements.txt` 为准；运行接口检查需使用支持内置 `fetch()` 的 Node.js。

## 启动 service-api

后端环境、`.env` 配置、Schema 准备、迁移和启动步骤统一见 [service-api README](service-api/README.md)。

完成配置与迁移后，从 `service-api` 目录启动本机开发服务：

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Swagger UI：`http://127.0.0.1:8000/docs`。

数据库使用 `postgres` 中的 `openaccount` Schema，而非名为 openaccount 的数据库。数据库结构详见 [数据库表结构](docs/数据库表结构.md)。日常启动不需要重新初始化数据。

## 启动模拟开户前端

前端使用 ES Modules，应通过 HTTP 静态服务器访问。从项目根目录执行：

```powershell
python -m http.server 8001 --bind 127.0.0.1 --directory frontend
```

浏览器访问：`http://127.0.0.1:8001/index/index.html`。

这里约定 service-api 使用 8000、前端使用 8001、service-js 使用 8002；这些都是启动示例端口，可按实际环境调整。独立注入实验服务使用自己的端口，运行时注意避免冲突。

前端默认请求当前网页主机的 HTTP 8000 端口，可以通过在模块加载前设置 `window.API_BASE_URL` 指定其他后端地址。手机访问时需让服务监听 `0.0.0.0`，使用开发电脑的局域网地址，并确认防火墙放行相应端口；手机的 `127.0.0.1` 指向手机自身。

页面顺序：

```text
首页（注册 / 登录）
→ 反洗钱信息
→ 补充资料
→ 交易者风险测评
→ 期货品种选择
→ 提交结果
```

当前前端行为：

- 首页提供注册、登录弹窗；注册成功后切换到登录，登录后可以开始填写。
- 两个 Token 和登录手机号保存在当前浏览器标签页的 `sessionStorage` 中，不保存密码。
- 四类答案提交通过 Bearer 请求头携带 Access Token，不传固定 `uid`。
- 受保护请求返回 `401` 后，使用 Refresh Token 刷新 Access Token，并重试原请求一次；同一页面的并发请求共用一次刷新。
- Refresh Token 无效时清除本地会话；网络或服务器暂时错误会显示提示，不直接当作会话失效。
- 退出请求携带当前会话的 Refresh Token，无论请求是否成功都清除本地会话。
- addInfo 使用配置中的中文 `field_name` 展示，以 `p${field_id}` 提交。
- 结果页根据当前 Access Token 中的用户编号请求答案，但尚未携带后端现在要求的注入共享密钥，因此当前读取会被拒绝，前端适配仍待完成。

修改前端后若浏览器仍显示旧样式或模块，可强制刷新，或在开发者工具中禁用缓存。HTTPS 页面请求 HTTP API 可能受到 Mixed Content 限制。

## 启动 service-js

启动方式和 Android APK 的接入流程见 [service-js README](service-js/README.md)。该服务提供 `GET /script/main.js`，目前脚本内的四类数据为硬编码示例，addInfo 键名已统一为 `p1` 至 `p23`。

## 切换数据库与初始化

家里、公司或其他环境的数据库连接统一通过 `service-api/.env` 中的 `DATABASE_URL` 配置；主机、端口和账号以实际环境为准。切换后重启后端，不要修改源码或在 `alembic.ini` 中写入真实凭据。

在 `service-api` 目录可先核对连接目标，命令会隐藏连接串密码：

```powershell
.\.venv\Scripts\python.exe -c "from app.database import engine; print(engine.url.render_as_string(hide_password=True))"
.\.venv\Scripts\python.exe -m alembic current
.\.venv\Scripts\python.exe -m alembic heads
```

用户名或密码含 URL 特殊字符时需编码；例如 `@` 写为 `%40`。迁移前核对目标并检查迁移文件，避免影响已有数据。

**seed 会清空模型表，包括用户、答案和 Refresh Token，并重置自增序列。`service-api/test/run.ps1` 会先调用 seed，因此也会重置数据库。** 仅在明确需要重置且已确认目标时执行，完整说明见 [seed README](service-api/scripts/seed/README.md)。

## 基本接口检查

`service-api/test/` 用于检查预设请求和接口基本流程，不是生产验收标准。先启动后端，再按 [test README](service-api/test/README.md) 选择单独检查或批量运行。

例如，从项目根目录只读取反洗钱配置：

```powershell
node .\service-api\test\launderingBack_test\get_launderingBack_config.js
```

批量入口是 `service-api/test/run.ps1`，不是 service-api 根目录中的 run.ps1。jsinject 检查成功后将响应保存到 `service-api/test/jsinject_data.json`，不再打印完整 JSON。

## 当前待完善部分

- 后端 jsinject 已加入共享密钥校验：`Authorization: Bearer <JS_INJECT_KEY>`。它与登录 Access Token 不同，持有密钥者仍可查询任意 `uid`，尚无用户数据隔离。后续计划由 Android APK 获取本人资料后交给注入脚本填写，官方网页无需增加额外登录。
- 注入脚本尚未读取真实 service-api 数据，Android APK 与注入脚本的认证信息传递和数据加载时机仍需联调。
- 两个服务的 CORS 当前为宽松的开发配置，允许所有来源、方法和请求头；上线前需按实际调用来源收紧。基本接口检查通过不能作为生产上线依据。
- 官方网页的 DOM 或 Vue 结构变化后，需要重新核对注入逻辑。
- `docs/所有字段整理.md` 和 `docs/pages-pathname.md` 的部分 frontend / service-js 内容尚未同步；当前后端字段以 Schema、CRUD、接口文档和数据库结构说明为准。

## 相关资料

- [service-api README](service-api/README.md)
- [service-js README](service-js/README.md)
- [seed README](service-api/scripts/seed/README.md)
- [test README](service-api/test/README.md)
- [后端接口文档](service-api/api.md)
- [数据库表结构](docs/数据库表结构.md)
- [所有字段整理（部分内容待更新）](docs/所有字段整理.md)
- [交易者风险测评问卷评分标准](docs/交易者风险测评问卷评分标准.md)
- [行政区划代码对照](docs/行政区划代码对照.md)
- [职业和学历代码对照](docs/职业和学历代码对照.md)
- [官方页面路径记录](docs/pages-pathname.md)
