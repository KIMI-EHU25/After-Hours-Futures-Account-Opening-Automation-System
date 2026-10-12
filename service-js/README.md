# service-js 注入脚本服务器

`service-js` 是一个基于 FastAPI 的 JavaScript 脚本分发服务器。客户端请求脚本接口后，服务器返回 `app/script/main.js` 的 JavaScript 源码，供手机 Android APK 获取并注入其加载的官方开户网页，实现资料预填写。

Android APK 内加载官方网页、获取脚本及执行注入的具体实现由 Android 端负责。本目录提供脚本下载接口和页面填写逻辑。

## 脚本接口

```http
GET /script/main.js
```

请求地址为 `http://<service-js 主机>:<端口>/script/main.js`。响应是 JavaScript 文件内容，类型为 `application/javascript; charset=utf-8`，不是 JSON 数据。服务器通过 `FileResponse` 返回文件，设置 `Content-Disposition: inline` 和 `Cache-Control: no-store`。

服务器仅返回代码，不在服务端执行网页注入，也不替 Android APK 加载官方开户网站。

## 预期使用流程

1. 用户在模拟开户前端填写资料，前端将答案提交到 `service-api`。
2. Android APK 加载官方开户网站 `https://app5.cfmmc.com`。
3. APK 请求 service-js 的 `/script/main.js`，取得代码并注入官方网页环境执行。
4. 注入逻辑读取该用户已提交的资料，根据官方网页当前路径填写对应控件。
5. 上传证件、银行卡、视频验证等需要用户操作的步骤仍由用户完成。

这里需要区分两个来源：**待预填写的用户资料来自 service-api；官方开户网页提供被填写的页面和控件。** 注入脚本在官方网页中操作 DOM、触发选项点击，必要时更新页面 Vue 实例的状态，并等待联动选项加载。

## 当前实现

`app/script/main.js` 监听首次页面加载及 `pushState`、`replaceState`、`popstate`、`hashchange` 等路径变化，根据 `location.pathname` 执行相应页面逻辑。

目前主要填写以下四个页面：

| 官方页面路径 | 注入数据分组 | 内容 |
| --- | --- | --- |
| `/launderingBack` | `launderingBack` | 反洗钱问卷 |
| `/addInfo` | `addInfo` | 开户补充资料 |
| `/question` | `question` | 交易者风险测评问卷 |
| `/chooseFutures` | `chooseFutures` | 期货品种选择 |

数据当前保存在脚本内的 `const data` 示例对象中。addInfo 的键名已与 service-api 统一为 `p1` 至 `p23`，其他问卷也使用 `p<题号>`；多选答案使用连续字母字符串，如 `AC`、`ACD`。脚本仍保留路径提示弹窗和登录页填写示例身份证号等调试行为。

## 真实后端数据读取尚待完善

**当前注入脚本尚未发起读取真实 service-api 数据的请求，运行时使用的是硬编码示例数据。** 数据结构对齐不代表真实数据获取流程已经完成。

service-api 已有 `GET /api/jsinject/data?uid=<uid>` 数据读取接口，可返回四个页面的数据；当前该后端接口的身份认证和数据访问权限控制仍未实现。后续需统一用户身份、认证信息传递、后端地址、请求失败处理及数据加载完成后的注入时机，并同步调整脚本。

权限控制完善时，应优先由服务端根据 Access Token 确定当前用户，让普通用户只能读取自己的资料，而不是信任任意 `uid` 查询参数。Android 端与注入脚本如何获取和传递认证信息，仍需结合 APK 的最终方案确定。

## 本地启动

在配置好 Python 环境后，从 `service-js` 目录执行：

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002
```

`8002` 是启动示例端口，可按实际部署调整。Android 真机应使用手机可访问的服务器地址；手机上的 `127.0.0.1` 指向手机自身，不能直接代替开发电脑地址。

## 文件分工

| 文件 | 用途 |
| --- | --- |
| `app/main.py` | FastAPI 应用、CORS 配置及脚本返回接口 |
| `app/script/main.js` | 路径监听、示例数据及官方页面填写逻辑 |
| `requirements.txt` | 服务器 Python 依赖 |

脚本依赖官方网页的 DOM 和 Vue 组件结构，网页变化后需要重新核对。脚本下载成功不等于 Android APK 内注入成功，最终效果仍需在实际 APK 和官方页面中联调验证。
