# 夜盘开户项目

这是一个用于演示期货夜盘开户流程的前后端项目。当前项目已经包含动态问卷配置、客户资料提交、答案保存、最新答案汇总、简易前端以及 JavaScript 注入脚本服务。

> 当前版本是学习和联调项目：没有登录认证，前端固定使用 `uid = 1`，后端 CORS 也处于宽松配置。项目中包含身份证号、联系电话等敏感字段，不能在未增加鉴权、权限控制、HTTPS、日志脱敏和数据保护措施的情况下直接用于生产环境。

## 1. 项目组成

```text
openaccount/
├─ frontend/                 # 纯 HTML、CSS、JavaScript 前端
│  ├─ launderingBack/       # 反洗钱页面（index.html/style.css/script.js）
│  ├─ index/                # 前端首页（index.html/index.css/index.js）
│  ├─ addInfo/              # 基本资料页面（index.html/style.css/script.js）
│  ├─ question/             # 风险测评页面（index.html/style.css/script.js）
│  ├─ chooseFutures/        # 期货品种页面（index.html/style.css/script.js）
│  ├─ dataprint/            # JSON 结果页面（index.html/style.css/script.js）
│  └─ utils/                # 通用 API、问卷渲染和公共样式
├─ service-api/              # FastAPI 业务接口和 PostgreSQL 数据访问
├─ service-js/               # 提供 main.js 下载的 FastAPI 服务
├─ test_for_JsInject/        # JavaScript 注入相关的独立测试页面和服务
├─ docs/                     # 字段、数据库、评分标准等文档
├─ api.txt                   # 后端接口简要约定
└─ README.md
```

主要数据流：

```text
frontend（浏览器）
        │ HTTP / JSON
        ▼
service-api（默认 8000 端口）
        │ SQLAlchemy + psycopg
        ▼
PostgreSQL 的 postgres 数据库
        └─ openaccount Schema
```

`service-js` 是另一个独立服务，默认可以运行在 `8001` 端口，用于返回：

```text
GET /script/main.js
```

## 2. 技术栈

- 前端：原生 HTML、CSS、JavaScript ES Modules
- 后端：Python、FastAPI、Pydantic
- ORM：SQLAlchemy
- 数据库：PostgreSQL
- 数据库迁移：Alembic
- 接口测试：Node.js 原生 `fetch`

建议安装：

- Python 3.10 或更高版本
- Node.js 18 或更高版本
- PostgreSQL
- 可选：DBeaver、`psql`

## 3. 数据库位置

本项目并不是在 PostgreSQL 中创建一个名为 `openaccount` 的数据库，而是使用：

- 数据库名：`postgres`
- Schema（模式）：`openaccount`

完整层级是：

```text
PostgreSQL 实例
└─ postgres 数据库
   └─ openaccount Schema
      ├─ users
      ├─ launderingbackanswers
      ├─ addinfoanswers
      ├─ questionanswers
      └─ ...
```

因此 SQL 查询通常写成：

```sql
SELECT * FROM openaccount.users;
```

详细表结构见 [docs/数据库表结构.md](docs/数据库表结构.md)。

## 4. 最重要：在家里数据库和公司数据库之间切换

### 4.1 数据库连接统一由 `.env` 管理

当前项目使用 `service-api/.env` 中的 `DATABASE_URL` 作为唯一数据库连接配置：

| 使用者 | 读取方式 |
| --- | --- |
| FastAPI、CRUD、初始化脚本 | `service-api/app/database.py` 读取 `.env` |
| Alembic 数据库迁移 | `service-api/alembic/env.py` 读取同一个 `.env` |

`service-api/alembic.ini` 中的 `sqlalchemy.url` 会保持为空，不能再向其中写入真实用户名或密码：

```ini
sqlalchemy.url =
```

切换数据库时只修改 `service-api/.env`，FastAPI 和 Alembic 就会使用同一个目标。项目提供了不含真实凭据的 `service-api/.env.example` 作为格式参考。

### 4.2 家里数据库配置

家里的 PostgreSQL 如果运行在当前电脑上，主机通常是 `127.0.0.1`。

在 `service-api/.env` 中配置：

```env
DATABASE_URL=postgresql+psycopg://<用户名>:<密码>@127.0.0.1:5432/postgres
```

### 4.3 公司数据库配置

当前项目代码中记录的公司数据库主机是 `<host>`。切换前应先确认电脑已经连接公司网络或公司 VPN，并确认数据库地址没有变化。

在 `service-api/.env` 中配置：

```env
DATABASE_URL=postgresql+psycopg://<公司用户名>:<公司密码>@<host>:5432/postgres
```

如果公司实际提供了不同的主机、端口或数据库名，应以公司 DBA 提供的信息为准，不要机械照抄上面的地址。

### 4.4 密码中存在特殊字符

如果用户名或密码包含 `@`、`:`、`/`、`#`、`?`、`%` 等 URL 特殊字符，需要先做 URL 编码。例如，密码中的 `@` 应写成 `%40`。

连接串现在只写在 `.env` 中，URL 编码后的百分号保持普通写法即可，例如 `%40`；不再需要为 `alembic.ini` 写成 `%%40`。

不要把真实数据库密码写入 README、Git 提交、截图或聊天记录。

### 4.5 推荐的安全切换步骤

每次从家里数据库切换到公司数据库，或者从公司切换回家里时，按以下顺序操作：

1. 停止正在运行的 `service-api`。
2. 确认目标数据库的主机和端口。
3. 只修改 `service-api/.env` 中的 `DATABASE_URL`。
4. 先检查 TCP 端口是否可达。
5. 再检查应用连接和 Alembic 连接。
6. 确认目标服务器、数据库和 Schema 都正确后，才执行迁移。
7. 除非明确允许清空目标数据，否则不要运行初始化脚本和 `run.ps1`。

检查 PostgreSQL 端口：

```powershell
Test-NetConnection <host> -Port 5432
```

家里数据库可以改成：

```powershell
Test-NetConnection 127.0.0.1 -Port 5432
```

进入后端目录并激活虚拟环境：

```powershell
cd D:\programming\openaccount\service-api
.\.venv\Scripts\Activate.ps1
```

显示 FastAPI 当前连接目标，密码会被隐藏：

```powershell
python -c "from app.database import engine; print(engine.url.render_as_string(hide_password=True))"
```

实际连接并打印服务器、数据库、Schema 和用户：

```powershell
python -c "from app.database import engine; c=engine.connect(); print(c.exec_driver_sql('SELECT inet_server_addr(), inet_server_port(), current_database(), current_schema(), current_user').one()); c.close()"
```

由于 `database.py` 已设置 `search_path=openaccount`，正常结果中的 `current_schema()` 应为：

```text
openaccount
```

再检查 Alembic 连接的数据库版本：

```powershell
alembic current
alembic heads
```

只有确认两个连接均指向目标数据库后，才能根据需要运行：

```powershell
alembic upgrade head
```

### 4.6 新数据库第一次部署

当前 Alembic 迁移文件不会自动创建 `openaccount` Schema。全新数据库第一次部署时，需要由具有权限的用户先执行：

```sql
CREATE SCHEMA IF NOT EXISTS openaccount;
```

如果应用使用的数据库账号不是 Schema 所有者，还需要 DBA 按公司权限规范授予所需权限。执行迁移的账号至少需要能够在 `openaccount` 中创建和修改表。

然后在 `service-api` 目录执行：

```powershell
alembic upgrade head
```

执行后可以检查：

```powershell
alembic current
```

当前代码预期的 Alembic head 可以通过 `alembic heads` 查看，不建议在 README 中长期写死版本号。

### 4.7 初始化脚本的高风险说明

初始化命令：

```powershell
python -m scripts.seed.seed_all
```

该脚本不是简单地补充缺失数据，而是会：

1. 验证当前数据库是 `postgres`。
2. 验证当前 Schema 是 `openaccount`。
3. 验证 Alembic 已升级到代码 head。
4. 对 `openaccount` 下全部 SQLAlchemy 模型表执行 `TRUNCATE ... RESTART IDENTITY CASCADE`。
5. 重新导入 `scripts/seed/seed_data.json` 中的初始化数据。

也就是说，**它会清空现有用户答案和其他业务数据。**

交互执行时，脚本会显示目标服务器并要求输入：

```text
TRUNCATE openaccount
```

只有明确需要重置数据库时才可以输入确认。`--yes` 会跳过确认，更不能在公司数据库上随意使用：

```powershell
python -m scripts.seed.seed_all --yes
```

`service-api/run.ps1` 也会先调用这个初始化脚本，因此它同样可能清空目标数据库。切换到公司库后，运行 `run.ps1` 前必须再次确认数据库目标和数据清空权限。

## 5. 安装和启动 service-api

首次安装：

```powershell
cd D:\programming\openaccount\service-api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

启动后端：

```powershell
fastapi dev app/main.py --host 0.0.0.0 --port 8000
```

常用地址：

- API 根地址：`http://127.0.0.1:8000`
- Swagger 接口文档：`http://127.0.0.1:8000/docs`
- OpenAPI JSON：`http://127.0.0.1:8000/openapi.json`

如果只在当前电脑访问，可以使用默认的 `127.0.0.1`。如果需要让同一 Wi-Fi 下的手机访问，必须使用 `--host 0.0.0.0` 启动，并使用电脑的局域网 IP，例如：

```text
http://<lan-ip>:8000/docs
```

同时需要确认 Windows 防火墙、代理软件和 Clash Verge 没有拦截局域网连接。

## 6. 启动前端

前端使用 ES Modules，不能直接双击 HTML 后通过 `file://` 使用，应通过 HTTP 静态服务器打开。

在项目根目录执行：

```powershell
cd D:\programming\openaccount
python -m http.server 8080 --directory frontend
```

浏览器访问：

```text
http://127.0.0.1:8080/index/index.html
```

页面顺序：

```text
index
→ launderingBack
→ addInfo
→ question
→ chooseFutures
→ dataprint
```

前四个页面会读取后端配置、生成表单、提交答案，然后通过 `window.location.href` 跳转。最后的 `dataprint` 页面会请求：

```text
GET /api/jsinject/data?uid=1
```

并打印后端返回的 JSON。

`frontend/utils/api.js` 默认根据当前网页的主机名连接其 `8000` 端口：

```text
网页：http://<lan-ip>:8080/...
API：http://<lan-ip>:8000/...
```

因此手机通过电脑局域网 IP 打开前端时，也会自动请求该电脑的后端，而不是错误地请求手机自己的 `127.0.0.1`。

## 7. 启动 service-js

首次安装：

```powershell
cd D:\programming\openaccount\service-js
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

启动服务：

```powershell
fastapi dev app/main.py --host 0.0.0.0 --port 8001
```

访问脚本：

```text
http://127.0.0.1:8001/script/main.js
```

局域网手机访问时，将 `127.0.0.1` 换成电脑的局域网 IP。

## 8. 主要 API

| 方法 | 地址 | 用途 |
| --- | --- | --- |
| GET | `/api/launderingBack/config` | 获取反洗钱问题和选项 |
| POST | `/api/launderingBack/answer` | 保存反洗钱答案 |
| GET | `/api/addInfo/config` | 获取补充资料字段配置 |
| POST | `/api/addInfo/answer` | 保存补充资料 |
| GET | `/api/question/config` | 获取风险测评问题和选项 |
| POST | `/api/question/answer` | 保存风险测评答案 |
| GET | `/api/chooseFutures/config` | 获取期货品种问题和选项 |
| POST | `/api/chooseFutures/answer` | 保存期货品种答案 |
| GET | `/api/jsinject/data?uid=1` | 获取用户四类最新答案 |

当前四个 POST 接口都要求 `uid`。简易前端和测试脚本暂时固定传入：

```json
{
  "uid": 1
}
```

多选题使用选项字母连接后的字符串保存，例如：

```text
AC
BC
ABCD
```

完整字段定义见 [api.txt](api.txt) 和 [docs/所有字段整理.md](docs/所有字段整理.md)。

## 9. 数据库迁移开发流程

修改 SQLAlchemy 模型后，先检查当前连接目标，再生成迁移：

```powershell
cd D:\programming\openaccount\service-api
.\.venv\Scripts\Activate.ps1
python -c "from app.database import engine; print(engine.url.render_as_string(hide_password=True))"
alembic current
alembic revision --autogenerate -m "说明本次数据库修改"
```

生成迁移文件后必须人工检查 `upgrade()` 和 `downgrade()`，尤其注意：

- Schema 是否为 `openaccount`。
- 字段类型转换是否会破坏已有数据。
- 主键、自增、外键和可空设置是否正确。
- 是否误删除表或字段。

确认无误后执行：

```powershell
alembic upgrade head
```

不要在没有备份和授权的公司数据库上直接执行未经检查的迁移。

## 10. 接口测试

先启动 `service-api`，然后可以单独运行测试：

```powershell
cd D:\programming\openaccount
node .\service-api\test\get_launderingBack_config.js
node .\service-api\test\get_addInfo_config.js
node .\service-api\test\get_question_config.js
node .\service-api\test\get_chooseFutures_config.js
node .\service-api\test\get_jsinject_data.js
```

也可以在 `service-api` 目录运行：

```powershell
.\run.ps1
```

但要再次注意：`run.ps1` 会先执行数据库初始化，清空模型表后再运行全部 GET 和 POST 测试。它适合本地开发库，不应默认用于保存真实数据的数据库。

## 11. 常见问题

### 11.1 `TcpTestSucceeded: False`

表示目标主机的 PostgreSQL 端口不可达，常见原因包括：

- 没有连接公司网络或 VPN。
- PostgreSQL 没有启动。
- PostgreSQL 只监听 `127.0.0.1`。
- Windows 或服务器防火墙未放行 `5432`。
- 公司数据库地址或端口已变化。

此时还没有进入用户名、密码验证阶段，应先解决网络和端口问题。

### 11.2 `password authentication failed`

表示已经连接到 PostgreSQL，但用户名或密码不正确。检查两个配置文件中的账号是否一致，以及特殊字符是否正确编码。

### 11.3 `no pg_hba.conf entry`

表示服务器没有允许当前电脑 IP 或当前数据库用户远程访问，需要由 PostgreSQL 管理员修改 `pg_hba.conf` 并重新加载配置。

### 11.4 `schema "openaccount" does not exist`

目标数据库还没有创建 Schema。先由有权限的账号执行：

```sql
CREATE SCHEMA IF NOT EXISTS openaccount;
```

### 11.5 `relation ... does not exist`

依次检查：

1. 是否连接到了正确的 PostgreSQL 服务器。
2. 数据库名是否为 `postgres`。
3. `openaccount` Schema 是否存在。
4. 是否执行过 `alembic upgrade head`。
5. FastAPI 和 Alembic 是否实际连接了不同数据库。

### 11.6 前端显示“请求失败”

检查：

- `service-api` 是否运行在 `8000` 端口。
- 浏览器实际请求的主机名是否正确。
- 手机访问时后端是否使用 `--host 0.0.0.0` 启动。
- Windows 防火墙是否放行对应端口。
- Clash Verge 等代理软件是否拦截局域网连接。
- HTTPS 页面是否正在请求 HTTP API，从而触发 Mixed Content 限制。

### 11.7 POST 返回 `422`

通常表示请求体与 Pydantic Schema 不匹配，例如缺少必填字段、日期不是 `YYYY-MM-DD`、布尔值被写成字符串，或者字段名称拼写错误。可查看响应 JSON 中的 `detail` 定位具体字段。

## 12. 相关文档

- [接口定义](api.txt)
- [数据库表结构](docs/数据库表结构.md)
- [所有字段整理](docs/所有字段整理.md)
- [交易者风险测评问卷评分标准](docs/交易者风险测评问卷评分标准.md)
- [行政区划代码对照](docs/行政区划代码对照.md)
- [职业和学历代码对照](docs/职业和学历代码对照.md)
- [页面路径记录](docs/pages-pathname.md)

## 13. 当前限制与后续建议

当前已知限制：

- 没有注册、登录和身份认证。
- 前端固定使用 `uid = 1`。
- CORS 允许所有来源。
- 数据库连接仍直接写在代码和 Alembic 配置中。
- 没有生产环境部署配置。
- 没有自动化浏览器端到端测试。

后续准备部署时，建议优先完成：

1. 把数据库连接改为环境变量，并提供不含密码的 `.env.example`。
2. 增加登录认证以及基于登录用户的 `uid` 获取逻辑。
3. 限制 CORS 来源。
4. 为敏感数据增加访问控制、日志脱敏和传输加密。
5. 区分开发、测试和生产数据库，禁止生产环境运行清库初始化脚本。
6. 增加数据库备份、迁移回滚方案和端到端测试。
