# JS 注入实验

本目录是独立的两页面注入实验，用于观察 Android 加载网页后执行 JavaScript，以及页面跳转后的填写行为。它不连接 service-api，也不验证真实开户流程。正式脚本服务见 [service-js README](../service-js/README.md)。

## 启动网页服务器

从项目根目录打开 PowerShell：

```powershell
cd .\test_for_JsInject\http_server
python server.py
```

服务监听 `0.0.0.0:8000`，访问 `http://127.0.0.1:8000/` 会跳转到 `/pages/index/index.html`。手机使用电脑的局域网地址访问，例如 `http://<电脑IP>:8000/`，并确保防火墙允许访问。

## 启动脚本服务器

另开 PowerShell，从项目根目录执行：

```powershell
cd .\test_for_JsInject\js_server
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn server:app --port 8001 --host 0.0.0.0
```

已有虚拟环境时可跳过创建步骤。APK 请求 `http://<电脑IP>:8001/script.js` 获取 `download.js` 源码，响应类型为 JavaScript，缓存设置为 `no-store`。

这两个示例端口与主项目的 service-api（8000）、frontend（8001）冲突。运行实验时应停止占用端口的服务，或调整实验网页服务器的 `PORT` 和 Uvicorn 的 `--port`，并同步修改访问地址。

## 注入与页面逻辑

下载脚本只是获取代码，Android 端还需要在当前网页环境执行注入。实验页面不会自动请求 `/script.js`。

`js_server/download.js` 中的 `main_func()` 会显示调试弹窗并调用 `distinguish_by_pathname()`：

| 页面路径 | 填写目标 |
| --- | --- |
| `/pages/index/index.html` | `input-index` |
| `/pages/second/second.html` | `input-second` |

脚本首次执行时等待 DOM 就绪；随后监听 `pushState`、`replaceState`、`popstate` 和 `hashchange`，URL 改变时执行页面逻辑。同一 URL 会被去重，因此不保证每次 History API 调用都执行。

整页导航或刷新会创建新的网页环境，原脚本和监听器不会自动保留。Android 端需要在新页面加载后重新注入，才能继续填写。

## 实验记录与验证范围

此前记录的两页面跳转实验中，输入框能够填入对应内容。这是历史实验结果，不代表当前 APK、官方网页或所有导航方式均已验证。本次文档更新仅对照静态代码，实际效果仍需在 Android 中检查。
