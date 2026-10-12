# service-api 接口基本功能检查

本目录使用 Node.js 的 `fetch()` 请求正在运行的 FastAPI 后端，用于开发时快速检查接口是否可以正常访问，以及注册、登录、刷新 Token、提交答案、退出登录和读取数据等基本流程是否能够执行。

**这里不是用于判断后端是否能够上生产的标准测试套件。即使所有脚本执行成功，也不代表系统已满足生产环境要求。**

## 检查范围与结果含义

目前各脚本主要发送一份预设请求，检查 HTTP 响应是否成功，再解析返回内容。多数脚本直接打印响应；jsinject 脚本将响应保存为 JSON 文件，仅打印保存提示。请求失败时通常会打印错误并设置非零退出码，供 `run.ps1` 中止后续执行。

本目录没有系统性覆盖异常输入、边界条件、完整权限规则、并发、性能、安全性及数据库保存结果，也没有全面断言响应内容是否符合业务预期。例如，读取接口返回成功但内容不正确，现有脚本仍可能执行通过。

因此，“All commands successfully completed.” 仅表示本次预设请求均完成了脚本中的基本检查。返回内容还需要结合终端输出及 `jsinject_data.json` 人工查看，不能将其视为生产验收结论。

## 文件与接口分工

| 文件或目录 | 用途 |
| --- | --- |
| `main.js` | 定义后端基础地址，当前为 `http://127.0.0.1:8000`；不是批量运行入口 |
| `run.ps1` | 初始化数据库后，按顺序使用 Node.js 执行接口检查脚本 |
| `auth_test/` | 检查注册、登录、刷新 Access Token 和退出登录 |
| `launderingBack_test/` | 读取反洗钱配置、提交反洗钱答案 |
| `addInfo_test/` | 读取补充资料配置、提交 `p1` 至 `p23` 的资料 |
| `question_test/` | 读取风险测评问卷配置、提交答案 |
| `chooseFutures_test/` | 读取期货选择配置、提交答案 |
| `code_test/` | 读取省份、城市、职业和学历代码 |
| `jsinject_test/` | 读取指定用户的页面注入数据，保存到 `jsinject_data.json` |
| `utils/token_file.js` | 读写本地 Access Token 和 Refresh Token |
| `test_token.json` | 登录、刷新等脚本使用的本地 Token 文件，不是初始化数据来源 |
| `jsinject_data.json` | jsinject 请求成功后生成或覆盖的响应文件，不是初始化数据来源 |

## Token 与执行顺序

`run.ps1` 当前依次执行：

1. 调用 `scripts.seed.seed_all` 初始化数据库。
2. 读取四个页面的配置，以及四类基础代码。
3. 注册测试用户，随后登录并刷新 Access Token。
4. 提交四类答案。
5. 退出登录。
6. 读取 jsinject 数据并保存到 `test/jsinject_data.json`。

测试用户手机号为 `13900000000`，密码为 `<password>`，与 seed 导入的初始管理员是不同账号。

登录脚本将 Access Token 和 Refresh Token 保存到 `test_token.json`。刷新脚本读取 Refresh Token，更新文件中的 Access Token，保留原 Refresh Token。四个答案提交脚本读取 Access Token，并通过 `Authorization: Bearer <access_token>` 请求头调用受保护接口；答案请求体不传 `uid`。

logout 同时发送 Bearer Access Token 和请求体中的 Refresh Token。当前脚本在成功或失败分支中将本地两个 Token 字段写为字符串 `"None"`，并非删除字段；需要再次调用受保护接口时，应重新登录。此处尚未实现请求收到 `401` 后自动刷新并重试，刷新是独立执行的步骤。

## jsinject 的当前状态与后续改进

**jsinject 数据读取接口已经实现，但后端的身份认证和数据访问权限控制尚未实现，对应测试也尚未加入权限验证。**

当前 `jsinject_test/get_jsinject_data.js` 不发送 Authorization 请求头，固定请求：

```http
GET /api/jsinject/data?uid=2
```

请求成功并解析 JSON 后，脚本以 UTF-8 编码、两空格缩进写入 `service-api/test/jsinject_data.json`，每次成功写入都会覆盖原文件。输出路径根据脚本自身位置确定，不受运行命令时所在目录影响。终端只打印保存提示，不再打印完整响应。

HTTP 请求失败或 JSON 解析失败时不会写入文件，已有文件会保留，因此旧文件的存在不代表本次请求成功。文件写入失败也会报错并设置非零退出码。

这里的 `uid=2` 依赖完整初始化后的数据：seed 导入初始管理员后，脚本注册的测试用户通常得到编号 2。单独执行脚本或数据库数据发生变化时，应按实际用户编号调整查询。

目前该检查仅用于确认数据读取接口能够返回结果，不验证调用者是否有权读取指定用户的数据。后续完善后端权限控制时，应优先从 Access Token 确定当前用户，使普通用户只能读取自己的数据，并同步调整测试中的认证方式和用户选择方式。

## 使用方式

执行前需安装支持内置 `fetch()` 的 Node.js、后端 Python 依赖，配置好数据库连接并完成 Alembic 迁移，然后先启动 FastAPI 服务。若服务地址不同，应调整 `main.js` 中的 `base_url`。

**批量运行会先重置数据库，清空已有用户、答案和 Refresh Token，再导入初始数据；随后注册、登录和答案提交还会继续写入数据库。请先核对初始化脚本打印的目标。**

从 `service-api` 目录运行：

```powershell
.\test\run.ps1
```

初始化步骤默认需要输入 `TRUNCATE openaccount` 确认。取消初始化或任一步骤返回非零退出码时，批量脚本会停止。初始化细节见 [seed 脚本说明](../scripts/seed/README.md)。

也可以单独执行某个检查，例如读取反洗钱配置：

```powershell
node .\test\launderingBack_test\get_launderingBack_config.js
```

单独执行 Node.js 脚本不会自动调用 seed，但注册、登录、提交答案和 logout 等请求仍会修改后端数据库，登录、刷新和 logout 还会写入本地 Token 文件，jsinject 脚本会写入本地响应文件。执行受保护接口前需要有效的 Access Token；刷新和退出登录还需要对应会话的 Refresh Token。各脚本并非彼此独立，需按所检查功能准备前置数据和登录状态。
